import { qBool, qCacheSeconds, qFormat, qInt, qString, qThemeOptions } from "../lib/query";
import { getCache } from "../lib/cache";
import { cacheGet, cacheSet } from "../lib/cache-aside";
import { staleExtraSecondsFor, ttlSecondsFor } from "../lib/config";
import { requestIdFrom } from "../lib/request";
import { sendJson, sendSvg } from "../lib/response";
import { renderImpact, type ContributionDay } from "../cards/impact";
import { renderErrorCard } from "../cards/error";
import { recordLastSuccess } from "../lib/diag";
import { withCacheKeyVersion } from "../lib/cache-key";
import { resolveTheme, styleKeyFrom } from "../lib/theme";

async function getContributions(username: string): Promise<ContributionDay[]> {
  const query = `
    query($userName:String!) {
      user(login: $userName) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;

  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN for GraphQL API access");
  }

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "gh-stats",
    },
    body: JSON.stringify({
      query,
      variables: { userName: username },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = (await response.json()) as any;

  if (data.errors) {
    throw new Error(`GraphQL error: ${data.errors[0]?.message}`);
  }

  const weeks = data.data?.user?.contributionsCollection?.contributionCalendar?.weeks || [];
  const contributions: ContributionDay[] = [];

  for (const week of weeks) {
    for (const day of week.contributionDays || []) {
      contributions.push({
        date: day.date,
        count: day.contributionCount || 0,
      });
    }
  }

  return contributions;
}

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);
  const username = qString(req.query, "username");
  const format = qFormat(req.query);
  const refresh = qBool(req.query, "refresh", false);

  const themeOpts = qThemeOptions(req.query);
  const style = resolveTheme(themeOpts);

  const hideTitle = qBool(req.query, "hide_title", false);
  const customTitle = qString(req.query, "custom_title") || undefined;
  const cardWidth = qInt(req.query, "card_width", 480, 320, 900);
  const disableAnimations = qBool(req.query, "disable_animations", false);

  const cdnCacheSeconds = qCacheSeconds(req.query, format === "svg" ? 86400 : 3600);
  const ttl = Math.min(ttlSecondsFor("impact"), cdnCacheSeconds);

  if (!username) {
    if (format === "json") {
      res.statusCode = 400;
      sendJson(req, res, { error: "Missing ?username=", hint: "Add ?username=octocat", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(
      req,
      res,
      renderErrorCard(style, {
        endpoint: "impact",
        requestId,
        title: "Missing username",
        hint: "Add ?username=octocat",
      }),
      60
    );
    return;
  }

  try {
    const key = withCacheKeyVersion([
      "impact",
      username,
      styleKeyFrom(themeOpts),
      format,
      hideTitle ? "1" : "0",
      customTitle || "",
      cardWidth,
      disableAnimations ? "1" : "0",
    ].join(":"));

    const cache = getCache();
    if (cache && !refresh) {
      const hit = await cacheGet(cache, key);
      if (hit.kind === "hit" && hit.freshness === "fresh") {
        if (format === "json") {
          sendJson(req, res, JSON.parse(hit.entry.body), cdnCacheSeconds);
        } else {
          sendSvg(req, res, hit.entry.body, cdnCacheSeconds);
        }
        return;
      }
    }

    const contributions = await getContributions(username);

    if (contributions.length === 0) {
      throw new Error("No contribution data found for this user");
    }

    const payload = {
      username,
      totalContributions: contributions.reduce((a, c) => a + c.count, 0),
      contributionDays: contributions.length,
      data: contributions,
    };

    if (format === "json") {
      const body = JSON.stringify(payload);
      if (cache) await cacheSet(cache, key, body, ttl, staleExtraSecondsFor("impact"));
      await recordLastSuccess("impact", cache);
      sendJson(req, res, payload, cdnCacheSeconds);
      return;
    }

    const svg = renderImpact(style, username, contributions, {
      hideTitle,
      customTitle,
      cardWidth,
      disableAnimations,
    });

    if (cache) await cacheSet(cache, key, svg, ttl, staleExtraSecondsFor("impact"));
    await recordLastSuccess("impact", cache);
    sendSvg(req, res, svg, cdnCacheSeconds);
  } catch (e: any) {
    const detail = String(e?.message || e);

    if (format === "json") {
      res.statusCode = 502;
      sendJson(
        req,
        res,
        {
          error: "Failed to generate impact card",
          hint: "Requires GITHUB_TOKEN for GraphQL access to contribution data",
          requestId,
        },
        60
      );
      return;
    }

    res.statusCode = 200;
    sendSvg(
      req,
      res,
      renderErrorCard(style, {
        endpoint: "impact",
        username,
        requestId,
        title: "Failed to generate impact card",
        hint: "Requires GITHUB_TOKEN for GraphQL access",
        detail,
      }),
      60
    );
  }
}

import {
  qBool,
  qCacheSeconds,
  qCompact,
  qFormat,
  qInt,
  qString,
  qThemeOptions,
} from "../lib/query";
import { getCache } from "../lib/cache";
import { cacheGet, cacheSet } from "../lib/cache-aside";
import { staleExtraSecondsFor, ttlSecondsFor } from "../lib/config";
import { getRepo } from "../lib/github";
import { requestIdFrom } from "../lib/request";
import { sendJson, sendSvg } from "../lib/response";
import { renderPin } from "../cards/pin";
import { renderErrorCard } from "../cards/error";
import { recordLastSuccess } from "../lib/diag";
import { withCacheKeyVersion } from "../lib/cache-key";
import { resolveTheme, styleKeyFrom } from "../lib/theme";

type RepoApiResponse = {
  name: string;
  full_name?: string;
  description?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  language?: string | null;
  owner?: {
    login?: string | null;
  } | null;
};

function parseRepoParam(raw: string | null | undefined): { owner: string; repo: string } | null {
  if (!raw) return null;
  const value = raw.trim().replace(/^\/+|\/+$/g, "");
  const parts = value.split("/").filter(Boolean);
  if (parts.length !== 2) return null;
  const [owner, repo] = parts;
  if (!owner || !repo) return null;
  return { owner, repo };
}

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);

  const repoParam = qString(req.query, "repo");
  const ownerParam = qString(req.query, "owner");
  const nameParam = qString(req.query, "name") || qString(req.query, "repository");

  const parsedRepo = parseRepoParam(repoParam);
  const owner = ownerParam || parsedRepo?.owner || null;
  const repo = nameParam || parsedRepo?.repo || null;

  const format = qFormat(req.query);
  const compact = qCompact(req.query);
  const refresh = qBool(req.query, "refresh", false);

  const themeOpts = qThemeOptions(req.query);
  const style = resolveTheme(themeOpts);

  const showOwner = qBool(req.query, "show_owner", false);
  const hideTitle = qBool(req.query, "hide_title", false);
  const customTitle = qString(req.query, "custom_title") || undefined;
  const showIcons = qBool(req.query, "show_icons", false);
  const textBold = qBool(req.query, "text_bold", false);
  const disableAnimations = qBool(req.query, "disable_animations", false);

  const descriptionLinesCount = qInt(
    req.query,
    "description_lines_count",
    compact ? 1 : 2,
    1,
    3,
  );
  const lineHeight = qInt(req.query, "line_height", compact ? 18 : 20, 16, 30);
  const cardWidth = qInt(req.query, "card_width", compact ? 420 : 480, 320, 900);

  const cdnCacheSeconds = qCacheSeconds(req.query, format === "svg" ? 21600 : 3600);
  const ttl = Math.min(ttlSecondsFor("pin"), cdnCacheSeconds);

  if (!owner || !repo) {
    const hint = "Add ?repo=owner/name or use ?owner=owner&name=repo";

    if (format === "json") {
      res.statusCode = 400;
      sendJson(
        req,
        res,
        {
          error: "Missing repository information",
          hint,
          requestId,
        },
        60,
      );
      return;
    }

    res.statusCode = 200;
    sendSvg(
      req,
      res,
      renderErrorCard(style, {
        endpoint: "pin",
        requestId,
        title: "Missing repository",
        hint,
        compact,
      }),
      60,
    );
    return;
  }

  try {
    const key = withCacheKeyVersion(
      [
        "pin",
        owner,
        repo,
        styleKeyFrom(themeOpts),
        format,
        compact ? "1" : "0",
        showOwner ? "1" : "0",
        hideTitle ? "1" : "0",
        customTitle || "",
        showIcons ? "1" : "0",
        textBold ? "1" : "0",
        disableAnimations ? "1" : "0",
        descriptionLinesCount,
        lineHeight,
        cardWidth,
      ].join(":"),
    );

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

    const repoData = (await getRepo(owner, repo)) as RepoApiResponse;

    const payload = {
      owner: repoData.owner?.login || owner,
      repo: repoData.name || repo,
      description: repoData.description || null,
      stars: Number(repoData.stargazers_count || 0),
      forks: Number(repoData.forks_count || 0),
      language: repoData.language || null,
    };

    if (format === "json") {
      const body = JSON.stringify(payload);

      if (cache) {
        await cacheSet(cache, key, body, ttl, staleExtraSecondsFor("pin"));
      }

      await recordLastSuccess("pin", cache);
      sendJson(req, res, payload, cdnCacheSeconds);
      return;
    }

    const svg = renderPin(style, payload, {
      showOwner,
      descriptionLinesCount,
      hideTitle,
      customTitle,
      cardWidth,
      lineHeight,
      showIcons,
      textBold,
      disableAnimations,
    });

    if (cache) {
      await cacheSet(cache, key, svg, ttl, staleExtraSecondsFor("pin"));
    }

    await recordLastSuccess("pin", cache);
    sendSvg(req, res, svg, cdnCacheSeconds);
  } catch (e: any) {
    const detail = String(e?.message || e);

    if (format === "json") {
      res.statusCode = 502;
      sendJson(
        req,
        res,
        {
          error: "Failed to generate pin card",
          hint: "Verify the repository and try again later",
          requestId,
        },
        60,
      );
      return;
    }

    res.statusCode = 200;
    sendSvg(
      req,
      res,
      renderErrorCard(style, {
        endpoint: "pin",
        username: owner,
        requestId,
        title: "Failed to generate pin card",
        hint: "Verify the repository and try again later",
        detail,
        compact,
      }),
      60,
    );
  }
}
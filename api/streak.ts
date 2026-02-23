import { qBool, qCacheSeconds, qCompact, qFormat, qString, qTheme } from "../lib/query";
import { getCache } from "../lib/cache";
import { cacheGet, cacheSet } from "../lib/cache-aside";
import { staleExtraSecondsFor, ttlSecondsFor } from "../lib/config";
import { githubTokenPresent, graphQL } from "../lib/github";
import { computeStreak } from "../lib/streak";
import { requestIdFrom } from "../lib/request";
import { sendJson, sendSvg } from "../lib/response";
import { renderStreak } from "../cards/streak";
import { renderErrorCard } from "../cards/error";
import { recordLastSuccess } from "../lib/diag";

type GqlResp = {
  user: { contributionsCollection: { contributionCalendar: { weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number }> }> } } };
};

const QUERY = `
query($login:String!) {
  user(login:$login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}
`;

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);
  const username = qString(req.query, "username");
  const theme = qTheme(req.query);
  const format = qFormat(req.query);
  const compact = qCompact(req.query);
  const refresh = qBool(req.query, "refresh", false);
  const cdnCacheSeconds = qCacheSeconds(req.query, format === "svg" ? 21600 : 3600);
  const ttl = Math.min(ttlSecondsFor("streak"), cdnCacheSeconds);

  if (!username) {
    if (format === "json") {
      res.statusCode = 400;
      sendJson(req, res, { error: "Missing ?username=", hint: "Add ?username=octocat", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(theme, { endpoint: "streak", requestId, title: "Missing username", hint: "Add ?username=octocat", compact }), 60);
    return;
  }

  if (!githubTokenPresent()) {
    const hint = "Set GITHUB_TOKEN (or GH_TOKEN) in Vercel env vars to enable /api/streak";
    if (format === "json") {
      res.statusCode = 401;
      sendJson(req, res, { error: "token_required", hint, requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(theme, { endpoint: "streak", username, requestId, title: "Token required", hint, compact }), 60);
    return;
  }

  try {
    const key = `streak:${username}:${theme}:${format}:${compact ? 1 : 0}`;
    const cache = getCache();
    if (cache && !refresh) {
      const hit = await cacheGet(cache, key);
      if (hit.kind === "hit" && hit.freshness === "fresh") {
        if (format === "json") sendJson(req, res, JSON.parse(hit.entry.body), cdnCacheSeconds);
        else sendSvg(req, res, hit.entry.body, cdnCacheSeconds);
        return;
      }
    }

    const data = await graphQL<GqlResp>(QUERY, { login: username });

    const days = data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap(w => w.contributionDays.map(d => ({ date: d.date, count: d.contributionCount })))
      .sort((a,b)=> a.date.localeCompare(b.date));

    const streak = computeStreak(days);

    if (format === "json") {
      const payload = { username, ...streak };
      const body = JSON.stringify(payload);
      if (cache) await cacheSet(cache, key, body, ttl, staleExtraSecondsFor("streak"));
      await recordLastSuccess("streak", cache);
      sendJson(req, res, payload, cdnCacheSeconds);
      return;
    }

    const svg = renderStreak(theme, username, streak, { compact });
    if (cache) await cacheSet(cache, key, svg, ttl, staleExtraSecondsFor("streak"));
    await recordLastSuccess("streak", cache);
    sendSvg(req, res, svg, cdnCacheSeconds);
  } catch (e:any) {
    const detail = String(e?.message || e);
    if (format === "json") {
      res.statusCode = 502;
      sendJson(req, res, { error: "Failed to generate streak card", hint: "Try again later", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(theme, { endpoint: "streak", username, requestId, title: "Failed to generate streak card", hint: "Try again later", detail, compact }), 60);
  }
}

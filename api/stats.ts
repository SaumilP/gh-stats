import { qBool, qCacheSeconds, qCompact, qFormat, qString, qTheme } from "../lib/query";
import { getCache } from "../lib/cache";
import { cacheGet, cacheSet } from "../lib/cache-aside";
import { staleExtraSecondsFor, ttlSecondsFor } from "../lib/config";
import { getUser, getUserRepoSummary, githubTokenPresent, listRepos } from "../lib/github";
import { requestIdFrom } from "../lib/request";
import { sendJson, sendSvg } from "../lib/response";
import { renderStats } from "../cards/stats";
import { renderErrorCard } from "../cards/error";
import { recordLastSuccess } from "../lib/diag";

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);
  const username = qString(req.query, "username");
  const theme = qTheme(req.query);
  const format = qFormat(req.query);
  const compact = qCompact(req.query);
  const refresh = qBool(req.query, "refresh", false);

  const cdnCacheSeconds = qCacheSeconds(req.query, format === "svg" ? 21600 : 3600);
  const ttl = Math.min(ttlSecondsFor("stats"), cdnCacheSeconds);

  if (!username) {
    if (format === "json") {
      res.statusCode = 400;
      sendJson(req, res, { error: "Missing ?username=", hint: "Add ?username=octocat", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(theme, { endpoint: "stats", requestId, title: "Missing username", hint: "Add ?username=octocat", compact }), 60);
    return;
  }

  try {
    const key = `stats:${username}:${theme}:${format}:${compact ? 1 : 0}`;
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

    let stats: { name: string; username: string; repos: number; followers: number; stars: number; forks: number };

    if (githubTokenPresent()) {
      const summary = await getUserRepoSummary(username, 100);
      const repos = summary.repos || [];
      const stars = repos.reduce((a, r) => a + (Number(r?.stargazerCount) || 0), 0);
      const forks = repos.reduce((a, r) => a + (Number(r?.forkCount) || 0), 0);
      stats = { name: summary.name || username, username, repos: summary.publicRepos || repos.length, followers: summary.followers || 0, stars, forks };
    } else {
      const user = await getUser(username);
      const repos = await listRepos(username);
      const arr = Array.isArray(repos) ? repos : [];
      const stars = arr.reduce((a: number, r: any) => a + (Number(r?.stargazers_count) || 0), 0);
      const forks = arr.reduce((a: number, r: any) => a + (Number(r?.forks_count) || 0), 0);
      stats = { name: user?.name || username, username, repos: user?.public_repos || arr.length, followers: user?.followers || 0, stars, forks };
    }

    if (format === "json") {
      const body = JSON.stringify(stats);
      if (cache) await cacheSet(cache, key, body, ttl, staleExtraSecondsFor("stats"));
      await recordLastSuccess("stats", cache);
      sendJson(req, res, stats, cdnCacheSeconds);
      return;
    }

    const svg = renderStats(theme, stats, { compact });
    if (cache) await cacheSet(cache, key, svg, ttl, staleExtraSecondsFor("stats"));
    await recordLastSuccess("stats", cache);
    sendSvg(req, res, svg, cdnCacheSeconds);
  } catch (e: any) {
    const detail = String(e?.message || e);
    if (format === "json") {
      res.statusCode = 502;
      sendJson(req, res, { error: "Failed to generate stats", hint: "Try again later or set GITHUB_TOKEN for higher rate limits", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(theme, { endpoint: "stats", username, requestId, title: "Failed to generate stats", hint: "Try again later or set GITHUB_TOKEN", detail, compact }), 60);
  }
}

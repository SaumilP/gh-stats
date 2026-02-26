import { qBool, qCacheSeconds, qCompact, qFormat, qInt, qString, qTheme } from "../lib/query";
import { getCache } from "../lib/cache";
import { cacheGet, cacheSet } from "../lib/cache-aside";
import { staleExtraSecondsFor, ttlSecondsFor } from "../lib/config";
import { getUserRepoSummary, githubTokenPresent, listRepos } from "../lib/github";
import { requestIdFrom } from "../lib/request";
import { sendJson, sendSvg } from "../lib/response";
import { renderRepos } from "../cards/repos";
import { renderErrorCard } from "../cards/error";
import { recordLastSuccess } from "../lib/diag";
import { withCacheKeyVersion } from "../lib/cache-key";

function sortRepos(repos: any[], sort: string) {
  const s = (sort || "stars").toLowerCase();
  const byName = (a: any, b: any) => String(a?.name || "").localeCompare(String(b?.name || ""));
  if (s === "updated") return repos.sort((a,b)=> {
    const d = new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
    return d !== 0 ? d : byName(a,b);
  });
  if (s === "forks") return repos.sort((a,b)=> {
    const d = (Number(b.forks_count)||0) - (Number(a.forks_count)||0);
    return d !== 0 ? d : byName(a,b);
  });
  return repos.sort((a,b)=> {
    const d = (Number(b.stargazers_count)||0) - (Number(a.stargazers_count)||0);
    return d !== 0 ? d : byName(a,b);
  });
}

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);
  const username = qString(req.query, "username");
  const theme = qTheme(req.query);
  const format = qFormat(req.query);
  const compact = qCompact(req.query);
  const refresh = qBool(req.query, "refresh", false);
  const count = qInt(req.query, "count", 6, 1, 10);
  const sort = qString(req.query, "sort", "stars") || "stars";

  const cdnCacheSeconds = qCacheSeconds(req.query, format === "svg" ? 21600 : 3600);
  const ttl = Math.min(ttlSecondsFor("repos"), cdnCacheSeconds);

  if (!username) {
    if (format === "json") {
      res.statusCode = 400;
      sendJson(req, res, { error: "Missing ?username=", hint: "Add ?username=octocat", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(theme, { endpoint: "repos", requestId, title: "Missing username", hint: "Add ?username=octocat", compact }), 60);
    return;
  }

  try {
    const key = withCacheKeyVersion(`repos:${username}:${theme}:${format}:${compact ? 1 : 0}:${count}:${sort}`);
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

    let out: Array<{ name: string; stars: number; forks: number; desc?: string }>;

    if (githubTokenPresent()) {
      const summary = await getUserRepoSummary(username, 100);
      const filtered = (summary.repos || []).filter(r => !r.isFork && !r.isArchived);
      const ordered = filtered
        .slice()
        .sort((a, b) => {
          const byName = a.name.localeCompare(b.name);
          const s = sort.toLowerCase();
          if (s === "updated") {
            const d = new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            return d !== 0 ? d : byName;
          }
          if (s === "forks") {
            const d = (Number(b.forkCount) || 0) - (Number(a.forkCount) || 0);
            return d !== 0 ? d : byName;
          }
          const d = (Number(b.stargazerCount) || 0) - (Number(a.stargazerCount) || 0);
          return d !== 0 ? d : byName;
        })
        .slice(0, count);
      out = ordered.map(r => ({ name: r.name, stars: Number(r.stargazerCount) || 0, forks: Number(r.forkCount) || 0, desc: r.description || "" }));
    } else {
      const repos = await listRepos(username);
      const arr = Array.isArray(repos) ? repos : [];
      const filtered = arr.filter((r:any)=> !r.fork && !r.archived);
      const ordered = sortRepos(filtered, sort).slice(0, count);
      out = ordered.map((r:any)=> ({ name: r.name, stars: Number(r.stargazers_count) || 0, forks: Number(r.forks_count) || 0, desc: r.description || "" }));
    }

    if (format === "json") {
      const payload = { username, sort, count, repos: out };
      const body = JSON.stringify(payload);
      if (cache) await cacheSet(cache, key, body, ttl, staleExtraSecondsFor("repos"));
      await recordLastSuccess("repos", cache);
      sendJson(req, res, payload, cdnCacheSeconds);
      return;
    }

    const svg = renderRepos(theme, username, out, { compact });
    if (cache) await cacheSet(cache, key, svg, ttl, staleExtraSecondsFor("repos"));
    await recordLastSuccess("repos", cache);
    sendSvg(req, res, svg, cdnCacheSeconds);
  } catch (e:any) {
    const detail = String(e?.message || e);
    if (format === "json") {
      res.statusCode = 502;
      sendJson(req, res, { error: "Failed to generate repos card", hint: "Try again later or set GITHUB_TOKEN", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(theme, { endpoint: "repos", username, requestId, title: "Failed to generate repos card", hint: "Try again later or set GITHUB_TOKEN", detail, compact }), 60);
  }
}

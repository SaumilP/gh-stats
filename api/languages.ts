import { qBool, qCacheSeconds, qCompact, qFormat, qInt, qString, qTheme } from "../lib/query";
import { getCache } from "../lib/cache";
import { cacheGet, cacheSet } from "../lib/cache-aside";
import { staleExtraSecondsFor, ttlSecondsFor } from "../lib/config";
import { getLatestRepoUpdatedAt, getRepoLanguages, getUserRepoSummary, githubTokenPresent, listRepos } from "../lib/github";
import { pLimit } from "../lib/limit";
import { requestIdFrom } from "../lib/request";
import { sendJson, sendSvg } from "../lib/response";
import { renderLanguages } from "../cards/languages";
import { renderErrorCard } from "../cards/error";
import { recordLastSuccess } from "../lib/diag";
import { withCacheKeyVersion } from "../lib/cache-key";

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);
  const username = qString(req.query, "username");
  const theme = qTheme(req.query);
  const format = qFormat(req.query);
  const compact = qCompact(req.query);
  const refresh = qBool(req.query, "refresh", false);
  const modeRaw = (qString(req.query, "mode", "primary") || "primary").toLowerCase();
  const maxReposForLanguages = qInt(req.query, "maxReposForLanguages", 30, 5, 50);

  const mode = (modeRaw === "bytes" ? "bytes" : "primary") as "primary" | "bytes";
  const cdnCacheSeconds = qCacheSeconds(req.query, format === "svg" ? (mode === "bytes" ? 86400 : 21600) : 3600);
  const baseTtl = ttlSecondsFor("langs");
  const serverTtl = Math.min(Math.max(baseTtl, mode === "bytes" ? 86400 : 0), cdnCacheSeconds);

  if (!username) {
    if (format === "json") {
      res.statusCode = 400;
      sendJson(req, res, { error: "Missing ?username=", hint: "Add ?username=octocat", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(theme, { endpoint: "languages", requestId, title: "Missing username", hint: "Add ?username=octocat", compact }), 60);
    return;
  }

  try {
    const effectiveMode: "primary" | "bytes" = (mode === "bytes" && !githubTokenPresent()) ? "primary" : mode;
    const cacheModeKey = effectiveMode;
    const key = withCacheKeyVersion(`langs:${username}:${theme}:${format}:${compact ? 1 : 0}:${cacheModeKey}:${maxReposForLanguages}`);
    const cache = getCache();

    if (cache && !refresh) {
      const hit = await cacheGet(cache, key);
      if (hit.kind === "hit") {
        if (hit.freshness === "fresh") {
          if (format === "json") sendJson(req, res, JSON.parse(hit.entry.body), cdnCacheSeconds);
          else sendSvg(req, res, hit.entry.body, cdnCacheSeconds);
          return;
        }

        // Soft TTL for expensive bytes mode: if latest repo update hasn't changed, keep serving cached.
        if (effectiveMode === "bytes") {
          const cachedLatest = String(hit.entry.meta?.latestRepoUpdatedAt || "");
          if (cachedLatest) {
            const latest = await getLatestRepoUpdatedAt(username).catch(() => null);
            if (!latest || latest === cachedLatest) {
              await cacheSet(cache, key, hit.entry.body, serverTtl, staleExtraSecondsFor("langs"), hit.entry.meta);
              if (format === "json") sendJson(req, res, JSON.parse(hit.entry.body), cdnCacheSeconds);
              else sendSvg(req, res, hit.entry.body, cdnCacheSeconds);
              return;
            }
          }
        }
      }
    }

    const totals = new Map<string, number>();
    let subtitle = "";
    let footer = "";

    if (effectiveMode === "primary") {
      subtitle = `@${username} • primary language • weighted by stars`;
      if (githubTokenPresent()) {
        const summary = await getUserRepoSummary(username, maxReposForLanguages);
        const repos = (summary.repos || []).filter(r => !r.isFork && !r.isArchived).slice(0, maxReposForLanguages);
        for (const r of repos) {
          const lang = r.primaryLanguage?.name;
          if (!lang) continue;
          const w = Math.max(1, Number(r.stargazerCount) || 0);
          totals.set(lang, (totals.get(lang) || 0) + w);
        }
      } else {
        const repos = await listRepos(username);
        const arr = (Array.isArray(repos) ? repos : []).filter((r:any)=> !r.fork && !r.archived).slice(0, maxReposForLanguages);
        for (const r of arr) {
          const lang = r.language;
          if (typeof lang !== "string" || !lang) continue;
          const w = Math.max(1, Number(r.stargazers_count) || 0);
          totals.set(lang, (totals.get(lang) || 0) + w);
        }
      }
    } else {
      subtitle = `@${username} • bytes mode • top repos only`;
      footer = "bytes mode is cached ≥24h to control cost";

      const repoLimit = Math.max(10, Math.min(100, maxReposForLanguages));
      let reposForBytes: Array<{ name: string; stars: number; forks: number; updatedAt?: string; updated_at?: string }> = [];

      if (githubTokenPresent()) {
        const summary = await getUserRepoSummary(username, repoLimit);
        reposForBytes = (summary.repos || [])
          .filter(r => !r.isFork && !r.isArchived)
          .map(r => ({ name: r.name, stars: Number(r.stargazerCount) || 0, forks: Number(r.forkCount) || 0, updatedAt: r.updatedAt }))
          .sort((a,b)=> (b.stars - a.stars) || a.name.localeCompare(b.name))
          .slice(0, 10);
      } else {
        // Shouldn't happen because bytes mode without token falls back to primary.
        const repos = await listRepos(username);
        reposForBytes = (Array.isArray(repos) ? repos : [])
          .filter((r:any)=> !r.fork && !r.archived)
          .map((r:any)=> ({ name: r.name, stars: Number(r.stargazers_count)||0, forks: Number(r.forks_count)||0, updated_at: r.updated_at }))
          .sort((a,b)=> (b.stars - a.stars) || a.name.localeCompare(b.name))
          .slice(0, 10);
      }

      const limit = pLimit(2);
      const results = await Promise.all(
        reposForBytes.map(r =>
          limit(async () => {
            const langs = await getRepoLanguages(username, r.name);
            return langs;
          }),
        ),
      );
      for (const langs of results) {
        for (const [k, v] of Object.entries(langs || {})) {
          totals.set(k, (totals.get(k) || 0) + (Number(v) || 0));
        }
      }
    }

    const out = [...totals.entries()]
      .map(([name, value]) => ({ name, value: Math.max(0, Number(value) || 0) }))
      .sort((a, b) => (b.value - a.value) || a.name.localeCompare(b.name));

    if (format === "json") {
      const payload = { username, mode: effectiveMode, maxReposForLanguages, languages: out };
      const body = JSON.stringify(payload);
      if (cache) {
        const latest = effectiveMode === "bytes" ? (await getLatestRepoUpdatedAt(username).catch(() => null)) : null;
        await cacheSet(cache, key, body, serverTtl, staleExtraSecondsFor("langs"), latest ? { latestRepoUpdatedAt: latest } : undefined);
      }
      await recordLastSuccess("languages", cache);
      sendJson(req, res, payload, cdnCacheSeconds);
      return;
    }

    const svg = renderLanguages(theme, username, out, {
      compact,
      subtitle,
      footer: (mode === "bytes" && !githubTokenPresent()) ? "mode=bytes needs GITHUB_TOKEN; served primary mode instead" : footer,
    });
    if (cache) {
      const latest = effectiveMode === "bytes" ? (await getLatestRepoUpdatedAt(username).catch(() => null)) : null;
      await cacheSet(cache, key, svg, serverTtl, staleExtraSecondsFor("langs"), latest ? { latestRepoUpdatedAt: latest } : undefined);
    }
    await recordLastSuccess("languages", cache);
    sendSvg(req, res, svg, cdnCacheSeconds);
  } catch (e:any) {
    const detail = String(e?.message || e);
    if (format === "json") {
      res.statusCode = 502;
      sendJson(req, res, { error: "Failed to generate languages card", hint: "Try mode=primary or set GITHUB_TOKEN", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(theme, { endpoint: "languages", username, requestId, title: "Failed to generate languages card", hint: "Try mode=primary or set GITHUB_TOKEN", detail, compact }), 60);
  }
}

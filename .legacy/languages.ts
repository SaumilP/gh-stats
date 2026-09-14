import { qBool, qCacheSeconds, qCompact, qFormat, qFloat, qInt, qString, qStringList, qThemeOptions } from "../lib/query";
import { getCache } from "../lib/cache";
import { cacheGet, cacheSet } from "../lib/cache-aside";
import { staleExtraSecondsFor, ttlSecondsFor } from "../lib/config";
import { getLatestRepoUpdatedAt, getRepoLanguages, getUserRepoSummary, githubTokenPresent, listRepos } from "../lib/github";
import { pLimit } from "../lib/limit";
import { requestIdFrom } from "../lib/request";
import { sendJson, sendSvg } from "../lib/response";
import { renderLanguages, type LanguageItem } from "../cards/languages";
import { renderErrorCard } from "../cards/error";
import { recordLastSuccess } from "../lib/diag";
import { withCacheKeyVersion } from "../lib/cache-key";
import { resolveTheme, styleKeyFrom } from "../lib/theme";
import { formatBytes, formatPercent } from "../lib/format";

function normalizeList(list: string[]) {
  return new Set(list.map((s) => s.trim().toLowerCase()).filter(Boolean));
}

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);
  const username = qString(req.query, "username");
  const format = qFormat(req.query);
  const compactParam = qCompact(req.query);
  const refresh = qBool(req.query, "refresh", false);
  const modeRaw = (qString(req.query, "mode", "primary") || "primary").toLowerCase();
  const maxReposForLanguages = qInt(req.query, "maxReposForLanguages", 30, 5, 50);

  const themeOpts = qThemeOptions(req.query);
  const style = resolveTheme(themeOpts);

  const layoutRaw = (qString(req.query, "layout", compactParam ? "compact" : "normal") || "normal").toLowerCase();
  const layout = (layoutRaw === "compact" || layoutRaw === "donut" || layoutRaw === "donut-vertical" || layoutRaw === "pie")
    ? (layoutRaw as "compact" | "donut" | "donut-vertical" | "pie")
    : "normal";
  const compact = layout === "compact" || compactParam;
  const hideProgress = qBool(req.query, "hide_progress", false);
  const hideTitle = qBool(req.query, "hide_title", false);
  const customTitle = qString(req.query, "custom_title") || undefined;
  const lineHeight = qInt(req.query, "line_height", compact ? 20 : 22, 16, 40);
  const cardWidth = qInt(req.query, "card_width", 480, 320, 900);
  const textBold = qBool(req.query, "text_bold", false);
  const disableAnimations = qBool(req.query, "disable_animations", false);

  const sizeWeight = qFloat(req.query, "size_weight", 1, 0, 2);
  const countWeight = qFloat(req.query, "count_weight", 0, 0, 2);
  const statsFormatRaw = (qString(req.query, "stats_format", "percentages") || "percentages").toLowerCase();
  const statsFormat = statsFormatRaw === "bytes" ? "bytes" : "percentages";
  const langsCount = qInt(req.query, "langs_count", 5, 1, 20);

  const locale = qString(req.query, "locale", "en") || "en";
  const numberPrecision = qInt(req.query, "number_precision", 1, 0, 3);

  const hideLangs = normalizeList(qStringList(req.query, "hide"));
  const excludeRepos = normalizeList(qStringList(req.query, "exclude_repo"));

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
    sendSvg(req, res, renderErrorCard(style, { endpoint: "languages", requestId, title: "Missing username", hint: "Add ?username=octocat", compact }), 60);
    return;
  }

  try {
    const effectiveMode: "primary" | "bytes" = (mode === "bytes" && !githubTokenPresent()) ? "primary" : mode;
    const cacheModeKey = effectiveMode;
    const key = withCacheKeyVersion([
      "langs",
      username,
      styleKeyFrom(themeOpts),
      format,
      compact ? "1" : "0",
      layout,
      hideProgress ? "1" : "0",
      hideTitle ? "1" : "0",
      customTitle || "",
      lineHeight,
      cardWidth,
      textBold ? "1" : "0",
      disableAnimations ? "1" : "0",
      sizeWeight,
      countWeight,
      statsFormat,
      langsCount,
      cacheModeKey,
      maxReposForLanguages,
      Array.from(hideLangs).sort().join(","),
      Array.from(excludeRepos).sort().join(","),
      locale,
      numberPrecision,
    ].join(":"));

    const cache = getCache();

    if (cache && !refresh) {
      const hit = await cacheGet(cache, key);
      if (hit.kind === "hit") {
        if (hit.freshness === "fresh") {
          if (format === "json") sendJson(req, res, JSON.parse(hit.entry.body), cdnCacheSeconds);
          else sendSvg(req, res, hit.entry.body, cdnCacheSeconds);
          return;
        }

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

    const totals = new Map<string, { bytes: number; repos: number }>();
    let subtitle = "";
    let footer = "";

    if (effectiveMode === "primary") {
      subtitle = `@${username} • primary language • weighted by stars`;
      if (githubTokenPresent()) {
        const summary = await getUserRepoSummary(username, maxReposForLanguages);
        const repos = (summary.repos || [])
          .filter(r => !r.isFork && !r.isArchived)
          .filter(r => !excludeRepos.has(String(r.name || "").toLowerCase()))
          .slice(0, maxReposForLanguages);
        for (const r of repos) {
          const lang = r.primaryLanguage?.name;
          if (!lang) continue;
          const key = lang.toLowerCase();
          if (hideLangs.has(key)) continue;
          const w = Math.max(1, Number(r.stargazerCount) || 0);
          const curr = totals.get(lang) || { bytes: 0, repos: 0 };
          totals.set(lang, { bytes: curr.bytes + w, repos: curr.repos + 1 });
        }
      } else {
        const repos = await listRepos(username);
        const arr = (Array.isArray(repos) ? repos : [])
          .filter((r: any) => !r.fork && !r.archived)
          .filter((r: any) => !excludeRepos.has(String(r.name || "").toLowerCase()))
          .slice(0, maxReposForLanguages);
        for (const r of arr) {
          const lang = r.language;
          if (typeof lang !== "string" || !lang) continue;
          const key = lang.toLowerCase();
          if (hideLangs.has(key)) continue;
          const w = Math.max(1, Number(r.stargazers_count) || 0);
          const curr = totals.get(lang) || { bytes: 0, repos: 0 };
          totals.set(lang, { bytes: curr.bytes + w, repos: curr.repos + 1 });
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
          .filter(r => !excludeRepos.has(String(r.name || "").toLowerCase()))
          .map(r => ({ name: r.name, stars: Number(r.stargazerCount) || 0, forks: Number(r.forkCount) || 0, updatedAt: r.updatedAt }))
          .sort((a, b) => (b.stars - a.stars) || a.name.localeCompare(b.name))
          .slice(0, 10);
      } else {
        const repos = await listRepos(username);
        reposForBytes = (Array.isArray(repos) ? repos : [])
          .filter((r: any) => !r.fork && !r.archived)
          .filter((r: any) => !excludeRepos.has(String(r.name || "").toLowerCase()))
          .map((r: any) => ({ name: r.name, stars: Number(r.stargazers_count) || 0, forks: Number(r.forks_count) || 0, updated_at: r.updated_at }))
          .sort((a, b) => (b.stars - a.stars) || a.name.localeCompare(b.name))
          .slice(0, 10);
      }

      const limit = pLimit(2);
      const results = await Promise.all(
        reposForBytes.map(r =>
          limit(async () => {
            const langs = await getRepoLanguages(username, r.name);
            return { name: r.name, langs: langs || {} };
          }),
        ),
      );

      for (const repo of results) {
        const seen = new Set<string>();
        for (const [k, v] of Object.entries(repo.langs || {})) {
          const key = String(k).toLowerCase();
          if (hideLangs.has(key)) continue;
          const curr = totals.get(k) || { bytes: 0, repos: 0 };
          const bytes = Number(v) || 0;
          totals.set(k, { bytes: curr.bytes + bytes, repos: curr.repos + (seen.has(key) ? 0 : 1) });
          seen.add(key);
        }
      }
    }

    const computed = [...totals.entries()]
      .map(([name, value]) => {
        const bytes = Math.max(0, Number(value.bytes) || 0);
        const repos = Math.max(0, Number(value.repos) || 0);
        const score = (bytes ** sizeWeight) * (repos ** countWeight || 1);
        return { name, bytes, repos, score };
      })
      .filter((l) => l.score > 0 || l.bytes > 0)
      .sort((a, b) => (b.score - a.score) || a.name.localeCompare(b.name))
      .slice(0, langsCount);

    const totalScore = computed.reduce((a, l) => a + (l.score || 0), 0) || 1;

    const out: LanguageItem[] = computed.map((l) => {
      const ratio = Math.max(0, Math.min(1, (l.score || 0) / totalScore));
      const valueLabel = statsFormat === "bytes" ? formatBytes(l.bytes, locale) : formatPercent(l.score, totalScore, numberPrecision);
      const label = `${l.name} (${valueLabel})`;
      return { name: l.name, ratio, label };
    });

    if (format === "json") {
      const payload = {
        username,
        mode: effectiveMode,
        maxReposForLanguages,
        layout,
        langsCount,
        sizeWeight,
        countWeight,
        statsFormat,
        languages: computed,
      };
      const body = JSON.stringify(payload);
      if (cache) {
        const latest = effectiveMode === "bytes" ? (await getLatestRepoUpdatedAt(username).catch(() => null)) : null;
        await cacheSet(cache, key, body, serverTtl, staleExtraSecondsFor("langs"), latest ? { latestRepoUpdatedAt: latest } : undefined);
      }
      await recordLastSuccess("languages", cache);
      sendJson(req, res, payload, cdnCacheSeconds);
      return;
    }

    const svg = renderLanguages(style, username, out, {
      compact,
      layout: layout === "normal" ? "normal" : layout,
      subtitle,
      footer: (mode === "bytes" && !githubTokenPresent()) ? "mode=bytes needs GITHUB_TOKEN; served primary mode instead" : footer,
      hideProgress,
      hideTitle,
      customTitle,
      lineHeight,
      cardWidth,
      textBold,
      disableAnimations,
    });
    if (cache) {
      const latest = effectiveMode === "bytes" ? (await getLatestRepoUpdatedAt(username).catch(() => null)) : null;
      await cacheSet(cache, key, svg, serverTtl, staleExtraSecondsFor("langs"), latest ? { latestRepoUpdatedAt: latest } : undefined);
    }
    await recordLastSuccess("languages", cache);
    sendSvg(req, res, svg, cdnCacheSeconds);
  } catch (e: any) {
    const detail = String(e?.message || e);
    if (format === "json") {
      res.statusCode = 502;
      sendJson(req, res, { error: "Failed to generate languages card", hint: "Try mode=primary or set GITHUB_TOKEN", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(style, { endpoint: "languages", username, requestId, title: "Failed to generate languages card", hint: "Try mode=primary or set GITHUB_TOKEN", detail, compact }), 60);
  }
}

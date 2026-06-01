import { qBool, qCacheSeconds, qCompact, qFormat, qInt, qString, qThemeOptions } from "../lib/query";
import { getCache } from "../lib/cache";
import { cacheGet, cacheSet } from "../lib/cache-aside";
import { staleExtraSecondsFor, ttlSecondsFor } from "../lib/config";
import { getUserStatsSummary, githubTokenPresent, listRepos } from "../lib/github";
import { requestIdFrom } from "../lib/request";
import { sendJson, sendSvg } from "../lib/response";
import { renderFocus, type FocusCategory } from "../cards/focus";
import { renderErrorCard } from "../cards/error";
import { recordLastSuccess } from "../lib/diag";
import { withCacheKeyVersion } from "../lib/cache-key";
import { resolveTheme, styleKeyFrom } from "../lib/theme";

const LANGUAGE_CATEGORIES: Record<string, string> = {
  // Frontend languages
  typescript: "frontend",
  javascript: "frontend",
  tsx: "frontend",
  jsx: "frontend",
  react: "frontend",
  vue: "frontend",
  svelte: "frontend",
  "next.js": "frontend",
  html: "frontend",
  css: "frontend",
  scss: "frontend",
  sass: "frontend",

  // Backend languages
  python: "backend",
  java: "backend",
  golang: "backend",
  go: "backend",
  rust: "backend",
  cpp: "backend",
  "c++": "backend",
  csharp: "backend",
  "c#": "backend",
  ruby: "backend",
  php: "backend",
  kotlin: "backend",
  scala: "backend",
  haskell: "backend",
  clojure: "backend",
  elixir: "backend",

  // Systems/DevOps
  shell: "systems",
  bash: "systems",
  dockerfile: "systems",
  terraform: "systems",
  yaml: "systems",
  ansible: "systems",
  makefile: "systems",

  // Architecture/Design
  markdown: "architecture",
  json: "architecture",
  xml: "architecture",
  graphql: "architecture",
  sql: "architecture",
  prisma: "architecture",
};

function categorizeLanguage(lang: string | null | undefined): string {
  if (!lang) return "other";
  const normalized = String(lang).toLowerCase().trim();
  return LANGUAGE_CATEGORIES[normalized] || "other";
}

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);
  const username = qString(req.query, "username");
  const format = qFormat(req.query);
  const compact = qCompact(req.query);
  const refresh = qBool(req.query, "refresh", false);

  const themeOpts = qThemeOptions(req.query);
  const style = resolveTheme(themeOpts);

  const hideTitle = qBool(req.query, "hide_title", false);
  const customTitle = qString(req.query, "custom_title") || undefined;
  const cardWidth = qInt(req.query, "card_width", 480, 320, 900);
  const disableAnimations = qBool(req.query, "disable_animations", false);
  const maxRepos = qInt(req.query, "max_repos", 50, 10, 100);

  const cdnCacheSeconds = qCacheSeconds(req.query, format === "svg" ? 21600 : 3600);
  const ttl = Math.min(ttlSecondsFor("focus"), cdnCacheSeconds);

  if (!username) {
    if (format === "json") {
      res.statusCode = 400;
      sendJson(req, res, { error: "Missing ?username=", hint: "Add ?username=octocat", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(style, { endpoint: "focus", requestId, title: "Missing username", hint: "Add ?username=octocat", compact }), 60);
    return;
  }

  try {
    const key = withCacheKeyVersion([
      "focus",
      username,
      styleKeyFrom(themeOpts),
      format,
      compact ? "1" : "0",
      hideTitle ? "1" : "0",
      customTitle || "",
      cardWidth,
      disableAnimations ? "1" : "0",
      maxRepos,
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

    const categoryMap = new Map<string, { count: number; repos: number }>();

    if (githubTokenPresent()) {
      const summary = await getUserStatsSummary(username, maxRepos);
      const repos = (summary.repos || [])
        .filter(r => !r.isFork && !r.isArchived)
        .slice(0, maxRepos);

      for (const repo of repos) {
        const lang = repo.primaryLanguage?.name;
        const category = categorizeLanguage(lang);
        const curr = categoryMap.get(category) || { count: 0, repos: 0 };
        categoryMap.set(category, { count: curr.count + 1, repos: curr.repos + 1 });
      }
    } else {
      const repos = await listRepos(username);
      const arr = (Array.isArray(repos) ? repos : [])
        .filter((r: any) => !r.fork && !r.archived)
        .slice(0, maxRepos);

      for (const repo of arr) {
        const lang = repo.language;
        const category = categorizeLanguage(lang);
        const curr = categoryMap.get(category) || { count: 0, repos: 0 };
        categoryMap.set(category, { count: curr.count + 1, repos: curr.repos + 1 });
      }
    }

    const totalCount = Array.from(categoryMap.values()).reduce((a, c) => a + c.count, 0) || 1;
    const categoryOrder = ["frontend", "backend", "systems", "architecture", "other"];
    const categories: FocusCategory[] = categoryOrder
      .filter(cat => categoryMap.has(cat))
      .map(cat => {
        const data = categoryMap.get(cat)!;
        const categoryColors: Record<string, string> = {
          frontend: "#3B82F6",
          backend: "#10B981",
          systems: "#F59E0B",
          architecture: "#8B5CF6",
          other: "#A78BFA",
        };
        return {
          name: cat.charAt(0).toUpperCase() + cat.slice(1),
          percentage: (data.count / totalCount) * 100,
          commits: data.count,
          color: categoryColors[cat] || "#A78BFA",
        };
      });

    const payload = {
      username,
      categories: categories.map(c => ({
        name: c.name,
        percentage: Math.round(c.percentage * 10) / 10,
        commits: c.commits,
      })),
    };

    if (format === "json") {
      const body = JSON.stringify(payload);
      if (cache) await cacheSet(cache, key, body, ttl, staleExtraSecondsFor("focus"));
      await recordLastSuccess("focus", cache);
      sendJson(req, res, payload, cdnCacheSeconds);
      return;
    }

    const svg = renderFocus(style, username, categories, {
      compact,
      hideTitle,
      customTitle,
      cardWidth,
      disableAnimations,
    });

    if (cache) await cacheSet(cache, key, svg, ttl, staleExtraSecondsFor("focus"));
    await recordLastSuccess("focus", cache);
    sendSvg(req, res, svg, cdnCacheSeconds);
  } catch (e: any) {
    const detail = String(e?.message || e);
    if (format === "json") {
      res.statusCode = 502;
      sendJson(req, res, { error: "Failed to generate focus card", hint: "Try again later or set GITHUB_TOKEN for higher rate limits", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(style, { endpoint: "focus", username, requestId, title: "Failed to generate focus card", hint: "Try again later or set GITHUB_TOKEN", detail, compact }), 60);
  }
}

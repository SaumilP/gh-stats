import { qBool, qCacheSeconds, qCompact, qFormat, qInt, qString, qStringList, qThemeOptions } from "../lib/query";
import { getCache } from "../lib/cache";
import { cacheGet, cacheSet } from "../lib/cache-aside";
import { staleExtraSecondsFor, ttlSecondsFor } from "../lib/config";
import { getUser, getUserStatsSummary, githubTokenPresent, listRepos } from "../lib/github";
import { requestIdFrom } from "../lib/request";
import { sendJson, sendSvg } from "../lib/response";
import { renderStats, type StatsItem } from "../cards/stats";
import { renderErrorCard } from "../cards/error";
import { recordLastSuccess } from "../lib/diag";
import { withCacheKeyVersion } from "../lib/cache-key";
import { resolveTheme, styleKeyFrom } from "../lib/theme";
import { formatNumber } from "../lib/format";
import { computeRank } from "../lib/rank";

function normalizeStatKey(raw: string) {
  const k = raw.trim().toLowerCase();
  if (k === "repo" || k === "repos" || k === "repositories") return "repos";
  if (k === "followers" || k === "follower") return "followers";
  if (k === "stars" || k === "star") return "stars";
  if (k === "forks" || k === "fork") return "forks";
  if (k === "commits" || k === "commit") return "commits";
  if (k === "prs" || k === "pulls" || k === "pull_requests" || k === "pull-requests") return "prs";
  if (k === "issues" || k === "issue") return "issues";
  if (k === "reviews" || k === "review") return "reviews";
  if (k === "contribs" || k === "contributions" || k === "contrib") return "contribs";
  if (k === "rank") return "rank";
  return k;
}

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);
  const username = qString(req.query, "username");
  const format = qFormat(req.query);
  const compact = qCompact(req.query);
  const refresh = qBool(req.query, "refresh", false);

  const themeOpts = qThemeOptions(req.query);
  const style = resolveTheme(themeOpts);

  const showIcons = qBool(req.query, "show_icons", false);
  const hideTitle = qBool(req.query, "hide_title", false);
  const customTitle = qString(req.query, "custom_title") || undefined;
  const hideRank = qBool(req.query, "hide_rank", false);
  const rankIcon = (qString(req.query, "rank_icon", "default") || "default").toLowerCase();
  const includeAllCommits = qBool(req.query, "include_all_commits", false);
  const commitsYear = qInt(req.query, "commits_year", 0, 2000, 2100);
  const lineHeight = qInt(req.query, "line_height", compact ? 20 : 24, 16, 40);
  const cardWidth = qInt(req.query, "card_width", 480, 320, 900);
  const textBold = qBool(req.query, "text_bold", false);
  const disableAnimations = qBool(req.query, "disable_animations", false);

  const numberFormatRaw = (qString(req.query, "number_format", "short") || "short").toLowerCase();
  const numberFormat = numberFormatRaw === "long" ? "long" : "short";
  const numberPrecision = qInt(req.query, "number_precision", 1, 0, 3);
  const locale = qString(req.query, "locale", "en") || "en";

  const hideSet = new Set(qStringList(req.query, "hide").map(normalizeStatKey));
  const showSet = new Set(qStringList(req.query, "show").map(normalizeStatKey));

  const cdnCacheSeconds = qCacheSeconds(req.query, format === "svg" ? 21600 : 3600);
  const ttl = Math.min(ttlSecondsFor("stats"), cdnCacheSeconds);

  if (!username) {
    if (format === "json") {
      res.statusCode = 400;
      sendJson(req, res, { error: "Missing ?username=", hint: "Add ?username=octocat", requestId }, 60);
      return;
    }
    res.statusCode = 200;
    sendSvg(req, res, renderErrorCard(style, { endpoint: "stats", requestId, title: "Missing username", hint: "Add ?username=octocat", compact }), 60);
    return;
  }

  try {
    const key = withCacheKeyVersion([
      "stats",
      username,
      styleKeyFrom(themeOpts),
      format,
      compact ? "1" : "0",
      showIcons ? "1" : "0",
      hideTitle ? "1" : "0",
      customTitle || "",
      hideRank ? "1" : "0",
      rankIcon,
      includeAllCommits ? "1" : "0",
      commitsYear ? String(commitsYear) : "",
      lineHeight,
      cardWidth,
      textBold ? "1" : "0",
      disableAnimations ? "1" : "0",
      numberFormat,
      numberPrecision,
      locale,
      Array.from(hideSet).sort().join(","),
      Array.from(showSet).sort().join(","),
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

    let stats: { name: string; username: string; repos: number; followers: number; stars: number; forks: number; commits?: number; prs?: number; issues?: number; reviews?: number; contribs?: number };

    if (githubTokenPresent()) {
      const now = new Date();
      let from: string | null = null;
      let to: string | null = now.toISOString();
      if (commitsYear) {
        from = new Date(Date.UTC(commitsYear, 0, 1)).toISOString();
        to = new Date(Date.UTC(commitsYear, 11, 31, 23, 59, 59)).toISOString();
      } else if (includeAllCommits) {
        from = new Date(Date.UTC(1970, 0, 1)).toISOString();
      } else {
        from = new Date(Date.UTC(now.getUTCFullYear(), 0, 1)).toISOString();
      }

      const summary = await getUserStatsSummary(username, 100, from, to);
      const repos = summary.repos || [];
      const stars = repos.reduce((a, r) => a + (Number(r?.stargazerCount) || 0), 0);
      const forks = repos.reduce((a, r) => a + (Number(r?.forkCount) || 0), 0);
      const commits = summary.contributions?.commits || 0;
      const prs = summary.contributions?.prs || 0;
      const issues = summary.contributions?.issues || 0;
      const reviews = summary.contributions?.reviews || 0;
      const contribs = commits + prs + issues + reviews;
      stats = {
        name: summary.name || username,
        username,
        repos: summary.publicRepos || repos.length,
        followers: summary.followers || 0,
        stars,
        forks,
        commits,
        prs,
        issues,
        reviews,
        contribs,
      };
    } else {
      const user = await getUser(username);
      const repos = await listRepos(username);
      const arr = Array.isArray(repos) ? repos : [];
      const stars = arr.reduce((a: number, r: any) => a + (Number(r?.stargazers_count) || 0), 0);
      const forks = arr.reduce((a: number, r: any) => a + (Number(r?.forks_count) || 0), 0);
      stats = { name: user?.name || username, username, repos: user?.public_repos || arr.length, followers: user?.followers || 0, stars, forks };
    }

    const fmt = (n: number) => formatNumber(n, { format: numberFormat, precision: numberPrecision, locale });
    const items: StatsItem[] = [];

    const base = [
      { key: "repos", label: "Total Repos", value: stats.repos, icon: "📦" },
      { key: "stars", label: "Total Stars", value: stats.stars, icon: "⭐" },
      { key: "forks", label: "Total Forks", value: stats.forks, icon: "🍴" },
      { key: "followers", label: "Followers", value: stats.followers, icon: "👥" },
    ];

    for (const b of base) {
      if (!hideSet.has(b.key)) items.push({ label: b.label, value: fmt(b.value), icon: b.icon });
    }

    const addExtra = (key: string, label: string, value: number | undefined, icon: string) => {
      if (value === undefined || value === null) return;
      if (hideSet.has(key)) return;
      if (!showSet.has(key)) return;
      items.push({ label, value: fmt(value), icon });
    };

    addExtra("commits", commitsYear ? `Commits ${commitsYear}` : "Commits", stats.commits, "📝");
    addExtra("prs", "PRs", stats.prs, "🔀");
    addExtra("issues", "Issues", stats.issues, "❗");
    addExtra("reviews", "Reviews", stats.reviews, "✅");
    addExtra("contribs", "Contributions", stats.contribs, "📈");

    let rankValue: string | undefined;
    if (!hideRank && !hideSet.has("rank")) {
      const rank = computeRank({
        stars: stats.stars,
        forks: stats.forks,
        followers: stats.followers,
        repos: stats.repos,
        commits: stats.commits,
        prs: stats.prs,
        issues: stats.issues,
        reviews: stats.reviews,
      });
      if (rankIcon === "percentile") rankValue = `Top ${rank.percentile}%`;
      else rankValue = rank.level;
      items.push({ label: "Rank", value: rankValue, icon: "🏅" });
    }

    const payload = {
      ...stats,
      show: Array.from(showSet),
      hide: Array.from(hideSet),
      rank: rankValue || null,
    };

    if (format === "json") {
      const body = JSON.stringify(payload);
      if (cache) await cacheSet(cache, key, body, ttl, staleExtraSecondsFor("stats"));
      await recordLastSuccess("stats", cache);
      sendJson(req, res, payload, cdnCacheSeconds);
      return;
    }

    const svg = renderStats(
      style,
      { name: stats.name, username: stats.username },
      items,
      { compact, hideTitle, customTitle, showIcons, lineHeight, cardWidth, textBold, disableAnimations },
    );
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
    sendSvg(req, res, renderErrorCard(style, { endpoint: "stats", username, requestId, title: "Failed to generate stats", hint: "Try again later or set GITHUB_TOKEN", detail, compact }), 60);
  }
}

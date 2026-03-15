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
import { requestIdFrom } from "../lib/request";
import { sendJson, sendSvg } from "../lib/response";
import { renderErrorCard } from "../cards/error";
import { renderWakaTime } from "../cards/wakatime";
import { recordLastSuccess } from "../lib/diag";
import { withCacheKeyVersion } from "../lib/cache-key";
import { resolveTheme, styleKeyFrom } from "../lib/theme";
import type { LanguageItem, LanguagesCardOptions } from "../cards/languages";

type WakaLanguage = {
  name?: string;
  percent?: number;
  text?: string;
  total_seconds?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
};

type WakaStatsResponse = {
  data?: {
    username?: string;
    human_readable_total?: string;
    daily_average?: number | string;
    human_readable_daily_average?: string;
    range?: string | { name?: string };
    languages?: WakaLanguage[];
  };
};

function wakatimeToken(): string | null {
  return (
    process.env.WAKATIME_API_KEY ||
    process.env.WAKATIME_ACCESS_TOKEN ||
    process.env.WAKATIME_TOKEN ||
    null
  );
}

function basicAuthHeader(token: string): string {
  return `Basic ${Buffer.from(token).toString("base64")}`;
}

async function getWakaTimeStats(range: string, timeoutMs = 12000): Promise<WakaStatsResponse> {
  const token = wakatimeToken();
  if (!token) {
    throw new Error("Missing WAKATIME_API_KEY (or WAKATIME_ACCESS_TOKEN / WAKATIME_TOKEN).");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const url = `https://api.wakatime.com/api/v1/users/current/stats/${encodeURIComponent(range)}`;
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "gh-stats-vercel",
        "Accept": "application/json",
        "Authorization": basicAuthHeader(token),
      },
      signal: controller.signal,
    });

    if (resp.status === 202) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`WakaTime stats are still refreshing (202): ${txt.slice(0, 240)}`);
    }

    if (!resp.ok) {
      const txt = await resp.text().catch(() => "");
      throw new Error(`WakaTime API error ${resp.status}: ${txt.slice(0, 300)}`);
    }

    return (await resp.json()) as WakaStatsResponse;
  } finally {
    clearTimeout(timer);
  }
}

function toLanguageItems(languages: WakaLanguage[], limit: number): LanguageItem[] {
  const filtered = (languages || [])
    .filter((lang) => lang && typeof lang.name === "string")
    .map((lang) => {
      const pct = Number(lang.percent ?? 0);
      const ratio = Math.max(0, Math.min(1, pct / 100));
      const label =
        lang.text && String(lang.text).trim().length > 0
          ? `${lang.name} ${lang.text}`
          : `${lang.name} ${pct.toFixed(1)}%`;

      return {
        name: String(lang.name),
        ratio,
        label,
      };
    })
    .filter((lang) => lang.ratio > 0)
    .sort((a, b) => b.ratio - a.ratio);

  return filtered.slice(0, Math.max(1, Math.min(12, limit)));
}

function subtitleFor(
  resolvedUsername: string,
  range: string,
  payload?: WakaStatsResponse["data"],
): string {
  const prettyRange =
    typeof payload?.range === "string"
      ? payload.range
      : payload?.range?.name || range;

  const total = payload?.human_readable_total;
  if (total) return `@${resolvedUsername} • ${prettyRange} • ${total}`;
  return `@${resolvedUsername} • ${prettyRange}`;
}

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);

  const requestedUsername = qString(req.query, "username", "wakatime");
  const range = qString(req.query, "range", "last_7_days") || "last_7_days";

  const format = qFormat(req.query);
  const compact = qCompact(req.query);
  const refresh = qBool(req.query, "refresh", false);

  const themeOpts = qThemeOptions(req.query);
  const style = resolveTheme(themeOpts);

  const hideTitle = qBool(req.query, "hide_title", false);
  const customTitle = qString(req.query, "custom_title") || undefined;
  const hideProgress = qBool(req.query, "hide_progress", false);
  const textBold = qBool(req.query, "text_bold", false);
  const disableAnimations = qBool(req.query, "disable_animations", false);

  const rawLayout = qString(req.query, "layout", compact ? "compact" : "normal");
  const layout: LanguagesCardOptions["layout"] =
    rawLayout === "compact" ||
    rawLayout === "donut" ||
    rawLayout === "donut-vertical" ||
    rawLayout === "pie"
      ? rawLayout
      : "normal";

  const lineHeight = qInt(req.query, "line_height", compact ? 20 : 22, 16, 36);
  const cardWidth = qInt(
    req.query,
    "card_width",
    layout === "donut" || layout === "donut-vertical" || layout === "pie" ? 560 : 480,
    320,
    900,
  );
  const limit = qInt(req.query, "langs_count", layout === "compact" ? 6 : 8, 1, 12);

  const cdnCacheSeconds = qCacheSeconds(req.query, format === "svg" ? 21600 : 3600);
  const ttl = Math.min(ttlSecondsFor("wakatime"), cdnCacheSeconds);

  if (!wakatimeToken()) {
    const hint =
      "Set WAKATIME_API_KEY (or WAKATIME_ACCESS_TOKEN / WAKATIME_TOKEN) in Vercel env vars.";

    if (format === "json") {
      res.statusCode = 401;
      sendJson(req, res, { error: "token_required", hint, requestId }, 60);
      return;
    }

    res.statusCode = 200;
    sendSvg(
      req,
      res,
      renderErrorCard(style, {
        endpoint: "wakatime",
        username: requestedUsername,
        requestId,
        title: "Token required",
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
        "wakatime",
        requestedUsername,
        range,
        styleKeyFrom(themeOpts),
        format,
        compact ? "1" : "0",
        hideTitle ? "1" : "0",
        customTitle || "",
        hideProgress ? "1" : "0",
        textBold ? "1" : "0",
        disableAnimations ? "1" : "0",
        layout,
        lineHeight,
        cardWidth,
        limit,
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

    const waka = await getWakaTimeStats(range);
    const resolvedUsername = waka.data?.username || requestedUsername || "wakatime";
    const langs = toLanguageItems(waka.data?.languages || [], limit);

    if (langs.length === 0) {
      throw new Error("No WakaTime language stats were returned for this range.");
    }

    const payload = {
      username: resolvedUsername,
      range,
      total: waka.data?.human_readable_total || null,
      dailyAverage: waka.data?.human_readable_daily_average || waka.data?.daily_average || null,
      languages: langs,
    };

    if (format === "json") {
      const body = JSON.stringify(payload);

      if (cache) {
        await cacheSet(cache, key, body, ttl, staleExtraSecondsFor("wakatime"));
      }

      await recordLastSuccess("wakatime", cache);
      sendJson(req, res, payload, cdnCacheSeconds);
      return;
    }

    const svg = renderWakaTime(style, resolvedUsername, langs, {
      compact,
      hideTitle,
      customTitle,
      hideProgress,
      textBold,
      disableAnimations,
      layout,
      lineHeight,
      cardWidth,
      subtitle: subtitleFor(resolvedUsername, range, waka.data),
      footer: "Powered by WakaTime",
    });

    if (cache) {
      await cacheSet(cache, key, svg, ttl, staleExtraSecondsFor("wakatime"));
    }

    await recordLastSuccess("wakatime", cache);
    sendSvg(req, res, svg, cdnCacheSeconds);
  } catch (e: any) {
    const detail = String(e?.message || e);

    if (format === "json") {
      res.statusCode = 502;
      sendJson(
        req,
        res,
        {
          error: "Failed to generate WakaTime card",
          hint: "Check WakaTime token, range, and account stats availability.",
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
        endpoint: "wakatime",
        username: requestedUsername,
        requestId,
        title: "Failed to generate WakaTime card",
        hint: "Check WakaTime token, range, and account stats availability.",
        detail,
        compact,
      }),
      60,
    );
  }
}
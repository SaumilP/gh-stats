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
import { getGist } from "../lib/github";
import { requestIdFrom } from "../lib/request";
import { sendJson, sendSvg } from "../lib/response";
import { renderGist } from "../cards/gist";
import { renderErrorCard } from "../cards/error";
import { recordLastSuccess } from "../lib/diag";
import { withCacheKeyVersion } from "../lib/cache-key";
import { resolveTheme, styleKeyFrom } from "../lib/theme";

type GistApiFile = {
  filename?: string | null;
  language?: string | null;
};

type GistApiResponse = {
  id: string;
  description?: string | null;
  comments?: number;
  owner?: {
    login?: string | null;
  } | null;
  files?: Record<string, GistApiFile>;
};

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);
  const gistId = qString(req.query, "id") || qString(req.query, "gist");
  const format = qFormat(req.query);
  const compact = qCompact(req.query);
  const refresh = qBool(req.query, "refresh", false);

  const themeOpts = qThemeOptions(req.query);
  const style = resolveTheme(themeOpts);

  const hideTitle = qBool(req.query, "hide_title", false);
  const customTitle = qString(req.query, "custom_title") || undefined;
  const showIcons = qBool(req.query, "show_icons", false);
  const textBold = qBool(req.query, "text_bold", false);
  const disableAnimations = qBool(req.query, "disable_animations", false);

  const lineHeight = qInt(req.query, "line_height", compact ? 18 : 20, 16, 30);
  const cardWidth = qInt(
    req.query,
    "card_width",
    compact ? 420 : 480,
    320,
    900,
  );

  const cdnCacheSeconds = qCacheSeconds(
    req.query,
    format === "svg" ? 21600 : 3600,
  );
  const ttl = Math.min(ttlSecondsFor("gist"), cdnCacheSeconds);

  if (!gistId) {
    if (format === "json") {
      res.statusCode = 400;
      sendJson(
        req,
        res,
        {
          error: "Missing ?id=",
          hint: "Add ?id=<gist_id> or ?gist=<gist_id>",
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
        endpoint: "gist",
        requestId,
        title: "Missing gist id",
        hint: "Add ?id=<gist_id> or ?gist=<gist_id>",
        compact,
      }),
      60,
    );
    return;
  }

  try {
    const key = withCacheKeyVersion(
      [
        "gist",
        gistId,
        styleKeyFrom(themeOpts),
        format,
        compact ? "1" : "0",
        hideTitle ? "1" : "0",
        customTitle || "",
        showIcons ? "1" : "0",
        textBold ? "1" : "0",
        disableAnimations ? "1" : "0",
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

    const gist = (await getGist(gistId)) as GistApiResponse;

    const owner = gist.owner?.login || "unknown";
    const description = gist.description || "No description";
    const comments = Number(gist.comments || 0);

    const files = Object.values(gist.files || {})
      .map((f) => ({
        name: f.filename || "untitled",
        language: f.language || null,
      }))
      .slice(0, 3);

    const payload = {
      id: gist.id,
      owner,
      description,
      comments,
      files,
    };

    if (format === "json") {
      const body = JSON.stringify(payload);

      if (cache) {
        await cacheSet(cache, key, body, ttl, staleExtraSecondsFor("gist"));
      }

      await recordLastSuccess("gist", cache);
      sendJson(req, res, payload, cdnCacheSeconds);
      return;
    }

    const svg = renderGist(
      style,
      {
        owner,
        description,
        comments,
        files,
      },
      {
        hideTitle,
        customTitle,
        cardWidth,
        lineHeight,
        showIcons,
        textBold,
        disableAnimations,
      },
    );

    if (cache) {
      await cacheSet(cache, key, svg, ttl, staleExtraSecondsFor("gist"));
    }

    await recordLastSuccess("gist", cache);
    sendSvg(req, res, svg, cdnCacheSeconds);
  } catch (e: any) {
    const detail = String(e?.message || e);

    if (format === "json") {
      res.statusCode = 502;
      sendJson(
        req,
        res,
        {
          error: "Failed to generate gist card",
          hint: "Verify the gist id and try again later",
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
        endpoint: "gist",
        requestId,
        title: "Failed to generate gist card",
        hint: "Verify the gist id and try again later",
        detail,
        compact,
      }),
      60,
    );
  }
}

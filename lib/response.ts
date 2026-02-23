import { sha256Hex } from "./etag";
import type { Theme } from "./query";

export type Format = "svg" | "json";

export function cacheControlFor(format: Format, cacheSeconds: number) {
  const sMaxAge = Math.max(0, Math.floor(cacheSeconds));
  if (format === "svg") return `public, s-maxage=${sMaxAge}, stale-while-revalidate=86400`;
  return `public, s-maxage=${Math.min(sMaxAge, 86400)}, stale-while-revalidate=86400`;
}

export function contentTypeFor(format: Format) {
  return format === "svg"
    ? "image/svg+xml; charset=utf-8"
    : "application/json; charset=utf-8";
}

export function withEtag(req: any, res: any, body: string) {
  const etag = `"${sha256Hex(body)}"`;
  res.setHeader("ETag", etag);
  const inm = req?.headers?.["if-none-match"];
  if (typeof inm === "string" && inm === etag) {
    res.statusCode = 304;
    res.end();
    return true;
  }
  return false;
}

export function setCommonHeaders(res: any, format: Format, cacheSeconds: number) {
  res.setHeader("Content-Type", contentTypeFor(format));
  res.setHeader("Cache-Control", cacheControlFor(format, cacheSeconds));
  // Helps avoid weird MIME sniffing in some contexts.
  res.setHeader("X-Content-Type-Options", "nosniff");
}

export function sendSvg(req: any, res: any, svg: string, cacheSeconds: number) {
  setCommonHeaders(res, "svg", cacheSeconds);
  if (withEtag(req, res, svg)) return;
  res.statusCode = res.statusCode || 200;
  res.end(svg);
}

export function sendJson(req: any, res: any, payload: unknown, cacheSeconds: number) {
  const body = JSON.stringify(payload);
  setCommonHeaders(res, "json", cacheSeconds);
  if (withEtag(req, res, body)) return;
  res.statusCode = res.statusCode || 200;
  res.end(body);
}

export function themeTokens(theme: Theme) {
  if (theme === "light") {
    return { bg:"#ffffff", fg:"#24292f", muted:"#57606a", border:"#d0d7de", chipBg:"#f6f8fa", accent:"#0969da" };
  }
  return { bg:"#0d1117", fg:"#e6edf3", muted:"#9da7b1", border:"#30363d", chipBg:"#161b22", accent:"#58a6ff" };
}

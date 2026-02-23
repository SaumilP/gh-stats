import type { Theme } from "./query.js";

export function setSvgHeaders(res: any) {
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=21600, stale-while-revalidate=86400");
}

export function setJsonHeaders(res: any) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
}

export function themeTokens(theme: Theme) {
  if (theme === "light") {
    return { bg:"#ffffff", fg:"#24292f", muted:"#57606a", border:"#d0d7de", chipBg:"#f6f8fa", accent:"#0969da" };
  }
  return { bg:"#0d1117", fg:"#e6edf3", muted:"#9da7b1", border:"#30363d", chipBg:"#161b22", accent:"#58a6ff" };
}

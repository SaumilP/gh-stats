import { themeTokens } from "../lib/http";
import type { Theme } from "../lib/query";

export function escapeXml(s: string) {
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll("\"","&quot;").replaceAll("'","&apos;");
}

export function cardFrame(theme: Theme, width: number, height: number, title: string) {
  const t = themeTokens(theme);
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapeXml(title)}">
  <rect x="0.5" y="0.5" width="${width-1}" height="${height-1}" rx="14" fill="${t.bg}" stroke="${t.border}" />
`;
}

export function cardFooter() { return `</svg>`; }

export function textLine(theme: Theme, x: number, y: number, text: string, size=14, weight=400, fill?: string) {
  const t = themeTokens(theme);
  const color = fill || t.fg;
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${escapeXml(text)}</text>`;
}

export function muted(theme: Theme, x: number, y: number, text: string, size=12) {
  const t = themeTokens(theme);
  return textLine(theme, x, y, text, size, 400, t.muted);
}

export function chip(theme: Theme, x: number, y: number, label: string) {
  const t = themeTokens(theme);
  const padX=8;
  const w = Math.max(46, label.length * 7.2 + padX*2);
  const h = 22;
  const rx = 10;
  return {
    w,
    svg: `
<g>
  <rect x="${x}" y="${y-h+6}" width="${w}" height="${h}" rx="${rx}" fill="${t.chipBg}" stroke="${t.border}" />
  <text x="${x+padX}" y="${y}" fill="${t.fg}" font-size="12" font-weight="600" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${escapeXml(label)}</text>
</g>`
  };
}

export function bar(theme: Theme, x: number, y: number, w: number, h: number, ratio: number, label: string) {
  const t = themeTokens(theme);
  const filled = Math.max(0, Math.min(1, ratio)) * w;
  return `
<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${t.chipBg}" stroke="${t.border}" />
  <rect x="${x}" y="${y}" width="${filled}" height="${h}" rx="6" fill="${t.accent}" opacity="0.85" />
  <text x="${x}" y="${y-6}" fill="${t.muted}" font-size="12" font-weight="600" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${escapeXml(label)}</text>
</g>`;
}

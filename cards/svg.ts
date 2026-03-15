import type { ThemeStyle } from "../lib/theme";

export function escapeXml(s: string) {
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll("\"","&quot;").replaceAll("'","&apos;");
}

export function cardFrame(style: ThemeStyle, width: number, height: number, title: string, opts: { disableAnimations?: boolean } = {}) {
  const t = style.tokens;
  const stroke = style.hideBorder ? "none" : t.border;
  const strokeWidth = style.hideBorder ? 0 : 1;
  const bgFill = style.bgGradient ? "url(#ghstats-bg)" : t.bg;
  const gradient = style.bgGradient
    ? `
    <linearGradient id="ghstats-bg" gradientTransform="rotate(${Math.round(style.bgGradient.angle || 0)})">
      <stop offset="0%" stop-color="${style.bgGradient.start}" />
      <stop offset="100%" stop-color="${style.bgGradient.end}" />
    </linearGradient>`
    : "";
  const motion = opts.disableAnimations
    ? ""
    : `
      @keyframes ghstatsGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
      .ghstats-bar-fill { transform-box: fill-box; transform-origin: left center; animation: ghstatsGrow 900ms cubic-bezier(.2,.8,.2,1) both; }
      @media (prefers-reduced-motion: reduce) { .ghstats-bar-fill { animation: none; } }
    `;
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" role="img" aria-label="${escapeXml(title)}">
  <defs>
    <style>
      ${motion}
    </style>
    ${gradient}
  </defs>
  <rect x="${strokeWidth ? 0.5 : 0}" y="${strokeWidth ? 0.5 : 0}" width="${width - (strokeWidth ? 1 : 0)}" height="${height - (strokeWidth ? 1 : 0)}" rx="${style.borderRadius}" fill="${bgFill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
`;
}

export function cardFooter() { return `</svg>`; }

export function textLine(style: ThemeStyle, x: number, y: number, text: string, size=14, weight=400, fill?: string) {
  const t = style.tokens;
  const color = fill || t.fg;
  return `<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${escapeXml(text)}</text>`;
}

export function muted(style: ThemeStyle, x: number, y: number, text: string, size=12) {
  const t = style.tokens;
  return textLine(style, x, y, text, size, 400, t.muted);
}

export function chip(style: ThemeStyle, x: number, y: number, label: string) {
  const t = style.tokens;
  const padX=8;
  const w = Math.max(46, label.length * 7.2 + padX*2);
  const h = 22;
  const rx = 10;
  return {
    w,
    svg: `
<g>
  <rect x="${x}" y="${y-h+6}" width="${w}" height="${h}" rx="${rx}" fill="${t.chipBg}" stroke="${style.hideBorder ? "none" : t.border}" />
  <text x="${x+padX}" y="${y}" fill="${t.fg}" font-size="12" font-weight="600" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${escapeXml(label)}</text>
</g>`
  };
}

export function bar(
  style: ThemeStyle,
  x: number,
  y: number,
  w: number,
  h: number,
  ratio: number,
  label: string,
  opts: { labelSize?: number; labelBaselineGap?: number } = {},
) {
  const t = style.tokens;
  const filled = Math.max(0, Math.min(1, ratio)) * w;
  const fillRx = Math.min(6, Math.max(0, filled / 2));
  const labelSize = Math.max(9, Math.min(12, Math.floor(opts.labelSize ?? 12)));
  // SVG text uses baseline positioning; keep a small gap above the bar to avoid collisions.
  const baselineGap = Math.max(4, Math.floor(opts.labelBaselineGap ?? Math.max(5, Math.round(labelSize * 0.5))));
  const labelY = y - baselineGap;
  return `
<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="${t.chipBg}" stroke="${style.hideBorder ? "none" : t.border}" />
  ${filled > 0.5 ? `<rect class="ghstats-bar-fill" x="${x}" y="${y}" width="${filled}" height="${h}" rx="${fillRx}" fill="${t.accent}" opacity="0.85" />` : ""}
  <text x="${x}" y="${labelY}" fill="${t.muted}" font-size="${labelSize}" font-weight="600" font-family="ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial">${escapeXml(label)}</text>
</g>`;
}

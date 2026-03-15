import type { ThemeStyle } from "../lib/theme";
import { bar, cardFooter, cardFrame, muted, textLine } from "./svg";

export type LanguageItem = {
  name: string;
  ratio: number;
  label: string;
};

export type LanguagesCardOptions = {
  compact?: boolean;
  subtitle?: string;
  footer?: string;
  hideTitle?: boolean;
  customTitle?: string;
  layout?: "normal" | "compact" | "donut" | "donut-vertical" | "pie";
  hideProgress?: boolean;
  lineHeight?: number;
  cardWidth?: number;
  textBold?: boolean;
  disableAnimations?: boolean;
};

const palette = [
  "#58a6ff",
  "#56d364",
  "#f2cc60",
  "#ff7b72",
  "#d2a8ff",
  "#79c0ff",
  "#ffa657",
  "#8b949e",
];

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180.0;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function describeDonut(cx: number, cy: number, outer: number, inner: number, startAngle: number, endAngle: number) {
  const outerArc = describeArc(cx, cy, outer, startAngle, endAngle);
  const innerArc = describeArc(cx, cy, inner, endAngle, startAngle);
  const outerStart = polarToCartesian(cx, cy, outer, endAngle);
  const innerStart = polarToCartesian(cx, cy, inner, endAngle);
  return `${outerArc} L ${innerStart.x} ${innerStart.y} ${innerArc} L ${outerStart.x} ${outerStart.y} Z`;
}

export function renderLanguages(
  style: ThemeStyle,
  username: string,
  langs: LanguageItem[],
  opts: LanguagesCardOptions = {},
) {
  const layout = (opts.layout || (opts.compact ? "compact" : "normal")) as LanguagesCardOptions["layout"];
  const title = opts.customTitle || "Top Languages";
  const lineHeight = Math.max(16, Math.min(36, Math.floor(opts.lineHeight || (opts.compact ? 20 : 22))));
  const weight = opts.textBold ? 700 : 600;

  if (layout === "donut" || layout === "pie" || layout === "donut-vertical") {
    const W = Math.max(360, Math.min(900, Math.floor(opts.cardWidth || 560)));
    const donutSize = 120;
    const outer = donutSize / 2;
    const inner = layout === "pie" ? 0 : Math.floor(outer * 0.55);

    const headerY = opts.hideTitle ? 0 : 34;
    const subtitleY = opts.hideTitle ? 0 : 54;

    const listX = layout === "donut-vertical" ? 18 : 200;
    const listY0 = layout === "donut-vertical" ? (opts.hideTitle ? 140 : 170) : (opts.hideTitle ? 40 : 70);

    const legendRows = Math.max(1, langs.length);
    const listHeight = listY0 + legendRows * lineHeight + 16;
    const donutCenterY = layout === "donut-vertical" ? (opts.hideTitle ? 70 : 90) : (opts.hideTitle ? 80 : 100);
    const donutCenterX = layout === "donut-vertical" ? W / 2 : 90;
    const H = Math.max(listHeight, donutCenterY + outer + 24);

    let svg = cardFrame(style, W, H, `${title}: ${username}`, { disableAnimations: opts.disableAnimations });
    if (!opts.hideTitle) {
      svg += textLine(style, 18, headerY, title, 16, 800, style.tokens.title);
      svg += muted(style, 18, subtitleY, opts.subtitle || `@${username}`);
    }

    let angle = 0;
    langs.forEach((lang, idx) => {
      const slice = Math.max(0, Math.min(1, lang.ratio));
      const sliceAngle = slice * 360;
      const color = palette[idx % palette.length];
      if (sliceAngle > 0.5) {
        const path = layout === "pie"
          ? `${describeArc(donutCenterX, donutCenterY, outer, angle, angle + sliceAngle)} L ${donutCenterX} ${donutCenterY} Z`
          : describeDonut(donutCenterX, donutCenterY, outer, inner, angle, angle + sliceAngle);
        svg += `<path d="${path}" fill="${color}" />`;
      }
      angle += sliceAngle;
    });

    langs.forEach((lang, idx) => {
      const y = listY0 + idx * lineHeight;
      const color = palette[idx % palette.length];
      svg += `<rect x="${listX}" y="${y - 10}" width="10" height="10" rx="2" fill="${color}" />`;
      svg += textLine(style, listX + 16, y, lang.label, 12, weight);
    });

    if (opts.footer) svg += muted(style, 18, H - 12, opts.footer, 11);
    svg += cardFooter();
    return svg;
  }

  const W = Math.max(360, Math.min(900, Math.floor(opts.cardWidth || 480)));
  const rows = Math.min(langs.length, 10);
  const rowStep = lineHeight;
  const barH = opts.compact ? 7 : 8;
  const barY0 = opts.hideTitle ? 50 : 86;
  const barW = W - 36;
  const labelSize = opts.compact ? 10 : 11;
  const H = barY0 + rows * rowStep + 24;

  let svg = cardFrame(style, W, H, `${title}: ${username}`, { disableAnimations: opts.disableAnimations });
  if (!opts.hideTitle) {
    svg += textLine(style, 18, 34, title, 16, 800, style.tokens.title);
    svg += muted(style, 18, 54, opts.subtitle || `@${username}`);
  }

  for (let i = 0; i < rows; i++) {
    const lang = langs[i];
    const y = barY0 + i * rowStep;
    if (opts.hideProgress) {
      svg += textLine(style, 18, y, lang.label, 12, weight);
    } else {
      svg += bar(style, 18, y, barW, barH, lang.ratio, lang.label, { labelSize, labelBaselineGap: 5 });
    }
  }

  if (opts.footer) svg += muted(style, 18, H - 12, opts.footer, 11);
  svg += cardFooter();
  return svg;
}

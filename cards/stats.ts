import type { ThemeStyle } from "../lib/theme";
import { cardFrame, cardFooter, textLine, muted } from "./svg";

export type StatsItem = {
  label: string;
  value: string;
  icon?: string;
};

export type StatsCardOptions = {
  compact?: boolean;
  hideTitle?: boolean;
  customTitle?: string;
  showIcons?: boolean;
  lineHeight?: number;
  cardWidth?: number;
  textBold?: boolean;
  disableAnimations?: boolean;
};

export function renderStats(
  style: ThemeStyle,
  header: { name: string; username: string },
  items: StatsItem[],
  opts: StatsCardOptions = {},
) {
  const W = Math.max(320, Math.min(900, Math.floor(opts.cardWidth || 480)));
  const lineHeight = Math.max(16, Math.min(40, Math.floor(opts.lineHeight || (opts.compact ? 20 : 24))));
  const title = opts.customTitle || "GitHub Stats";
  const yTitle = 34;
  const ySubtitle = 54;
  const yStart = opts.hideTitle ? 38 : 72;
  const rows = Math.max(1, items.length);
  const H = yStart + rows * lineHeight + 20;
  const weight = opts.textBold ? 700 : 600;

  let svg = cardFrame(style, W, H, `${title}: ${header.username}`, { disableAnimations: opts.disableAnimations });
  if (!opts.hideTitle) {
    svg += textLine(style, 18, yTitle, title, 16, 800, style.tokens.title);
    svg += muted(style, 18, ySubtitle, `@${header.username}`, 12);
  }

  items.forEach((item, idx) => {
    const icon = opts.showIcons && item.icon ? `${item.icon} ` : "";
    const y = yStart + idx * lineHeight;
    const text = `${icon}${item.label}: ${item.value}`;
    svg += textLine(style, 18, y, text, 13, weight);
  });

  svg += cardFooter();
  return svg;
}

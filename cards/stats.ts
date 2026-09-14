import type { ThemeStyle } from "../lib/theme";
import { cardFrame, cardFooter, textLine, muted } from "./svg";

export type StatsItem = { label: string; value: string; icon?: string };
export type StatsCardOptions = { compact?: boolean; hideTitle?: boolean; customTitle?: string; showIcons?: boolean; lineHeight?: number; cardWidth?: number; textBold?: boolean; disableAnimations?: boolean };

export function renderStats(style: ThemeStyle, header: { name: string; username: string }, items: StatsItem[], opts: StatsCardOptions = {}) {
  const width = Math.max(320, Math.min(900, opts.cardWidth || 480));
  const title = opts.customTitle || "GitHub Overview";
  const rank = items.find(item => item.label === "Rank");
  const metrics = items.filter(item => item.label !== "Rank");
  const top = opts.hideTitle ? 24 : 90;
  const rowHeight = opts.compact ? 60 : 74;
  const height = top + Math.ceil(metrics.length / 2) * rowHeight + 28;
  let svg = cardFrame(style, width, height, `${title}: ${header.username}`, opts);
  if (!opts.hideTitle) {
    svg += textLine(style, 24, 33, title.slice(0, 36), 16, 650, style.tokens.title);
    svg += muted(style, 24, 54, `@${header.username} · public GitHub activity`, 11);
  }
  if (rank) {
    svg += `<circle cx="${width - 44}" cy="40" r="22" fill="${style.tokens.chipBg}" stroke="${style.tokens.accent}" stroke-width="1.5" />`;
    svg += `<g text-anchor="middle">${textLine(style, width - 44, 46, rank.value, rank.value.length > 3 ? 9 : 17, 700, style.tokens.accent)}</g>`;
  }
  svg += `<path d="M24 ${top - 15}H${width - 24}" stroke="${style.tokens.border}" />`;
  metrics.forEach((item, index) => {
    const x = 24 + (index % 2) * (width / 2);
    const y = top + Math.floor(index / 2) * rowHeight;
    svg += muted(style, x, y, item.label.toUpperCase(), 9);
    svg += textLine(style, x, y + 32, item.value, 28, opts.textBold ? 800 : 600);
  });
  svg += muted(style, 24, height - 13, "gh-stats  /  built around you", 9);
  return svg + cardFooter();
}

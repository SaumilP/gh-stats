import type { ThemeStyle } from "../lib/theme";
import { cardFrame, cardFooter, textLine, muted } from "./svg";
export type StreakCardOptions = { compact?: boolean; hideTitle?: boolean; customTitle?: string; footer?: string; cardWidth?: number; lineHeight?: number; showIcons?: boolean; textBold?: boolean; disableAnimations?: boolean };
export function renderStreak(style: ThemeStyle, username: string, data: { current: number; longest: number; total: number }, opts: StreakCardOptions = {}) {
  const width = Math.max(320, Math.min(900, opts.cardWidth || 480));
  const height = opts.compact ? 174 : 194;
  let svg = cardFrame(style, width, height, `Contribution streak: ${username}`, opts);
  if (!opts.hideTitle) {
    svg += textLine(style, 24, 33, opts.customTitle || "Keep the momentum.", 16, 650, style.tokens.title);
    svg += muted(style, 24, 54, `@${username} · past year`, 11);
  }
  const values = [[data.current, "CURRENT STREAK"], [data.longest, "LONGEST STREAK"], [data.total, "ACTIVE DAYS"]];
  values.forEach(([value, label], index) => {
    const x = width / 6 + index * width / 3;
    svg += `<g text-anchor="middle">${textLine(style, x, 113, String(value), 34, 650, index === 0 ? style.tokens.accent : style.tokens.fg)}${muted(style, x, 139, String(label), width < 400 ? 8 : 9)}</g>`;
  });
  svg += muted(style, 24, height - 15, opts.footer || "Every contribution counts.", 10);
  return svg + cardFooter();
}

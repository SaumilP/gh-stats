import type { ThemeStyle } from "../lib/theme";
import { cardFrame, cardFooter, textLine, muted, chip } from "./svg";

export type StreakCardOptions = {
  compact?: boolean;
  hideTitle?: boolean;
  customTitle?: string;
  footer?: string;
  cardWidth?: number;
  lineHeight?: number;
  showIcons?: boolean;
  textBold?: boolean;
  disableAnimations?: boolean;
};

export function renderStreak(
  style: ThemeStyle,
  username: string,
  s: { current: number; longest: number; total: number },
  opts: StreakCardOptions = {},
) {
  const W = Math.max(320, Math.min(900, Math.floor(opts.cardWidth || 480)));
  const H = opts.compact ? 165 : 180;
  const title = opts.customTitle || "Contribution Streak";

  let svg = cardFrame(style, W, H, `${title}: ${username}`, { disableAnimations: opts.disableAnimations });
  if (!opts.hideTitle) {
    svg += textLine(style, 18, 34, title, 16, 800, style.tokens.title);
    svg += muted(style, 18, 54, `@${username} • last 365 days`);
  }

  let x = 18;
  const flame = opts.showIcons ? "🔥 " : "";
  const trophy = opts.showIcons ? "🏆 " : "";
  const check = opts.showIcons ? "✅ " : "";

  const c1 = chip(style, x, 90, `${flame}Current: ${s.current}d`); svg += c1.svg; x += c1.w + 10;
  const c2 = chip(style, x, 90, `${trophy}Longest: ${s.longest}d`); svg += c2.svg;

  svg += chip(style, 18, 122, `${check}Total days contributed: ${s.total}`).svg;
  if (opts.footer) svg += muted(style, 18, H - 16, opts.footer);
  svg += cardFooter();
  return svg;
}

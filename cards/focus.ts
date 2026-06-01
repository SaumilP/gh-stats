import type { ThemeStyle } from "../lib/theme";
import { cardFrame, cardFooter, textLine, muted } from "./svg";

export type FocusCategory = {
  name: string;
  percentage: number;
  commits: number;
  color: string;
};

export type FocusCardOptions = {
  compact?: boolean;
  hideTitle?: boolean;
  customTitle?: string;
  cardWidth?: number;
  disableAnimations?: boolean;
};

export function renderFocus(
  style: ThemeStyle,
  username: string,
  categories: FocusCategory[],
  opts: FocusCardOptions = {},
) {
  const W = Math.max(320, Math.min(900, Math.floor(opts.cardWidth || 480)));
  const title = opts.customTitle || "Recent Focus";
  const barHeight = 10;
  const rowHeight = 28;

  // Calculate height: title + subtitle + rows with bars
  const yTitle = 34;
  const ySubtitle = 54;
  const yStart = opts.hideTitle ? 38 : 72;
  const H = yStart + Math.max(1, categories.length) * rowHeight + 20;

  let svg = cardFrame(style, W, H, `${title}: ${username}`, { disableAnimations: opts.disableAnimations });

  if (!opts.hideTitle) {
    svg += textLine(style, 18, yTitle, title, 16, 800, style.tokens.title);
    svg += muted(style, 18, ySubtitle, `@${username} • recent activity`, 12);
  }

  // Render categories with bars
  categories.forEach((cat, idx) => {
    const y = yStart + idx * rowHeight;
    const labelWidth = 100;
    const barX = 18 + labelWidth + 12;
    const barWidth = W - barX - 35;
    const barY = y + 6;

    // Category label (e.g., "Frontend")
    svg += textLine(style, 18, y, cat.name, 13, 600, style.tokens.fg);

    // Progress bar background
    const barBg = `<rect x="${barX}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="4" fill="${style.tokens.border}" opacity="0.4" />`;
    svg += barBg;

    // Progress bar fill
    const fillWidth = Math.max(0, (cat.percentage / 100) * barWidth);
    const barFill = `<rect x="${barX}" y="${barY}" width="${fillWidth}" height="${barHeight}" rx="4" fill="${cat.color}" />`;
    svg += barFill;

    // Percentage text
    const percentageX = W - 32;
    svg += textLine(style, percentageX, y + 2, `${Math.round(cat.percentage)}%`, 12, 600, cat.color);

    // Commit count below category
    const commitText = cat.commits === 1 ? "1 commit" : `${cat.commits} commits`;
    svg += muted(style, 18, y + 16, commitText, 11);
  });

  // Footer
  svg += muted(style, 18, H - 16, "Recent activity • last year", 11);
  svg += cardFooter();
  return svg;
}

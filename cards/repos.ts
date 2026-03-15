import type { ThemeStyle } from "../lib/theme";
import { cardFrame, cardFooter, textLine, muted } from "./svg";

export type RepoCardItem = { name: string; stars: number; forks: number; desc?: string };

export type ReposCardOptions = {
  compact?: boolean;
  hideTitle?: boolean;
  customTitle?: string;
  lineHeight?: number;
  cardWidth?: number;
  showIcons?: boolean;
  textBold?: boolean;
  showOwner?: boolean;
  disableAnimations?: boolean;
};

export function renderRepos(
  style: ThemeStyle,
  username: string,
  repos: RepoCardItem[],
  opts: ReposCardOptions = {},
) {
  const W = Math.max(360, Math.min(900, Math.floor(opts.cardWidth || (opts.compact ? 560 : 720))));
  const rows = Math.min(6, repos.length);
  const lineHeight = Math.max(16, Math.min(30, Math.floor(opts.lineHeight || (opts.compact ? 20 : 22))));
  const headerHeight = opts.hideTitle ? 40 : 76;
  const H = headerHeight + rows * (lineHeight + 20);
  const weight = opts.textBold ? 700 : 600;
  const title = opts.customTitle || "Top Repositories";

  let svg = cardFrame(style, W, H, `${title}: ${username}`, { disableAnimations: opts.disableAnimations });
  if (!opts.hideTitle) {
    svg += textLine(style, 18, 34, title, 16, 800, style.tokens.title);
    svg += muted(style, 18, 54, `@${username} • stars/forks • public repos`);
  }

  for (let i = 0; i < rows; i++) {
    const r = repos[i];
    const y = headerHeight + i * (lineHeight + 20) - 12;
    const repoName = opts.showOwner ? `${username}/${r.name}` : r.name;
    const star = opts.showIcons ? "⭐" : "";
    const fork = opts.showIcons ? "🍴" : "";
    const sep = opts.showIcons ? " " : "";
    svg += textLine(style, 18, y, `${repoName}  ${star}${sep}${r.stars}  ${fork}${sep}${r.forks}`, 13, weight);
    const d = (r.desc || "").trim();
    if (d) {
      const limit = opts.compact ? 56 : 80;
      const clipped = d.length > limit ? d.slice(0, limit - 3) + "..." : d;
      svg += muted(style, 18, y + lineHeight, clipped, 12);
    }
    svg += `<line x1="18" y1="${y + lineHeight + 10}" x2="${W - 18}" y2="${y + lineHeight + 10}" stroke="${style.hideBorder ? "transparent" : "rgba(125,125,125,0.25)"}" />`;
  }

  svg += cardFooter();
  return svg;
}

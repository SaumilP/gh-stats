import type { Theme } from "../lib/query";
import { cardFrame, cardFooter, textLine, muted, chip } from "./svg";

export function renderStats(theme: Theme, stats: { name: string; username: string; repos: number; followers: number; stars: number; forks: number; }) {
  const W=480, H=190;
  let svg = cardFrame(theme, W, H, `GitHub Stats: ${stats.username}`);
  svg += textLine(theme, 18, 36, stats.name, 18, 800);
  svg += muted(theme, 18, 56, `@${stats.username}`);

  let x=18;
  const c1=chip(theme,x,84,`📦 Repos: ${stats.repos}`); svg+=c1.svg; x+=c1.w+10;
  const c2=chip(theme,x,84,`⭐ Stars: ${stats.stars}`); svg+=c2.svg; x+=c2.w+10;
  const c3=chip(theme,x,84,`🍴 Forks: ${stats.forks}`); svg+=c3.svg;

  svg += chip(theme,18,116,`👥 Followers: ${stats.followers}`).svg;
  svg += muted(theme, 18, 170, "Cache: up to 6h (edge) • Powered by GitHub API");
  svg += cardFooter();
  return svg;
}

import type { Theme } from "../lib/query.js";
import { cardFrame, cardFooter, textLine, muted, chip } from "./svg.js";

export function renderStreak(theme: Theme, username: string, s: { current: number; longest: number; total: number }) {
  const W=480,H=180;
  let svg=cardFrame(theme,W,H,`Contribution Streak: ${username}`);
  svg += textLine(theme,18,34,"Contribution Streak",16,800);
  svg += muted(theme,18,54,`@${username} • last 365 days`);

  let x=18;
  const c1=chip(theme,x,90,`🔥 Current: ${s.current}d`); svg+=c1.svg; x+=c1.w+10;
  const c2=chip(theme,x,90,`🏆 Longest: ${s.longest}d`); svg+=c2.svg;

  svg += chip(theme,18,122,`✅ Total days contributed: ${s.total}`).svg;
  svg += muted(theme,18,164,"Requires GITHUB_TOKEN (GraphQL) for accurate data");
  svg += cardFooter();
  return svg;
}

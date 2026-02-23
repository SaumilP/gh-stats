import type { Theme } from "../lib/query";
import { cardFrame, cardFooter, textLine, muted } from "./svg";

export function renderRepos(theme: Theme, username: string, repos: Array<{ name: string; stars: number; forks: number; desc?: string }>) {
  const W=720;
  const rows=Math.min(6, repos.length);
  const H=92 + rows*44;
  let svg=cardFrame(theme,W,H,`Top Repositories: ${username}`);
  svg += textLine(theme,18,34,"Top Repositories",16,800);
  svg += muted(theme,18,54,`@${username} • stars/forks • public repos`);

  for (let i=0;i<rows;i++){
    const r=repos[i];
    const y=78+i*44;
    svg += textLine(theme,18,y,`${r.name}  ⭐${r.stars}  🍴${r.forks}`,13,700);
    const d=(r.desc||"").trim();
    if (d){
      const clipped=d.length>80? d.slice(0,77)+"…": d;
      svg += muted(theme,18,y+18,clipped,12);
    }
    svg += `<line x1="18" y1="${y+28}" x2="${W-18}" y2="${y+28}" stroke="rgba(125,125,125,0.25)" />`;
  }
  svg += cardFooter();
  return svg;
}

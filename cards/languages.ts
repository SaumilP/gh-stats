import type { Theme } from "../lib/query.js";
import { cardFrame, cardFooter, textLine, muted, bar } from "./svg.js";

export function renderLanguages(theme: Theme, username: string, langs: Array<{ name: string; bytes: number }>) {
  const W=480;
  const rows=Math.min(6, langs.length);
  const H=96 + rows*28;
  let svg=cardFrame(theme,W,H,`Top Languages: ${username}`);
  svg += textLine(theme,18,34,"Top Languages",16,800);
  svg += muted(theme,18,54,`@${username} • by bytes (public repos)`);

  const total = langs.reduce((a,l)=>a+l.bytes,0) || 1;
  for (let i=0;i<rows;i++){
    const l=langs[i];
    const pct=Math.round((l.bytes/total)*100);
    svg += bar(theme,18,70+i*28,360,14,l.bytes/total,`${l.name} (${pct}%)`);
  }
  svg += muted(theme,18,H-16,"Tip: set GITHUB_TOKEN in Vercel for higher rate limits");
  svg += cardFooter();
  return svg;
}

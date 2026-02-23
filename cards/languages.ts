import type { Theme } from "../lib/query";
import { cardFrame, cardFooter, textLine, muted, bar } from "./svg";

export function renderLanguages(
  theme: Theme,
  username: string,
  langs: Array<{ name: string; value: number }>,
  opts: { compact?: boolean; subtitle?: string; footer?: string } = {},
) {
  const W=480;
  const rows=Math.min(6, langs.length);
  const H=(opts.compact ? 86 : 96) + rows*28;
  let svg=cardFrame(theme,W,H,`Top Languages: ${username}`);
  svg += textLine(theme,18,34,"Top Languages",16,800);
  svg += muted(theme,18,54,opts.subtitle || `@${username} • primary language (cheap mode)`);

  const total = langs.reduce((a,l)=>a+(Number(l.value)||0),0) || 1;
  for (let i=0;i<rows;i++){
    const l=langs[i];
    const v = Math.max(0, Number(l.value) || 0);
    const pct=Math.round((v/total)*100);
    svg += bar(theme,18,(opts.compact ? 64 : 70)+i*28,360,14,v/total,`${l.name} (${pct}%)`);
  }
  svg += muted(theme,18,H-16,opts.footer || "Tip: set GITHUB_TOKEN in Vercel for higher rate limits");
  svg += cardFooter();
  return svg;
}

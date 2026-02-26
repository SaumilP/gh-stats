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
  const rowStep = opts.compact ? 24 : 26;
  const barH = opts.compact ? 7 : 8;
  const barY0 = opts.compact ? 82 : 88;
  const barW = W - 36;
  const labelSize = opts.compact ? 10 : 11;
  const labelBaselineGap = opts.compact ? 5 : 5;
  const H = barY0 + rows * rowStep + 28;
  let svg=cardFrame(theme,W,H,`Top Languages: ${username}`);
  svg += textLine(theme,18,34,"Top Languages",16,800);
  svg += muted(theme,18,54,opts.subtitle || `@${username} • primary language (cheap mode)`);

  const total = langs.reduce((a,l)=>a+(Number(l.value)||0),0) || 1;
  for (let i=0;i<rows;i++){
    const l=langs[i];
    const v = Math.max(0, Number(l.value) || 0);
    const pct=Math.round((v/total)*100);
    const y = barY0 + i * rowStep;
    svg += bar(theme,18,y,barW,barH,v/total,`${l.name} (${pct}%)`, { labelSize, labelBaselineGap });
  }
  svg += muted(theme,18,H-16,opts.footer || "Tip: set GITHUB_TOKEN in Vercel for higher rate limits");
  svg += cardFooter();
  return svg;
}

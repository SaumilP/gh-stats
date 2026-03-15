import type { ThemeStyle } from "../lib/theme";
import { cardFrame, cardFooter, textLine, muted } from "./svg";

export type PinCardData = {
  owner: string;
  repo: string;
  description?: string | null;
  stars: number;
  forks: number;
  language?: string | null;
};

export type PinCardOptions = {
  showOwner?: boolean;
  descriptionLinesCount?: number;
  hideTitle?: boolean;
  customTitle?: string;
  cardWidth?: number;
  lineHeight?: number;
  showIcons?: boolean;
  textBold?: boolean;
  disableAnimations?: boolean;
};

function wrapText(text: string, maxLen: number, maxLines: number): string[] {
  if (!text) return [];
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (next.length > maxLen) {
      lines.push(line || w);
      line = w;
      if (lines.length >= maxLines) break;
    } else {
      line = next;
    }
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length > maxLines) return lines.slice(0, maxLines);
  return lines;
}

export function renderPin(style: ThemeStyle, data: PinCardData, opts: PinCardOptions = {}) {
  const W = Math.max(320, Math.min(900, Math.floor(opts.cardWidth || 480)));
  const title = opts.customTitle || "Pinned Repo";
  const header = opts.hideTitle ? 36 : 64;
  const lineHeight = Math.max(16, Math.min(30, Math.floor(opts.lineHeight || 20)));
  const descLines = Math.max(1, Math.min(3, Math.floor(opts.descriptionLinesCount || 2)));
  const desc = (data.description || "").trim();
  const wrapped = wrapText(desc, 60, descLines);
  const H = header + (wrapped.length * lineHeight) + 58;
  const weight = opts.textBold ? 700 : 600;
  const ownerRepo = opts.showOwner ? `${data.owner}/${data.repo}` : data.repo;

  let svg = cardFrame(style, W, H, `${title}: ${ownerRepo}`, { disableAnimations: opts.disableAnimations });
  if (!opts.hideTitle) {
    svg += textLine(style, 18, 34, title, 16, 800, style.tokens.title);
    svg += muted(style, 18, 54, `@${data.owner}`);
  }

  svg += textLine(style, 18, header, ownerRepo, 14, weight);

  let y = header + lineHeight;
  for (const line of wrapped) {
    svg += muted(style, 18, y, line, 12);
    y += lineHeight - 2;
  }

  const star = opts.showIcons ? "⭐ " : "";
  const fork = opts.showIcons ? "🍴 " : "";
  const lang = data.language ? ` • ${data.language}` : "";
  svg += muted(style, 18, H - 16, `${star}${data.stars}  ${fork}${data.forks}${lang}`, 12);
  svg += cardFooter();
  return svg;
}

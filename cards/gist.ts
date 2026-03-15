import type { ThemeStyle } from "../lib/theme";
import { cardFrame, cardFooter, textLine, muted } from "./svg";

export type GistCardData = {
  owner: string;
  description?: string | null;
  files: Array<{ name: string; language?: string | null }>;
  comments: number;
};

export type GistCardOptions = {
  hideTitle?: boolean;
  customTitle?: string;
  cardWidth?: number;
  lineHeight?: number;
  showIcons?: boolean;
  textBold?: boolean;
  disableAnimations?: boolean;
};

export function renderGist(style: ThemeStyle, data: GistCardData, opts: GistCardOptions = {}) {
  const W = Math.max(320, Math.min(900, Math.floor(opts.cardWidth || 480)));
  const title = opts.customTitle || "Gist";
  const lineHeight = Math.max(16, Math.min(30, Math.floor(opts.lineHeight || 20)));
  const header = opts.hideTitle ? 40 : 64;
  const listRows = Math.min(3, data.files.length);
  const H = header + 24 + listRows * lineHeight + 36;
  const weight = opts.textBold ? 700 : 600;

  let svg = cardFrame(style, W, H, `${title}: ${data.owner}`, { disableAnimations: opts.disableAnimations });
  if (!opts.hideTitle) {
    svg += textLine(style, 18, 34, title, 16, 800, style.tokens.title);
    svg += muted(style, 18, 54, `@${data.owner}`);
  }

  const desc = (data.description || "No description").trim();
  svg += textLine(style, 18, header, desc.length > 60 ? desc.slice(0, 57) + "..." : desc, 13, weight);

  let y = header + 22;
  for (let i = 0; i < listRows; i++) {
    const f = data.files[i];
    const lang = f.language ? ` • ${f.language}` : "";
    svg += muted(style, 18, y, `${f.name}${lang}`, 12);
    y += lineHeight;
  }

  const commentIcon = opts.showIcons ? "💬 " : "";
  svg += muted(style, 18, H - 16, `${commentIcon}${data.comments} comments`, 12);
  svg += cardFooter();
  return svg;
}

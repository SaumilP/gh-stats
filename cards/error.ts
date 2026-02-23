import type { Theme } from "../lib/query";
import { cardFooter, cardFrame, muted, textLine } from "./svg";

type ErrorCardInput = {
  endpoint: string;
  username?: string;
  requestId: string;
  title?: string;
  hint?: string;
  detail?: string;
  compact?: boolean;
};

export function renderErrorCard(theme: Theme, input: ErrorCardInput) {
  const W = 720;
  const H = input.compact ? 150 : 180;
  const title = input.title || "Something went wrong";
  const ep = input.endpoint || "unknown";
  const u = input.username ? `@${input.username}` : "(missing username)";

  let svg = cardFrame(theme, W, H, `Error: ${ep}`);
  svg += textLine(theme, 18, 34, "⚠️ Error", 16, 800);
  svg += muted(theme, 18, 54, `${title} • ${ep} • ${u}`, 12);

  let y = 80;
  if (input.hint) {
    svg += textLine(theme, 18, y, `Hint: ${input.hint}`, 13, 600);
    y += 22;
  }
  if (input.detail) {
    const d = input.detail.length > 120 ? input.detail.slice(0, 117) + "…" : input.detail;
    svg += muted(theme, 18, y, d, 12);
    y += 20;
  }

  svg += muted(theme, 18, H - 16, `requestId: ${input.requestId}`, 11);
  svg += cardFooter();
  return svg;
}


import { resolveTheme } from "./theme";
import { renderStats } from "../cards/stats";
import { renderLanguages } from "../cards/languages";
import { renderStreak } from "../cards/streak";
import { renderRepos } from "../cards/repos";
import { renderFocus } from "../cards/focus";
import { renderPin } from "../cards/pin";
import { renderGist } from "../cards/gist";
import { renderImpact } from "../cards/impact";

export function exampleCard(card: string) {
  const style = resolveTheme({ theme: "dark", titleColor: "bce9d5", borderColor: "29312f", bgColor: "111816" });
  const langs = [{ name: "TypeScript", ratio: .54, label: "TypeScript · 54%" }, { name: "Rust", ratio: .28, label: "Rust · 28%" }, { name: "Python", ratio: .18, label: "Python · 18%" }];
  if (card === "languages" || card === "wakatime") return renderLanguages(style, "your-handle", langs, { layout: "donut", disableAnimations: true, subtitle: "A stack that tells your story", cardWidth: 480 });
  if (card === "streak") return renderStreak(style, "your-handle", { current: 24, longest: 86, total: 248 });
  if (card === "repos") return renderRepos(style, "your-handle", [{ name: "something-great", stars: 1284, forks: 96, desc: "An idea worth sharing with the world." }, { name: "tiny-tools", stars: 642, forks: 34, desc: "Small utilities. Thoughtfully built." }], { cardWidth: 480 });
  if (card === "focus") return renderFocus(style, "your-handle", [{ name: "Frontend", percentage: 62, commits: 24, color: "#6ee7b7" }, { name: "Backend", percentage: 38, commits: 15, color: "#94b8ff" }]);
  if (card === "pin") return renderPin(style, { owner: "your-handle", repo: "something-great", stars: 1284, forks: 96, language: "TypeScript", description: "An idea worth sharing with the world." });
  if (card === "gist") return renderGist(style, { owner: "your-handle", description: "A useful little snippet", files: [{ name: "hello-world.ts", language: "TypeScript" }], comments: 12 });
  if (card === "impact") return renderImpact(style, "your-handle", Array.from({ length: 365 }, (_, index) => ({ date: new Date(Date.now() - (364 - index) * 86400000).toISOString().slice(0, 10), count: (index * 17 % 13) })), { cardWidth: 760, disableAnimations: true });
  return renderStats(style, { name: "Your name", username: "your-handle" }, [{ label: "Total stars", value: "2.4k" }, { label: "Repositories", value: "48" }, { label: "Total forks", value: "386" }, { label: "Followers", value: "1.2k" }, { label: "Rank", value: "A+" }]);
}

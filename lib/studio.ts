export const CARD_TYPES = [
  { id: "stats", label: "Overview", description: "Your open-source story, in numbers.", icon: "chart" },
  { id: "languages", label: "Languages", description: "A colorful breakdown of your stack.", icon: "code" },
  { id: "streak", label: "Streak", description: "Show up. Build things. Keep going.", icon: "flame" },
  { id: "impact", label: "Impact", description: "A year of contributions at a glance.", icon: "grid" },
  { id: "repos", label: "Repositories", description: "Put your most-loved projects first.", icon: "repo" },
  { id: "focus", label: "Focus", description: "The languages behind your recent repositories.", icon: "target" },
  { id: "pin", label: "Pinned repo", description: "Give one great project the spotlight.", icon: "pin" },
  { id: "gist", label: "Gist", description: "Small snippets. Big ideas.", icon: "file" },
  { id: "wakatime", label: "WakaTime", description: "Your publicly shared coding activity.", icon: "clock" },
] as const;
export type StudioCard = typeof CARD_TYPES[number]["id"];
export type StudioConfig = { username: string; card: StudioCard; theme: string; layout: string; title: string; border: boolean; accent: string; repo: string; gist: string; range: string };
export const DEFAULT_CONFIG: StudioConfig = { username: "octocat", card: "stats", theme: "dark", layout: "normal", title: "", border: true, accent: "", repo: "gh-stats", gist: "", range: "last_7_days" };

export function cardPath(config: StudioConfig, overrideTheme?: string) {
  const params = new URLSearchParams();
  if (config.card === "gist") params.set("id", config.gist);
  else if (config.card === "pin") params.set("repo", `${config.username}/${config.repo}`);
  else params.set("username", config.username);
  params.set("theme", overrideTheme || config.theme);
  if (["languages", "wakatime"].includes(config.card)) params.set("layout", config.layout);
  if (config.card === "wakatime") params.set("range", config.range);
  if (config.title) params.set("custom_title", config.title);
  if (!config.border) params.set("hide_border", "true");
  if (config.accent) params.set("title_color", config.accent.replace("#", ""));
  return `/api/${config.card}?${params}`;
}

export function embedCode(config: StudioConfig, origin: string, format: string) {
  const url = origin + cardPath(config);
  const alt = `${CARD_TYPES.find(card => card.id === config.card)?.label} for ${config.username}`;
  const htmlEscape = (value: string) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  if (format === "URL") return url;
  if (format === "HTML") return `<img src="${htmlEscape(url)}" alt="${htmlEscape(alt)}" />`;
  if (format === "Adaptive") return `<picture>\n  <source media="(prefers-color-scheme: dark)" srcset="${htmlEscape(origin + cardPath(config, "dark"))}" />\n  <img src="${htmlEscape(origin + cardPath(config, "light"))}" alt="${htmlEscape(alt)}" />\n</picture>`;
  return `![${alt.replace(/[[\]\\]/g, "")}](${url})`;
}

export function configFromSearch(search: string, themes: string[]): StudioConfig {
  const p = new URLSearchParams(search);
  const config = { ...DEFAULT_CONFIG };
  for (const key of ["username", "title", "repo", "gist", "accent"] as const) if (p.has(key)) config[key] = (p.get(key) || "").slice(0, 100);
  if (CARD_TYPES.some(card => card.id === p.get("card"))) config.card = p.get("card") as StudioCard;
  if (themes.includes(p.get("theme") || "")) config.theme = p.get("theme")!;
  if (["normal", "compact", "donut", "donut-vertical", "pie"].includes(p.get("layout") || "")) config.layout = p.get("layout")!;
  if (["last_7_days", "last_30_days", "last_year", "all_time"].includes(p.get("range") || "")) config.range = p.get("range")!;
  if (p.get("border") === "false") config.border = false;
  return config;
}

function envInt(name: string, def: number) {
  const raw = process.env[name];
  if (raw === undefined) return def;
  const n = Number.parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : def;
}

export function ttlSecondsFor(endpoint: "stats" | "repos" | "langs" | "streak") {
  if (endpoint === "langs") return envInt("CACHE_TTL_LANGUAGES", 86400);
  if (endpoint === "repos") return envInt("CACHE_TTL_REPOS", 21600);
  if (endpoint === "streak") return envInt("CACHE_TTL_STREAK", 21600);
  return envInt("CACHE_TTL_STATS", 21600);
}

export function staleExtraSecondsFor(endpoint: "stats" | "repos" | "langs" | "streak") {
  // Keep stale entries around to enable soft-TTL checks without recomputing.
  if (endpoint === "langs") return 7 * 86400;
  return 2 * 86400;
}

export function hasGithubToken() {
  return Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);
}


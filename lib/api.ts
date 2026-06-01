import { Theme, CardType } from "./types";

export function buildCardUrl(
  endpoint: string,
  username: string,
  theme: Theme,
  extra?: Record<string, string>
): string {
  const params = new URLSearchParams({
    username,
    theme,
    ...extra,
  });

  return `${endpoint}?${params.toString()}`;
}

export function getCardUrls(
  username: string,
  theme: Theme,
  domain: string = "https://gh-stats.com/api"
) {
  return {
    stats: buildCardUrl(`${domain}/stats`, username, theme),
    languages: buildCardUrl(`${domain}/languages`, username, theme),
    repos: buildCardUrl(`${domain}/repos`, username, theme),
    streak: buildCardUrl(`${domain}/streak`, username, theme),
  };
}

export function generateEmbedCode(username: string, domain: string): string {
  const theme = "auto";
  const urls = getCardUrls(username, theme, domain);

  return `<a href="https://github.com/${username}">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="${urls.stats}" />
    <img src="${urls.stats}" alt="GitHub stats for ${username}" />
  </picture>
</a>`;
}

export function clampUsername(input: string): string {
  if (!input || input.trim() === "") {
    return "octocat";
  }

  // Remove special characters, keep only alphanumeric and hyphens
  let sanitized = input.replace(/[^a-zA-Z0-9-]/g, "");

  // Limit to 39 characters (GitHub username max)
  sanitized = sanitized.substring(0, 39);

  // If empty after sanitization, default to octocat
  return sanitized || "octocat";
}

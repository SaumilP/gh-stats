import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.GH_STATS_BASE_URL || process.env.BASE_URL;
const username = process.env.GH_STATS_USERNAME || process.env.USERNAME;
const repo = process.env.GH_REPOSITORY_NAME || process.env.REPO_NAME;
const gistid = process.env.GIST_ID || process.env.GIST_ID;

if (!baseUrl || !username || repo || gistid) {
  console.error("Missing GH_STATS_BASE_URL and/or GH_STATS_USERNAME env vars.");
  process.exit(2);
}

const outDir = join(process.cwd(), "public", "cards");
await mkdir(outDir, { recursive: true });

const themes = ["dark", "light"];

const endpoints = [
  {
    name: "stats",
    path: ({ username, theme }) => `/api/stats?username=${username}&theme=${theme}&`,
  },
  {
    name: "repos",
    path: ({ username, theme }) =>
      `/api/repos?username=${username}&theme=${theme}&count=6&sort=stars`,
  },
  {
    name: "languages",
    path: ({ username, theme }) =>
      `/api/languages?username=${username}&theme=${theme}&mode=primary`,
  },
  {
    name: "streak",
    path: ({ username, theme }) => `/api/streak?username=${username}&theme=${theme}&`,
  },
  {
    name: "pin",
    path: ({ username, theme, repo }) => `/api/pin?repo=${username}/${repo}&theme=${theme}&show_icons=true`,
  },
  {
    name: "gist",
    path: ({ gistid, theme }) => `/api/gist?id=${gistid}&theme=${theme}&show_icons=true`,
  },
];

async function fetchText(url) {
  const resp = await fetch(url, { headers: { "User-Agent": "gh-stats-pregenerate" } });
  if (!resp.ok) throw new Error(`Fetch failed ${resp.status} for ${url}`);
  return resp.text();
}

function resolveEndpointPath(pathTemplate, { username, theme }) {
  const resolvedPath =
    typeof pathTemplate === "function"
      ? pathTemplate({
          username: encodeURIComponent(username),
          theme: encodeURIComponent(theme),
        })
      : pathTemplate;

  // Ensure format/compact are appended last, regardless of existing query params.
  const separator = resolvedPath.includes("?")
    ? resolvedPath.endsWith("?") || resolvedPath.endsWith("&")
      ? ""
      : "&"
    : "?";

  return `${resolvedPath}${separator}format=svg&compact=1`;
}

for (const ep of endpoints) {
  for (const theme of themes) {
    const path = resolveEndpointPath(ep.path, { username, theme });
    const url = new URL(path, baseUrl).toString();
    const svg = await fetchText(url);
    const file = join(outDir, `${ep.name}-${theme}.svg`);
    await writeFile(file, svg, "utf8");
    console.log(`Wrote ${file}`);
  }
}

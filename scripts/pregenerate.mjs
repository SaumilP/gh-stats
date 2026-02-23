import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const baseUrl = process.env.GH_STATS_BASE_URL || process.env.BASE_URL;
const username = process.env.GH_STATS_USERNAME || process.env.USERNAME;

if (!baseUrl || !username) {
  console.error("Missing GH_STATS_BASE_URL and/or GH_STATS_USERNAME env vars.");
  process.exit(2);
}

const outDir = join(process.cwd(), "public", "cards");
await mkdir(outDir, { recursive: true });

const themes = ["dark", "light"];

const endpoints = [
  { name: "stats", path: "/api/stats" },
  { name: "repos", path: "/api/repos?count=6&sort=stars" },
  { name: "languages", path: "/api/languages?mode=primary" },
  { name: "streak", path: "/api/streak" },
];

async function fetchText(url) {
  const resp = await fetch(url, { headers: { "User-Agent": "gh-stats-pregenerate" } });
  if (!resp.ok) throw new Error(`Fetch failed ${resp.status} for ${url}`);
  return resp.text();
}

for (const ep of endpoints) {
  for (const theme of themes) {
    const url = new URL(baseUrl);
    url.pathname = ep.path.startsWith("/") ? ep.path : `/${ep.path}`;
    if (url.pathname.includes("?")) {
      const [p, q] = url.pathname.split("?");
      url.pathname = p;
      url.search = q;
    }
    url.searchParams.set("username", username);
    url.searchParams.set("theme", theme);
    url.searchParams.set("format", "svg");
    url.searchParams.set("compact", "1");

    const svg = await fetchText(url.toString());
    const file = join(outDir, `${ep.name}-${theme}.svg`);
    await writeFile(file, svg, "utf8");
    console.log(`Wrote ${file}`);
  }
}


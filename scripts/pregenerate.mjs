import { mkdir, writeFile, rename } from "node:fs/promises";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

export function targets(env) {
  const username = env.GH_STATS_USERNAME;
  if (!env.GH_STATS_BASE_URL || !username) throw new Error("Set GH_STATS_BASE_URL and GH_STATS_USERNAME.");
  const base = new URL(env.GH_STATS_BASE_URL);
  if (base.protocol !== "https:" && base.hostname !== "localhost") throw new Error("Use an HTTPS service URL.");
  return ["dark", "light"].flatMap(theme => {
    const endpoints = ["stats", "repos", "languages", "streak", "focus", "impact"];
    if (env.GH_REPOSITORY_NAME) endpoints.push("pin");
    if (env.GIST_ID) endpoints.push("gist");
    return endpoints.map(endpoint => {
      const params = new URLSearchParams({ theme, format: "svg", compact: "1" });
      if (endpoint === "pin") params.set("repo", `${username}/${env.GH_REPOSITORY_NAME}`);
      else if (endpoint === "gist") params.set("id", env.GIST_ID);
      else params.set("username", username);
      return { name: `${endpoint}-${theme}.svg`, url: new URL(`/api/${endpoint}?${params}`, base) };
    });
  });
}

export function validateSvg(body) {
  if (!body.includes("<svg") || !body.includes("</svg>") || /data-error="true"|aria-label="Error:/.test(body)) throw new Error("Refusing to publish an invalid or error SVG.");
}

export async function generate(env = process.env) {
  // Fetch and validate the entire batch before touching the previous good cards.
  const results = [];
  for (const target of targets(env)) {
    const response = await fetch(target.url, { headers: { "User-Agent": "gh-stats-pregenerate" }, signal: AbortSignal.timeout(30_000) });
    if (!response.ok || response.headers.get("x-card-status") === "error") throw new Error(`Card request failed: ${target.name} (${response.status})`);
    const body = await response.text();
    validateSvg(body);
    results.push({ ...target, body });
  }
  const directory = join(process.cwd(), "public", "cards");
  await mkdir(directory, { recursive: true });
  for (const result of results) {
    const path = join(directory, result.name);
    await writeFile(`${path}.tmp`, result.body, "utf8");
    await rename(`${path}.tmp`, path);
    console.log(`Updated ${result.name}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  generate().catch(error => { console.error(error.message); process.exitCode = 1; });
}

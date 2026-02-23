import { qFormat, qString, qTheme } from "../lib/query.js";
import { setJsonHeaders, setSvgHeaders } from "../lib/http.js";
import { getUser, listRepos } from "../lib/github.js";
import { renderStats } from "../cards/stats.js";

export default async function handler(req: any, res: any) {
  const username = qString(req.query, "username");
  if (!username) {
    setJsonHeaders(res);
    res.status(400).send(JSON.stringify({ error: "Missing ?username=" }));
    return;
  }
  const theme = qTheme(req.query);
  const format = qFormat(req.query);

  try {
    const user = await getUser(username);
    const repos = await listRepos(username);
    const stars = repos.reduce((a: number, r: any) => a + (r.stargazers_count || 0), 0);
    const forks = repos.reduce((a: number, r: any) => a + (r.forks_count || 0), 0);

    const stats = { name: user.name || username, username, repos: user.public_repos || repos.length, followers: user.followers || 0, stars, forks };

    if (format === "json") { setJsonHeaders(res); res.status(200).send(JSON.stringify(stats)); return; }

    setSvgHeaders(res);
    res.status(200).send(renderStats(theme, stats));
  } catch (e: any) {
    setJsonHeaders(res);
    res.status(500).send(JSON.stringify({ error: "Failed to generate stats", detail: String(e?.message || e) }));
  }
}

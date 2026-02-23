import { qFormat, qInt, qString, qTheme } from "../lib/query";
import { setJsonHeaders, setSvgHeaders } from "../lib/http";
import { listRepos } from "../lib/github";
import { renderRepos } from "../cards/repos";

function sortRepos(repos: any[], sort: string) {
  const s = (sort || "stars").toLowerCase();
  if (s === "updated") return repos.sort((a,b)=> (new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()));
  if (s === "forks") return repos.sort((a,b)=> (b.forks_count||0)-(a.forks_count||0));
  return repos.sort((a,b)=> (b.stargazers_count||0)-(a.stargazers_count||0));
}

export default async function handler(req: any, res: any) {
  const username = qString(req.query, "username");
  if (!username) { setJsonHeaders(res); res.status(400).send(JSON.stringify({ error: "Missing ?username=" })); return; }

  const theme = qTheme(req.query);
  const format = qFormat(req.query);
  const count = qInt(req.query, "count", 6, 1, 10);
  const sort = qString(req.query, "sort", "stars") || "stars";

  try {
    const repos = await listRepos(username);
    const filtered = repos.filter((r:any)=> !r.fork && !r.archived);
    const ordered = sortRepos(filtered, sort).slice(0, count);

    const out = ordered.map((r:any)=> ({ name: r.name, stars: r.stargazers_count || 0, forks: r.forks_count || 0, desc: r.description || "" }));

    if (format === "json") { setJsonHeaders(res); res.status(200).send(JSON.stringify({ username, sort, count, repos: out })); return; }

    setSvgHeaders(res);
    res.status(200).send(renderRepos(theme, username, out));
  } catch (e:any) {
    setJsonHeaders(res);
    res.status(500).send(JSON.stringify({ error: "Failed to generate repos card", detail: String(e?.message || e) }));
  }
}

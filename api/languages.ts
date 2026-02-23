import { qFormat, qString, qTheme } from "../lib/query.js";
import { setJsonHeaders, setSvgHeaders } from "../lib/http.js";
import { listRepos, getRepoLanguages } from "../lib/github.js";
import { renderLanguages } from "../cards/languages.js";

export default async function handler(req: any, res: any) {
  const username = qString(req.query, "username");
  if (!username) { setJsonHeaders(res); res.status(400).send(JSON.stringify({ error: "Missing ?username=" })); return; }

  const theme = qTheme(req.query);
  const format = qFormat(req.query);

  try {
    const repos = await listRepos(username);
    const filtered = repos.filter((r:any)=> !r.fork && !r.archived).slice(0, 30); // limit for rate

    const totals = new Map<string, number>();
    for (const r of filtered) {
      const langs = await getRepoLanguages(username, r.name);
      for (const [k,v] of Object.entries(langs)) {
        totals.set(k, (totals.get(k) || 0) + Number(v));
      }
    }

    const out = [...totals.entries()].map(([name, bytes])=>({ name, bytes })).sort((a,b)=> b.bytes - a.bytes);

    if (format === "json") { setJsonHeaders(res); res.status(200).send(JSON.stringify({ username, languages: out })); return; }

    setSvgHeaders(res);
    res.status(200).send(renderLanguages(theme, username, out));
  } catch (e:any) {
    setJsonHeaders(res);
    res.status(500).send(JSON.stringify({ error: "Failed to generate languages card", detail: String(e?.message || e) }));
  }
}

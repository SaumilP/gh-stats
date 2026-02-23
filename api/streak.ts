import { qFormat, qString, qTheme } from "../lib/query";
import { setJsonHeaders, setSvgHeaders } from "../lib/http";
import { graphQL } from "../lib/github";
import { computeStreak } from "../lib/streak";
import { renderStreak } from "../cards/streak";

type GqlResp = {
  user: { contributionsCollection: { contributionCalendar: { weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number }> }> } } };
};

const QUERY = `
query($login:String!) {
  user(login:$login) {
    contributionsCollection {
      contributionCalendar {
        weeks { contributionDays { date contributionCount } }
      }
    }
  }
}
`;

export default async function handler(req: any, res: any) {
  const username = qString(req.query, "username");
  if (!username) { setJsonHeaders(res); res.status(400).send(JSON.stringify({ error: "Missing ?username=" })); return; }

  const theme = qTheme(req.query);
  const format = qFormat(req.query);

  try {
    const data = await graphQL<GqlResp>(QUERY, { login: username });

    const days = data.user.contributionsCollection.contributionCalendar.weeks
      .flatMap(w => w.contributionDays.map(d => ({ date: d.date, count: d.contributionCount })))
      .sort((a,b)=> a.date.localeCompare(b.date));

    const streak = computeStreak(days);

    if (format === "json") { setJsonHeaders(res); res.status(200).send(JSON.stringify({ username, ...streak })); return; }

    setSvgHeaders(res);
    res.status(200).send(renderStreak(theme, username, streak));
  } catch (e:any) {
    setJsonHeaders(res);
    res.status(500).send(JSON.stringify({ error: "Failed to generate streak card", detail: String(e?.message || e), hint: "Set GITHUB_TOKEN in Vercel env vars to enable /api/streak" }));
  }
}

const GH_API = "https://api.github.com";

function authHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function ghFetch(url: string, init: RequestInit = {}) {
  const headers = {
    "User-Agent": "github-stats-vercel",
    "Accept": "application/vnd.github+json",
    ...authHeaders(),
    ...(init.headers || {}),
  } as Record<string, string>;

  const resp = await fetch(url, { ...init, headers });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`GitHub API error ${resp.status}: ${txt.slice(0, 300)}`);
  }
  return resp;
}

export async function getUser(username: string) {
  const resp = await ghFetch(`${GH_API}/users/${encodeURIComponent(username)}`);
  return (await resp.json()) as any;
}

export async function listRepos(username: string) {
  const resp = await ghFetch(`${GH_API}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`);
  return (await resp.json()) as any;
}

export async function getRepoLanguages(owner: string, repo: string) {
  const resp = await ghFetch(`${GH_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`);
  return (await resp.json()) as any;
}

export async function graphQL<T>(query: string, variables: Record<string, any>): Promise<T> {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) throw new Error("Missing GITHUB_TOKEN for GraphQL endpoint.");
  const resp = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "User-Agent": "github-stats-vercel",
      "Content-Type": "application/json",
      "Accept": "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`GitHub GraphQL error ${resp.status}: ${txt.slice(0, 300)}`);
  }
  const payload = (await resp.json()) as any;
  if (payload.errors?.length) throw new Error(`GitHub GraphQL errors: ${JSON.stringify(payload.errors).slice(0, 300)}`);
  return payload.data as T;
}

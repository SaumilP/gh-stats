const GH_API = "https://api.github.com";

function authHeaders() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function githubTokenPresent() {
  return Boolean(process.env.GITHUB_TOKEN || process.env.GH_TOKEN);
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

export async function listReposPage(username: string, perPage: number, sort: "updated" | "pushed" | "created" | "full_name" = "updated") {
  const pp = Math.max(1, Math.min(100, Math.floor(perPage)));
  const resp = await ghFetch(`${GH_API}/users/${encodeURIComponent(username)}/repos?per_page=${pp}&sort=${encodeURIComponent(sort)}`);
  return (await resp.json()) as any;
}

export async function getLatestRepoUpdatedAt(username: string): Promise<string | null> {
  const repos = await listReposPage(username, 1, "updated");
  const first = Array.isArray(repos) ? repos[0] : null;
  const ts = first?.updated_at;
  return typeof ts === "string" ? ts : null;
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

export type RepoNode = {
  name: string;
  description?: string | null;
  stargazerCount: number;
  forkCount: number;
  isFork: boolean;
  isArchived: boolean;
  updatedAt: string;
  primaryLanguage?: { name: string } | null;
};

export type UserRepoSummary = {
  login: string;
  name?: string | null;
  followers: number;
  publicRepos: number;
  repos: RepoNode[];
};

const USER_REPOS_QUERY = `
query($login:String!, $repoLimit:Int!) {
  user(login:$login) {
    login
    name
    followers { totalCount }
    repositories(privacy:PUBLIC, first:$repoLimit, orderBy:{field:UPDATED_AT, direction:DESC}) {
      totalCount
      nodes {
        name
        description
        stargazerCount
        forkCount
        isFork
        isArchived
        updatedAt
        primaryLanguage { name }
      }
    }
  }
}
`;

export async function getUserRepoSummary(login: string, repoLimit = 100): Promise<UserRepoSummary> {
  type Gql = {
    user: {
      login: string;
      name?: string | null;
      followers: { totalCount: number };
      repositories: { totalCount: number; nodes: RepoNode[] };
    } | null;
  };
  const data = await graphQL<Gql>(USER_REPOS_QUERY, { login, repoLimit: Math.max(1, Math.min(100, Math.floor(repoLimit))) });
  if (!data.user) throw new Error("GitHub user not found.");
  return {
    login: data.user.login,
    name: data.user.name,
    followers: data.user.followers.totalCount || 0,
    publicRepos: data.user.repositories.totalCount || 0,
    repos: data.user.repositories.nodes || [],
  };
}

export async function getRateLimit() {
  const resp = await ghFetch(`${GH_API}/rate_limit`);
  return (await resp.json()) as any;
}

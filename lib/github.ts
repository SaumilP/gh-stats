import { createHash } from "node:crypto";
import { cachedData } from "./data-cache";
import { requestContext } from "./context";

const GH_API = "https://api.github.com";
let cooldownUntil = 0;
let cooldownReason = "rate_limited";

export function githubTokenPresent() { return Boolean((process.env.GITHUB_TOKEN || process.env.GH_TOKEN)?.trim()); }
export function githubStatus() { return { tokenPresent: githubTokenPresent(), cooldownUntil: cooldownUntil > Date.now() ? new Date(cooldownUntil).toISOString() : null }; }

async function ghFetch(url: string, init: RequestInit = {}) {
  if (Date.now() < cooldownUntil) throw new Error(cooldownReason);
  const token = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN)?.trim();
  for (let attempt = 0; attempt < 2; attempt++) {
    const remaining = (requestContext.getStore()?.deadline ?? Date.now() + 8000) - Date.now();
    if (remaining < 100) throw new Error("request_timeout");
    let response: Response;
    try {
      response = await fetch(url, {
        ...init,
        headers: { "User-Agent": "gh-stats", Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers },
        signal: AbortSignal.timeout(Math.min(8000, remaining)),
        cache: "no-store",
      });
    } catch { throw new Error("upstream_timeout"); }
    if (response.ok) return response;
    if (response.status === 404) throw new Error("not_found");
    if (response.status === 401 || response.status === 403 || response.status === 429) {
      cooldownReason = response.status === 401 ? "token_invalid" : "rate_limited";
      const reset = Number(response.headers.get("x-ratelimit-reset")) * 1000;
      const retry = Number(response.headers.get("retry-after")) * 1000;
      cooldownUntil = Date.now() + Math.min(3_600_000, Math.max(60_000, retry, reset - Date.now()));
      throw new Error(cooldownReason);
    }
    if (response.status < 500 || attempt === 1) throw new Error("upstream_unavailable");
    await response.body?.cancel();
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error("upstream_unavailable");
}

export type RestRepo = { name: string; description: string | null; stargazers_count: number; forks_count: number; fork: boolean; archived: boolean; updated_at: string; language: string | null; private: boolean };
export type User = { login: string; name: string | null; followers: number; public_repos: number };
export function getUser(username: string): Promise<User> {
  return cachedData(`user:${username.toLowerCase()}`, async () => (await ghFetch(`${GH_API}/users/${encodeURIComponent(username)}`)).json());
}

export function listRepos(username: string): Promise<RestRepo[]> {
  return cachedData(`repos:${username.toLowerCase()}`, async () => {
    const repos: RestRepo[] = [];
    // Bound cost for very large accounts. Consumers disclose the 500-repo limit.
    for (let page = 1; page <= 5; page++) {
      const response = await ghFetch(`${GH_API}/users/${encodeURIComponent(username)}/repos?type=owner&per_page=100&sort=updated&page=${page}`);
      const batch: RestRepo[] = await response.json();
      repos.push(...batch.filter(repo => !repo.private));
      if (batch.length < 100) break;
    }
    return repos;
  });
}

export async function getLatestRepoUpdatedAt(username: string) { return (await listRepos(username))[0]?.updated_at || null; }

export function getRepoLanguages(owner: string, repo: string): Promise<Record<string, number>> {
  return cachedData(`languages:${owner.toLowerCase()}/${repo.toLowerCase()}`, async () => (await ghFetch(`${GH_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/languages`)).json());
}

export function graphQL<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const hash = createHash("sha256").update(JSON.stringify({ query, variables })).digest("hex");
  return cachedData(`graphql:${hash}`, async () => {
    if (!githubTokenPresent()) throw new Error("token_missing");
    const response = await ghFetch(`${GH_API}/graphql`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, variables }) });
    const payload = await response.json();
    if (payload.errors?.length) {
      const type = payload.errors[0]?.type;
      if (type === "NOT_FOUND") throw new Error("not_found");
      if (type === "RATE_LIMITED") { cooldownUntil = Date.now() + 60_000; throw new Error("rate_limited"); }
      throw new Error("graphql_error");
    }
    return payload.data as T;
  });
}

export type RepoNode = { name: string; description?: string | null; stargazerCount: number; forkCount: number; isFork: boolean; isArchived: boolean; updatedAt: string; primaryLanguage?: { name: string } | null };
export type UserRepoSummary = { login: string; name?: string | null; followers: number; publicRepos: number; repos: RepoNode[]; sampled: boolean };

export async function getUserRepoSummary(login: string, repoLimit = 500): Promise<UserRepoSummary> {
  const [user, repos] = await Promise.all([getUser(login), listRepos(login)]);
  return { login: user.login, name: user.name, followers: user.followers, publicRepos: user.public_repos, sampled: user.public_repos > repos.length,
    repos: repos.slice(0, repoLimit).map(repo => ({ name: repo.name, description: repo.description, stargazerCount: repo.stargazers_count, forkCount: repo.forks_count, isFork: repo.fork, isArchived: repo.archived, updatedAt: repo.updated_at, primaryLanguage: repo.language ? { name: repo.language } : null })) };
}

export type Contributions = { totalCommitContributions: number; totalIssueContributions: number; totalPullRequestContributions: number; totalPullRequestReviewContributions: number; contributionCalendar: { weeks: Array<{ contributionDays: Array<{ date: string; contributionCount: number }> }> } };
const CONTRIBUTIONS_QUERY = `query($login:String!, $from:DateTime, $to:DateTime) { user(login:$login) { contributionsCollection(from:$from,to:$to) { totalCommitContributions totalIssueContributions totalPullRequestContributions totalPullRequestReviewContributions contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }`;

export async function getContributions(login: string, from: string | null = null, to: string | null = null) {
  const result = await graphQL<{ user: { contributionsCollection: Contributions } | null }>(CONTRIBUTIONS_QUERY, { login: login.toLowerCase(), from, to });
  if (!result.user) throw new Error("not_found");
  return result.user.contributionsCollection;
}

export type UserStatsSummary = UserRepoSummary & { contributions?: { commits: number; issues: number; prs: number; reviews: number } };
export async function getUserStatsSummary(login: string, repoLimit = 500, from: string | null = null, to: string | null = null): Promise<UserStatsSummary> {
  const [summary, contributions] = await Promise.all([getUserRepoSummary(login, repoLimit), getContributions(login, from, to)]);
  return { ...summary, contributions: { commits: contributions.totalCommitContributions, issues: contributions.totalIssueContributions, prs: contributions.totalPullRequestContributions, reviews: contributions.totalPullRequestReviewContributions } };
}

export function getRateLimit() { return cachedData("rate_limit", async () => (await ghFetch(`${GH_API}/rate_limit`)).json(), 60); }

export function getRepo(owner: string, repo: string) {
  return cachedData(`repo:${owner.toLowerCase()}/${repo.toLowerCase()}`, async () => {
    const data = await (await ghFetch(`${GH_API}/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`)).json();
    if (data.private) throw new Error("private_resource");
    return data;
  });
}

export function getGist(id: string) {
  return cachedData(`gist:${id}`, async () => {
    const data = await (await ghFetch(`${GH_API}/gists/${encodeURIComponent(id)}`)).json();
    if (!data.public) throw new Error("private_resource");
    return data;
  });
}

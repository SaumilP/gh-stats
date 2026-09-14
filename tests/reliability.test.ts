import { test } from "node:test";
import assert from "node:assert/strict";
import { cachedData, DAY, MAX_AGE } from "../lib/data-cache";
import { localCache, InMemoryCache } from "../lib/cache";
import { requestContext } from "../lib/context";
import { KvRestCache } from "../lib/kv-rest";
import { GET as stats } from "../app/api/stats/route";
import { GET as streak } from "../app/api/streak/route";
import { GET as impact } from "../app/api/impact/route";
import { getRepo } from "../lib/github";

test("concurrent requests share one refresh", async () => {
  let calls = 0;
  const load = async () => { calls++; await new Promise(resolve => setTimeout(resolve, 10)); return { stars: 42 }; };
  const values = await Promise.all(Array.from({ length: 12 }, () => cachedData("concurrent-test", load)));
  assert.equal(calls, 1);
  assert.ok(values.every(value => value.stars === 42));
});

test("stale successful data survives upstream errors, without resetting its age", async () => {
  const updatedAt = Date.now() - 2 * DAY * 1000;
  await localCache.set("data:v4:stale-test", JSON.stringify({ value: { stars: 23 }, updatedAt }), MAX_AGE);
  await requestContext.run({ requestId: "test", deadline: Date.now() + 1000 }, async () => {
    const value = await cachedData("stale-test", async () => { throw new Error("token_invalid"); });
    assert.deepEqual(value, { stars: 23 });
    assert.equal(requestContext.getStore()?.updatedAt, updatedAt);
    assert.equal(requestContext.getStore()?.stale, true);
  });
});

test("expired data and known private/deleted resources are never served stale", async () => {
  await localCache.set("data:v4:expired-test", JSON.stringify({ value: 42, updatedAt: Date.now() - (MAX_AGE + 1) * 1000 }), 60);
  await assert.rejects(cachedData("expired-test", async () => { throw new Error("upstream_timeout"); }), /upstream_timeout/);
  await localCache.set("data:v4:deleted-test", JSON.stringify({ value: 42, updatedAt: Date.now() - 2 * DAY * 1000 }), 60);
  await assert.rejects(cachedData("deleted-test", async () => { throw new Error("not_found"); }), /not_found/);
});

test("in-memory fallback is bounded", async () => {
  const cache = new InMemoryCache(2);
  await cache.set("a", "one", 10); await cache.set("b", "two", 10); await cache.get("a"); await cache.set("c", "three", 10);
  assert.equal(await cache.get("b"), null);
  assert.equal(await cache.get("a"), "one");
});

test("stats themes and formats reuse snapshots; ETags work at the origin", async t => {
  const token = process.env.GITHUB_TOKEN;
  process.env.GITHUB_TOKEN = "fixture-token";
  t.after(() => { if (token) process.env.GITHUB_TOKEN = token; else delete process.env.GITHUB_TOKEN; });
  let calls = 0;
  let variables: any;
  t.mock.method(globalThis, "fetch", async (input: string | URL | Request, init?: RequestInit) => {
    calls++;
    const url = String(input);
    if (url.endsWith("/graphql")) {
      variables = JSON.parse(String(init?.body)).variables;
      return Response.json({ data: { user: { contributionsCollection: { totalCommitContributions: 123, totalIssueContributions: 4, totalPullRequestContributions: 8, totalPullRequestReviewContributions: 2, contributionCalendar: { weeks: [{ contributionDays: [{ date: new Date().toISOString().slice(0, 10), contributionCount: 2 }] }] } } } } });
    }
    if (url.includes("/repos?")) return Response.json([{ name: "hello", stargazers_count: 12, forks_count: 3, language: "TypeScript", updated_at: "2026-09-01", private: false }]);
    return Response.json({ login: "fixture-user", name: "Fixture", public_repos: 1, followers: 9 });
  });
  const response = await stats(new Request("http://localhost/api/stats?username=fixture-user&format=json"));
  const data = await response.json();
  assert.equal(data.commits, 123);
  assert.equal(data.stars, 12);
  assert.equal(variables.from, null, "default must not be year 2000");
  const svg = await stats(new Request("http://localhost/api/stats?username=fixture-user&theme=nord&refresh=1&cacheSeconds=300"));
  assert.match(await svg.text(), /viewBox=/);
  assert.equal(calls, 3, "one user request, one repo request, one contributions request");
  const etag = svg.headers.get("etag")!;
  const conditional = await stats(new Request("http://localhost/api/stats?username=fixture-user&theme=nord", { headers: { "If-None-Match": `W/${etag}` } }));
  assert.equal(conditional.status, 304);
  assert.equal(await conditional.text(), "");
  assert.equal(calls, 3);
  await streak(new Request("http://localhost/api/streak?username=fixture-user"));
  await impact(new Request("http://localhost/api/impact?username=fixture-user"));
  assert.equal(calls, 3, "streak and impact share the contribution snapshot");
});

test("private repositories are rejected before entering the cache", async t => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ name: "secret", private: true }));
  await assert.rejects(getRepo("fixture", "private-repo"), /private_resource/);
  assert.equal(await localCache.get("data:v4:repo:fixture/private-repo"), null);
});

test("invalid input returns a short-cached SVG error and a JSON error", async () => {
  const response = await stats(new Request("http://localhost/api/stats?username=bad%3Cinput"));
  assert.match(await response.text(), /data-error="true"/);
  assert.equal(response.headers.get("x-card-status"), "error");
  assert.equal(response.headers.get("vercel-cdn-cache-control"), "public, s-maxage=60");
  const json = await stats(new Request("http://localhost/api/stats?username=bad%3Cinput&format=json"));
  assert.equal(json.status, 400);
});

test("KV failures do not discard successfully fetched data", async t => {
  const url = process.env.KV_REST_API_URL, token = process.env.KV_REST_API_TOKEN;
  process.env.KV_REST_API_URL = "https://cache.invalid"; process.env.KV_REST_API_TOKEN = "test";
  t.after(() => { if (url) process.env.KV_REST_API_URL = url; else delete process.env.KV_REST_API_URL; if (token) process.env.KV_REST_API_TOKEN = token; else delete process.env.KV_REST_API_TOKEN; });
  t.mock.method(KvRestCache.prototype, "get", async () => { throw new Error("offline"); });
  t.mock.method(KvRestCache.prototype, "claim", async () => true);
  t.mock.method(KvRestCache.prototype, "release", async () => {});
  t.mock.method(KvRestCache.prototype, "set", async () => { throw new Error("offline"); });
  assert.equal(await cachedData("kv-failure", async () => 73), 73);
});

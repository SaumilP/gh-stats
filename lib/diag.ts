import type { Cache } from "./cache";

type Endpoint = "stats" | "repos" | "languages" | "streak" | "health" | "limits";

const KEY_PREFIX = "diag:last_success:";

function mem() {
  const g = globalThis as any;
  if (!g.__GH_STATS_DIAG__) g.__GH_STATS_DIAG__ = new Map<string, string>();
  return g.__GH_STATS_DIAG__ as Map<string, string>;
}

export async function recordLastSuccess(endpoint: Endpoint, cache: Cache | null) {
  const ts = new Date().toISOString();
  mem().set(endpoint, ts);
  if (!cache) return;
  await cache.set(`${KEY_PREFIX}${endpoint}`, ts, 30 * 86400);
}

export async function getLastSuccess(endpoint: Endpoint, cache: Cache | null): Promise<string | null> {
  if (cache) {
    const v = await cache.get(`${KEY_PREFIX}${endpoint}`);
    if (v) return v;
  }
  return mem().get(endpoint) || null;
}


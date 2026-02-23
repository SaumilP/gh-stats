export interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
}

type CacheEntry = { value: string; expiresAt: number };

export class InMemoryCache implements Cache {
  private readonly map = new Map<string, CacheEntry>();

  async get(key: string): Promise<string | null> {
    const hit = this.map.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      this.map.delete(key);
      return null;
    }
    return hit.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    const ttlMs = Math.max(1, ttlSeconds) * 1000;
    this.map.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}

function envBool(name: string, def: boolean) {
  const v = process.env[name];
  if (v === undefined) return def;
  const s = String(v).toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

export function cacheEnabled() {
  return envBool("CACHE_ENABLED", true);
}

export function getCache(): Cache | null {
  if (!cacheEnabled()) return null;

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (url && token) {
    const { KvRestCache } = require("./kv-rest") as typeof import("./kv-rest");
    return new KvRestCache(url, token);
  }

  const g = globalThis as any;
  if (!g.__GH_STATS_INMEM_CACHE__) g.__GH_STATS_INMEM_CACHE__ = new InMemoryCache();
  return g.__GH_STATS_INMEM_CACHE__ as InMemoryCache;
}


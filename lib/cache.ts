import { KvRestCache } from "./kv-rest";
import { requestContext } from "./context";

export interface Cache {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  claim?(key: string, owner: string, ttl: number): Promise<boolean>;
  release?(key: string, owner: string): Promise<void>;
}

export class InMemoryCache implements Cache {
  private readonly map = new Map<string, { value: string; expiresAt: number }>();
  constructor(private readonly capacity = 300) {}
  async get(key: string) {
    const hit = this.map.get(key);
    if (!hit) return null;
    if (Date.now() >= hit.expiresAt) { this.map.delete(key); return null; }
    this.map.delete(key);
    this.map.set(key, hit);
    return hit.value;
  }
  async set(key: string, value: string, ttl: number) {
    if (value.length > 1_000_000) return;
    this.map.delete(key);
    while (this.map.size >= this.capacity) this.map.delete(this.map.keys().next().value!);
    this.map.set(key, { value, expiresAt: Date.now() + Math.max(1, ttl) * 1000 });
  }
}

export const localCache = new InMemoryCache();
let backend: Cache | undefined;
let backendIdentity = "";
let unavailableUntil = 0;

export function cacheEnabled() { return !["0", "false", "off"].includes(process.env.CACHE_ENABLED || "true"); }

export function sharedCache(): Cache {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!cacheEnabled() || !url || !token || Date.now() < unavailableUntil) return localCache;
  const identity = `${url}:${token}`;
  if (!backend || backendIdentity !== identity) {
    backendIdentity = identity;
    backend = new KvRestCache(url, token);
  }
  return backend;
}

export function cacheFailure() {
  unavailableUntil = Date.now() + 30_000;
  console.warn(JSON.stringify({ event: "cache_unavailable", requestId: requestContext.getStore()?.requestId }));
}

export function cacheStatus() {
  return { enabled: cacheEnabled(), backend: sharedCache() === localCache ? "memory" : "kv-rest", degraded: Date.now() < unavailableUntil };
}

/** Legacy renderers no longer store theme-specific results. CDN caches the SVG;
 * the data layer stores reusable, timestamped snapshots instead. */
export function getCache(): Cache | null {
  return requestContext.getStore() ? null : sharedCache();
}

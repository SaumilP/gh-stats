import type { Cache } from "./cache";
import { decodeEntry, encodeEntry, type CacheEntry } from "./cache-entry";

export type CacheHit =
  | { kind: "miss" }
  | { kind: "hit"; freshness: "fresh" | "stale"; entry: CacheEntry };

export async function cacheGet(cache: Cache, key: string, nowMs = Date.now()): Promise<CacheHit> {
  const raw = await cache.get(key);
  if (!raw) return { kind: "miss" };
  const entry = decodeEntry(raw);
  if (!entry) return { kind: "miss" };
  if (nowMs <= entry.expiresAtMs) return { kind: "hit", freshness: "fresh", entry };
  if (nowMs <= entry.staleUntilMs) return { kind: "hit", freshness: "stale", entry };
  return { kind: "miss" };
}

export async function cacheSet(
  cache: Cache,
  key: string,
  body: string,
  ttlSeconds: number,
  staleExtraSeconds: number,
  meta?: Record<string, any>,
): Promise<CacheEntry> {
  const now = Date.now();
  const entry: CacheEntry = {
    body,
    expiresAtMs: now + Math.max(1, ttlSeconds) * 1000,
    staleUntilMs: now + (Math.max(1, ttlSeconds) + Math.max(0, staleExtraSeconds)) * 1000,
    meta,
  };
  const storeTtl = Math.max(1, ttlSeconds + staleExtraSeconds);
  await cache.set(key, encodeEntry(entry), storeTtl);
  return entry;
}


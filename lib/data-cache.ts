import { randomUUID } from "node:crypto";
import { cacheFailure, localCache, sharedCache } from "./cache";
import { observeSnapshot, requestContext } from "./context";

export const DAY = 86_400;
export const MAX_AGE = 7 * DAY;
type Snapshot<T> = { value: T; updatedAt: number };
const pending = new Map<string, Promise<Snapshot<unknown>>>();

function decode<T>(raw: string | null): Snapshot<T> | null {
  try {
    const value = raw ? JSON.parse(raw) : null;
    return value && Number.isFinite(value.updatedAt) && "value" in value && Date.now() - value.updatedAt < MAX_AGE * 1000 ? value : null;
  } catch { return null; }
}

export async function cachedData<T>(key: string, load: () => Promise<T>, ttl = DAY): Promise<T> {
  key = `data:v4:${key}`;
  const store = sharedCache();
  let snapshot = decode<T>(await localCache.get(key));
  if (!snapshot || Date.now() - snapshot.updatedAt >= ttl * 1000) {
    try { snapshot = decode<T>(await store.get(key)) || snapshot; }
    catch { cacheFailure(); }
  }
  const use = (entry: Snapshot<T>) => {
    observeSnapshot(entry.updatedAt, Date.now() - entry.updatedAt >= ttl * 1000);
    return entry.value;
  };
  if (snapshot && Date.now() - snapshot.updatedAt < ttl * 1000) return use(snapshot);

  const existing = pending.get(key);
  if (existing) {
    try { return use(await existing as Snapshot<T>); }
    catch (error) { if (snapshot && canUseStale(error)) return use(snapshot); throw error; }
  }

  const refresh = async (): Promise<Snapshot<T>> => {
    const owner = randomUUID();
    let claimed = false;
    try {
      if (store.claim) {
        try { claimed = await store.claim(`${key}:lock`, owner, 30); }
        catch { cacheFailure(); claimed = true; }
        if (!claimed) {
          if (snapshot) return snapshot;
          // Brief bounded wait for a cold request in another instance.
          for (let attempt = 0; attempt < 6; attempt++) {
            await new Promise(resolve => setTimeout(resolve, 300));
            try {
              const filled = decode<T>(await store.get(key));
              if (filled) return filled;
            } catch { cacheFailure(); break; }
          }
          throw new Error("refresh_in_progress");
        }
      }
      if (Date.now() > (requestContext.getStore()?.deadline ?? Infinity)) throw new Error("request_timeout");
      const result = { value: await load(), updatedAt: Date.now() };
      const raw = JSON.stringify(result);
      await localCache.set(key, raw, MAX_AGE);
      if (store !== localCache) {
        try { await store.set(key, raw, MAX_AGE); }
        catch { cacheFailure(); }
      }
      return result;
    } catch (error) {
      if (snapshot && canUseStale(error) && Date.now() - snapshot.updatedAt < MAX_AGE * 1000) return snapshot;
      throw error;
    } finally {
      if (claimed && store.release) {
        try { await store.release(`${key}:lock`, owner); } catch { cacheFailure(); }
      }
    }
  };
  const promise = refresh();
  pending.set(key, promise);
  try { return use(await promise); }
  finally { pending.delete(key); }
}

function canUseStale(error: unknown) {
  // Do not keep publishing a resource known to be deleted or private.
  return !(error instanceof Error && ["not_found", "private_resource", "invalid_input"].includes(error.message));
}

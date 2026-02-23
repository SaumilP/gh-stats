export type CacheEntry = {
  body: string;
  expiresAtMs: number;
  staleUntilMs: number;
  meta?: Record<string, any>;
};

export function encodeEntry(entry: CacheEntry) {
  return JSON.stringify(entry);
}

export function decodeEntry(raw: string): CacheEntry | null {
  try {
    const obj = JSON.parse(raw) as any;
    if (!obj || typeof obj.body !== "string") return null;
    if (typeof obj.expiresAtMs !== "number" || typeof obj.staleUntilMs !== "number") return null;
    return obj as CacheEntry;
  } catch {
    return null;
  }
}


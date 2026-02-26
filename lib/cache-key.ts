export const CACHE_KEY_VERSION = 2;

export function withCacheKeyVersion(key: string) {
  return `v${CACHE_KEY_VERSION}:${key}`;
}


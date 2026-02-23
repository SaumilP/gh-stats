import type { Cache } from "./cache";

function joinUrl(base: string, path: string) {
  if (base.endsWith("/")) base = base.slice(0, -1);
  if (!path.startsWith("/")) path = `/${path}`;
  return `${base}${path}`;
}

function enc(s: string) {
  return encodeURIComponent(s);
}

async function kvFetch(url: string, token: string, init: RequestInit) {
  const resp = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(`KV REST error ${resp.status}: ${txt.slice(0, 200)}`);
  }
  return resp;
}

// Compatible with Upstash Redis REST style used by Vercel KV:
// - GET  {KV_REST_API_URL}/get/{key}
// - POST {KV_REST_API_URL}/setex/{key}/{ttl}/{value}
export class KvRestCache implements Cache {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
    private readonly keyPrefix = "",
  ) {}

  private k(key: string) {
    return `${this.keyPrefix}${key}`;
  }

  async get(key: string): Promise<string | null> {
    const url = joinUrl(this.baseUrl, `/get/${enc(this.k(key))}`);
    const resp = await kvFetch(url, this.token, { method: "GET" });
    const data = (await resp.json()) as any;
    const result = data?.result;
    if (result === null || result === undefined) return null;
    return String(result);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    const ttl = Math.max(1, Math.floor(ttlSeconds));
    const url = joinUrl(this.baseUrl, `/setex/${enc(this.k(key))}/${ttl}/${enc(value)}`);
    await kvFetch(url, this.token, { method: "POST" });
  }
}


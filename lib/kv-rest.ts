import type { Cache } from "./cache";

/** Upstash-compatible commands travel in the body, never inside a long URL. */
export class KvRestCache implements Cache {
  constructor(private readonly url: string, private readonly token: string) {}

  private async command(args: (string | number)[]) {
    const response = await fetch(this.url, {
      method: "POST",
      headers: { Authorization: `Bearer ${this.token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(1500),
      cache: "no-store",
    });
    if (!response.ok) throw new Error(`cache_http_${response.status}`);
    const payload = await response.json();
    if (payload.error) throw new Error("cache_command_failed");
    return payload.result;
  }

  async get(key: string): Promise<string | null> {
    return this.command(["GET", key]);
  }

  async set(key: string, value: string, ttl: number) {
    await this.command(["SET", key, value, "EX", Math.max(1, Math.floor(ttl))]);
  }

  async claim(key: string, owner: string, ttl: number): Promise<boolean> {
    return (await this.command(["SET", key, owner, "NX", "EX", ttl])) === "OK";
  }

  async release(key: string, owner: string) {
    await this.command(["EVAL", "if redis.call('get',KEYS[1]) == ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end", 1, key, owner]);
  }
}

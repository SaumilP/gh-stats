import { randomUUID } from "node:crypto";
import { requestContext } from "./context";
import { DAY, MAX_AGE } from "./data-cache";
import { renderErrorCard } from "../cards/error";
import { resolveTheme } from "./theme";

type Handler = (req: { query: Record<string, string>; headers: Record<string, string> }, res: { statusCode: number; setHeader: (key: string, value: string) => void; end: (body?: string) => void }) => Promise<void>;
const USERNAME = /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i;

export function cardRoute(endpoint: string, handler: Handler) {
  return async (request: Request) => {
    const requestId = randomUUID();
    return requestContext.run({ requestId, deadline: Date.now() + 22_000 }, async () => {
      const start = Date.now();
      const url = new URL(request.url);
      const query = Object.fromEntries(url.searchParams);
      // Daily origin-data freshness is operator controlled, not public-input controlled.
      delete query.refresh;
      delete query.cacheSeconds;
      delete query.cache_seconds;
      if (query.username) query.username = query.username.trim().toLowerCase();
      const headers = new Headers();
      let body: string | undefined;
      const res = { statusCode: 200, setHeader: (key: string, value: string) => headers.set(key, value), end: (value?: string) => { body = value; } };
      try {
        if (url.search.length > 3000 || Object.values(query).some(value => value.length > 200)) throw new Error("invalid_input");
        if (query.username && endpoint !== "wakatime" && !USERNAME.test(query.username)) throw new Error("invalid_input");
        if (query.include_all_commits === "true" || query.include_all_commits === "1") throw new Error("Historical all-time commits are not supported. Use commits_year for a single year.");
        await handler({ query, headers: Object.fromEntries(request.headers) }, res);
      } catch (error) {
        res.statusCode = query.format === "json" ? 400 : 200;
        const hint = error instanceof Error && error.message.startsWith("Historical") ? error.message : "Check the username and card parameters, then try again.";
        body = query.format === "json" ? JSON.stringify({ error: "invalid_request", hint, requestId }) : renderErrorCard(resolveTheme({ theme: query.theme || "dark" }), { endpoint, requestId, title: "Unable to create this card", hint });
        headers.set("Content-Type", query.format === "json" ? "application/json" : "image/svg+xml; charset=utf-8");
      }
      const context = requestContext.getStore()!;
      const error = Boolean(context.error || (body?.includes('data-error="true"')) || res.statusCode >= 400);
      const age = Math.max(0, Math.floor((Date.now() - (context.updatedAt || Date.now())) / 1000));
      const ttl = error ? 60 : context.stale ? Math.max(0, Math.min(300, MAX_AGE - age)) : Math.max(1, DAY - age);
      headers.set("Cache-Control", error ? "public, max-age=0, must-revalidate" : "public, max-age=60, must-revalidate");
      headers.set("Vercel-CDN-Cache-Control", `public, s-maxage=${ttl}`);
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("X-Request-Id", requestId);
      headers.set("X-Card-Status", error ? "error" : context.stale ? "stale" : "fresh");
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Expose-Headers", "X-Card-Status, X-Data-Updated-At, X-Request-Id");
      if (context.updatedAt) headers.set("X-Data-Updated-At", new Date(context.updatedAt).toISOString());
      console.info(JSON.stringify({ event: "card_request", endpoint, requestId, status: headers.get("X-Card-Status"), error: context.error, durationMs: Date.now() - start }));
      return new Response(res.statusCode === 304 ? null : body, { status: res.statusCode, headers });
    });
  };
}

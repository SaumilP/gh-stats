import { randomUUID } from "node:crypto";
import { cacheStatus } from "@/lib/cache";
import { getRateLimit, githubStatus } from "@/lib/github";
import { requestContext } from "@/lib/context";

export const maxDuration = 15;
export async function GET() {
  const requestId = randomUUID();
  return requestContext.run({ requestId, deadline: Date.now() + 9000 }, async () => {
    let rate = null;
    let error: string | null = null;
    try { rate = await getRateLimit(); }
    catch (cause) { error = cause instanceof Error ? cause.message : "upstream_unavailable"; }
    const github = githubStatus();
    const cache = cacheStatus();
    const context = requestContext.getStore()!;
    const stale = context.stale || false;
    const ok = !error && !stale && !cache.degraded && github.tokenPresent && rate?.resources?.graphql?.remaining > 0 && rate?.resources?.core?.remaining > 0;
    return Response.json({ ok, service: "gh-stats", status: ok ? "operational" : "degraded", requestId, cache,
      github: { ...github, status: error || (stale ? "stale_check" : github.tokenPresent ? "authenticated" : "token_missing"), checkedAt: context.updatedAt ? new Date(context.updatedAt).toISOString() : null, rest: rate?.resources?.core || null, graphql: rate?.resources?.graphql || null },
      policy: { freshHours: 24, maximumSnapshotAgeDays: 7 } },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store", "Vercel-CDN-Cache-Control": "s-maxage=60", "X-Request-Id": requestId } });
  });
}

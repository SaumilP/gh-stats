import { getCache } from "../lib/cache";
import { hasGithubToken } from "../lib/config";
import { getRateLimit, githubTokenPresent } from "../lib/github";
import { qCacheSeconds } from "../lib/query";
import { requestIdFrom } from "../lib/request";
import { sendJson } from "../lib/response";

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);
  if (!githubTokenPresent()) {
    res.statusCode = 200;
    sendJson(req, res, { ok: true, tokenPresent: hasGithubToken(), hint: "Set GITHUB_TOKEN to see authenticated rate limits", requestId }, 60);
    return;
  }

  const cdnCacheSeconds = qCacheSeconds(req.query, 60);
  const cache = getCache();
  try {
    const key = "gh:rate_limit";
    const cached = cache ? await cache.get(key) : null;
    const rate = cached ? JSON.parse(cached) : await getRateLimit();
    if (!cached && cache) await cache.set(key, JSON.stringify(rate), 60);
    sendJson(req, res, { ok: true, tokenPresent: true, rateLimit: rate, requestId }, cdnCacheSeconds);
  } catch (e: any) {
    res.statusCode = 502;
    sendJson(req, res, { error: "Failed to fetch rate limits", requestId }, 60);
  }
}

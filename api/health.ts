import { cacheEnabled, getCache } from "../lib/cache";
import { hasGithubToken } from "../lib/config";
import { getRateLimit, githubTokenPresent } from "../lib/github";
import { getLastSuccess, recordLastSuccess } from "../lib/diag";
import { qCacheSeconds } from "../lib/query";
import { requestIdFrom } from "../lib/request";
import { sendJson } from "../lib/response";

function cacheBackend() {
  if (!cacheEnabled()) return "none";
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) return "kv-rest";
  return "memory";
}

function serviceVersion() {
  const v = process.env.npm_package_version;
  if (v) return v;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = require("../package.json") as any;
    if (pkg?.version) return String(pkg.version);
  } catch {}
  return "unknown";
}

export default async function handler(req: any, res: any) {
  const requestId = requestIdFrom(req);
  const cdnCacheSeconds = qCacheSeconds(req.query, 60);
  const cache = getCache();

  let rate: any = null;
  if (githubTokenPresent()) {
    try {
      const key = "gh:rate_limit";
      const cached = cache ? await cache.get(key) : null;
      if (cached) rate = JSON.parse(cached);
      else {
        rate = await getRateLimit();
        if (cache) await cache.set(key, JSON.stringify(rate), 60);
      }
    } catch {
      rate = null;
    }
  }

  const payload = {
    ok: true,
    service: "gh-stats",
    version: serviceVersion(),
    requestId,
    cache: {
      enabled: cacheEnabled(),
      backend: cacheBackend(),
    },
    github: {
      tokenPresent: hasGithubToken(),
      rateLimit: rate?.resources?.core
        ? {
            remaining: rate.resources.core.remaining,
            limit: rate.resources.core.limit,
            reset: rate.resources.core.reset,
          }
        : null,
    },
    lastSuccess: {
      stats: await getLastSuccess("stats", cache),
      repos: await getLastSuccess("repos", cache),
      languages: await getLastSuccess("languages", cache),
      streak: await getLastSuccess("streak", cache),
    },
  };

  await recordLastSuccess("health", cache);
  sendJson(req, res, payload, cdnCacheSeconds);
}

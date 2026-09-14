# gh-stats

**Your work deserves a better README.**

A free, open-source GitHub card studio and SVG API. Choose a card, find your theme, and copy an embed into your profile. Built with Next.js, React, TypeScript, and a shared daily data cache.

[Card studio](https://gh-stats-plum-five.vercel.app) · [Documentation](https://gh-stats-plum-five.vercel.app/docs) · [Service health](https://gh-stats-plum-five.vercel.app/api/health)

## Features

- Nine card types: overview, languages, streak, impact, repositories, focus, pinned repository, gist, and WakaTime.
- A shared theme registry, color overrides, and multiple language chart layouts.
- Markdown, HTML, direct URLs, and adaptive light/dark embeds.
- Shareable studio configuration and explicit preview error/retry states.
- Static homepage, documentation, and illustrative examples; no GitHub requests on landing.
- Daily shared data snapshots, bounded upstream requests, refresh deduplication, and stale fallback.
- SVG and JSON output, ETags, and separate browser/CDN cache policies.

## Quick start

```md
![GitHub overview](https://gh-stats-plum-five.vercel.app/api/stats?username=YOUR_USERNAME&theme=dark)
```

For adaptive appearance:

```html
<picture>
  <source media="(prefers-color-scheme: dark)"
    srcset="https://gh-stats-plum-five.vercel.app/api/stats?username=YOUR_USERNAME&amp;theme=dark" />
  <img src="https://gh-stats-plum-five.vercel.app/api/stats?username=YOUR_USERNAME&amp;theme=light"
    alt="My GitHub overview" />
</picture>
```

Users of the hosted service do not need a token. Tokens are configured by the operator, server-side.

## Development

Requires Node.js 24.

```sh
npm ci
npm run dev
```

Copy `.env.example` to `.env.local` and fill in the values you need. The homepage and sample cards work without credentials. GitHub REST cards can work without a token at a much lower quota; contribution endpoints require a token or a usable cached snapshot.

```sh
npm run lint
npm run typecheck
npm test
npm run audit
npm run build
npx playwright install chromium
npm run test:ui
```

Browser tests start the production server on port 3100. Local screenshots and traces go to `../ai_agents_tracking/gh-stats/browser`; CI artifacts go to `/tmp/gh-stats-playwright`. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can select an existing compatible browser.

## API

| Endpoint | Input | Notes |
| --- | --- | --- |
| `/api/stats` | `username` | Stars, forks, repositories, followers; optional contribution metrics |
| `/api/languages` | `username` | `mode=primary\|bytes`; `layout=normal\|compact\|donut\|donut-vertical\|pie` |
| `/api/streak` | `username` | Current, longest, and active days in the rolling past-year calendar |
| `/api/impact` | `username` | Contribution heatmap |
| `/api/repos` | `username` | `count=1..10`; `sort=stars\|forks\|updated` |
| `/api/focus` | `username` | Repository-language categories, not commit counts |
| `/api/pin` | `repo=owner/name` | Public repositories only; `owner` and `name` aliases also supported |
| `/api/gist` | `id` | Public gists only |
| `/api/wakatime` | WakaTime `username` | Public statistics; optional `range=last_7_days` |
| `/api/health` | — | Readiness, token state, REST/GraphQL quota, and cache state |
| `/api/limits` | — | Alias for service diagnostics |

Shared presentation controls include `theme`, `custom_title`, `hide_border`, `border_radius`, `title_color`, `text_color`, `icon_color`, `border_color`, and `bg_color`. Use `format=json` for structured data. See `/docs` for examples and metric definitions.

### Metric scope

- Repository inventory is bounded to 500 recently updated public repositories per user. Stats JSON exposes `sampled` and `repositoryLimit`; totals for larger accounts are partial.
- Contribution metrics default to GitHub’s rolling past-year range. `commits_year` requests a single calendar year; all-time aggregation is intentionally unsupported.
- Primary-language mode weights selected repositories by stars. Bytes mode reads up to 10 selected public repositories.
- Focus counts repositories by primary-language category. WakaTime reads the requested public account, never the host’s private account.

## Cache architecture and cost control

```text
README image → Vercel CDN → SVG renderer → shared daily snapshot → GitHub
```

The CDN caches rendered output. Shared KV snapshots hold underlying data independently of theme, card style, and output format. Repositories and contribution calendars are reused across card types. No scheduled warming of arbitrary users is needed: data refreshes on demand after 24 hours.

- Successful data is retained for a maximum total age of seven days. Transient provider failures can use this stale snapshot without resetting its timestamp.
- Known deleted/private resources are not served stale on a failed refresh.
- Response TTLs use the oldest data timestamp to prevent freshness from being extended by layered caching.
- Stale responses are CDN-cached for at most five minutes, bounded by snapshot expiry. Errors use a 60-second CDN window and no long stale extension.
- Concurrent refreshes share a promise locally and use short-lived owner-checked KV locks across instances. Cold followers briefly wait, then return a retryable error rather than stampeding GitHub.
- KV calls have short timeouts. KV errors fall back to bounded local storage; successful data is still returned when cache writes fail.
- GitHub calls have deadlines and at most one retry for 5xx responses. Authentication and rate-limit failures trigger a temporary circuit cooldown in the running instance.
- Public `refresh`, `cacheSeconds`, and `cache_seconds` are ignored by the hosted routes. Data freshness remains operator controlled.

Response headers: `X-Card-Status: fresh|stale|error`, `X-Data-Updated-At`, `X-Request-Id`. JSON errors use error HTTP statuses; SVG error responses remain viewable images with a machine-readable `data-error="true"` marker.

GitHub's image proxy can retain cards beyond the origin's own cache window. Daily refresh is an origin policy, not a guarantee of an exact update time on every profile view.

## Vercel deployment

Use the Next.js preset and Node.js 24. Connect Vercel’s Git integration for preview and production deployments. The manual **Deploy to Vercel** workflow is a fallback, avoiding duplicate automatic deployment pipelines.

| Variable | Purpose |
| --- | --- |
| `GITHUB_TOKEN` (or `GH_TOKEN`) | Public GitHub data access; required for GraphQL contribution cards |
| `KV_REST_API_URL` | Upstash-compatible REST endpoint |
| `KV_REST_API_TOKEN` | Cache credential |
| `NEXT_PUBLIC_SITE_URL` | Public canonical URL, used in documentation and metadata |

`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are supported aliases. Keep token permissions limited to needed public data. Never expose credentials via `NEXT_PUBLIC_` variables.

Without KV configuration, caching is per-instance and does not survive cold starts. For a public Vercel deployment, use a shared cache in a region close to the functions.

This architecture targets Hobby and a free shared-cache allowance at modest traffic. Monitor edge requests, transfer, invocations, active CPU, memory duration, and KV usage: cached requests still consume CDN resources. Set GitHub Actions failure notifications for the daily smoke check, and inspect Vercel usage when traffic grows.

## Static pregeneration

Set repository variables `GH_STATS_BASE_URL` and `GH_STATS_USERNAME` to enable the daily workflow. Optional `GH_REPOSITORY_NAME` and `GIST_ID` add pin/gist cards. For local generation, set the same environment variables and run:

```sh
npm run pregenerate
```

The script validates the entire response batch before replacing existing SVGs. It rejects HTTP-200 error cards, uses request timeouts, and replaces files atomically one at a time. The workflow only commits changed SVGs and retries transient push failures.

Static exports serve the configured profile. Arbitrary hosted users use the on-demand API.

## Operations

`/api/health` returns HTTP 503 when readiness is degraded, with separate cache and GitHub information. A configured token is not automatically considered healthy. Health checks are cached briefly; the daily smoke workflow checks readiness and a JSON stats response.

For an error, capture its request ID and time. Vercel logs include endpoint, duration, and card status. The GitHub Actions log for a static-export failure distinguishes generation errors from publishing failures.

Repository layout: `app/` contains pages and native route entrypoints, `lib/` contains shared data and request handling, `cards/` contains SVG renderers, and `.legacy/` retains compatible endpoint-specific parsing/rendering behind the common adapter. Build output and agent artifacts are excluded from source control.

## License

MIT. Not affiliated with GitHub or WakaTime.

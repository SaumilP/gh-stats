<p align="center">
  <img src="./public/logo.svg" width="140" alt="gh-stats logo" />
</p>

# gh-stats

📖 **Overview**

`gh-stats` is a minimal, dependency-light Vercel serverless service that generates **SVG cards** (or JSON) you can embed directly into your GitHub profile README. It’s designed to be easy to self-host, fast to render, and simple to understand/modify.

It currently ships four “cards”:

- 📊 **Stats** (repos, followers, total stars, total forks)
- 🧠 **Languages** (default: cheap “primary language” aggregation; optional accurate bytes mode)
- 📦 **Repos** (top repos by stars/forks/updated)
- 🔥 **Streak** (contribution streak via GitHub GraphQL; token recommended)

✨ **Features**

- 🖼️ SVG-first output (ideal for GitHub README embeds)
- 🧾 Optional `format=json` for debugging / integrations
- 🎨 `dark`/`light` themes
- ⚡ Vercel-friendly: `/api/*` serverless functions (Node.js 24 runtime)
- 🧰 No runtime deps (only `typescript` + `@types/node` as dev deps)
- 🗄️ CDN cache headers + server-side cache (KV REST / in-memory)
- 🧷 `ETag` + `If-None-Match` support (304 responses reduce bandwidth)
- 🧯 SVG error cards (stable embeds; no plain-text failures)

## 🧰 Engineering Snapshot

<table>
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/SaumilP/gh-stats/refs/heads/main/public/cards/stats-dark.svg">
        <img alt="Stats card" src="https://raw.githubusercontent.com/SaumilP/gh-stats/refs/heads/main/public/cards/stats-light.svg" width="100%">
      </picture>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/SaumilP/gh-stats/refs/heads/main/public/cards/languages-dark.svg">
        <img alt="Top languages card" src="https://raw.githubusercontent.com/SaumilP/gh-stats/refs/heads/main/public/cards/languages-light.svg" width="100%">
      </picture>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/SaumilP/gh-stats/refs/heads/main/public/cards/repos-dark.svg">
        <img alt="Top repositories card" src="https://raw.githubusercontent.com/SaumilP/gh-stats/refs/heads/main/public/cards/repos-light.svg" width="100%">
      </picture>
    </td>
    <td width="50%">
      <picture>
        <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/SaumilP/gh-stats/refs/heads/main/public/cards/streak-dark.svg">
        <img alt="Streak card" src="https://raw.githubusercontent.com/SaumilP/gh-stats/refs/heads/main/public/cards/streak-light.svg" width="100%">
      </picture>
    </td>
  </tr>
</table>

✅ **Requirements**

- Node.js `v24.13.1` for local dev (see `.nvmrc`)
- Vercel Functions runtime is pinned separately (see `vercel.json`)
- (Recommended) Vercel CLI for local dev: `npm i -g vercel`
- (Recommended) GitHub token for higher rate limits: `GITHUB_TOKEN` or `GH_TOKEN`

🚀 **Installation**

```bash
npm install
```

🛠️ **Usage**

Local dev (Vercel dev server):

```bash
npm install -g vercel
npm run vercel:dev
```

Then hit endpoints like:

- `http://localhost:3000/api/health`
- `http://localhost:3000/api/stats?username=octocat&theme=dark`

Deploy:

```bash
vercel
```

📦 **Technologies**

- TypeScript
- Vercel Serverless Functions (Node.js 24 runtime via `vercel.json` + `package.json#engines`)
- GitHub REST API + GitHub GraphQL API (for streak)

🔧 **Configuration**

Environment variables:

- `GITHUB_TOKEN` (preferred) or `GH_TOKEN`
  - Enables `/api/streak` (GraphQL requires auth)
  - Improves REST rate limits for `/api/stats`, `/api/repos`, `/api/languages`

- Cache (recommended for reliability + lower cost)
  - `CACHE_ENABLED=true|false` (default: `true`)
  - `KV_REST_API_URL` + `KV_REST_API_TOKEN` (Vercel KV / Upstash Redis REST)
  - TTLs (seconds):
    - `CACHE_TTL_STATS=21600` (6h)
    - `CACHE_TTL_REPOS=21600` (6h)
    - `CACHE_TTL_LANGUAGES=86400` (24h)
    - `CACHE_TTL_STREAK=21600` (6h)

Vercel setup:

- Project Settings → Environment Variables → add `GITHUB_TOKEN`
- (Optional) Add `KV_REST_API_URL` + `KV_REST_API_TOKEN` for server-side caching
- `vercel.json` pins function runtime to `nodejs24.x` for `api/**/*.ts`

## 🚏 Endpoints

### `/api/health`

Health check.

- Example: `/api/health`
- Output: JSON only (`format=json`)
- Includes cache status, token presence (boolean only), last success timestamps, and (if token present) GitHub rate limit summary.

### `/api/limits` (optional)

Rate limit diagnostics (JSON only).

- Example: `/api/limits?format=json`

### `/api/stats`

Generates a “GitHub Stats” card.

- With `GITHUB_TOKEN`: uses GitHub GraphQL (single request) to fetch followers + recent repos and totals stars/forks.
- Without token: falls back to GitHub REST (`/users/:username` + `/users/:username/repos`).

Examples:

- `/api/stats?username=octocat&theme=dark`
- `/api/stats?username=octocat&format=json`

### `/api/repos`

Generates a “Top Repositories” card from public repos, filtering out forks and archived repos, then sorting.

Query params:

- `count` (default `6`, range `1..10`)
- `sort` = `stars|forks|updated` (default `stars`)

Examples:

- `/api/repos?username=octocat&theme=dark&count=6&sort=stars`
- `/api/repos?username=octocat&format=json&sort=updated`

### `/api/languages`

Generates a “Top Languages” card with two modes:

- `mode=primary` (default, cheap): aggregates each repo’s *primary language* (1 GitHub call per request).
- `mode=bytes` (optional, accurate/expensive): calls the per-repo languages endpoint for up to the top 10 repos by stars, concurrency-limited to 2. Cached for ≥24h.

Examples:

- `/api/languages?username=octocat&theme=dark` (primary mode)
- `/api/languages?username=octocat&mode=bytes&theme=dark` (accurate bytes mode)
- `/api/languages?username=octocat&format=json&mode=primary`

Notes:
- If `mode=bytes` is requested without a token, it automatically falls back to `mode=primary`.

### `/api/streak`

Generates a “Contribution Streak” card using GitHub GraphQL `contributionCalendar` for the last 365 days.

Requires:

- `GITHUB_TOKEN` (or `GH_TOKEN`) set in env vars.
  - If missing, the endpoint returns a valid SVG “Token required” card (no 500s).

Examples:

- `/api/streak?username=octocat&theme=dark`
- `/api/streak?username=octocat&format=json`

## 🔌 Common Query Params

Shared across most endpoints:

- `username` (required)
- `theme` = `dark|light` (default: `dark`)
- `format` = `svg|json` (default: `svg`)
- `cacheSeconds` (optional) — clamps `300..86400` (affects CDN cache header)
- `refresh=1` (optional) — bypass server-side cache for a manual refresh
- `compact=1` (optional) — smaller SVG for lower bandwidth

Languages-only:

- `mode` = `primary|bytes` (default: `primary`)
- `maxReposForLanguages` (default `30`, clamps `5..50`)

## 🧩 Embed Examples (GitHub README)

Use a `<picture>` tag for automatic theme switching:

```html
<picture>
  <source srcset="https://YOUR.vercel.app/api/stats?username=YOUR_USER&theme=dark" media="(prefers-color-scheme: dark)">
  <img src="https://YOUR.vercel.app/api/stats?username=YOUR_USER&theme=light" alt="GitHub stats card" />
</picture>
```

You can do the same for the other cards:

- Languages:
  - Dark: `https://YOUR.vercel.app/api/languages?username=YOUR_USER&theme=dark`
  - Light: `https://YOUR.vercel.app/api/languages?username=YOUR_USER&theme=light`
- Repos:
  - Dark: `https://YOUR.vercel.app/api/repos?username=YOUR_USER&theme=dark&count=6&sort=stars`
  - Light: `https://YOUR.vercel.app/api/repos?username=YOUR_USER&theme=light&count=6&sort=stars`
- Streak (token required):
  - Dark: `https://YOUR.vercel.app/api/streak?username=YOUR_USER&theme=dark`
  - Light: `https://YOUR.vercel.app/api/streak?username=YOUR_USER&theme=light`

## 🗂️ Repository Structure

Complete tree (current workspace):

```text
.
├── .github
│   └── workflows
│       ├── ci.yml
│       └── pregenerate.yml
├── .gitignore
├── README.md
├── README_bak.md
├── api
│   ├── health.ts
│   ├── limits.ts
│   ├── languages.ts
│   ├── repos.ts
│   ├── stats.ts
│   └── streak.ts
├── cards
│   ├── error.ts
│   ├── languages.ts
│   ├── repos.ts
│   ├── stats.ts
│   ├── streak.ts
│   └── svg.ts
├── lib
│   ├── cache-aside.ts
│   ├── cache-entry.ts
│   ├── cache.ts
│   ├── config.ts
│   ├── diag.ts
│   ├── etag.ts
│   ├── github.ts
│   ├── http.ts
│   ├── kv-rest.ts
│   ├── limit.ts
│   ├── query.ts
│   ├── request.ts
│   ├── response.ts
│   └── streak.ts
├── public
│   └── cards
│       └── .gitkeep
├── scripts
│   └── pregenerate.mjs
├── package.json
├── tsconfig.json
└── vercel.json
```

What each folder does:

- `api/`: Vercel serverless entrypoints (one file per endpoint). Each handler:
  - Parses query params (`lib/query.ts`)
  - Calls GitHub API helpers (`lib/github.ts`)
  - Renders SVG via card renderers (`cards/*`)
  - Returns either SVG or JSON depending on `format`
- `cards/`: Pure render logic (string-based SVG composition).
  - `cards/svg.ts` provides shared primitives like `cardFrame`, text, chips, bars, and XML escaping.
- `lib/`: Shared utilities:
  - `lib/github.ts`: GitHub REST + GraphQL fetch helpers (token-aware, helpful error messages)
  - `lib/http.ts`: response headers + theme tokens
  - `lib/query.ts`: robust parsing of `username`, `theme`, `format`, `count`
  - `lib/streak.ts`: computes current/longest streak from GraphQL day counts

## 🔗 Flow Chart (Mermaid)

```mermaid
flowchart TD
  A[Request /api/*?username=...] --> B[api/*.ts handler]
  B --> C[lib/query.ts parse params]
  B --> D[lib/cache.ts + KV REST cache]
  B --> E[lib/github.ts call GitHub API]
  B --> F[cards/* render SVG]
  B --> G[lib/response.ts set headers + ETag]
  G --> H[Response: SVG or JSON]
```

## 🧠 Notes on Caching & Rate Limits

- SVG responses default to: `Cache-Control: public, s-maxage=21600, stale-while-revalidate=86400` (6h at CDN/edge).
- JSON responses default to: `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400` (1h at CDN/edge).
- All responses include `ETag` and support `If-None-Match` → `304 Not Modified`.
- Server-side cache is cache-aside: cache hit returns immediately; miss computes + stores.
- If you don’t set `GITHUB_TOKEN`, GitHub’s anonymous rate limit can be tight; `mode=primary` keeps `/api/languages` cheap.

## 🪵 Static mode (zero runtime usage)

If you want effectively **zero Vercel function usage** during README views, you can pre-generate SVGs nightly and commit them to the repo:

1) Set repo variables:
   - `GH_STATS_BASE_URL` (your deployed service URL, e.g. `https://YOUR.vercel.app`)
   - `GH_STATS_USERNAME` (your GitHub username)
2) Enable the `Pregenerate Cards` workflow (`.github/workflows/pregenerate.yml`).
3) Reference files under `/cards/*.svg` in your README (the project rewrites `/cards/*` → `public/cards/*`).

## 🏠 Home page

This repo includes a simple marketing home page (static) at `/`:

- `public/index.html`
- `public/site.css`
- `public/site.js`

It renders a live preview of the cards and generates copy/paste embed snippets.

## 🤝 Contributing

PRs and tweaks are welcome. A lightweight workflow that matches this repo:

1. Keep changes small and focused (one card/endpoint at a time).
2. Prefer adding helpers to `lib/` if logic is shared across endpoints.
3. If you add a new card, mirror the existing pattern:
   - `cards/<name>.ts` renderer
   - `api/<name>.ts` handler

## 📄 Documentation

There isn’t separate hosted documentation yet; the best “docs” are the code and the endpoints above:

- `api/*.ts` shows request/response behavior
- `cards/*.ts` shows SVG layout and styling
- `lib/github.ts` shows how GitHub API calls are made (token handling, error messages)

## ❤️ Acknowledgements

- GitHub REST & GraphQL APIs
- Vercel serverless platform

## 📝 Changelog

### Unreleased (working tree)

- Added server-side caching (KV REST / in-memory) + cache-aside policy
- Added `ETag`/`If-None-Match` support for `304 Not Modified`
- Reduced GitHub API calls via GraphQL batching (token-aware)
- Reworked `/api/languages` to default to cheap `mode=primary` with optional `mode=bytes` (limited + cached)
- Added marketing homepage at `/` with live previews and embed snippet generator

### History (git)

- 2026-02-26 minor changes around the cards (`bc7c699`)
- 2026-02-26 Adjust pre-generate build for once a week (`c4b1aea`)
- 2026-02-26 Remove unwanted file; Add index.html page (`b6b14fc`)
- 2026-02-23 vercel deploy CI added (`6131946`)
- 2026-02-23 performance improvements; Lower hosting cost and rate-limits applied (`4a097c0`)
- 2026-02-23 Package fix for successful deployment (`aef549f`)
- 2026-02-23 Updates for ESM (`5f82912`)
- 2026-02-23 Aligned TS config for NodeNext ESM; Updated all relrevant imports to include .js (`d4eaff9`)
- 2026-02-23 Update for build failure (`d34e345`)
- 2026-02-23 Init commit (`0e133c2`)

## 🔒 Security posture

- Uses Node’s built-in `fetch` (no axios) to reduce dependency/advisory exposure.
- Minimal dependencies: only `typescript` + `@types/node` as dev deps.

## 📄 License

MIT — see `LICENSE`.

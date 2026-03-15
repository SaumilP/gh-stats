# gh-stats

<p align="center">
  <img src="./public/logo.svg" alt="gh-stats logo" width="120" />
</p>

<p align="center">
  <strong>SVG-first GitHub README cards, self-hosted on Vercel.</strong><br/>
  Lightweight, dependency-light, cache-aware, and designed for stable embeds.
</p>

<p align="center">
  <a href="https://github.com/SaumilP/gh-stats">Repository</a>
  ·
  <a href="https://gh-stats-gen.vercel.app/">Live Demo</a>
  ·
  <a href="#features">Features</a>
  ·
  <a href="#deployment">Deployment</a>
  ·
  <a href="#api-endpoints">API Endpoints</a>
</p>

---

## Overview

`gh-stats` is a minimal Vercel serverless service that generates GitHub profile cards as SVG or JSON output. It is built for profile READMEs, personal dashboards, and low-cost self-hosted usage.

The project currently focuses on a pragmatic feature set:

- GitHub stats card
- Top languages card
- Top repositories card
- Contribution streak card
- Theme-aware output for dark and light embeds
- JSON output for debugging and integrations
- Server-side and CDN caching support
- Static pre-generation workflow for near-zero runtime cost

The latest repository changes also introduce broader card foundations and presentation capabilities, including pin/gist/WakaTime-oriented renderers, expanded theme controls, richer language layouts, and extended diagnostics readiness.

---

## Example snapshots

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
        <img alt="Languages card" src="https://raw.githubusercontent.com/SaumilP/gh-stats/refs/heads/main/public/cards/languages-light.svg" width="100%">
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

---

## Features

- SVG-first output for clean GitHub README embedding
- Optional `format=json` output for diagnostics and downstream integrations
- Vercel serverless-friendly structure using `/api/*`
- TypeScript codebase with minimal runtime dependency surface
- CDN caching plus server-side cache support
- `ETag` and `If-None-Match` support for efficient repeat requests
- Stable SVG error cards instead of raw text failures
- Static pregeneration support for repository-committed SVG assets
- Theme support including built-in named themes and custom color overrides
- Configurable borders, border radius, icon colors, title colors, text colors, and background colors/gradients
- Enhanced language card layouts such as `normal`, `compact`, `donut`, `donut-vertical`, and `pie`
- Foundations for additional card types such as pinned repository, gist, and WakaTime renderers

---

## Why this project

`gh-stats` is positioned as a lean, understandable, self-hosted alternative for developers who want:

- lower hosting complexity
- straightforward TypeScript source code
- tighter control over GitHub token usage
- lighter operational cost through caching and pregeneration
- a smaller code surface that is easier to extend for personal branding

---

## Live usage

The hosted generator lets you preview cards and generate embed snippets from the browser:

- Live app: `https://gh-stats-gen.vercel.app/`
- Health check: `https://gh-stats-gen.vercel.app/api/health`
- Limits: `https://gh-stats-gen.vercel.app/api/limits?format=json`

---

## API endpoints

### `/api/stats`

Renders a GitHub profile stats card.

**Purpose**

- Repositories
- Followers
- Total stars
- Total forks

**Examples**

```text
/api/stats?username=octocat&theme=dark
/api/stats?username=octocat&format=json
```

### `/api/repos`

Renders a top repositories card for public repositories.

**Options**

- `count=1..10`
- `sort=stars|forks|updated`

**Examples**

```text
/api/repos?username=octocat&theme=dark&count=6&sort=stars
/api/repos?username=octocat&format=json&sort=updated
```

### `/api/languages`

Renders a top languages card.

**Modes**

- `mode=primary` — lower-cost default mode
- `mode=bytes` — more accurate mode for language distribution

**Examples**

```text
/api/languages?username=octocat&theme=dark
/api/languages?username=octocat&mode=bytes&theme=dark
/api/languages?username=octocat&format=json&mode=primary
```

### `/api/streak`

Renders a contribution streak card using GitHub GraphQL contribution data.

**Examples**

```text
/api/streak?username=octocat&theme=dark
/api/streak?username=octocat&format=json
```

### `/api/gist`

Renders a gist related card using GitHub API.

**Examples**

```text
/api/gist?id=aa5a315d61ae9438b18d
/api/gist?id=aa5a315d61ae9438b18d&theme=tokyonight&show_icons=true
/api/gist?id=aa5a315d61ae9438b18d&custom_title=Featured%20Gist&card_width=560
/api/gist?id=aa5a315d61ae9438b18d&format=json
```

### `/api/wakatime`

Renders a wakatime related card using Wakatime API.

**Examples**

```text
/api/wakatime?username=octocat
/api/wakatime?username=octocat&range=last_30_days
/api/wakatime?username=octocat&layout=donut&theme=tokyonight
/api/wakatime?username=octocat&format=json
```

### `/api/pin`

Renders a pinned repository related card using GitHub API.

**Examples**

```text
/api/pin?repo=SaumilP/gh-stats
/api/pin?repo=SaumilP/gh-stats&theme=tokyonight&show_icons=true
/api/pin?owner=SaumilP&name=gh-stats&show_owner=true&custom_title=Featured%20Repo
/api/pin?repo=SaumilP/gh-stats&format=json
```

### `/api/health`

Returns service diagnostics information.

### `/api/limits`

Returns rate limit diagnostics in JSON form.

---

## Shared query parameters

Most endpoints support these parameters:

```text
username       required GitHub username
theme          dark | light | default | transparent | radical | merko | gruvbox | tokyonight | onedark | cobalt | synthwave | highcontrast | dracula
format         svg | json
cacheSeconds   cache header override within allowed clamp
refresh        1 to bypass server-side cache
compact        1 for smaller output where supported
```

### Theme customization

The codebase now supports additional presentation controls such as:

```text
title_color
text_color
icon_color
border_color
bg_color
hide_border
border_radius
```

`bg_color` also supports gradient-style input in the theme resolver.

### Languages-specific presentation controls

The language renderer supports broader layout options:

```text
layout=normal
layout=compact
layout=donut
layout=donut-vertical
layout=pie
hide_progress=true
maxReposForLanguages=5..50
```

---

## README embed examples

### Basic stats card

```md
![GitHub stats](https://YOUR_DOMAIN/api/stats?username=YOUR_USERNAME&theme=dark)
```

### Theme-aware `<picture>` embed

```html
<picture>
  <source
    srcset="https://YOUR_DOMAIN/api/stats?username=YOUR_USERNAME&theme=dark"
    media="(prefers-color-scheme: dark)"
  />
  <img
    src="https://YOUR_DOMAIN/api/stats?username=YOUR_USERNAME&theme=light"
    alt="GitHub stats card"
  />
</picture>
```

### Languages + repos pairing

```html
<a href="https://github.com/YOUR_USERNAME">
  <img height="180" src="https://YOUR_DOMAIN/api/stats?username=YOUR_USERNAME&theme=dark" />
</a>
<a href="https://github.com/YOUR_USERNAME?tab=repositories">
  <img height="180" src="https://YOUR_DOMAIN/api/languages?username=YOUR_USERNAME&theme=dark&layout=compact" />
</a>
```

### Top repos card

```md
![Top repositories](https://YOUR_DOMAIN/api/repos?username=YOUR_USERNAME&theme=dark&count=6&sort=stars)
```

### Streak card

```md
![Contribution streak](https://YOUR_DOMAIN/api/streak?username=YOUR_USERNAME&theme=dark)
```

---

## Installation

```bash
$> npm install
```

For local Vercel development:

```bash
$> npm install -g vercel
$> npm run vercel:dev
```

---

## Deployment

### Vercel

```bash
vercel
```

### Recommended environment variables

```text
GITHUB_TOKEN
GH_TOKEN
CACHE_ENABLED=true
KV_REST_API_URL
KV_REST_API_TOKEN
CACHE_TTL_STATS=21600
CACHE_TTL_REPOS=21600
CACHE_TTL_LANGUAGES=86400
CACHE_TTL_STREAK=21600
```

---

## Static pregeneration mode

If you want minimal runtime cost for public README views, pre-generate SVGs and commit them into the repository.

### Repository variables

```text
GH_STATS_BASE_URL
GH_STATS_USERNAME
```

### Workflow

Use the pregeneration workflow to periodically refresh committed card assets and reference them directly from your profile README.

---

## Project structure

```text
.github/workflows/
api/
cards/
lib/
public/
scripts/
README.md
package.json
tsconfig.json
vercel.json
```

### Key folders

- `api/` — Vercel function entrypoints
- `cards/` — SVG renderers and card composition logic
- `lib/` — query parsing, GitHub API helpers, theme resolution, ranking, diagnostics, formatting, response helpers
- `public/` — static marketing page and public assets
- `scripts/` — pregeneration support

---

## Recent enhancement direction

The most recent work in the repository indicates a broader evolution beyond the initial four cards. The codebase now shows support or preparation for:

- richer theme/token handling
- custom color parameters
- border and radius customization
- advanced language-card layouts
- pinned repository card renderer
- gist card renderer
- WakaTime-oriented renderer
- extended health diagnostics coverage for newly introduced card categories

This makes the project more aligned with a self-hosted GitHub README card platform rather than a single-purpose stats endpoint set.

---

## Homepage

The repository includes a simple static landing page at `/` that previews cards and generates embed snippets.

Key homepage goals:

- explain the product quickly
- let users preview cards against a chosen username
- provide copy/paste embed snippets
- expose health and rate-limit diagnostics
- encourage self-hosting and low-cost usage patterns

---

## Security posture

- Minimal dependency footprint
- TypeScript-based codebase
- Cache-aware design to reduce upstream API pressure
- Friendly fallback cards instead of hard failures in embeds

---

## Acknowledgements

- GitHub REST API
- GitHub GraphQL API
- Vercel
- The broader GitHub profile README ecosystem, including inspiration from `anuraghazra/github-readme-stats`

---

## License

MIT. See [`LICENSE`](LICENSE) for details.

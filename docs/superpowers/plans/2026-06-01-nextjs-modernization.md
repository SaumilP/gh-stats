# Next.js Homepage Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the gh-stats static homepage to a modern, mobile-first Next.js app with React components, shadcn/ui, Framer Motion animations, responsive design, and an interactive card builder while preserving all existing API endpoints.

**Architecture:** Mobile-first Next.js App Router with Tailwind CSS responsive utilities. Touch-friendly interactions, optimized layout stacking for small screens, fluid typography, and adaptive component sizing. React hooks manage preview state and theme. All components tested at 375px (mobile), 768px (tablet), and 1440px (desktop) breakpoints.

**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, next-themes, viewport meta tags for mobile

---

## File Structure

```
app/
├── layout.tsx                 # Root layout, theme provider, viewport meta
├── page.tsx                   # Main homepage
├── globals.css               # Tailwind + mobile-first global styles
└── components/
    ├── Header.tsx            # Mobile hamburger nav ready
    ├── Hero.tsx              # Stack on mobile, grid on desktop
    ├── PreviewPanel.tsx       # Full-width on mobile, side panel on desktop
    ├── EmbedSection.tsx       # Responsive code block with mobile copy
    ├── EndpointsSection.tsx   # 1 col mobile, 2 col desktop
    ├── Footer.tsx            # Flex column on mobile
    ├── ThemeToggle.tsx        # Touch-friendly button
    ├── UsernameInput.tsx      # Full-width on mobile
    ├── ThemeSelector.tsx      # Full-width select on mobile
    └── Button.tsx            # Touch-sized targets (min 44px)
public/
├── logo.svg                  # Existing assets
├── favicon.svg
└── cards/
    └── *.svg
lib/
├── api.ts
└── types.ts
```

---

## Task Breakdown

### Task 1: Initialize Next.js Project with Mobile-First Configuration

**Files:**
- Create: `package.json` (update)
- Create: `tsconfig.json` (update)
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`

- [ ] **Step 1: Update package.json with dependencies**

```json
{
  "name": "gh-stats",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "next": "^15.1.3",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "next-themes": "^0.2.1",
    "framer-motion": "^11.0.8",
    "clsx": "^2.1.1",
    "class-variance-authority": "^0.7.0",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-slot": "^2.0.2"
  },
  "devDependencies": {
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.9.3"
  },
  "engines": {
    "node": ">=24"
  }
}
```

- [ ] **Step 2: Run npm install**

```bash
cd /Users/saumilpatel/code/gh-stats
npm install
```

Expected: All packages installed successfully.

- [ ] **Step 3: Create next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  compress: true,
};

export default nextConfig;
```

- [ ] **Step 4: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["app", "lib"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Create tailwind.config.ts with mobile-first breakpoints**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        accent: {
          DEFAULT: "#58a6ff",
          light: "#0969da",
        },
        accent2: {
          DEFAULT: "#a78bfa",
          light: "#7c3aed",
        },
      },
      spacing: {
        'safe': 'max(1rem, env(safe-area-inset-left))',
      },
      fontSize: {
        xs: ["12px", { lineHeight: "16px" }],
        sm: ["13px", { lineHeight: "18px" }],
        base: ["14px", { lineHeight: "20px" }],
        lg: ["16px", { lineHeight: "24px" }],
        xl: ["20px", { lineHeight: "28px" }],
        "2xl": ["24px", { lineHeight: "32px" }],
        "3xl": ["30px", { lineHeight: "36px" }],
        "4xl": ["36px", { lineHeight: "40px" }],
      },
      borderRadius: {
        lg: "18px",
        md: "12px",
        sm: "8px",
      },
    },
  },
  darkMode: "class",
  plugins: [],
};

export default config;
```

- [ ] **Step 6: Create postcss.config.js**

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 7: Commit**

```bash
git add package.json tsconfig.json next.config.ts tailwind.config.ts postcss.config.js
git commit -m "chore: initialize Next.js with mobile-first Tailwind config"
```

---

### Task 2: Create App Router Layout with Mobile Viewport and Theme Provider

**Files:**
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/providers.tsx`

- [ ] **Step 1: Create globals.css with mobile-first responsive design**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    @apply scroll-smooth;
  }

  body {
    @apply bg-gradient-to-b from-transparent via-transparent to-transparent;
    background-image: 
      radial-gradient(1200px 700px at 20% -10%, rgba(88, 166, 255, 0.2), transparent 55%),
      radial-gradient(900px 560px at 100% 10%, rgba(167, 139, 250, 0.2), transparent 52%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 70%);
    @apply dark:bg-slate-950 bg-blue-50;
    @apply text-base;
  }

  @media (prefers-color-scheme: dark) {
    body {
      @apply text-neutral-100;
    }
  }

  @media (prefers-color-scheme: light) {
    body {
      @apply text-slate-900;
    }
  }

  /* Safe area support for notched devices */
  @supports (padding: max(0px)) {
    body {
      padding-left: max(12px, env(safe-area-inset-left));
      padding-right: max(12px, env(safe-area-inset-right));
    }
  }
}

@layer components {
  .glass {
    @apply backdrop-blur-lg bg-white/5 dark:bg-white/5 border border-white/10;
  }

  .card-glass {
    @apply glass rounded-xl overflow-hidden;
  }

  .container-responsive {
    @apply w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8;
  }
}

/* Prevent text zoom on input focus (iOS) */
input, select, textarea {
  font-size: 16px;
}

/* Smooth color transitions */
* {
  @apply transition-colors duration-200;
}

button, [role="button"] {
  -webkit-tap-highlight-color: transparent;
}
```

- [ ] **Step 2: Create app/providers.tsx**

```typescript
"use client";

import { ThemeProvider } from "next-themes";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: Create app/layout.tsx with mobile viewport meta tags**

```typescript
import type { Metadata, Viewport } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "gh-stats — SVG cards for GitHub READMEs",
  description: "Generate fast, cache-friendly SVG cards (stats, languages, repos, streak) you can embed into your GitHub profile README.",
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx app/globals.css app/providers.tsx
git commit -m "feat: set up Next.js App Router with mobile-first viewport"
```

---

### Task 3: Create TypeScript Types and API Utilities

**Files:**
- Create: `lib/types.ts`
- Create: `lib/api.ts`

- [ ] **Step 1: Create lib/types.ts**

```typescript
export type Theme = "auto" | "dark" | "light";
export type CardType = "stats" | "languages" | "repos" | "streak";

export interface PreviewState {
  username: string;
  theme: Theme;
}

export interface CardPreview {
  type: CardType;
  src: string;
  alt: string;
}

export interface EmbedOptions {
  username: string;
  domain: string;
  theme: Theme;
}
```

- [ ] **Step 2: Create lib/api.ts**

```typescript
import { CardType, Theme } from "./types";

export function buildCardUrl(
  endpoint: string,
  username: string,
  theme: Theme,
  extra: Record<string, string> = {}
): string {
  const params = new URLSearchParams({
    username,
    format: "svg",
    compact: "1",
    theme: theme === "auto" ? "dark" : theme,
    ...extra,
  });

  return `${endpoint}?${params.toString()}`;
}

export function getCardUrls(username: string, theme: Theme) {
  return {
    stats: buildCardUrl("/api/stats", username, theme),
    languages: buildCardUrl("/api/languages", username, theme, {
      mode: "primary",
    }),
    repos: buildCardUrl("/api/repos", username, theme, {
      count: "6",
      sort: "stars",
    }),
    streak: buildCardUrl("/api/streak", username, theme),
  };
}

export function generateEmbedCode(username: string, domain: string): string {
  const base = `https://${domain}`;
  return `<picture>
  <source srcset="${base}/api/stats?username=${username}&theme=dark" media="(prefers-color-scheme: dark)">
  <img src="${base}/api/stats?username=${username}&theme=light" alt="GitHub stats" />
</picture>

<!-- Languages (cheap default) -->
<img src="${base}/api/languages?username=${username}&mode=primary&theme=dark" alt="Top languages" />

<!-- Repos -->
<img src="${base}/api/repos?username=${username}&count=6&sort=stars&theme=dark" alt="Top repos" />

<!-- Streak (token recommended) -->
<img src="${base}/api/streak?username=${username}&theme=dark" alt="Contribution streak" />`;
}

export function clampUsername(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "octocat";
  const clean = trimmed.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 39);
  return clean || "octocat";
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts lib/api.ts
git commit -m "feat: add TypeScript types and API utilities"
```

---

### Task 4: Create Responsive Mobile-First Button and Input Components

**Files:**
- Create: `app/components/Button.tsx`
- Create: `app/components/Input.tsx`

- [ ] **Step 1: Create app/components/Button.tsx with touch targets**

```typescript
import React from "react";
import clsx from "clsx";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  children: React.ReactNode;
}

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center font-bold rounded-md transition-all duration-200",
        "hover:scale-105 active:scale-95",
        "min-h-[44px]", // Touch-friendly minimum height
        size === "sm" && "px-3 py-2 text-xs h-auto min-h-[40px]",
        size === "md" && "px-4 py-2.5 sm:py-2 text-sm h-auto min-h-[44px]",
        variant === "primary" &&
          "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg",
        variant === "secondary" &&
          "bg-white/10 dark:bg-white/5 border border-white/20 hover:bg-white/20 dark:hover:bg-white/10",
        variant === "ghost" &&
          "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100",
        className
      )}
      {...props}
    />
  );
}
```

- [ ] **Step 2: Create app/components/Input.tsx with mobile optimization**

```typescript
import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col w-full">
      {label && (
        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "w-full h-11 sm:h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700",
          "bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100",
          "text-base sm:text-sm",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "placeholder-gray-500 dark:placeholder-gray-400",
          className
        )}
        {...props}
      />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/components/Button.tsx app/components/Input.tsx
git commit -m "feat: create touch-friendly responsive buttons and inputs"
```

---

### Task 5: Create Responsive Theme Toggle

**Files:**
- Create: `app/components/ThemeToggle.tsx`

- [ ] **Step 1: Create app/components/ThemeToggle.tsx**

```typescript
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2.5 sm:p-2 rounded-md hover:bg-white/10 dark:hover:bg-white/5 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536a1 1 0 10-1.414-1.414 3 3 0 11-4.242 0 1 1 0 00-1.414 1.414 5 5 0 007.07 0zM7 11a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      )}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/ThemeToggle.tsx
git commit -m "feat: create responsive theme toggle with touch targets"
```

---

### Task 6: Create Responsive Header with Mobile Navigation

**Files:**
- Create: `app/components/Header.tsx`

- [ ] **Step 1: Create app/components/Header.tsx**

```typescript
"use client";

import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-950/80 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 sm:gap-3 font-bold text-sm sm:text-lg flex-shrink-0">
          <img src="/logo.svg" alt="gh-stats" className="w-7 h-7 sm:w-8 sm:h-8" />
          <span className="hidden xs:inline">gh-stats</span>
        </Link>

        <nav className="hidden sm:flex gap-4 md:gap-6 text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-400">
          <a href="#preview" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Preview
          </a>
          <a href="#embed" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Embed
          </a>
          <a href="#endpoints" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
            Endpoints
          </a>
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/Header.tsx
git commit -m "feat: create responsive header with mobile optimization"
```

---

### Task 7: Create Responsive Hero Section

**Files:**
- Create: `app/components/Hero.tsx`

- [ ] **Step 1: Create app/components/Hero.tsx with mobile-first layout**

```typescript
"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Input } from "./Input";
import { Button } from "./Button";
import { clampUsername } from "@/lib/api";
import { Theme } from "@/lib/types";

interface HeroProps {
  onPreviewUpdate: (username: string, theme: Theme) => void;
}

export function Hero({ onPreviewUpdate }: HeroProps) {
  const [username, setUsername] = useState("octocat");
  const [theme, setTheme] = useState<Theme>("auto");

  const handleUpdate = useCallback(() => {
    const cleaned = clampUsername(username);
    setUsername(cleaned);
    onPreviewUpdate(cleaned, theme);
  }, [username, theme, onPreviewUpdate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleUpdate();
  };

  return (
    <section className="relative py-8 sm:py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center">
          {/* Left Content - Stack on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="order-2 md:order-1"
          >
            <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 mb-4">
              <img
                src="/logo.svg"
                alt=""
                className="w-8 h-8 xs:w-10 xs:h-10 drop-shadow-lg flex-shrink-0"
              />
              <span className="inline-flex items-center gap-1.5 xs:gap-2 px-2 xs:px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-white/5 text-xs font-bold text-gray-600 dark:text-gray-400">
                <span className="hidden sm:inline">Vercel-friendly •</span> 
                <span className="hidden sm:inline">dependency-light •</span> 
                <span>SVG-first</span>
              </span>
            </div>

            <h1 className="text-3xl xs:text-4xl sm:text-5xl font-bold tracking-tight mb-3 sm:mb-4 leading-tight">
              Beautiful GitHub README cards,{" "}
              <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                generated on-demand.
              </span>
            </h1>

            <p className="text-sm xs:text-base text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 leading-relaxed">
              <strong>gh-stats</strong> is a minimal serverless service that renders
              stable SVG cards for your GitHub profile: stats, top repos, languages,
              and contribution streak.
            </p>

            {/* Controls - Full width on mobile */}
            <div className="glass rounded-xl p-4 sm:p-5 mb-6 space-y-4">
              <Input
                label="GitHub username"
                placeholder="octocat"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              <div className="flex flex-col w-full">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-2">
                  Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as Theme)}
                  className="w-full h-11 sm:h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auto">Auto</option>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <Button
                variant="primary"
                size="md"
                onClick={handleUpdate}
                className="w-full"
              >
                Update preview
              </Button>
            </div>

            {/* CTA Buttons - Stack on mobile */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 mb-4">
              <Button variant="primary" size="md" className="flex-1 xs:flex-auto">
                Get embed code
              </Button>
              <Button variant="secondary" size="md" className="hidden xs:inline-flex">
                Health
              </Button>
              <Button variant="secondary" size="md" className="hidden xs:inline-flex">
                Rate limits
              </Button>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Tip: set <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                GITHUB_TOKEN
              </code>{" "}
              on Vercel for higher rate limits.
            </p>
          </motion.div>

          {/* Right Preview - Full width on mobile, side on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            id="preview"
            className="order-1 md:order-2"
          >
            <div className="card-glass p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div className="flex gap-1.5 sm:gap-2">
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 ml-2">
                  Preview
                </span>
              </div>
              <div className="space-y-2">
                <div className="bg-white/5 rounded-lg h-32 sm:h-40 animate-pulse" />
                <div className="bg-white/5 rounded-lg h-32 sm:h-40 animate-pulse" />
                <div className="bg-white/5 rounded-lg h-20 sm:h-24 animate-pulse" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/Hero.tsx
git commit -m "feat: create mobile-first responsive hero section"
```

---

### Task 8: Create Responsive Preview Panel

**Files:**
- Create: `app/components/PreviewPanel.tsx`

- [ ] **Step 1: Create app/components/PreviewPanel.tsx**

```typescript
"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getCardUrls } from "@/lib/api";
import { Theme } from "@/lib/types";

interface PreviewPanelProps {
  username: string;
  theme: Theme;
}

export function PreviewPanel({ username, theme }: PreviewPanelProps) {
  const [cardUrls, setCardUrls] = useState<Record<string, string>>({
    stats: "",
    languages: "",
    repos: "",
    streak: "",
  });

  useEffect(() => {
    setCardUrls(getCardUrls(username, theme));
  }, [username, theme]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <motion.div
      className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={cardVariants} className="card-glass rounded-lg p-2 sm:p-3 md:p-4">
        <img
          src={cardUrls.stats}
          alt="Stats card"
          className="w-full h-auto"
          loading="lazy"
        />
      </motion.div>

      <motion.div variants={cardVariants} className="card-glass rounded-lg p-2 sm:p-3 md:p-4">
        <img
          src={cardUrls.languages}
          alt="Languages card"
          className="w-full h-auto"
          loading="lazy"
        />
      </motion.div>

      <motion.div variants={cardVariants} className="card-glass rounded-lg p-2 sm:p-3 md:p-4">
        <img
          src={cardUrls.repos}
          alt="Repos card"
          className="w-full h-auto"
          loading="lazy"
        />
      </motion.div>

      <motion.div variants={cardVariants} className="card-glass rounded-lg p-2 sm:p-3 md:p-4">
        <img
          src={cardUrls.streak}
          alt="Streak card"
          className="w-full h-auto"
          loading="lazy"
        />
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/PreviewPanel.tsx
git commit -m "feat: create responsive animated preview panel"
```

---

### Task 9: Create Responsive Embed Section

**Files:**
- Create: `app/components/EmbedSection.tsx`

- [ ] **Step 1: Create app/components/EmbedSection.tsx**

```typescript
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { generateEmbedCode } from "@/lib/api";
import { Button } from "./Button";

interface EmbedSectionProps {
  username: string;
}

export function EmbedSection({ username }: EmbedSectionProps) {
  const [embedCode, setEmbedCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const domain = typeof window !== "undefined" ? window.location.host : "";
    setEmbedCode(generateEmbedCode(username, domain));
  }, [username]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section id="embed" className="py-8 sm:py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Embed in your README</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 leading-relaxed">
            Use a <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
              &lt;picture&gt;
            </code>{" "}
            tag to automatically match the viewer's theme.
          </p>

          <div className="relative glass rounded-lg p-3 sm:p-4 md:p-6 mb-4 sm:mb-6 overflow-x-auto">
            <pre className="text-xs sm:text-sm text-gray-100 dark:text-gray-300 whitespace-pre-wrap break-words">
              <code>{embedCode}</code>
            </pre>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCopy}
              className="absolute top-3 sm:top-4 right-3 sm:right-4"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <div className="glass rounded-lg p-3 sm:p-4">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Want the lowest cost? Use{" "}
              <code className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                /api/languages?mode=primary
              </code>{" "}
              and keep your cards cached.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/EmbedSection.tsx
git commit -m "feat: create responsive embed section with mobile copy"
```

---

### Task 10: Create Responsive Endpoints Section

**Files:**
- Create: `app/components/EndpointsSection.tsx`

- [ ] **Step 1: Create app/components/EndpointsSection.tsx**

```typescript
"use client";

import { motion } from "framer-motion";

const endpoints = [
  {
    path: "/api/stats",
    description: "Profile stats: repos, followers, stars, forks.",
    params: "?username= (required) • ?theme=",
  },
  {
    path: "/api/repos",
    description: "Top repos. Sorted deterministically.",
    params: "?count=1..10 • ?sort=stars|forks",
  },
  {
    path: "/api/languages",
    description: "Default cheap mode + accurate bytes mode.",
    params: "?mode=primary • ?mode=bytes",
  },
  {
    path: "/api/streak",
    description: "Contribution streak via GraphQL.",
    params: "GITHUB_TOKEN recommended",
  },
];

export function EndpointsSection() {
  return (
    <section id="endpoints" className="py-8 sm:py-12 md:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl xs:text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">API Endpoints</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {endpoints.map((endpoint, idx) => (
              <motion.div
                key={endpoint.path}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="glass rounded-lg p-4 sm:p-5"
              >
                <h3 className="font-mono font-bold text-blue-400 text-sm sm:text-base mb-2">
                  {endpoint.path}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  {endpoint.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 font-mono break-words">
                  {endpoint.params}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/EndpointsSection.tsx
git commit -m "feat: create responsive endpoints documentation"
```

---

### Task 11: Create Responsive Footer

**Files:**
- Create: `app/components/Footer.tsx`

- [ ] **Step 1: Create app/components/Footer.tsx**

```typescript
"use client";

import { motion } from "framer-motion";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 py-8 sm:py-12 mt-12 md:mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center gap-2 sm:gap-3 text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400"
        >
          <span className="leading-relaxed">
            gh-stats — built for stable embeds and low-cost hosting.
          </span>
          <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
            <a href="/api/health" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Health
            </a>
            <span className="text-gray-400">·</span>
            <a href="/api/limits?format=json" className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              Limits
            </a>
            <span className="text-gray-400">·</span>
            <a
              href="https://github.com/SaumilP/gh-stats"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              GitHub
            </a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/Footer.tsx
git commit -m "feat: create responsive footer"
```

---

### Task 12: Create Main Page with State Management

**Files:**
- Create: `app/page.tsx`

- [ ] **Step 1: Create app/page.tsx**

```typescript
"use client";

import { useState, useCallback, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PreviewPanel } from "./components/PreviewPanel";
import { EmbedSection } from "./components/EmbedSection";
import { EndpointsSection } from "./components/EndpointsSection";
import { Footer } from "./components/Footer";
import { Theme } from "@/lib/types";

export default function Home() {
  const [username, setUsername] = useState("octocat");
  const [theme, setTheme] = useState<Theme>("auto");
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize from URL params on client
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const urlUsername = url.searchParams.get("username") || "octocat";
      const urlTheme = (url.searchParams.get("theme") || "auto") as Theme;
      setUsername(urlUsername);
      setTheme(urlTheme);
      setIsInitialized(true);
    }
  }, []);

  const handlePreviewUpdate = useCallback((newUsername: string, newTheme: Theme) => {
    setUsername(newUsername);
    setTheme(newTheme);
    
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("username", newUsername);
      url.searchParams.set("theme", newTheme);
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  if (!isInitialized) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="flex flex-col">
        <Hero onPreviewUpdate={handlePreviewUpdate} />
        
        <section className="py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* Preview Panel - Full width on mobile, right on desktop */}
              <div className="md:order-2">
                <PreviewPanel username={username} theme={theme} />
              </div>
              
              {/* Description - Full width on mobile, left on desktop */}
              <div className="md:order-1 flex items-center">
                <div className="glass rounded-lg p-4 sm:p-5 md:p-6 w-full">
                  <h3 className="font-bold text-lg mb-2">Preview</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Live preview of your GitHub stats cards. Change theme and username above to see real-time updates.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <EmbedSection username={username} />
        <EndpointsSection />
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: create main page with responsive layout"
```

---

### Task 13: Configure Vercel Deployment

**Files:**
- Modify: `vercel.json`
- Create: `public/manifest.json`

- [ ] **Step 1: Update vercel.json**

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "nodeVersion": "24.x",
  "env": {
    "GITHUB_TOKEN": "@github_token",
    "GH_TOKEN": "@gh_token"
  }
}
```

- [ ] **Step 2: Create public/manifest.json for PWA support**

```json
{
  "name": "gh-stats",
  "short_name": "gh-stats",
  "description": "Generate SVG cards for GitHub READMEs",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#58a6ff",
  "icons": [
    {
      "src": "/logo.svg",
      "sizes": "192x192",
      "type": "image/svg+xml"
    }
  ]
}
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: No TypeScript errors.

- [ ] **Step 4: Test locally on mobile viewport**

```bash
npm run dev
```

Open `http://localhost:3000` and test at:
- **375px (mobile):** Stack layout, touch targets 44px min
- **768px (tablet):** Grid layout, readable spacing
- **1440px (desktop):** Full layout with side panel

Test functionality:
- [ ] Navigation works on mobile
- [ ] All buttons are touch-friendly (tap-friendly sizes)
- [ ] Form inputs accept text without zooming
- [ ] Images load and scale properly
- [ ] Dark/light theme toggle works
- [ ] All sections scroll smoothly
- [ ] Embed code copy works on mobile

- [ ] **Step 5: Build for production**

```bash
npm run build
```

Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add vercel.json public/manifest.json
git commit -m "chore: configure Vercel deployment and PWA manifest"
```

- [ ] **Step 7: Deploy to Vercel**

```bash
vercel deploy --prod
```

Expected: Deployment succeeds.

---

### Task 14: Test Responsive Design on Multiple Devices

**Files:** None (testing only)

- [ ] **Step 1: Test on Chrome DevTools at multiple breakpoints**

```
- 375px (iPhone SE)
- 425px (iPhone 12)
- 768px (iPad)
- 1024px (Landscape tablet)
- 1440px (Desktop)
```

Verify for each breakpoint:
- [ ] Text is readable (no horizontal scroll)
- [ ] Images scale properly
- [ ] Buttons are touch-friendly (min 44px height)
- [ ] Form fields accept input without zoom
- [ ] Navigation is accessible
- [ ] Cards display in correct grid layout
- [ ] Spacing is consistent

- [ ] **Step 2: Test touch interactions**

- [ ] Tap theme toggle smoothly
- [ ] Tap buttons smoothly without tap highlight
- [ ] Swipe to scroll works
- [ ] Click on navbar links scrolls smoothly

- [ ] **Step 3: Test on actual devices**

If available, test on:
- [ ] iPhone (latest)
- [ ] Android phone
- [ ] iPad/tablet
- [ ] Desktop

- [ ] **Step 4: Verify dark mode**

- [ ] Toggle theme at each breakpoint
- [ ] Colors are accessible (contrast ratio ≥ 4.5:1)
- [ ] Transitions are smooth

- [ ] **Step 5: Check performance**

```bash
npm run build && npm start
```

Open Chrome DevTools Lighthouse:
- [ ] Mobile score ≥ 90
- [ ] Desktop score ≥ 95
- [ ] No cumulative layout shift (CLS < 0.1)

---

### Task 15: Final Polish and Commit

**Files:** None (documentation only)

- [ ] **Step 1: Verify all components are documented**

Check README has:
- [ ] How to run dev server
- [ ] How to build for production
- [ ] Deployment instructions
- [ ] Component structure
- [ ] Mobile-first design principles

- [ ] **Step 2: Final commit**

```bash
git log --oneline -10
```

Expected: All commits are present with clear messages.

- [ ] **Step 3: Push to GitHub**

```bash
git push origin feature/restyle-design
```

- [ ] **Step 4: Create PR**

If ready, create PR with:
- Description of changes
- Before/after (old vs new site)
- Mobile responsiveness notes
- Testing checklist

---

## Spec Coverage Check

✅ **Mobile-first design** — All components use Tailwind responsive utilities starting with mobile  
✅ **Touch-friendly interactions** — All buttons/inputs min 44px height  
✅ **Responsive breakpoints** — 375px, 425px, 768px, 1024px, 1440px tested  
✅ **Framework migration** — Tasks 1-2 set up Next.js  
✅ **React components** — Tasks 4-12 create all responsive components  
✅ **TypeScript** — Integrated throughout  
✅ **Tailwind CSS** — Mobile-first utility classes  
✅ **Framer Motion** — Animations in all sections  
✅ **Dark/Light mode** — next-themes with smooth transitions  
✅ **API endpoints preserved** — No changes to `/api/*`  
✅ **Deployment configured** — Task 13 handles Vercel  
✅ **Testing strategy** — Task 14 comprehensive testing  

---

Plan complete and saved to `docs/superpowers/plans/2026-06-01-nextjs-modernization.md`. 

**Two execution options:**

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
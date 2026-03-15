import type { ThemeOptions } from "./query";

export type ThemeTokens = {
  bg: string;
  fg: string;
  muted: string;
  border: string;
  chipBg: string;
  accent: string;
  title: string;
  icon: string;
};

export type ThemeStyle = {
  theme: string;
  tokens: ThemeTokens;
  borderRadius: number;
  hideBorder: boolean;
  bgGradient?: { angle: number; start: string; end: string };
};

const THEMES: Record<string, ThemeTokens> = {
  light: {
    bg: "#ffffff",
    fg: "#24292f",
    muted: "#57606a",
    border: "#d0d7de",
    chipBg: "#f6f8fa",
    accent: "#0969da",
    title: "#0969da",
    icon: "#0969da",
  },
  dark: {
    bg: "#0d1117",
    fg: "#e6edf3",
    muted: "#9da7b1",
    border: "#30363d",
    chipBg: "#161b22",
    accent: "#58a6ff",
    title: "#58a6ff",
    icon: "#58a6ff",
  },
  default: {
    bg: "#ffffff",
    fg: "#24292f",
    muted: "#57606a",
    border: "#d0d7de",
    chipBg: "#f6f8fa",
    accent: "#0969da",
    title: "#0969da",
    icon: "#0969da",
  },
  transparent: {
    bg: "transparent",
    fg: "#24292f",
    muted: "#57606a",
    border: "transparent",
    chipBg: "rgba(0,0,0,0.04)",
    accent: "#0969da",
    title: "#0969da",
    icon: "#0969da",
  },
  radical: {
    bg: "#141321",
    fg: "#a9fef7",
    muted: "#9a8fbe",
    border: "#1f1b24",
    chipBg: "#1f1b24",
    accent: "#fe428e",
    title: "#fe428e",
    icon: "#f8d847",
  },
  merko: {
    bg: "#0a0f0b",
    fg: "#c8e2a7",
    muted: "#87a96b",
    border: "#0c1a10",
    chipBg: "#0c1a10",
    accent: "#abd200",
    title: "#abd200",
    icon: "#b7ff00",
  },
  gruvbox: {
    bg: "#282828",
    fg: "#ebdbb2",
    muted: "#a89984",
    border: "#3c3836",
    chipBg: "#3c3836",
    accent: "#fabd2f",
    title: "#fabd2f",
    icon: "#fe8019",
  },
  tokyonight: {
    bg: "#1a1b27",
    fg: "#c0caf5",
    muted: "#9aa5ce",
    border: "#1a1b27",
    chipBg: "#1f2335",
    accent: "#7aa2f7",
    title: "#7aa2f7",
    icon: "#bb9af7",
  },
  onedark: {
    bg: "#282c34",
    fg: "#abb2bf",
    muted: "#5c6370",
    border: "#3e4451",
    chipBg: "#3e4451",
    accent: "#61afef",
    title: "#61afef",
    icon: "#98c379",
  },
  cobalt: {
    bg: "#193549",
    fg: "#ffffff",
    muted: "#a0b9d1",
    border: "#193549",
    chipBg: "#1e3a52",
    accent: "#ffc600",
    title: "#ffc600",
    icon: "#ff9900",
  },
  synthwave: {
    bg: "#2b213a",
    fg: "#f4eee4",
    muted: "#d0a9ff",
    border: "#2b213a",
    chipBg: "#3a2f50",
    accent: "#e2e9ff",
    title: "#e2e9ff",
    icon: "#ff8a65",
  },
  highcontrast: {
    bg: "#000000",
    fg: "#ffffff",
    muted: "#c0c0c0",
    border: "#ffffff",
    chipBg: "#111111",
    accent: "#00e676",
    title: "#ffffff",
    icon: "#00e676",
  },
  dracula: {
    bg: "#282a36",
    fg: "#f8f8f2",
    muted: "#bd93f9",
    border: "#44475a",
    chipBg: "#44475a",
    accent: "#ff79c6",
    title: "#ff79c6",
    icon: "#8be9fd",
  },
};

function normalizeColor(raw?: string): string | undefined {
  if (!raw) return undefined;
  const s = String(raw).trim();
  if (!s) return undefined;
  if (s === "none" || s === "transparent") return s;
  const hex = s.startsWith("#") ? s.slice(1) : s;
  if (/^[0-9a-fA-F]{3,8}$/.test(hex)) return `#${hex}`;
  return undefined;
}

function parseGradient(raw?: string): { angle: number; start: string; end: string } | null {
  if (!raw) return null;
  const parts = String(raw)
    .split(",")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length < 2) return null;
  let angle = 0;
  let idx = 0;
  if (/^-?\d+(\.\d+)?$/.test(parts[0])) {
    angle = Number.parseFloat(parts[0]);
    idx = 1;
  }
  const start = normalizeColor(parts[idx]);
  const end = normalizeColor(parts[idx + 1]);
  if (!start || !end) return null;
  return { angle, start, end };
}

export function resolveTheme(opts: ThemeOptions): ThemeStyle {
  const name = (opts.theme || "dark").toLowerCase();
  const base = THEMES[name] || (name === "light" ? THEMES.light : THEMES.dark);
  const tokens: ThemeTokens = {
    bg: base.bg,
    fg: base.fg,
    muted: base.muted,
    border: base.border,
    chipBg: base.chipBg,
    accent: base.accent,
    title: base.title || base.accent,
    icon: base.icon || base.accent,
  };

  const bgGradient = parseGradient(opts.bgColor);
  if (!bgGradient) {
    const bg = normalizeColor(opts.bgColor);
    if (bg) tokens.bg = bg;
  }

  const title = normalizeColor(opts.titleColor);
  if (title) tokens.title = title;

  const fg = normalizeColor(opts.textColor);
  if (fg) tokens.fg = fg;

  const icon = normalizeColor(opts.iconColor);
  if (icon) tokens.icon = icon;

  const border = normalizeColor(opts.borderColor);
  if (border) tokens.border = border;

  return {
    theme: name,
    tokens,
    borderRadius: Number.isFinite(opts.borderRadius) ? Math.max(0, opts.borderRadius || 0) : 14,
    hideBorder: Boolean(opts.hideBorder),
    bgGradient: bgGradient || undefined,
  };
}

export function styleKeyFrom(opts: ThemeOptions): string {
  return [
    (opts.theme || "dark").toLowerCase(),
    opts.titleColor || "",
    opts.textColor || "",
    opts.iconColor || "",
    opts.borderColor || "",
    opts.bgColor || "",
    opts.hideBorder ? "1" : "0",
    opts.borderRadius ? String(opts.borderRadius) : "",
  ].join("|");
}

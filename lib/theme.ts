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
  // Core themes
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
  // Popular editor themes
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
  // Solarized themes
  solarized_light: {
    bg: "#fdf6e3",
    fg: "#657b83",
    muted: "#93a1a1",
    border: "#eee8d5",
    chipBg: "#eee8d5",
    accent: "#268bd2",
    title: "#268bd2",
    icon: "#2aa198",
  },
  solarized_dark: {
    bg: "#002b36",
    fg: "#839496",
    muted: "#586e75",
    border: "#073642",
    chipBg: "#073642",
    accent: "#268bd2",
    title: "#268bd2",
    icon: "#2aa198",
  },
  // Nord theme
  nord: {
    bg: "#2e3440",
    fg: "#eceff4",
    muted: "#d8dee9",
    border: "#3b4252",
    chipBg: "#3b4252",
    accent: "#88c0d0",
    title: "#88c0d0",
    icon: "#81a1c1",
  },
  // Material themes
  material: {
    bg: "#263238",
    fg: "#eeffff",
    muted: "#b0bec5",
    border: "#37474f",
    chipBg: "#37474f",
    accent: "#82b1ff",
    title: "#82b1ff",
    icon: "#80deea",
  },
  material_palenight: {
    bg: "#292d3e",
    fg: "#eeffff",
    muted: "#9fa8da",
    border: "#3f3f5f",
    chipBg: "#3f3f5f",
    accent: "#c792ea",
    title: "#c792ea",
    icon: "#80deea",
  },
  // Monokai
  monokai: {
    bg: "#272822",
    fg: "#f8f8f2",
    muted: "#75715e",
    border: "#3e3d32",
    chipBg: "#3e3d32",
    accent: "#f92672",
    title: "#f92672",
    icon: "#66d9ef",
  },
  // VS Code themes
  vscode_dark: {
    bg: "#1e1e1e",
    fg: "#d4d4d4",
    muted: "#858585",
    border: "#3e3e42",
    chipBg: "#3e3e42",
    accent: "#007acc",
    title: "#007acc",
    icon: "#4ec9b0",
  },
  // Atom themes
  atom_dark: {
    bg: "#282c34",
    fg: "#abb2bf",
    muted: "#5c6370",
    border: "#3e4451",
    chipBg: "#3e4451",
    accent: "#61afef",
    title: "#61afef",
    icon: "#98c379",
  },
  atom_light: {
    bg: "#fafafa",
    fg: "#383a42",
    muted: "#a0a1a7",
    border: "#e1e4e8",
    chipBg: "#f6f8fa",
    accent: "#0184bc",
    title: "#0184bc",
    icon: "#4078f2",
  },
  // GitHub themes
  github: {
    bg: "#ffffff",
    fg: "#24292f",
    muted: "#57606a",
    border: "#d0d7de",
    chipBg: "#f6f8fa",
    accent: "#0969da",
    title: "#0969da",
    icon: "#0969da",
  },
  github_dark: {
    bg: "#0d1117",
    fg: "#e6edf3",
    muted: "#9da7b1",
    border: "#30363d",
    chipBg: "#161b22",
    accent: "#58a6ff",
    title: "#58a6ff",
    icon: "#58a6ff",
  },
  github_dimmed: {
    bg: "#0d1117",
    fg: "#e6edf3",
    muted: "#8b949e",
    border: "#21262d",
    chipBg: "#161b22",
    accent: "#79c0ff",
    title: "#79c0ff",
    icon: "#79c0ff",
  },
  // Slack themes
  slack_dark: {
    bg: "#1f0a1f",
    fg: "#f7f7f7",
    muted: "#999999",
    border: "#4a3a4a",
    chipBg: "#4a3a4a",
    accent: "#e01e5a",
    title: "#e01e5a",
    icon: "#36c5f0",
  },
  // Discord theme
  discord: {
    bg: "#36393f",
    fg: "#dcddde",
    muted: "#72767d",
    border: "#202225",
    chipBg: "#2c2f33",
    accent: "#7289da",
    title: "#7289da",
    icon: "#43b581",
  },
  // Twilight theme
  twilight: {
    bg: "#141414",
    fg: "#f7f7f7",
    muted: "#8f8f8f",
    border: "#323232",
    chipBg: "#323232",
    accent: "#d1d1d1",
    title: "#d1d1d1",
    icon: "#9b859d",
  },
  // Seti UI theme
  seti: {
    bg: "#151718",
    fg: "#d4d4d4",
    muted: "#858585",
    border: "#282828",
    chipBg: "#282828",
    accent: "#15a0d0",
    title: "#15a0d0",
    icon: "#79d835",
  },
  // Spacegray theme
  spacegray: {
    bg: "#2b2b2b",
    fg: "#e0e0e0",
    muted: "#9d9d9d",
    border: "#3a3a3a",
    chipBg: "#3a3a3a",
    accent: "#7ad8ff",
    title: "#7ad8ff",
    icon: "#a1efe4",
  },
  // Zenburn theme
  zenburn: {
    bg: "#383838",
    fg: "#dcdcdc",
    muted: "#9fafaf",
    border: "#4a4a4a",
    chipBg: "#4a4a4a",
    accent: "#e8d4b8",
    title: "#e8d4b8",
    icon: "#bc9458",
  },
  // Ayu theme
  ayu_dark: {
    bg: "#0f1419",
    fg: "#e6e1cf",
    muted: "#626a6c",
    border: "#191f26",
    chipBg: "#191f26",
    accent: "#39bae6",
    title: "#39bae6",
    icon: "#aad94c",
  },
  ayu_mirage: {
    bg: "#1f2430",
    fg: "#cbccc6",
    muted: "#626a6c",
    border: "#282e3b",
    chipBg: "#282e3b",
    accent: "#73d7ff",
    title: "#73d7ff",
    icon: "#d4bfff",
  },
  // Dracula variants
  dracula_pro_blue: {
    bg: "#282a36",
    fg: "#f8f8f2",
    muted: "#bd93f9",
    border: "#44475a",
    chipBg: "#44475a",
    accent: "#8be9fd",
    title: "#8be9fd",
    icon: "#50fa7b",
  },
  dracula_pro_green: {
    bg: "#282a36",
    fg: "#f8f8f2",
    muted: "#bd93f9",
    border: "#44475a",
    chipBg: "#44475a",
    accent: "#50fa7b",
    title: "#50fa7b",
    icon: "#ff79c6",
  },
  dracula_pro_pink: {
    bg: "#282a36",
    fg: "#f8f8f2",
    muted: "#bd93f9",
    border: "#44475a",
    chipBg: "#44475a",
    accent: "#ff79c6",
    title: "#ff79c6",
    icon: "#ffb86c",
  },
  // Catppuccin themes
  catppuccin_latte: {
    bg: "#eff1f5",
    fg: "#4c4f69",
    muted: "#9ca0b0",
    border: "#dce0e8",
    chipBg: "#dce0e8",
    accent: "#1e66f5",
    title: "#1e66f5",
    icon: "#7287fd",
  },
  catppuccin_frappe: {
    bg: "#292c3c",
    fg: "#c6d0f5",
    muted: "#988ba2",
    border: "#414559",
    chipBg: "#414559",
    accent: "#8caaee",
    title: "#8caaee",
    icon: "#85c1dc",
  },
  catppuccin_macchiato: {
    bg: "#24273a",
    fg: "#cad3f5",
    muted: "#a5adcb",
    border: "#393e52",
    chipBg: "#393e52",
    accent: "#8aadf4",
    title: "#8aadf4",
    icon: "#91e8fd",
  },
  catppuccin_mocha: {
    bg: "#1e1e2e",
    fg: "#cdd6f4",
    muted: "#a6adc8",
    border: "#45475a",
    chipBg: "#45475a",
    accent: "#89b4fa",
    title: "#89b4fa",
    icon: "#a6e3a1",
  },
  // One themes
  onedark_pro: {
    bg: "#282c34",
    fg: "#abb2bf",
    muted: "#5c6370",
    border: "#3e4451",
    chipBg: "#3e4451",
    accent: "#61afef",
    title: "#61afef",
    icon: "#98c379",
  },
  // Eva theme
  eva_dark: {
    bg: "#0d1117",
    fg: "#e6e6fa",
    muted: "#7d8590",
    border: "#282c34",
    chipBg: "#282c34",
    accent: "#a1ff60",
    title: "#a1ff60",
    icon: "#7f8ff2",
  },
  // Everforest theme
  everforest: {
    bg: "#2d2d2d",
    fg: "#e8e8e8",
    muted: "#9da8a8",
    border: "#404040",
    chipBg: "#404040",
    accent: "#7fbbb3",
    title: "#7fbbb3",
    icon: "#d4c77f",
  },
  // Flexoki theme
  flexoki_dark: {
    bg: "#100f0f",
    fg: "#b7b5ac",
    muted: "#878580",
    border: "#292726",
    chipBg: "#292726",
    accent: "#df5e3b",
    title: "#df5e3b",
    icon: "#2d9f6f",
  },
  // GitHub Copilot theme (inspired by GitHub's AI theme)
  copilot: {
    bg: "#0d1117",
    fg: "#c9d1d9",
    muted: "#8b949e",
    border: "#30363d",
    chipBg: "#161b22",
    accent: "#58a6ff",
    title: "#58a6ff",
    icon: "#79c0ff",
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

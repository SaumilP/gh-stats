export function qString(q: any, key: string, def?: string): string | undefined {
  const v = q?.[key];
  if (v === undefined || v === null) return def;
  return Array.isArray(v) ? String(v[0]) : String(v);
}

export function qStringList(q: any, key: string): string[] {
  const raw = qString(q, key);
  if (!raw) return [];
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function qInt(q: any, key: string, def: number, min: number, max: number): number {
  const raw = qString(q, key);
  const n = raw ? Number.parseInt(raw, 10) : def;
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}

export function qFloat(q: any, key: string, def: number, min: number, max: number): number {
  const raw = qString(q, key);
  const n = raw ? Number.parseFloat(raw) : def;
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}

export function qBool(q: any, key: string, def = false): boolean {
  const raw = qString(q, key);
  if (raw === undefined) return def;
  const s = String(raw).toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

export type ThemeName = string;

export type ThemeOptions = {
  theme: ThemeName;
  titleColor?: string;
  textColor?: string;
  iconColor?: string;
  borderColor?: string;
  bgColor?: string;
  hideBorder?: boolean;
  borderRadius?: number;
};

export function qTheme(q: any): ThemeName {
  const t = (qString(q, "theme", "dark") || "dark").toLowerCase();
  return t;
}

export function qThemeOptions(q: any): ThemeOptions {
  return {
    theme: qTheme(q),
    titleColor: qString(q, "title_color"),
    textColor: qString(q, "text_color"),
    iconColor: qString(q, "icon_color"),
    borderColor: qString(q, "border_color"),
    bgColor: qString(q, "bg_color"),
    hideBorder: qBool(q, "hide_border", false),
    borderRadius: qInt(q, "border_radius", 14, 0, 40),
  };
}

export function qFormat(q: any): "svg" | "json" {
  const f = (qString(q, "format", "svg") || "svg").toLowerCase();
  return (f === "json" ? "json" : "svg");
}

export function qCacheSeconds(q: any, def: number): number {
  // Cost-control knob; clamp 5m..24h.
  const raw = qString(q, "cacheSeconds") ?? qString(q, "cache_seconds");
  const v = raw ? qInt({ cacheSeconds: raw }, "cacheSeconds", def, 300, 86400) : def;
  return v;
}

export function qCompact(q: any): boolean {
  return qBool(q, "compact", false);
}

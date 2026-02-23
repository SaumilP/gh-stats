export function qString(q: any, key: string, def?: string): string | undefined {
  const v = q?.[key];
  if (v === undefined || v === null) return def;
  return Array.isArray(v) ? String(v[0]) : String(v);
}

export function qInt(q: any, key: string, def: number, min: number, max: number): number {
  const raw = qString(q, key);
  const n = raw ? Number.parseInt(raw, 10) : def;
  if (!Number.isFinite(n)) return def;
  return Math.max(min, Math.min(max, n));
}

export function qBool(q: any, key: string, def = false): boolean {
  const raw = qString(q, key);
  if (raw === undefined) return def;
  const s = String(raw).toLowerCase();
  return s === "1" || s === "true" || s === "yes" || s === "on";
}

export type Theme = "dark" | "light";

export function qTheme(q: any): Theme {
  const t = (qString(q, "theme", "dark") || "dark").toLowerCase();
  return (t === "light" ? "light" : "dark");
}

export function qFormat(q: any): "svg" | "json" {
  const f = (qString(q, "format", "svg") || "svg").toLowerCase();
  return (f === "json" ? "json" : "svg");
}

export function qCacheSeconds(q: any, def: number): number {
  // Cost-control knob; clamp 5m..24h.
  const v = qInt(q, "cacheSeconds", def, 300, 86400);
  return v;
}

export function qCompact(q: any): boolean {
  return qBool(q, "compact", false);
}

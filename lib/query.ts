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

export type Theme = "dark" | "light";

export function qTheme(q: any): Theme {
  const t = (qString(q, "theme", "dark") || "dark").toLowerCase();
  return (t === "light" ? "light" : "dark");
}

export function qFormat(q: any): "svg" | "json" {
  const f = (qString(q, "format", "svg") || "svg").toLowerCase();
  return (f === "json" ? "json" : "svg");
}

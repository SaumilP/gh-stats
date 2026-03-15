export type NumberFormat = "short" | "long";

function trimZeros(s: string) {
  if (!s.includes(".")) return s;
  return s.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

export function formatNumber(
  value: number,
  opts: { format?: NumberFormat; precision?: number; locale?: string } = {},
) {
  if (!Number.isFinite(value)) return "0";
  const format = opts.format || "short";
  const precision = Math.max(0, Math.min(4, Math.floor(opts.precision ?? 1)));
  const locale = opts.locale || "en";

  if (format === "long") {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: precision }).format(value);
  }

  const abs = Math.abs(value);
  if (abs >= 1e9) return trimZeros((value / 1e9).toFixed(precision)) + "B";
  if (abs >= 1e6) return trimZeros((value / 1e6).toFixed(precision)) + "M";
  if (abs >= 1e3) return trimZeros((value / 1e3).toFixed(precision)) + "K";
  return new Intl.NumberFormat(locale, { maximumFractionDigits: precision }).format(value);
}

export function formatBytes(value: number, locale = "en") {
  if (!Number.isFinite(value)) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let n = Math.max(0, value);
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i++;
  }
  const formatted = new Intl.NumberFormat(locale, { maximumFractionDigits: n >= 10 ? 0 : 1 }).format(n);
  return `${formatted} ${units[i]}`;
}

export function formatPercent(value: number, total: number, precision = 0) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const p = Math.max(0, Math.min(4, Math.floor(precision)));
  return `${pct.toFixed(p)}%`;
}

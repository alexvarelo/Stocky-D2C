export const DASH = "—";

export function fmtMoney(v: number | null | undefined, currency = "USD", compact = false): string {
  if (v == null || !Number.isFinite(v)) return DASH;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      notation: compact ? "compact" : "standard",
    }).format(v);
  } catch {
    return `${v.toFixed(0)} ${currency}`;
  }
}

/** Decimal fraction to percent text, e.g. 0.1234 -> "12.3%". */
export function fmtPct(v: number | null | undefined, digits = 1, signed = false): string {
  if (v == null || !Number.isFinite(v)) return DASH;
  const s = (v * 100).toFixed(digits);
  return signed && v > 0 ? `+${s}%` : `${s}%`;
}

export function fmtNum(v: number | null | undefined, digits = 2): string {
  return v == null || !Number.isFinite(v) ? DASH : v.toFixed(digits);
}

export function toneClass(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v) || v === 0) return "";
  return v > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400";
}

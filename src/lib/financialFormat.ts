import type { HealthMetric } from "@/api/financialDataApi.schemas";

/** Compact number with currency code, e.g. "USD 1.2B". Null/undefined/NaN -> "—". */
export function formatCompact(value: number | null | undefined, currency?: string | null): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  const abs = Math.abs(value);
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  let text = abs.toFixed(abs < 100 ? 2 : 0);
  for (const [limit, suffix] of units) {
    if (abs >= limit) {
      text = `${(abs / limit).toFixed(abs / limit < 100 ? 2 : 1)}${suffix}`;
      break;
    }
  }
  const sign = value < 0 ? "-" : "";
  return `${sign}${currency ? `${currency} ` : ""}${text}`;
}

/** Decimal ratio (0.42) -> "42.0%". */
export function formatDecimalPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(1)}%`;
}

/** Format a health metric value by unit. */
export function formatHealthValue(metric: Pick<HealthMetric, "value" | "unit">): string {
  const { value, unit } = metric;
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  switch (unit) {
    case "months":
      return `${value.toFixed(1)} mo`;
    case "x":
    case "ratio":
      return `${value.toFixed(2)}×`;
    case "percent":
      return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
    case "score":
      return `${Math.round(value)}/9`;
    default:
      return String(value);
  }
}

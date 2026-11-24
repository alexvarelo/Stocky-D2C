import type { PortfolioRiskResponse } from "@/api/financialDataApi.schemas";

export const NO_DATA = "—";
export const NO_DATA_HINT = "Not enough history";

export const fmtPct = (v: number | null | undefined): string =>
  v == null || !Number.isFinite(v) ? NO_DATA : `${(v * 100).toFixed(1)}%`;

export const fmtNum = (v: number | null | undefined): string =>
  v == null || !Number.isFinite(v) ? NO_DATA : v.toFixed(2);

/** Neutral, purely descriptive one-liners. */
export function describeBeta(v: number | null | undefined): string | null {
  if (v == null) return null;
  if (Math.abs(v - 1) < 0.1) return "Has moved roughly in line with the market";
  if (v < 0) return "Has tended to move opposite to the market";
  if (v < 1) return `Has moved ~${v.toFixed(1)}× the market, less than the index`;
  return `Has moved ~${v.toFixed(1)}× the market, more than the index`;
}

export function describeVolatility(v: number | null | undefined): string | null {
  if (v == null) return null;
  return `Typical yearly swing of about ±${(v * 100).toFixed(0)}%`;
}

export function describeDrawdown(v: number | null | undefined): string | null {
  if (v == null) return null;
  return `Largest peak-to-trough fall was ${(Math.abs(v) * 100).toFixed(0)}%`;
}

export function describeSharpe(v: number | null | undefined): string | null {
  if (v == null) return null;
  return `Return per unit of volatility: ${v.toFixed(2)}`;
}

export function describeReturn(v: number | null | undefined): string | null {
  if (v == null) return null;
  return v >= 0 ? "Annualised gain over the period" : "Annualised loss over the period";
}

export function describeConcentration(r: PortfolioRiskResponse): string | null {
  if (r.effective_positions == null) return null;
  return `Behaves like ~${r.effective_positions.toFixed(1)} equally weighted positions`;
}

export const PERIOD_OPTIONS = [
  { value: "6mo", label: "6M", long: "6 months" },
  { value: "1y", label: "1Y", long: "year" },
  { value: "3y", label: "3Y", long: "3 years" },
  { value: "5y", label: "5Y", long: "5 years" },
] as const;

/** Diverging colour for a correlation in [-1, 1] (HSL; works in light and dark). */
export function correlationColor(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "hsl(var(--muted))";
  const c = Math.max(-1, Math.min(1, v));
  const hue = c >= 0 ? 217 : 25; // blue positive, orange negative
  const alpha = 0.1 + Math.abs(c) * 0.8;
  return `hsl(${hue} 85% 55% / ${alpha.toFixed(2)})`;
}

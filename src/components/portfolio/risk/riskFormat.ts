import type { PortfolioRiskResponse } from "@/api/financialDataApi.schemas";
import i18n from "@/i18n";
import { formatDecimal } from "@/lib/formatters";

const tr = (key: string, options?: Record<string, unknown>) => i18n.t(key, { ns: "risk", ...options });

export const NO_DATA = "—";
/** Read at render time so it follows the UI language. */
export const getNoDataHint = () => tr("noDataHint");

export const fmtPct = (v: number | null | undefined): string =>
  v == null || !Number.isFinite(v) ? NO_DATA : `${formatDecimal(v * 100, 1)}%`;

export const fmtNum = (v: number | null | undefined): string =>
  v == null || !Number.isFinite(v) ? NO_DATA : formatDecimal(v, 2);

/** Neutral, purely descriptive one-liners. */
export function describeBeta(v: number | null | undefined): string | null {
  if (v == null) return null;
  if (Math.abs(v - 1) < 0.1) return tr("describe.betaInLine");
  if (v < 0) return tr("describe.betaOpposite");
  return tr(v < 1 ? "describe.betaLess" : "describe.betaMore", { beta: formatDecimal(v, 1) });
}

export function describeVolatility(v: number | null | undefined): string | null {
  if (v == null) return null;
  return tr("describe.volatility", { pct: formatDecimal(v * 100, 0) });
}

export function describeDrawdown(v: number | null | undefined): string | null {
  if (v == null) return null;
  return tr("describe.drawdown", { pct: formatDecimal(Math.abs(v) * 100, 0) });
}

export function describeSharpe(v: number | null | undefined): string | null {
  if (v == null) return null;
  return tr("describe.sharpe", { value: formatDecimal(v, 2) });
}

export function describeReturn(v: number | null | undefined): string | null {
  if (v == null) return null;
  return tr(v >= 0 ? "describe.returnGain" : "describe.returnLoss");
}

export function describeConcentration(r: PortfolioRiskResponse): string | null {
  if (r.effective_positions == null) return null;
  return tr("describe.concentration", { count: formatDecimal(r.effective_positions, 1) });
}

/** `label` and `long` are keys in the risk namespace (periods.*). */
export const PERIOD_OPTIONS = [
  { value: "6mo", label: "6M", long: "6mo" },
  { value: "1y", label: "1Y", long: "1y" },
  { value: "3y", label: "3Y", long: "3y" },
  { value: "5y", label: "5Y", long: "5y" },
] as const;

export const periodLabel = (value: string) => tr(`periods.short.${value}`);
export const periodLong = (value: string) => tr(`periods.long.${value}`);

/** Diverging colour for a correlation in [-1, 1] (HSL; works in light and dark). */
export function correlationColor(v: number | null): string {
  if (v == null || !Number.isFinite(v)) return "hsl(var(--muted))";
  const c = Math.max(-1, Math.min(1, v));
  const hue = c >= 0 ? 217 : 25; // blue positive, orange negative
  const alpha = 0.1 + Math.abs(c) * 0.8;
  return `hsl(${hue} 85% 55% / ${alpha.toFixed(2)})`;
}

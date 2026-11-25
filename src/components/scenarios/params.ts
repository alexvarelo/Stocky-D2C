import { MonteCarloRequestLookback } from "@/api/financialDataApi.schemas";
import { MAX_AMOUNT } from "./format";

/** Validators for params blobs loaded from the database; anything ill-typed falls back to a safe default. */
export function loadHorizon(v: unknown, fallback = 3): number {
  return typeof v === "number" && Number.isFinite(v) ? Math.min(5, Math.max(1, Math.round(v))) : fallback;
}

export function loadLookback(v: unknown): MonteCarloRequestLookback {
  return v === "3y" || v === "5y" || v === "10y" ? (v as MonteCarloRequestLookback) : MonteCarloRequestLookback["5y"];
}

/** Returns the amount as text, or `fallback` when the stored value is not a sensible number. */
export function loadAmount(v: unknown, fallback = "0"): string {
  return typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= MAX_AMOUNT ? String(v) : fallback;
}

export const isAmount = (s: string): boolean => {
  const n = Number(s);
  return s.trim() !== "" && Number.isFinite(n) && n >= 0 && n <= MAX_AMOUNT;
};

/** Saved rows: only keep objects with a string ticker and a positive finite quantity. */
export function loadTradeRows(v: unknown): { ticker: string; quantity: string }[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((r): r is { ticker: string; quantity: number } => !!r && typeof r === "object" && typeof (r as { ticker?: unknown }).ticker === "string")
    .map((r) => ({
      ticker: r.ticker.trim().toUpperCase(),
      quantity: typeof r.quantity === "number" && Number.isFinite(r.quantity) && r.quantity > 0 ? String(r.quantity) : "",
    }));
}

import type { PortfolioHolding } from "@/api/portfolio/portfolio";

export const MAX_POSITIONS = 50;

/** Same pattern the analytics API validates; one bad symbol would otherwise reject the whole request. */
export const VALID_TICKER = /^[A-Za-z0-9.^=-]{1,20}$/;

export function invalidTickers(holdings: PortfolioHolding[]) {
  const out = new Set<string>();
  for (const h of holdings) {
    const ticker = h.ticker?.trim().toUpperCase();
    if (ticker && h.quantity > 0 && !VALID_TICKER.test(ticker)) out.add(ticker);
  }
  return [...out].sort();
}

/** Aggregate holdings by ticker; drop zero/negative quantities and unsupported symbols; cap at 50 largest. */
export function toPositions(holdings: PortfolioHolding[]) {
  const byTicker = new Map<string, { quantity: number; value: number }>();
  for (const h of holdings) {
    const ticker = h.ticker?.trim().toUpperCase();
    if (!ticker || !(h.quantity > 0) || !VALID_TICKER.test(ticker)) continue;
    const prev = byTicker.get(ticker) ?? { quantity: 0, value: 0 };
    prev.quantity += h.quantity;
    prev.value += (h.current_price ?? 0) * h.quantity;
    byTicker.set(ticker, prev);
  }
  return [...byTicker.entries()]
    .sort((a, b) => b[1].value - a[1].value || a[0].localeCompare(b[0]))
    .slice(0, MAX_POSITIONS)
    .map(([ticker, v]) => ({ ticker, quantity: v.quantity }))
    .sort((a, b) => a.ticker.localeCompare(b.ticker));
}

export type Position = ReturnType<typeof toPositions>[number];

/** Normalise a portfolio currency into a 3-letter base currency, defaulting to USD. */
export function toBaseCurrency(currency?: string) {
  return currency && currency.length === 3 ? currency.toUpperCase() : "USD";
}

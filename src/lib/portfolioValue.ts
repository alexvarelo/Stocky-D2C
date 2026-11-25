// Values a holding in its portfolio's base currency.
//
// Prices and average costs stay in the currency each stock is quoted in (IAG.VI in EUR,
// 300983.SZ in CNY). Use these helpers when adding holdings together or comparing their
// sizes. They multiply by the FX rate usePortfolio attaches to each holding, and that
// rate is 1 when the stock is already in the base currency.

export interface ValuedHolding {
  quantity: number;
  current_price?: number;
  total_invested?: number;
  fx_rate?: number;
}

export function fxRateOf(h: Pick<ValuedHolding, "fx_rate">): number {
  return h.fx_rate && h.fx_rate > 0 ? h.fx_rate : 1;
}

/** Market value in the portfolio's base currency. */
export function holdingMarketValue(h: ValuedHolding): number {
  return (h.current_price || 0) * h.quantity * fxRateOf(h);
}

/** Amount invested, in the portfolio's base currency. */
export function holdingCostBasis(h: ValuedHolding): number {
  return (h.total_invested || 0) * fxRateOf(h);
}

/** London listings are quoted in pence ("GBp"/"GBX"); returns the price in pounds. */
export function normalisePence(price: number, currency?: string | null): { price: number; currency?: string } {
  if (currency === "GBp" || currency === "GBX") return { price: price / 100, currency: "GBP" };
  return { price, currency: currency ?? undefined };
}

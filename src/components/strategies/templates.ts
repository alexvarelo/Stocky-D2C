import type { StrategyKind } from "@/hooks/useSavedStrategies";
import { CURRENCIES } from "@/components/scenarios/format";
import { VALID_TICKER } from "@/lib/portfolioPositions";

export interface StrategyTemplate {
  id: StrategyKind;
  name: string;
  description: string;
  singleTicker: boolean;
}

export const TEMPLATES: StrategyTemplate[] = [
  {
    id: "dca",
    name: "Dollar-cost averaging",
    description: "Invests a fixed amount on the first trading day of each month, whatever the price.",
    singleTicker: false,
  },
  {
    id: "rebalance",
    name: "Periodic rebalance",
    description: "Starts with your target weights and periodically brings the mix back to them.",
    singleTicker: false,
  },
  {
    id: "rsi",
    name: "RSI 30/70",
    description: "Holds a single asset only after its RSI falls below the buy level, and exits when it rises above the sell level.",
    singleTicker: true,
  },
  {
    id: "ma_cross",
    name: "Moving-average cross 50/200",
    description: "Holds a single asset while its fast moving average is above the slow one.",
    singleTicker: true,
  },
];

export interface FormState {
  strategy: StrategyKind;
  tickers: { ticker: string; weight: string }[];
  start_date: string;
  end_date: string;
  base_currency: string;
  initial_capital: string;
  monthly_amount: string;
  rebalance_frequency: "monthly" | "quarterly" | "yearly";
  fast: string;
  slow: string;
  rsi_buy: string;
  rsi_sell: string;
  fee_bps: string;
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function defaultForm(): FormState {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 5);
  return {
    strategy: "dca",
    tickers: [{ ticker: "SPY", weight: "100" }],
    start_date: iso(start),
    end_date: iso(end),
    base_currency: "USD",
    initial_capital: "10000",
    monthly_amount: "500",
    rebalance_frequency: "quarterly",
    fast: "50",
    slow: "200",
    rsi_buy: "30",
    rsi_sell: "70",
    fee_bps: "5",
  };
}

const FREQUENCIES = ["monthly", "quarterly", "yearly"] as const;

/** Merge a saved params blob over defaults, ignoring unknown/ill-typed values. */
export function formFromSaved(strategy: StrategyKind, saved: Record<string, unknown>): FormState {
  const base = { ...defaultForm(), strategy };
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(base)) {
    if (k === "tickers" || k === "strategy") continue;
    const v = saved[k];
    if (typeof v === "string" || (typeof v === "number" && Number.isFinite(v))) out[k] = String(v);
  }
  if (!(FREQUENCIES as readonly string[]).includes(out.rebalance_frequency as string)) out.rebalance_frequency = base.rebalance_frequency;
  if (!(CURRENCIES as readonly string[]).includes(out.base_currency as string)) out.base_currency = base.base_currency;
  const single = TEMPLATES.find((t) => t.id === strategy)?.singleTicker ?? false;
  if (Array.isArray(saved.tickers)) {
    const rows = (saved.tickers as { ticker?: unknown; weight?: unknown }[])
      .filter((t) => typeof t?.ticker === "string" && VALID_TICKER.test(t.ticker.trim()))
      .map((t) => ({ ticker: String(t.ticker).trim().toUpperCase(), weight: String(t.weight ?? 1) }));
    const limited = rows.slice(0, single ? 1 : 15).map((r) => (single ? { ...r, weight: "100" } : r));
    if (limited.length) out.tickers = limited;
  }
  out.strategy = strategy;
  return out as unknown as FormState;
}

import type { StrategyKind } from "@/hooks/useSavedStrategies";

export interface StrategyTemplate {
  id: StrategyKind;
  name: string;
  description: string;
  singleTicker: boolean;
  glossary?: string;
}

export const TEMPLATES: StrategyTemplate[] = [
  {
    id: "dca",
    name: "Dollar-cost averaging",
    description: "Invests a fixed amount on the first trading day of each month, whatever the price.",
    singleTicker: false,
    glossary: "dollar-cost-averaging",
  },
  {
    id: "rebalance",
    name: "Periodic rebalance",
    description: "Starts with your target weights and periodically brings the mix back to them.",
    singleTicker: false,
    glossary: "rebalancing",
  },
  {
    id: "rsi",
    name: "RSI 30/70",
    description: "Holds a single asset only after its RSI falls below the buy level, and exits when it rises above the sell level.",
    singleTicker: true,
    glossary: "rsi",
  },
  {
    id: "ma_cross",
    name: "Moving-average cross 50/200",
    description: "Holds a single asset while its fast moving average is above the slow one.",
    singleTicker: true,
    glossary: "ma-crossover",
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

/** Merge a saved params blob over defaults, ignoring unknown/ill-typed values. */
export function formFromSaved(strategy: StrategyKind, saved: Record<string, unknown>): FormState {
  const base = { ...defaultForm(), strategy };
  const out: Record<string, unknown> = { ...base };
  for (const k of Object.keys(base)) {
    if (k === "tickers") continue;
    const v = saved[k];
    if (typeof v === "string" || typeof v === "number") out[k] = String(v);
  }
  if (Array.isArray(saved.tickers)) {
    out.tickers = (saved.tickers as { ticker?: unknown; weight?: unknown }[])
      .filter((t) => typeof t?.ticker === "string")
      .map((t) => ({ ticker: String(t.ticker), weight: String(t.weight ?? 1) }));
  }
  out.strategy = strategy;
  return out as unknown as FormState;
}

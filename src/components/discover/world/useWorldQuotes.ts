import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { PriceData } from "@/api/financialDataApi.schemas";
import { getMultipleStockPricesApiV1StockTickersPricesGet } from "@/api/stock/stock";
import { WORLD_COMPANIES, type RegionId, type WorldCompany } from "./companies";

export interface WorldQuote extends WorldCompany {
  price: number | null;
  changePercent: number | null;
  change: number | null;
  currency: string;
  marketCap: number | null;
  dayHigh: number | null;
  dayLow: number | null;
}

const REGION_IDS: Exclude<RegionId, "all">[] = ["americas", "europe", "asia"];

const num = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

/**
 * Live quotes for every company on the globe. One request per region so a
 * slow exchange doesn't hold back the rest, refreshed every minute.
 */
export function useWorldQuotes() {
  const results = useQueries({
    queries: REGION_IDS.map((region) => {
      const tickers = WORLD_COMPANIES.filter((c) => c.region === region)
        .map((c) => c.symbol)
        .join(",");
      return {
        queryKey: ["discover-world-quotes", region, tickers],
        queryFn: ({ signal }: { signal?: AbortSignal }) =>
          getMultipleStockPricesApiV1StockTickersPricesGet(tickers, signal).then((r) => r.data),
        staleTime: 60_000,
        refetchInterval: 60_000,
        refetchOnMount: true,
      };
    }),
  });

  const loadedKey = results.map((r) => r.dataUpdatedAt).join("-");

  const quotes = useMemo<WorldQuote[]>(() => {
    const bySymbol = new Map<string, PriceData>();
    results.forEach((r) => {
      (r.data ?? []).forEach((row) => {
        if (row?.symbol) bySymbol.set(row.symbol.toUpperCase(), row);
      });
    });

    return WORLD_COMPANIES.map((company) => {
      const row = bySymbol.get(company.symbol.toUpperCase());
      const price = num(row?.current_price);
      const previous = num(row?.previous_close);
      let changePercent = num(row?.change_percent);
      if (changePercent === null && price !== null && previous) {
        changePercent = ((price - previous) / previous) * 100;
      }
      return {
        ...company,
        price,
        changePercent,
        change: num(row?.change) ?? (price !== null && previous !== null ? price - previous : null),
        currency: (row?.currency as string) || "USD",
        marketCap: num(row?.market_cap),
        dayHigh: num(row?.high),
        dayLow: num(row?.low),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedKey]);

  return {
    quotes,
    isLoading: results.every((r) => r.isLoading),
    isError: results.every((r) => r.isError),
    updatedAt: Math.max(0, ...results.map((r) => r.dataUpdatedAt)),
  };
}

// Some exchanges quote in a minor unit (London in pence). Show the major one.
const MINOR_UNITS: Record<string, { code: string; divisor: number }> = {
  GBp: { code: "GBP", divisor: 100 },
  GBX: { code: "GBP", divisor: 100 },
  ZAc: { code: "ZAR", divisor: 100 },
  ILA: { code: "ILS", divisor: 100 },
};

export function formatMoney(value: number | null | undefined, currency = "USD"): string {
  if (value === null || value === undefined) return "—";
  const minor = MINOR_UNITS[currency];
  const amount = minor ? value / minor.divisor : value;
  const code = minor ? minor.code : currency;
  const digits = Math.abs(amount) >= 10_000 ? 0 : 2;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: code,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `${amount.toFixed(digits)} ${code}`;
  }
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(2)}%`;
}

export function formatMarketCap(value: number | null | undefined, currency = "USD"): string {
  if (!value) return "—";
  const minor = MINOR_UNITS[currency];
  const code = minor ? minor.code : currency;
  const units: [number, string][] = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
  ];
  for (const [size, suffix] of units) {
    if (value >= size) return `${(value / size).toFixed(value / size >= 100 ? 0 : 2)}${suffix} ${code}`;
  }
  return `${Math.round(value).toLocaleString("en-US")} ${code}`;
}

/** Semantic colours from the design system, as raw values for canvas/SVG. */
export const UP_COLOR = "#00a87e";
export const DOWN_COLOR = "#e23b4a";
export const FLAT_COLOR = "#8d969e";

export const moveColor = (changePercent: number | null | undefined) =>
  changePercent === null || changePercent === undefined || Math.abs(changePercent) < 0.005
    ? FLAT_COLOR
    : changePercent > 0
      ? UP_COLOR
      : DOWN_COLOR;

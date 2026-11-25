import { useState } from "react";
import { useCompareApiV1CompareGet } from "@/api/analysis/analysis";
import { useGetStockPriceApiV1StockTickerPriceGet } from "@/api/stock/stock";
import type { CompareResponse, CompareRow, PriceData } from "@/api/financialDataApi.schemas";
import { Term } from "@/components/glossary/Term";
import { StockSearch } from "@/components/stock/StockSearch";
import { ExplainThis } from "@/components/explain/ExplainThis";
import { formatCompact, formatDecimalPercent } from "@/lib/financialFormat";
import { Reading, WidgetError, WidgetLoading, fmtNum, type WidgetProps } from "./shared";

function usePrice(ticker: string) {
  const q = useGetStockPriceApiV1StockTickerPriceGet(ticker, { query: { staleTime: 5 * 60 * 1000, retry: 1 } });
  return { ...q, price: q.data?.data as PriceData | undefined };
}

/** Price, market capitalisation and the share count they imply. */
export function PriceSnapshotWidget({ ticker }: WidgetProps) {
  const { price: p, isLoading, isError } = usePrice(ticker);
  if (isLoading) return <WidgetLoading />;
  if (isError || !p || p.current_price == null) return <WidgetError />;
  const cap = p.market_cap;
  const shares = cap && p.current_price ? cap / p.current_price : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Reading label="Price per share" value={fmtNum(p.current_price)} note={p.currency ?? undefined} />
        <Reading label={<Term id="market-cap">Market cap</Term>} value={formatCompact(cap, p.currency)} />
        <Reading
          label="Shares outstanding (implied)"
          value={shares == null ? "N/A" : formatCompact(shares)}
          note="Market cap divided by price"
        />
      </div>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {ticker} is worth about {formatCompact(cap, p.currency)} in total: the share price multiplied by the number of shares. Each share is one small slice of that.
        </p>
        <ExplainThis context={{ label: "price and market capitalisation", noun: "metric", ticker, value: `price ${fmtNum(p.current_price)}, market cap ${formatCompact(cap, p.currency)}` }} />
      </div>
    </div>
  );
}

/**
 * Price and dividend yield. The API passes through the provider's yield, which is quoted in percent
 * (for example 0.5 means 0.5%).
 */
export function DividendYieldWidget({ ticker }: WidgetProps) {
  const { price: p, isLoading, isError } = usePrice(ticker);
  if (isLoading) return <WidgetLoading />;
  if (isError || !p || p.current_price == null) return <WidgetError />;
  const y = p.dividend_yield;
  const hasYield = y != null && y > 0;
  const perShare = hasYield ? (p.current_price * y) / 100 : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Reading label="Price per share" value={fmtNum(p.current_price)} note={p.currency ?? undefined} />
        <Reading label={<Term id="dividend-yield">Dividend yield</Term>} value={hasYield ? `${y.toFixed(2)}%` : "None reported"} />
        <Reading
          label="Implied yearly dividend per share"
          value={perShare == null ? "N/A" : perShare.toFixed(2)}
          note={perShare == null ? undefined : "Price multiplied by the yield"}
        />
      </div>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {hasYield
            ? `Holding ${ticker} for a year would have paid roughly ${y.toFixed(2)}% of today's price in dividends if the payout stays the same. Dividends can be cut or stopped.`
            : `${ticker} reports no dividend yield. Many companies pay no dividend and reinvest profits instead. Try a different ticker.`}
        </p>
        <ExplainThis context={{ label: "dividend yield", noun: "metric", ticker, value: hasYield ? `${y.toFixed(2)}%` : "none reported" }} />
      </div>
    </div>
  );
}

const fmtX = (v: number | null | undefined) => (v == null || Number.isNaN(v) ? "N/A" : `${v.toFixed(1)}x`);

function CompareColumn({ row }: { row?: CompareRow }) {
  if (!row) return <WidgetError message="No data for this ticker." />;
  return (
    <div className="grid min-w-0 grid-cols-2 gap-2">
      <Reading label={<Term id="pe-ratio">P/E</Term>} value={fmtX(row.valuation.pe)} />
      <Reading label={<Term id="price-to-sales">Price / sales</Term>} value={fmtX(row.valuation.price_to_sales)} />
      <Reading label={<Term id="revenue-growth">Revenue growth</Term>} value={formatDecimalPercent(row.growth.revenue_growth_yoy)} note="Year on year" />
      <Reading label="Earnings growth" value={formatDecimalPercent(row.growth.earnings_growth_yoy)} note="Year on year" />
    </div>
  );
}

/** Two tickers side by side: valuation multiples and growth, the two axes of the growth-versus-value discussion. */
export function ValueGrowthCompareWidget({ ticker }: WidgetProps) {
  const [other, setOther] = useState("KO");
  const same = other.toUpperCase() === ticker.toUpperCase();
  const tickers = `${ticker.toUpperCase()},${other.toUpperCase()}`;
  const { data, isLoading, isError } = useCompareApiV1CompareGet(
    { tickers },
    { query: { enabled: !same, staleTime: 15 * 60 * 1000, retry: 1 } },
  );
  const rows = (data?.data as CompareResponse | undefined)?.rows ?? [];
  const a = rows.find((r) => r.ticker.toUpperCase() === ticker.toUpperCase());
  const b = rows.find((r) => r.ticker.toUpperCase() === other.toUpperCase());
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">
          Compare {ticker} with: <span className="font-medium text-foreground">{other}</span>
        </p>
        <StockSearch onSelect={(s) => setOther(s.symbol.toUpperCase())} placeholder="Pick a second ticker" />
      </div>
      {same ? (
        <WidgetError message="Pick a different second ticker." />
      ) : isLoading ? (
        <WidgetLoading />
      ) : isError || rows.length === 0 ? (
        <WidgetError message="Comparison data is not available for these tickers." />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm font-medium">{ticker}</p>
              <CompareColumn row={a} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{other}</p>
              <CompareColumn row={b} />
            </div>
          </div>
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              A higher multiple alongside faster growth is the typical "growth" profile; lower multiples with slower growth the typical "value" profile. Labels like these are simplifications, and neither profile is better by itself.
            </p>
            <ExplainThis context={{ label: `valuation and growth comparison of ${ticker} and ${other}`, noun: "comparison" }} />
          </div>
        </div>
      )}
    </div>
  );
}

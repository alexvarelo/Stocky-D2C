import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { StockSearch } from "@/components/stock/StockSearch";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { useCompareApiV1CompareGet } from "@/api/analysis/analysis";
import type { CompareRow } from "@/api/financialDataApi.schemas";
import { cn } from "@/lib/utils";

const MIN_TICKERS = 2;
const MAX_TICKERS = 6;

const NA = "N/A";
const fmtPct = (v?: number | null) => (v == null ? NA : `${(v * 100).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`);
const fmtMult = (v?: number | null) => (v == null ? NA : `${v.toLocaleString(undefined, { maximumFractionDigits: 1 })}×`);
const fmtPlain = (v?: number | null) => (v == null ? NA : v.toLocaleString(undefined, { maximumFractionDigits: 2 }));
const fmtMoney = (v?: number | null, currency?: string | null) =>
  v == null ? NA : `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}${currency ? ` ${currency}` : ""}`;
const fmtCap = (v?: number | null, currency?: string | null) =>
  v == null
    ? NA
    : `${new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 2 }).format(v)}${currency ? ` ${currency}` : ""}`;

interface MetricRow {
  label: string;
  termId?: string;
  get: (_r: CompareRow, _base?: string) => number | null | undefined;
  format: (_v: number | null | undefined, _r: CompareRow, _base?: string) => string;
  /** "high" = higher is unambiguously better. Omitted = neutral, no colouring. */
  better?: "high";
}

interface Group {
  title: string;
  rows: MetricRow[];
}

const GROUPS: Group[] = [
  {
    title: "Price & size",
    rows: [
      { label: "Price", get: (r) => r.price, format: (v, r) => fmtMoney(v, r.currency) },
      { label: "Market cap", termId: "market-cap", get: (r) => r.market_cap, format: (v, r) => fmtCap(v, r.currency) },
      { label: "Market cap (base currency)", termId: "market-cap", get: (r) => r.market_cap_usd, format: (v, _r, base) => fmtCap(v, base ?? "USD") },
    ],
  },
  {
    title: "Valuation",
    rows: [
      { label: "P/E", termId: "pe-ratio", get: (r) => r.valuation.pe, format: (v) => fmtMult(v) },
      { label: "Forward P/E", termId: "pe-ratio", get: (r) => r.valuation.forward_pe, format: (v) => fmtMult(v) },
      { label: "PEG", termId: "peg-ratio", get: (r) => r.valuation.peg, format: (v) => fmtPlain(v) },
      { label: "EV/EBITDA", termId: "ev-ebitda", get: (r) => r.valuation.ev_ebitda, format: (v) => fmtMult(v) },
      { label: "Price/Sales", termId: "price-to-sales", get: (r) => r.valuation.price_to_sales, format: (v) => fmtMult(v) },
      { label: "Price/Book", termId: "price-to-book", get: (r) => r.valuation.price_to_book, format: (v) => fmtMult(v) },
    ],
  },
  {
    title: "Growth",
    rows: [
      { label: "Revenue growth (YoY)", termId: "revenue-growth", get: (r) => r.growth.revenue_growth_yoy, format: (v) => fmtPct(v), better: "high" },
      { label: "Earnings growth (YoY)", get: (r) => r.growth.earnings_growth_yoy, format: (v) => fmtPct(v), better: "high" },
    ],
  },
  {
    title: "Margins",
    rows: [
      { label: "Gross margin", termId: "gross-margin", get: (r) => r.margins.gross, format: (v) => fmtPct(v), better: "high" },
      { label: "Operating margin", termId: "operating-margin", get: (r) => r.margins.operating, format: (v) => fmtPct(v), better: "high" },
      { label: "Net margin", termId: "net-margin", get: (r) => r.margins.net, format: (v) => fmtPct(v), better: "high" },
    ],
  },
  {
    title: "Health",
    rows: [
      { label: "Net debt/EBITDA", termId: "net-debt-ebitda", get: (r) => r.health.net_debt_to_ebitda, format: (v) => fmtMult(v) },
      { label: "Current ratio", termId: "current-ratio", get: (r) => r.health.current_ratio, format: (v) => fmtPlain(v) },
      { label: "Altman Z-score", termId: "altman-z-score", get: (r) => r.health.altman_z, format: (v) => fmtPlain(v) },
    ],
  },
  {
    title: "Returns",
    rows: [
      { label: "Return 1y", termId: "total-return", get: (r) => r.returns.r1y, format: (v) => fmtPct(v), better: "high" },
      { label: "Return 3y", termId: "total-return", get: (r) => r.returns.r3y, format: (v) => fmtPct(v), better: "high" },
      { label: "Return 5y", termId: "total-return", get: (r) => r.returns.r5y, format: (v) => fmtPct(v), better: "high" },
    ],
  },
];

function parseTickers(raw: string | null): string[] {
  const seen = new Set<string>();
  for (const t of (raw ?? "").split(",")) {
    const s = t.trim().toUpperCase();
    if (s) seen.add(s);
  }
  return [...seen].slice(0, MAX_TICKERS);
}

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tickers = useMemo(() => parseTickers(searchParams.get("tickers")), [searchParams]);

  const setTickers = (next: string[]) => {
    setSearchParams(next.length ? { tickers: next.join(",") } : {}, { replace: true });
  };

  const canQuery = tickers.length >= MIN_TICKERS;
  const { data: response, isLoading, error } = useCompareApiV1CompareGet(
    { tickers: tickers.join(",") },
    { query: { enabled: canQuery, staleTime: 60 * 60 * 1000 } },
  );
  const data = canQuery ? response?.data : undefined;
  const rows = data?.rows ?? [];
  const missing = data?.missing ?? [];

  const addTicker = (symbol: string) => {
    const s = symbol.toUpperCase();
    if (tickers.includes(s) || tickers.length >= MAX_TICKERS) return;
    setTickers([...tickers, s]);
  };

  const extremes = (m: MetricRow) => {
    if (m.better !== "high") return { best: null, worst: null };
    const vals = rows.map((r) => m.get(r)).filter((v): v is number => v != null);
    if (vals.length < 2) return { best: null, worst: null };
    const max = Math.max(...vals);
    const min = Math.min(...vals);
    return max === min ? { best: null, worst: null } : { best: max, worst: min };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Compare</h1>
        <p className="text-sm text-muted-foreground">Compare {MIN_TICKERS} to {MAX_TICKERS} stocks side by side.</p>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex flex-wrap items-center gap-2" aria-label="Selected tickers">
            {tickers.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full border bg-accent/50 py-1 pl-3 pr-1 text-sm font-medium">
                <Link to={`/instrument/${t}`} className="hover:underline">{t}</Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  aria-label={`Remove ${t}`}
                  onClick={() => setTickers(tickers.filter((x) => x !== t))}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </span>
            ))}
          </div>
          {tickers.length < MAX_TICKERS ? (
            <StockSearch
              onSelect={(stock) => addTicker(stock.symbol)}
              placeholder="Add a ticker..."
              className="w-full sm:max-w-sm"
            />
          ) : (
            <p className="text-xs text-muted-foreground">Maximum of {MAX_TICKERS} tickers reached.</p>
          )}
          {!canQuery && (
            <p className="text-sm text-muted-foreground">Add at least {MIN_TICKERS} tickers to compare.</p>
          )}
        </CardContent>
      </Card>

      {canQuery && isLoading && <Skeleton className="h-96 w-full" />}

      {canQuery && !isLoading && (error || !data) && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison unavailable</CardTitle>
            <CardDescription>The comparison could not be loaded. Please try again later.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {missing.length > 0 && (
        <p role="status" className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          No data found for: {missing.join(", ")}.
        </p>
      )}

      {rows.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-max border-collapse text-sm">
                <thead>
                  <tr className="border-b">
                    <th scope="col" className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-medium text-muted-foreground">
                      <span className="sr-only">Metric</span>
                    </th>
                    {rows.map((r) => (
                      <th key={r.ticker} scope="col" className="min-w-[120px] px-3 py-2 text-right font-semibold">
                        <Link to={`/instrument/${r.ticker}`} className="hover:underline">{r.ticker}</Link>
                        {r.name && <div className="max-w-[140px] truncate text-xs font-normal text-muted-foreground">{r.name}</div>}
                      </th>
                    ))}
                  </tr>
                </thead>
                {GROUPS.map((g) => (
                  <tbody key={g.title}>
                    <tr className="bg-muted/40">
                      <th colSpan={rows.length + 1} scope="colgroup" className="sticky left-0 px-3 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {g.title}
                      </th>
                    </tr>
                    {g.rows.map((m) => {
                      const { best, worst } = extremes(m);
                      return (
                        <tr key={m.label} className="border-b last:border-0">
                          <th scope="row" className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-normal">
                            {m.termId ? <Term id={m.termId}>{m.label}</Term> : m.label}
                          </th>
                          {rows.map((r) => {
                            const v = m.get(r, data?.base_currency);
                            return (
                              <td
                                key={r.ticker}
                                className={cn(
                                  "px-3 py-2 text-right tabular-nums",
                                  v != null && v === best && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                                  v != null && v === worst && "bg-red-500/10 text-red-600 dark:text-red-400",
                                  v == null && "text-muted-foreground",
                                )}
                              >
                                {m.format(v, r, data?.base_currency)}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                ))}
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <EducationalDisclaimer />
    </div>
  );
}

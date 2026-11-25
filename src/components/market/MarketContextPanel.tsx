import { useId } from "react";
import { Gauge } from "lucide-react";
import { useMarketContextApiV1MarketContextGet } from "@/api/market/market";
import type { MarketIndicator } from "@/api/financialDataApi.schemas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { ExplainThis } from "@/components/explain/ExplainThis";
import { cn } from "@/lib/utils";

const TERM_BY_KEY: Record<string, string> = {
  vix: "vix",
  us10y: "treasury-10y",
  dxy: "us-dollar-index",
  sp500: "sp500",
};

/** One-line description per indicator. Used when the API does not send `description` yet. */
const DESCRIPTION_BY_KEY: Record<string, string> = {
  vix: "Volatility the options market expects for the S&P 500 over the next 30 days.",
  us10y: "Yield on 10-year US government bonds, a reference for borrowing costs.",
  dxy: "Value of the US dollar against a basket of major currencies.",
  sp500: "Index of 500 large US companies, a common gauge of the US stock market.",
};

/** Optional fields the API may add (additive); read safely so this works before and after regenerating the client. */
type IndicatorExtras = { description?: string | null; as_of?: string | null };

function indicatorDescription(ind: MarketIndicator): string | null {
  return (ind as MarketIndicator & IndicatorExtras).description ?? DESCRIPTION_BY_KEY[ind.key] ?? null;
}

export function formatIndicatorValue(ind: Pick<MarketIndicator, "value" | "unit">): string {
  if (ind.value == null || Number.isNaN(ind.value)) return "N/A";
  return ind.unit === "percent"
    ? `${ind.value.toFixed(2)}%`
    : ind.value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatChange(ind: MarketIndicator): string | null {
  const c = ind.change_1d;
  if (c == null || Number.isNaN(c)) return null;
  const sign = c > 0 ? "+" : "";
  return ind.unit === "percent" ? `${sign}${c.toFixed(2)} pp` : `${sign}${c.toFixed(2)}%`;
}

const fmtPctDist = (v: number | null | undefined) =>
  v == null ? "N/A" : `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;

export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 100;
  const h = 28;
  const pts = values
    .map((v, i) => `${((i / (values.length - 1)) * w).toFixed(2)},${(h - 2 - ((v - min) / range) * (h - 4)).toFixed(2)}`)
    .join(" ");
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-7 w-full text-muted-foreground", className)}
      aria-hidden
    >
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export function PercentileBar({ value, label }: { value: number; label: string }) {
  const id = useId();
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span id={id}>
          1-year <Term id="percentile">percentile</Term>
        </span>
        <span className="tabular-nums">{Math.round(pct)}</span>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(pct)}
        aria-label={label}
        className="relative h-1.5 rounded-full bg-secondary"
      >
        <span
          className="absolute top-1/2 h-3 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function IndicatorCard({ ind, ctxAsOf }: { ind: MarketIndicator; ctxAsOf?: string | null }) {
  const termId = TERM_BY_KEY[ind.key];
  const change = formatChange(ind);
  const value = formatIndicatorValue(ind);
  const sma = ind.extra;
  const description = indicatorDescription(ind);
  const asOf = (ind as MarketIndicator & IndicatorExtras).as_of;
  const name = termId ? <Term id={termId}>{ind.label}</Term> : ind.label;
  return (
    <div className="flex min-w-0 flex-col gap-1.5 rounded-2xl border border-border/50 bg-card/50 p-2.5 sm:gap-2 sm:p-3">
      <div className="flex items-start justify-between gap-1">
        <p className="min-w-0 text-xs text-muted-foreground">{name}</p>
        <ExplainThis
          className="-mr-1.5 -mt-1.5"
          context={{
            label: ind.label,
            noun: "indicator",
            value: `${value}${change ? ` (${change} on the day)` : ""}${
              ind.percentile_1y != null ? `, 1-year percentile ${Math.round(ind.percentile_1y)}` : ""
            }`,
          }}
        />
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-lg font-semibold tabular-nums sm:text-xl">{value}</span>
        {change && (
          <span
            className={cn(
              "text-xs tabular-nums",
              (ind.change_1d ?? 0) > 0 ? "text-emerald-500" : (ind.change_1d ?? 0) < 0 ? "text-red-500" : "text-muted-foreground",
            )}
          >
            {change}
          </span>
        )}
      </div>
      {description && <p className="text-[11px] leading-snug text-muted-foreground">{description}</p>}
      {ind.sparkline && ind.sparkline.length > 1 && <Sparkline values={ind.sparkline} className="h-5 sm:h-7" />}
      {ind.percentile_1y != null && <PercentileBar value={ind.percentile_1y} label={`${ind.label} 1-year percentile`} />}
      {sma && (sma.sma50_distance != null || sma.sma200_distance != null) && (
        <p className="text-[11px] text-muted-foreground tabular-nums">
          vs <Term id="sma">SMA</Term>50 {fmtPctDist(sma.sma50_distance)} · SMA200 {fmtPctDist(sma.sma200_distance)}
        </p>
      )}
      {ind.reading && <p className="hidden text-xs text-muted-foreground sm:block">{ind.reading}</p>}
      {asOf && asOf !== ctxAsOf && <p className="text-[10px] text-muted-foreground">As of {asOf}</p>}
    </div>
  );
}

function PanelSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4" aria-busy="true">
      {[0, 1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 rounded-2xl sm:h-40" />
      ))}
    </div>
  );
}

/**
 * Compact market backdrop (VIX, US 10y, dollar index, S&P 500). Hides itself if the API fails,
 * so it can never break the page it sits on.
 */
export function MarketContextPanel({ className }: { className?: string }) {
  const { data, isLoading, isError } = useMarketContextApiV1MarketContextGet({
    query: { staleTime: 15 * 60 * 1000 },
  });
  const ctx = data?.data;

  if (isError || (!isLoading && (!ctx || ctx.indicators.length === 0))) return null;

  return (
    <Card className={cn("rounded-3xl border-border/50", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Gauge className="h-5 w-5 text-muted-foreground" aria-hidden />
            Market context
          </CardTitle>
          {ctx?.as_of && <p className="mt-0.5 text-[11px] text-muted-foreground">As of {ctx.as_of}</p>}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading || !ctx ? (
          <PanelSkeleton />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
              {ctx.indicators.map((ind) => (
                <IndicatorCard key={ind.key} ind={ind} ctxAsOf={ctx.as_of} />
              ))}
            </div>
            {ctx.breadth && (
              <div className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-card/50 p-3 sm:max-w-sm">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-xs text-muted-foreground">
                    <Term id="market-breadth">Market breadth</Term>: share above 200-day average
                  </p>
                  <ExplainThis
                    className="-mr-1 -mt-1"
                    context={{
                      label: "market breadth (share of stocks above their 200-day average)",
                      value: `${ctx.breadth.pct_above_sma200.toFixed(0)}%`,
                    }}
                  />
                </div>
                <span className="text-xl font-semibold tabular-nums">{ctx.breadth.pct_above_sma200.toFixed(0)}%</span>
                {ctx.breadth.percentile_1y != null && (
                  <PercentileBar value={ctx.breadth.percentile_1y} label="Market breadth 1-year percentile" />
                )}
              </div>
            )}
            {ctx.notes && ctx.notes.length > 0 && (
              <ul className="list-disc space-y-0.5 pl-4 text-xs text-muted-foreground">
                {ctx.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            )}
          </>
        )}
        <EducationalDisclaimer />
      </CardContent>
    </Card>
  );
}

export default MarketContextPanel;

import { useMarketContextApiV1MarketContextGet } from "@/api/market/market";
import type { MarketContextResponse } from "@/api/financialDataApi.schemas";
import { Term } from "@/components/glossary/Term";
import { ExplainThis } from "@/components/explain/ExplainThis";
import { PercentileBar, Sparkline, formatIndicatorValue } from "@/components/market/MarketContextPanel";
import { Reading, WidgetError, WidgetLoading } from "./shared";

function useCtx() {
  const q = useMarketContextApiV1MarketContextGet({ query: { staleTime: 15 * 60 * 1000, retry: 1 } });
  return { ...q, ctx: q.data?.data as MarketContextResponse | undefined };
}

function IndicatorWidget({ indicatorKey, termId, extraNote }: { indicatorKey: string; termId: string; extraNote?: string }) {
  const { ctx, isLoading, isError } = useCtx();
  if (isLoading) return <WidgetLoading />;
  const ind = ctx?.indicators.find((i) => i.key === indicatorKey);
  if (isError || !ind || ind.value == null) return <WidgetError message="This market indicator is not available right now." />;
  const value = formatIndicatorValue(ind);
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Reading label={<Term id={termId}>{ind.label}</Term>} value={value} note={ctx?.as_of ? `As of ${ctx.as_of}` : undefined} />
        </div>
        <ExplainThis context={{ label: ind.label, value }} />
      </div>
      {ind.sparkline && ind.sparkline.length > 1 && <Sparkline values={ind.sparkline} className="h-12" />}
      {ind.percentile_1y != null && <PercentileBar value={ind.percentile_1y} label={`${ind.label} 1-year percentile`} />}
      {ind.reading && <p className="text-xs text-muted-foreground">{ind.reading}</p>}
      {extraNote && <p className="text-xs text-muted-foreground">{extraNote}</p>}
    </div>
  );
}

export const VixWidget = () => <IndicatorWidget indicatorKey="vix" termId="vix" />;
export const Treasury10yWidget = () => <IndicatorWidget indicatorKey="us10y" termId="treasury-10y" />;
export const DollarIndexWidget = () => <IndicatorWidget indicatorKey="dxy" termId="us-dollar-index" />;

/** The API exposes only the 10-year yield, so the curve itself can't be drawn. */
export const YieldCurveWidget = () => (
  <IndicatorWidget
    indicatorKey="us10y"
    termId="treasury-10y"
    extraNote="The yield curve compares yields across maturities. This example shows only the 10-year yield because 2-year and 3-month yields are not available yet, so the curve itself (and any inversion) cannot be shown."
  />
);

export function MarketBreadthWidget() {
  const { ctx, isLoading, isError } = useCtx();
  if (isLoading) return <WidgetLoading />;
  const b = ctx?.breadth;
  if (isError || !b) return <WidgetError message="Market breadth is not available right now." />;
  const value = `${b.pct_above_sma200.toFixed(0)}%`;
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Reading
            label={<Term id="market-breadth">Share of stocks above their 200-day average</Term>}
            value={value}
            note={ctx?.as_of ? `As of ${ctx.as_of}` : undefined}
          />
        </div>
        <ExplainThis context={{ label: "market breadth (share of stocks above their 200-day average)", value }} />
      </div>
      {b.percentile_1y != null && <PercentileBar value={b.percentile_1y} label="Market breadth 1-year percentile" />}
    </div>
  );
}

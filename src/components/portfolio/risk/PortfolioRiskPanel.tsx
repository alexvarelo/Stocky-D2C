import { useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw, ShieldAlert } from "lucide-react";
import { portfolioRiskApiV1PortfolioRiskPost } from "@/api/risk/risk";
import type { PortfolioRiskRequestPeriod, PortfolioRiskResponse } from "@/api/financialDataApi.schemas";
import type { PortfolioHolding } from "@/api/portfolio/portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { CorrelationHeatmap } from "./CorrelationHeatmap";
import {
  NO_DATA,
  NO_DATA_HINT,
  PERIOD_OPTIONS,
  describeBeta,
  describeConcentration,
  describeDrawdown,
  describeReturn,
  describeSharpe,
  describeVolatility,
  fmtNum,
  fmtPct,
} from "./riskFormat";

const MAX_POSITIONS = 50;

const EXCLUSION_REASON: Record<string, string> = {
  no_history: "no price history",
  no_fx: "no exchange rate",
  unknown_currency: "unknown currency",
  limit: "over position limit",
};

interface Props {
  portfolioId?: string;
  holdings: PortfolioHolding[];
  currency?: string;
}

/** Same pattern the risk API validates; one bad symbol would otherwise reject the whole request. */
const VALID_TICKER = /^[A-Za-z0-9.^=-]{1,20}$/;

function invalidTickers(holdings: PortfolioHolding[]) {
  const out = new Set<string>();
  for (const h of holdings) {
    const ticker = h.ticker?.trim().toUpperCase();
    if (ticker && h.quantity > 0 && !VALID_TICKER.test(ticker)) out.add(ticker);
  }
  return [...out].sort();
}

/** Aggregate holdings by ticker; drop zero/negative quantities and unsupported symbols; cap at 50 largest. */
function toPositions(holdings: PortfolioHolding[]) {
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

interface MetricProps {
  label: React.ReactNode;
  value: string;
  reading?: string | null;
  isNull?: boolean;
  tooltip?: string;
}

function MetricCard({ label, value, reading, isNull, tooltip }: MetricProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-3 sm:p-4 flex flex-col gap-1">
      <div className="text-xs text-muted-foreground" title={tooltip}>{label}</div>
      <div className="text-xl font-semibold tabular-nums" title={isNull ? NO_DATA_HINT : undefined}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground min-h-[1rem]">{isNull ? NO_DATA_HINT : reading}</div>
    </div>
  );
}

function RiskSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-40 rounded-2xl" />
    </div>
  );
}

export function PortfolioRiskPanel({ portfolioId, holdings, currency }: Props) {
  const [period, setPeriod] = useState<PortfolioRiskRequestPeriod>("1y");
  const baseCurrency = currency && currency.length === 3 ? currency.toUpperCase() : "USD";

  const positions = useMemo(() => toPositions(holdings), [holdings]);
  const skipped = useMemo(() => invalidTickers(holdings), [holdings]);
  const totalPositions = useMemo(
    () => new Set(holdings.filter((h) => h.ticker?.trim() && h.quantity > 0).map((h) => h.ticker.trim().toUpperCase())).size,
    [holdings]
  );
  const positionsKey = useMemo(
    () => positions.map((p) => `${p.ticker}:${p.quantity}`).join(","),
    [positions]
  );

  const { data, isLoading, isError, refetch, isFetching } = useQuery<PortfolioRiskResponse>({
    queryKey: ["portfolio-risk", portfolioId, period, baseCurrency, positionsKey],
    queryFn: async ({ signal }) =>
      (
        await portfolioRiskApiV1PortfolioRiskPost(
          { positions, benchmark: "^GSPC", period, risk_free_rate: 0, base_currency: baseCurrency },
          signal
        )
      ).data,
    enabled: positions.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const periodLong = PERIOD_OPTIONS.find((p) => p.value === period)?.long ?? period;

  return (
    <Card className="rounded-3xl border-border/50">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5 text-muted-foreground" aria-hidden />
            Risk
          </CardTitle>
          {data?.as_of && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              As of {parseISO(data.as_of).toLocaleDateString()}
            </p>
          )}
        </div>
        <ToggleGroup
          type="single"
          size="sm"
          variant="outline"
          value={period}
          onValueChange={(v) => v && setPeriod(v as PortfolioRiskRequestPeriod)}
          aria-label="Risk period"
        >
          {PERIOD_OPTIONS.map((p) => (
            <ToggleGroupItem key={p.value} value={p.value} className="px-3">
              {p.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </CardHeader>
      <CardContent className="space-y-5">
        {positions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            Add holdings to this portfolio to see its risk metrics.
          </p>
        ) : isLoading ? (
          <RiskSkeleton />
        ) : isError || !data ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
            <p className="text-sm text-muted-foreground">Couldn't load risk metrics.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        ) : (
          <div className={isFetching ? "opacity-60 transition-opacity space-y-5" : "space-y-5"}>
            {totalPositions > MAX_POSITIONS && (
              <p className="text-xs text-muted-foreground">
                Showing risk for the {MAX_POSITIONS} largest positions.
              </p>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                label={<Term id="beta">Beta vs S&amp;P 500</Term>}
                value={fmtNum(data.beta)}
                isNull={data.beta == null}
                reading={describeBeta(data.beta)}
              />
              <MetricCard
                label={<Term id="volatility">Volatility</Term>}
                value={fmtPct(data.volatility_annual)}
                isNull={data.volatility_annual == null}
                reading={describeVolatility(data.volatility_annual)}
              />
              <MetricCard
                label={<Term id="max-drawdown">Max drawdown</Term>}
                value={fmtPct(data.max_drawdown)}
                isNull={data.max_drawdown == null}
                reading={describeDrawdown(data.max_drawdown)}
              />
              <MetricCard
                label={<Term id="sharpe-ratio">Sharpe ratio</Term>}
                value={fmtNum(data.sharpe_ratio)}
                isNull={data.sharpe_ratio == null}
                reading={describeSharpe(data.sharpe_ratio)}
                tooltip="Calculated with a 0% risk-free rate"
              />
              <MetricCard
                label={<Term id="annual-return">Annual return</Term>}
                value={fmtPct(data.annual_return)}
                isNull={data.annual_return == null}
                reading={describeReturn(data.annual_return)}
              />
              <MetricCard
                label={<Term id="diversification">Largest position</Term>}
                value={data.largest_position ? `${data.largest_position.ticker} ${fmtPct(data.largest_position.weight)}` : NO_DATA}
                reading={data.largest_position ? "Share of portfolio value in the top holding" : null}
                isNull={!data.largest_position}
              />
              <MetricCard
                label={<Term id="concentration-hhi">Concentration (HHI)</Term>}
                value={Number.isFinite(data.hhi) ? data.hhi.toFixed(3) : NO_DATA}
                reading={describeConcentration(data)}
              />
              <MetricCard
                label={<Term id="effective-positions">Effective positions</Term>}
                value={data.effective_positions == null ? NO_DATA : data.effective_positions.toFixed(1)}
                isNull={data.effective_positions == null}
                reading={`Out of ${data.weights.length} holding${data.weights.length === 1 ? "" : "s"}`}
              />
            </div>

            <CorrelationHeatmap data={data} />

            {(data.missing_tickers.length > 0 || skipped.length > 0) && (
              <p className="text-xs text-muted-foreground flex gap-2 items-start rounded-xl bg-muted/50 p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>
                  Excluded:{" "}
                  {[
                    ...(data.excluded && data.excluded.length > 0
                      ? data.excluded.map((e) => `${e.ticker} (${EXCLUSION_REASON[e.reason] ?? "unavailable"})`)
                      : data.missing_tickers),
                    ...skipped.map((t) => `${t} (unsupported symbol)`),
                  ].join(", ")}
                  .
                </span>
              </p>
            )}
          </div>
        )}

        <div className="space-y-1 pt-1 border-t border-border/50">
          <p className="text-xs text-muted-foreground pt-3">
            Based on today's holdings held over the last {periodLong}; past behaviour does not predict future results.
          </p>
          <EducationalDisclaimer />
        </div>
      </CardContent>
    </Card>
  );
}

export default PortfolioRiskPanel;

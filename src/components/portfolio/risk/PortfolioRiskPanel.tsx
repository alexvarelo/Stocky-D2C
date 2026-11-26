import { useEffect, useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { formatDate, formatDecimal } from "@/lib/formatters";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown, RefreshCw, ShieldAlert } from "lucide-react";
import { portfolioRiskApiV1PortfolioRiskPost } from "@/api/risk/risk";
import type { PortfolioRiskRequestPeriod, PortfolioRiskResponse } from "@/api/financialDataApi.schemas";
import type { PortfolioHolding } from "@/api/portfolio/portfolio";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExplainThis } from "@/components/explain/ExplainThis";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { MAX_POSITIONS, invalidTickers, toPositions } from "@/lib/portfolioPositions";
import { CorrelationHeatmap } from "./CorrelationHeatmap";
import {
  NO_DATA,
  getNoDataHint,
  PERIOD_OPTIONS,
  periodLabel,
  periodLong as getPeriodLong,
  describeBeta,
  describeConcentration,
  describeDrawdown,
  describeReturn,
  describeSharpe,
  describeVolatility,
  fmtNum,
  fmtPct,
} from "./riskFormat";


interface Props {
  portfolioId?: string;
  holdings: PortfolioHolding[];
  currency?: string;
}

interface MetricProps {
  label: React.ReactNode;
  value: string;
  reading?: string | null;
  isNull?: boolean;
  tooltip?: string;
  /** Plain-text metric name for the "Explain this" question. */
  name: string;
}

function MetricCard({ label, value, reading, isNull, tooltip, name }: MetricProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-3 sm:p-4 flex flex-col gap-1">
      <div className="flex items-start justify-between gap-1">
        <div className="text-xs text-muted-foreground" title={tooltip}>{label}</div>
        {!isNull && (
          <ExplainThis
            className="-mr-1.5 -mt-1.5"
            context={{ label: `portfolio ${name}`, value }}
          />
        )}
      </div>
      <div className="text-xl font-semibold tabular-nums" title={isNull ? getNoDataHint() : undefined}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground min-h-[1rem]">{isNull ? getNoDataHint() : reading}</div>
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

const OPEN_KEY = "stocky.portfolio-risk-open";

function readOpen(): boolean {
  try {
    return window.localStorage.getItem(OPEN_KEY) === "1";
  } catch {
    return false;
  }
}

/** One compact figure for the collapsed summary row. */
function SummaryFigure({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="truncate text-[11px] text-muted-foreground">{label}</dt>
      <dd className="truncate text-base font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

export function PortfolioRiskPanel({ portfolioId, holdings, currency }: Props) {
  const { t } = useTranslation("risk");
  const [period, setPeriod] = useState<PortfolioRiskRequestPeriod>("1y");
  // Collapsed by default so holdings stay near the top; remembered per browser.
  const [open, setOpen] = useState<boolean>(readOpen);
  useEffect(() => {
    try {
      window.localStorage.setItem(OPEN_KEY, open ? "1" : "0");
    } catch {
      /* storage unavailable: the panel still works, it just won't remember */
    }
  }, [open]);
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

  const periodLong = getPeriodLong(period);

  const summary = data && !isError && positions.length > 0 && (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryFigure label={t("metrics.beta")} value={fmtNum(data.beta)} />
      <SummaryFigure label={t("metrics.volatility")} value={fmtPct(data.volatility_annual)} />
      <SummaryFigure label={t("metrics.maxDrawdown")} value={fmtPct(data.max_drawdown)} />
      <SummaryFigure
        label={t("metrics.largestPosition")}
        value={data.largest_position ? `${data.largest_position.ticker} ${fmtPct(data.largest_position.weight)}` : NO_DATA}
      />
    </dl>
  );

  return (
    <Collapsible open={open} onOpenChange={setOpen} asChild>
    <Card className="rounded-3xl border-border/50">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ShieldAlert className="h-5 w-5 text-muted-foreground" aria-hidden />
            {t("title")}
          </CardTitle>
          {data?.as_of && (
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t("asOf", { date: formatDate(parseISO(data.as_of).toISOString()) })}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {open && (
            <ToggleGroup
              type="single"
              size="sm"
              variant="outline"
              value={period}
              onValueChange={(v) => v && setPeriod(v as PortfolioRiskRequestPeriod)}
              aria-label={t("periodLabel")}
            >
              {PERIOD_OPTIONS.map((p) => (
                <ToggleGroupItem key={p.value} value={p.value} className="px-3">
                  {periodLabel(p.value)}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
              {open ? t("hideDetails") : t("showDetails")}
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
            </Button>
          </CollapsibleTrigger>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {!open && (
          positions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("empty")}</p>
          ) : isLoading ? (
            <Skeleton className="h-12 rounded-xl" />
          ) : isError || !data ? (
            <p className="text-sm text-muted-foreground">{t("errorCollapsed")}</p>
          ) : (
            summary
          )
        )}
        <CollapsibleContent className="space-y-5">
        {positions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">
            {t("empty")}
          </p>
        ) : isLoading ? (
          <RiskSkeleton />
        ) : isError || !data ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
            <p className="text-sm text-muted-foreground">{t("error")}</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              {t("common:actions.retry")}
            </Button>
          </div>
        ) : (
          <div className={isFetching ? "opacity-60 transition-opacity space-y-5" : "space-y-5"}>
            {totalPositions > MAX_POSITIONS && (
              <p className="text-xs text-muted-foreground">
                {t("maxPositions", { count: MAX_POSITIONS })}
              </p>
            )}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <MetricCard
                name="beta vs the S&P 500"
                label={<Term id="beta">{t("metrics.beta")}</Term>}
                value={fmtNum(data.beta)}
                isNull={data.beta == null}
                reading={describeBeta(data.beta)}
              />
              <MetricCard
                name="annualised volatility"
                label={<Term id="volatility">{t("metrics.volatility")}</Term>}
                value={fmtPct(data.volatility_annual)}
                isNull={data.volatility_annual == null}
                reading={describeVolatility(data.volatility_annual)}
              />
              <MetricCard
                name="maximum drawdown"
                label={<Term id="max-drawdown">{t("metrics.maxDrawdown")}</Term>}
                value={fmtPct(data.max_drawdown)}
                isNull={data.max_drawdown == null}
                reading={describeDrawdown(data.max_drawdown)}
              />
              <MetricCard
                name="Sharpe ratio"
                label={<Term id="sharpe-ratio">{t("metrics.sharpe")}</Term>}
                value={fmtNum(data.sharpe_ratio)}
                isNull={data.sharpe_ratio == null}
                reading={describeSharpe(data.sharpe_ratio)}
                tooltip={t("sharpeTooltip")}
              />
              <MetricCard
                name="annualised return"
                label={<Term id="annual-return">{t("metrics.annualReturn")}</Term>}
                value={fmtPct(data.annual_return)}
                isNull={data.annual_return == null}
                reading={describeReturn(data.annual_return)}
              />
              <MetricCard
                name="largest position weight"
                label={<Term id="diversification">{t("metrics.largestPosition")}</Term>}
                value={data.largest_position ? `${data.largest_position.ticker} ${fmtPct(data.largest_position.weight)}` : NO_DATA}
                reading={data.largest_position ? t("largestReading") : null}
                isNull={!data.largest_position}
              />
              <MetricCard
                name="concentration (HHI)"
                label={<Term id="concentration-hhi">{t("metrics.hhi")}</Term>}
                value={Number.isFinite(data.hhi) ? formatDecimal(data.hhi, 3) : NO_DATA}
                reading={describeConcentration(data)}
              />
              <MetricCard
                name="effective number of positions"
                label={<Term id="effective-positions">{t("metrics.effectivePositions")}</Term>}
                value={data.effective_positions == null ? NO_DATA : formatDecimal(data.effective_positions, 1)}
                isNull={data.effective_positions == null}
                reading={t("outOfHoldings", { count: data.weights.length })}
              />
            </div>

            <CorrelationHeatmap data={data} />

            {(data.missing_tickers.length > 0 || skipped.length > 0) && (
              <p className="text-xs text-muted-foreground flex gap-2 items-start rounded-xl bg-muted/50 p-3">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                <span>
                  {t("excluded")}{" "}
                  {[
                    ...(data.excluded && data.excluded.length > 0
                      ? data.excluded.map((e) => `${e.ticker} (${t(`exclusion.${e.reason}`, { defaultValue: t("exclusion.unavailable") })})`)
                      : data.missing_tickers),
                    ...skipped.map((ticker) => `${ticker} (${t("exclusion.unsupported")})`),
                  ].join(", ")}
                  .
                </span>
              </p>
            )}
          </div>
        )}
        </CollapsibleContent>

        <div className="space-y-1 pt-1 border-t border-border/50">
          <p className="text-xs text-muted-foreground pt-3">
            {t("basedOn", { period: periodLong })}
          </p>
          <EducationalDisclaimer />
        </div>
      </CardContent>
    </Card>
    </Collapsible>
  );
}

export default PortfolioRiskPanel;

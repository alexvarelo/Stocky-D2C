import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { portfolioRiskApiV1PortfolioRiskPost } from "@/api/risk/risk";
import { useGetHistoricalDataApiV1StockTickerHistoryGet } from "@/api/stock/stock";
import type { HistoricalDataResponse, PortfolioRiskResponse } from "@/api/financialDataApi.schemas";
import { Term } from "@/components/glossary/Term";
import { StockSearch } from "@/components/stock/StockSearch";
import { ExplainThis } from "@/components/explain/ExplainThis";
import { VALID_TICKER } from "@/lib/portfolioPositions";
import { describeBeta, describeDrawdown, describeVolatility, fmtNum as fmtRiskNum, fmtPct } from "@/components/portfolio/risk/riskFormat";
import { CHART_AXIS, CHART_MARGIN, ChartTitle, Reading, TOOLTIP_STYLE, WidgetError, WidgetLoading, fmtTick, type WidgetProps } from "./shared";

/** Risk numbers for one ticker, reusing the portfolio risk endpoint with a single position. */
function useSingleRisk(tickers: string[]) {
  const positions = tickers.filter((t) => VALID_TICKER.test(t)).map((t) => ({ ticker: t.toUpperCase(), quantity: 1 }));
  return useQuery<PortfolioRiskResponse>({
    queryKey: ["learn-risk", positions.map((p) => p.ticker).join(",")],
    enabled: positions.length > 0,
    staleTime: 15 * 60 * 1000,
    retry: 1,
    queryFn: async ({ signal }) =>
      (
        await portfolioRiskApiV1PortfolioRiskPost(
          { positions, benchmark: "^GSPC", period: "1y", risk_free_rate: 0, base_currency: "USD" },
          signal,
        )
      ).data,
  });
}

export function BetaWidget({ ticker }: WidgetProps) {
  const { data, isLoading, isError } = useSingleRisk([ticker]);
  if (isLoading) return <WidgetLoading />;
  if (isError || !data || data.beta == null) return <WidgetError message="Beta needs more price history than is available for this ticker." />;
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Reading label={<Term id="beta">Beta vs S&amp;P 500 (1 year)</Term>} value={fmtRiskNum(data.beta)} note={describeBeta(data.beta)} />
        </div>
        <ExplainThis context={{ label: "beta versus the S&P 500", ticker, value: fmtRiskNum(data.beta) }} />
      </div>
    </div>
  );
}

export function VolatilityWidget({ ticker }: WidgetProps) {
  const { data, isLoading, isError } = useSingleRisk([ticker]);
  if (isLoading) return <WidgetLoading />;
  if (isError || !data || data.volatility_annual == null) return <WidgetError message="Not enough price history for this ticker." />;
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <Reading
          label={<Term id="volatility">Annualised volatility (1 year)</Term>}
          value={fmtPct(data.volatility_annual)}
          note={describeVolatility(data.volatility_annual)}
        />
      </div>
      <ExplainThis context={{ label: "annualised volatility", ticker, value: fmtPct(data.volatility_annual) }} />
    </div>
  );
}

export function DrawdownWidget({ ticker }: WidgetProps) {
  const { data, isLoading, isError } = useGetHistoricalDataApiV1StockTickerHistoryGet(
    ticker,
    { period: "1y" },
    { query: { staleTime: 15 * 60 * 1000, retry: 1 } },
  );
  const rows = useMemo(() => {
    const pts = (data?.data as HistoricalDataResponse | undefined)?.data ?? [];
    let peak = 0;
    return pts
      .filter((p) => p.close != null)
      .map((p) => {
        peak = Math.max(peak, p.close as number);
        return { date: p.date.slice(0, 10), dd: ((p.close as number) / peak - 1) * 100 };
      });
  }, [data]);
  if (isLoading) return <WidgetLoading />;
  if (isError || rows.length < 2) return <WidgetError />;
  const worst = Math.min(...rows.map((r) => r.dd));
  const current = rows[rows.length - 1].dd;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Reading label={<Term id="max-drawdown">Max drawdown (1 year)</Term>} value={`${worst.toFixed(1)}%`} note={describeDrawdown(worst / 100)} />
        <Reading label="Currently below its peak by" value={`${Math.abs(current).toFixed(1)}%`} />
      </div>
      <ChartTitle explain={{ label: "drawdown chart", ticker, value: `max drawdown ${worst.toFixed(1)}%` }}>
        Fall from the previous high over the last year
      </ChartTitle>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
            <XAxis dataKey="date" {...CHART_AXIS} tickFormatter={fmtTick} interval="preserveStartEnd" minTickGap={50} />
            <YAxis {...CHART_AXIS} width={40} tickFormatter={(v: number) => `${v.toFixed(0)}%`} />
            <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => `${v.toFixed(1)}%`} />
            <Area dataKey="dd" name="Drawdown" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CorrelationWidget({ ticker }: WidgetProps) {
  const [other, setOther] = useState("SPY");
  const same = other.toUpperCase() === ticker.toUpperCase();
  const { data, isLoading, isError } = useSingleRisk(same ? [] : [ticker, other]);
  const idxA = data?.correlation.tickers.indexOf(ticker.toUpperCase()) ?? -1;
  const idxB = data?.correlation.tickers.indexOf(other.toUpperCase()) ?? -1;
  const corr = idxA >= 0 && idxB >= 0 ? data?.correlation.matrix[idxA]?.[idxB] ?? null : null;
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <p className="text-xs text-muted-foreground">
          Compare {ticker} with: <span className="font-medium text-foreground">{other}</span>
        </p>
        <StockSearch onSelect={(s) => setOther(s.symbol)} placeholder="Pick a second ticker" />
      </div>
      {same ? (
        <WidgetError message="Pick a different second ticker." />
      ) : isLoading ? (
        <WidgetLoading />
      ) : isError || corr == null ? (
        <WidgetError message="Not enough overlapping history to compute a correlation." />
      ) : (
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Reading
              label={<Term id="correlation">Correlation of daily returns (1 year)</Term>}
              value={corr.toFixed(2)}
              note="1 means they moved together, 0 unrelated, -1 in opposite directions."
            />
          </div>
          <ExplainThis context={{ label: `correlation between ${ticker} and ${other}`, value: corr.toFixed(2) }} />
        </div>
      )}
    </div>
  );
}

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useGetFinancialsApiV1StockTickerFinancialsGet, useGetHealthApiV1StockTickerHealthGet } from "@/api/analysis/analysis";
import { useGetStockPriceApiV1StockTickerPriceGet } from "@/api/stock/stock";
import type { FinancialItem, FinancialsResponse, HealthMetric, HealthResponse, PriceData } from "@/api/financialDataApi.schemas";
import { Term } from "@/components/glossary/Term";
import { formatCompact, formatDecimalPercent, formatHealthValue } from "@/lib/financialFormat";
import { CHART_AXIS, CHART_MARGIN, ChartTitle, Reading, TOOLTIP_STYLE, WidgetError, WidgetLoading, fmtNum, type WidgetProps } from "./shared";

const STALE = 60 * 60 * 1000;
const C = {
  primary: "hsl(var(--primary))",
  positive: "hsl(var(--success))",
  negative: "hsl(var(--destructive))",
  amber: "hsl(38 92% 50%)",
};

function yearLabel(end: string) {
  const d = new Date(end);
  return Number.isNaN(d.getTime()) ? end : String(d.getUTCFullYear());
}

function useAnnual(ticker: string) {
  const q = useGetFinancialsApiV1StockTickerFinancialsGet(
    ticker,
    { period: "annual" },
    { query: { staleTime: STALE, retry: 1 } },
  );
  const fin = q.data?.data as FinancialsResponse | undefined;
  const items = useMemo(() => fin?.items ?? [], [fin]);
  return { ...q, fin, items };
}

function FinFrame({ ticker, children }: { ticker: string; children: (_items: FinancialItem[], _currency?: string) => React.ReactNode }) {
  const { fin, items, isLoading, isError } = useAnnual(ticker);
  if (isLoading) return <WidgetLoading />;
  if (isError || !fin || items.length === 0) return <WidgetError message="Financial statements are not available for this ticker." />;
  return <>{children(items, fin.currency ?? undefined)}</>;
}

function Box({ children }: { children: React.ReactElement }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function latest(items: FinancialItem[]) {
  return items[items.length - 1];
}

export function PeRatioWidget({ ticker }: WidgetProps) {
  const { data, isLoading, isError } = useGetStockPriceApiV1StockTickerPriceGet(ticker, {
    query: { staleTime: 5 * 60 * 1000, retry: 1 },
  });
  const p = data?.data as PriceData | undefined;
  if (isLoading) return <WidgetLoading />;
  if (isError || !p) return <WidgetError />;
  const pe = p.pe_ratio;
  const price = p.current_price;
  const eps = pe && price ? price / pe : null;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Reading label={<Term id="pe-ratio">P/E</Term>} value={pe == null ? "N/A" : pe.toFixed(1)} />
        <Reading label="Price" value={fmtNum(price)} note={p.currency ?? undefined} />
        <Reading label={<Term id="eps">EPS (implied)</Term>} value={eps == null ? "N/A" : eps.toFixed(2)} />
      </div>
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {pe == null
          ? "No P/E is reported, which usually means the company has no positive earnings."
          : `${ticker} trades at ${pe.toFixed(1)} times its yearly earnings per share: the price divided by EPS.`}
      </p>
    </div>
  );
}

export function MarginsWidget({ ticker }: WidgetProps) {
  return (
    <FinFrame ticker={ticker}>
      {(items) => {
        const l = latest(items);
        const data = items.map((i) => ({
          label: yearLabel(i.period_end),
          gross: i.gross_margin != null ? i.gross_margin * 100 : null,
          operating: i.operating_margin != null ? i.operating_margin * 100 : null,
          net: i.net_margin != null ? i.net_margin * 100 : null,
        }));
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Reading label={<Term id="gross-margin">Gross</Term>} value={formatDecimalPercent(l.gross_margin)} />
              <Reading label={<Term id="operating-margin">Operating</Term>} value={formatDecimalPercent(l.operating_margin)} />
              <Reading label={<Term id="net-margin">Net</Term>} value={formatDecimalPercent(l.net_margin)} />
            </div>
            <ChartTitle explain={{ label: "gross, operating and net margins chart", ticker, value: `latest net margin ${formatDecimalPercent(l.net_margin)}` }}>
              Margins by year
            </ChartTitle>
            <Box>
              <LineChart data={data} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="label" {...CHART_AXIS} />
                <YAxis {...CHART_AXIS} width={40} tickFormatter={(v: number) => `${v}%`} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => `${v.toFixed(1)}%`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line dataKey="gross" name="Gross" stroke={C.primary} strokeWidth={2} dot={false} connectNulls />
                <Line dataKey="operating" name="Operating" stroke={C.amber} strokeWidth={2} dot={false} connectNulls />
                <Line dataKey="net" name="Net" stroke={C.positive} strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </Box>
          </div>
        );
      }}
    </FinFrame>
  );
}

export function FreeCashFlowWidget({ ticker }: WidgetProps) {
  return (
    <FinFrame ticker={ticker}>
      {(items, cur) => {
        const l = latest(items);
        const data = items.map((i) => ({
          label: yearLabel(i.period_end),
          fcf: i.free_cash_flow ?? null,
          net: i.net_income ?? null,
        }));
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Reading label="Operating cash flow" value={formatCompact(l.operating_cash_flow, cur)} />
              <Reading label="Capex" value={formatCompact(l.capex, cur)} />
              <Reading label={<Term id="free-cash-flow">Free cash flow</Term>} value={formatCompact(l.free_cash_flow, cur)} />
              <Reading label="Net income" value={formatCompact(l.net_income, cur)} />
            </div>
            <ChartTitle explain={{ label: "free cash flow against net income chart", ticker, value: `free cash flow ${formatCompact(l.free_cash_flow, cur)}, net income ${formatCompact(l.net_income, cur)}` }}>
              <Term id="free-cash-flow">Free cash flow</Term> vs net income by year
            </ChartTitle>
            <Box>
              <BarChart data={data} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="label" {...CHART_AXIS} />
                <YAxis {...CHART_AXIS} width={48} tickFormatter={(v: number) => formatCompact(v)} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => formatCompact(v, cur)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                <Bar dataKey="fcf" name="Free cash flow" radius={[3, 3, 0, 0]}>
                  {data.map((d, i) => (
                    <Cell key={i} fill={(d.fcf ?? 0) < 0 ? C.negative : C.positive} />
                  ))}
                </Bar>
                <Bar dataKey="net" name="Net income" fill={C.primary} radius={[3, 3, 0, 0]} />
              </BarChart>
            </Box>
          </div>
        );
      }}
    </FinFrame>
  );
}

export function NetDebtWidget({ ticker }: WidgetProps) {
  const { metric: leverage } = useHealthMetric(ticker, "net_debt_to_ebitda");
  return (
    <FinFrame ticker={ticker}>
      {(items, cur) => {
        const l = latest(items);
        const data = items.map((i) => ({ label: yearLabel(i.period_end), cash: i.cash ?? null, debt: i.total_debt ?? null }));
        const nd = l.net_debt;
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Reading label="Cash" value={formatCompact(l.cash, cur)} />
              <Reading label="Total debt" value={formatCompact(l.total_debt, cur)} />
              <Reading
                label={<Term id="net-debt">Net debt</Term>}
                value={formatCompact(nd, cur)}
                note={nd == null ? undefined : nd < 0 ? "Cash is larger than debt" : "Debt is larger than cash"}
              />
              {leverage && (
                <Reading
                  label={<Term id="net-debt-ebitda">Net debt / EBITDA</Term>}
                  value={formatHealthValue(leverage)}
                  note={leverage.explanation}
                />
              )}
            </div>
            <ChartTitle explain={{ label: "cash versus total debt chart", ticker, value: `net debt ${formatCompact(nd, cur)}` }}>
              Cash vs total debt by year
            </ChartTitle>
            <Box>
              <BarChart data={data} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="label" {...CHART_AXIS} />
                <YAxis {...CHART_AXIS} width={48} tickFormatter={(v: number) => formatCompact(v)} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => formatCompact(v, cur)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="cash" name="Cash" fill={C.positive} radius={[3, 3, 0, 0]} />
                <Bar dataKey="debt" name="Total debt" fill={C.negative} radius={[3, 3, 0, 0]} />
              </BarChart>
            </Box>
          </div>
        );
      }}
    </FinFrame>
  );
}

function useHealthMetric(ticker: string, key: string) {
  const q = useGetHealthApiV1StockTickerHealthGet(ticker, { query: { staleTime: STALE, retry: 1 } });
  const metric = ((q.data?.data as HealthResponse | undefined)?.metrics ?? []).find((m: HealthMetric) => m.key === key);
  return { ...q, metric };
}

export function CashRunwayWidget({ ticker }: WidgetProps) {
  const { metric, isLoading, isError } = useHealthMetric(ticker, "cash_runway_months");
  const { items, fin } = useAnnual(ticker);
  if (isLoading) return <WidgetLoading />;
  if (isError || !metric) return <WidgetError message="Cash runway is not available for this ticker." />;
  const l = items.length ? latest(items) : undefined;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Reading label={<Term id="cash-runway">Cash runway</Term>} value={formatHealthValue(metric)} />
        <Reading label="Cash" value={formatCompact(l?.cash, fin?.currency)} note="Latest annual statement" />
      </div>
      <p className="text-xs text-muted-foreground">{metric.explanation}</p>
    </div>
  );
}

export function DilutionWidget({ ticker }: WidgetProps) {
  const { metric } = useHealthMetric(ticker, "dilution_yoy");
  return (
    <FinFrame ticker={ticker}>
      {(items) => {
        const data = items.map((i) => ({ label: yearLabel(i.period_end), shares: i.shares_outstanding ?? null }));
        return (
          <div className="space-y-3">
            {metric && (
              <Reading
                label={<Term id="share-dilution">Share count change (year on year)</Term>}
                value={formatHealthValue(metric)}
                note={metric.explanation}
              />
            )}
            <ChartTitle explain={{ label: "shares outstanding chart", ticker, value: metric ? formatHealthValue(metric) : undefined }}>
              Shares outstanding by year
            </ChartTitle>
            <Box>
              <BarChart data={data} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="label" {...CHART_AXIS} />
                <YAxis {...CHART_AXIS} width={48} domain={[0, "auto"]} tickFormatter={(v: number) => formatCompact(v)} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => formatCompact(v)} />
                <Bar dataKey="shares" name="Shares" fill={C.primary} radius={[3, 3, 0, 0]} />
              </BarChart>
            </Box>
          </div>
        );
      }}
    </FinFrame>
  );
}

export function IncomeStatementWidget({ ticker }: WidgetProps) {
  return (
    <FinFrame ticker={ticker}>
      {(items, cur) => {
        const l = latest(items);
        const data = items.map((i) => ({
          label: yearLabel(i.period_end),
          revenue: i.revenue ?? null,
          operating: i.operating_income ?? null,
          net: i.net_income ?? null,
        }));
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Reading label="Revenue" value={formatCompact(l.revenue, cur)} note="Latest annual statement" />
              <Reading label="Operating income" value={formatCompact(l.operating_income, cur)} />
              <Reading label={<Term id="net-margin">Net income</Term>} value={formatCompact(l.net_income, cur)} note={`Net margin ${formatDecimalPercent(l.net_margin)}`} />
            </div>
            <ChartTitle explain={{ label: "revenue, operating income and net income chart", ticker, value: `latest revenue ${formatCompact(l.revenue, cur)}, net income ${formatCompact(l.net_income, cur)}` }}>
              Revenue, operating income and net income by year
            </ChartTitle>
            <Box>
              <BarChart data={data} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                <XAxis dataKey="label" {...CHART_AXIS} />
                <YAxis {...CHART_AXIS} width={48} tickFormatter={(v: number) => formatCompact(v)} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => formatCompact(v, cur)} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <ReferenceLine y={0} stroke="hsl(var(--muted-foreground))" />
                <Bar dataKey="revenue" name="Revenue" fill={C.primary} radius={[3, 3, 0, 0]} />
                <Bar dataKey="operating" name="Operating income" fill={C.amber} radius={[3, 3, 0, 0]} />
                <Bar dataKey="net" name="Net income" fill={C.positive} radius={[3, 3, 0, 0]} />
              </BarChart>
            </Box>
          </div>
        );
      }}
    </FinFrame>
  );
}

export function QualityScoresWidget({ ticker }: WidgetProps) {
  const altman = useHealthMetric(ticker, "altman_z");
  const piotroski = useHealthMetric(ticker, "piotroski_f");
  if (altman.isLoading || piotroski.isLoading) return <WidgetLoading />;
  if (altman.isError || (!altman.metric && !piotroski.metric)) {
    return <WidgetError message="Quality scores are not available for this ticker (they need full financial statements)." />;
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {altman.metric && (
          <Reading
            label={<Term id="altman-z-score">Altman Z-score</Term>}
            value={altman.metric.value == null ? "N/A" : altman.metric.value.toFixed(2)}
            note={altman.metric.explanation}
          />
        )}
        {piotroski.metric && (
          <Reading
            label={<Term id="piotroski-f-score">Piotroski F-score</Term>}
            value={formatHealthValue(piotroski.metric)}
            note={piotroski.metric.explanation}
          />
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Both scores are simple summaries of the financial statements. They describe past accounts and do not predict future results.
      </p>
    </div>
  );
}

import { useState } from "react";
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
import { useGetFinancialsApiV1StockTickerFinancialsGet } from "@/api/analysis/analysis";
import type { FinancialItem, FinancialsResponse } from "@/api/financialDataApi.schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { formatCompact, formatDecimalPercent } from "@/lib/financialFormat";

type Period = "annual" | "quarterly";

const STALE_TIME_MS = 60 * 60 * 1000;
const C = {
  primary: "hsl(var(--primary))",
  positive: "hsl(var(--success))",
  negative: "hsl(var(--destructive))",
  amber: "hsl(38 92% 50%)",
  muted: "hsl(var(--muted-foreground))",
  border: "hsl(var(--border))",
};

interface FundamentalsTabProps {
  ticker: string;
}

function periodLabel(end: string, period: Period) {
  const d = new Date(end);
  if (Number.isNaN(d.getTime())) return end;
  return period === "annual"
    ? String(d.getUTCFullYear())
    : `${d.toLocaleString("en-US", { month: "short", timeZone: "UTC" })} ${String(d.getUTCFullYear()).slice(2)}`;
}

function ChartCard({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {children as React.ReactElement}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

const tooltipStyle = {
  backgroundColor: "hsl(var(--background))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

const axisProps = {
  stroke: C.muted,
  fontSize: 11,
  tickLine: false,
  axisLine: false,
} as const;

interface Row {
  label: string;
  item: FinancialItem;
}

type Fmt = "money" | "pct" | "shares";

const TABLE_ROWS: { key: keyof FinancialItem; label: string; term?: string; fmt: Fmt }[] = [
  { key: "revenue", label: "Revenue", fmt: "money" },
  { key: "gross_profit", label: "Gross profit", fmt: "money" },
  { key: "operating_income", label: "Operating income", fmt: "money" },
  { key: "net_income", label: "Net income", fmt: "money" },
  { key: "ebitda", label: "EBITDA", term: "ev-ebitda", fmt: "money" },
  { key: "gross_margin", label: "Gross margin", term: "gross-margin", fmt: "pct" },
  { key: "operating_margin", label: "Operating margin", term: "operating-margin", fmt: "pct" },
  { key: "net_margin", label: "Net margin", term: "net-margin", fmt: "pct" },
  { key: "operating_cash_flow", label: "Operating cash flow", fmt: "money" },
  { key: "capex", label: "Capex", fmt: "money" },
  { key: "free_cash_flow", label: "Free cash flow", term: "free-cash-flow", fmt: "money" },
  { key: "cash", label: "Cash", fmt: "money" },
  { key: "total_debt", label: "Total debt", fmt: "money" },
  { key: "net_debt", label: "Net debt", term: "net-debt", fmt: "money" },
  { key: "shares_outstanding", label: "Shares outstanding", term: "share-dilution", fmt: "shares" },
];

function FundamentalsContent({ data, period }: { data: FinancialsResponse; period: Period }) {
  const currency = data.currency ?? undefined;
  const rows: Row[] = data.items.map((item) => ({ label: periodLabel(item.period_end, period), item }));
  const chartData = rows.map(({ label, item }) => ({
    label,
    revenue: item.revenue ?? null,
    net_income: item.net_income ?? null,
    gross_margin: item.gross_margin != null ? item.gross_margin * 100 : null,
    operating_margin: item.operating_margin != null ? item.operating_margin * 100 : null,
    net_margin: item.net_margin != null ? item.net_margin * 100 : null,
    free_cash_flow: item.free_cash_flow ?? null,
    cash: item.cash ?? null,
    total_debt: item.total_debt ?? null,
  }));
  const money = (v: unknown) => formatCompact(typeof v === "number" ? v : null, currency);
  const axisMoney = (v: number) => formatCompact(v);
  const pct = (v: unknown) => (typeof v === "number" ? `${v.toFixed(1)}%` : "—");

  const cell = (item: FinancialItem, key: keyof FinancialItem, fmt: Fmt) => {
    const v = item[key] as number | null | undefined;
    if (fmt === "pct") return formatDecimalPercent(v);
    if (fmt === "shares") return formatCompact(v);
    return formatCompact(v, null);
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Statement currency: {currency ?? "unknown"}
        {currency ? " (may differ from the quote currency)" : ""}
      </p>
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue vs Net income">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={axisMoney} width={52} />
            <Tooltip contentStyle={tooltipStyle} formatter={money} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" name="Revenue" fill={C.primary} radius={[3, 3, 0, 0]} />
            <Bar dataKey="net_income" name="Net income" fill={C.positive} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartCard>

        <ChartCard title="Margins">
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={(v: number) => `${v}%`} width={44} />
            <Tooltip contentStyle={tooltipStyle} formatter={pct} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line type="monotone" dataKey="gross_margin" name="Gross" stroke={C.primary} strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="operating_margin" name="Operating" stroke={C.amber} strokeWidth={2} dot={false} connectNulls />
            <Line type="monotone" dataKey="net_margin" name="Net" stroke={C.positive} strokeWidth={2} dot={false} connectNulls />
          </LineChart>
        </ChartCard>

        <ChartCard title={<Term id="free-cash-flow">Free cash flow</Term>}>
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={axisMoney} width={52} />
            <Tooltip contentStyle={tooltipStyle} formatter={money} />
            <ReferenceLine y={0} stroke={C.muted} />
            <Bar dataKey="free_cash_flow" name="Free cash flow" radius={[3, 3, 0, 0]}>
              {chartData.map((d, i) => (
                <Cell key={i} fill={(d.free_cash_flow ?? 0) < 0 ? C.negative : C.positive} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard title="Cash vs Total debt">
          <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={C.border} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...axisProps} tickFormatter={axisMoney} width={52} />
            <Tooltip contentStyle={tooltipStyle} formatter={money} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="cash" name="Cash" fill={C.positive} radius={[3, 3, 0, 0]} />
            <Bar dataKey="total_debt" name="Total debt" fill={C.negative} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartCard>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <caption className="sr-only">Financial statements by period ({currency ?? "unknown currency"})</caption>
              <thead>
                <tr className="border-b">
                  <th scope="col" className="sticky left-0 z-10 bg-card px-3 py-2 text-left font-medium text-muted-foreground">
                    {currency ?? ""}
                  </th>
                  {rows.map((r) => (
                    <th key={r.item.period_end} scope="col" className="whitespace-nowrap px-3 py-2 text-right font-medium">
                      {r.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row) => (
                  <tr key={row.key} className="border-b last:border-0">
                    <th scope="row" className="sticky left-0 z-10 whitespace-nowrap bg-card px-3 py-2 text-left font-normal text-muted-foreground">
                      {row.term ? <Term id={row.term}>{row.label}</Term> : row.label}
                    </th>
                    {rows.map((r) => (
                      <td key={r.item.period_end} className="whitespace-nowrap px-3 py-2 text-right tabular-nums">
                        {cell(r.item, row.key, row.fmt)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function FundamentalsTab({ ticker }: FundamentalsTabProps) {
  const [period, setPeriod] = useState<Period>("annual");
  const { data, isLoading, isError, refetch, isFetching } = useGetFinancialsApiV1StockTickerFinancialsGet(
    ticker,
    { period },
    { query: { staleTime: STALE_TIME_MS } }
  );
  const financials = data?.data as FinancialsResponse | undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Fundamentals</h2>
        <div className="inline-flex rounded-md border p-0.5" role="group" aria-label="Period">
          {(["annual", "quarterly"] as const).map((p) => (
            <Button
              key={p}
              type="button"
              size="sm"
              variant={period === p ? "default" : "ghost"}
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className="h-7 px-3 capitalize"
            >
              {p}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4" aria-busy="true">
          <div className="grid gap-4 lg:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-72 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      ) : isError || !financials ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">Failed to load financial statements.</p>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : financials.items.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            No financial statements available for this ticker
          </CardContent>
        </Card>
      ) : (
        <FundamentalsContent data={financials} period={period} />
      )}

      <EducationalDisclaimer />
    </div>
  );
}

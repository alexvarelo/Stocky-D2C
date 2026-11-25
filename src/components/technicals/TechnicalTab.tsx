import { useMemo, useState } from "react";
import { Info } from "lucide-react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExplainThis } from "@/components/explain/ExplainThis";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { useStockTechnicalsApiV1StockTickerTechnicalsGet } from "@/api/technicals/technicals";
import {
  StockTechnicalsApiV1StockTickerTechnicalsGetPeriod as Period,
  type TechnicalPoint,
} from "@/api/financialDataApi.schemas";
import { cn } from "@/lib/utils";

type PeriodValue = (typeof Period)[keyof typeof Period];

const PERIODS: { value: PeriodValue; label: string }[] = [
  { value: "6mo", label: "6M" },
  { value: "1y", label: "1Y" },
  { value: "2y", label: "2Y" },
  { value: "5y", label: "5Y" },
];

type OverlayKey = "sma20" | "sma50" | "sma200" | "ema12" | "ema26" | "bollinger" | "levels";

const OVERLAYS: { key: OverlayKey; label: string; termId: string; color: string }[] = [
  { key: "sma20", label: "SMA20", termId: "sma", color: "#f59e0b" },
  { key: "sma50", label: "SMA50", termId: "sma", color: "#3b82f6" },
  { key: "sma200", label: "SMA200", termId: "sma", color: "#a855f7" },
  { key: "ema12", label: "EMA12", termId: "ema", color: "#14b8a6" },
  { key: "ema26", label: "EMA26", termId: "ema", color: "#ec4899" },
  { key: "bollinger", label: "Bollinger", termId: "bollinger-bands", color: "#94a3b8" },
  { key: "levels", label: "Support/Resistance", termId: "support-resistance", color: "#64748b" },
];

const Y_WIDTH = 52;
const SYNC_ID = "technicals";
const MARGIN = { top: 5, right: 8, bottom: 0, left: 0 };

const fmtNum = (v: number | null | undefined, digits = 2) =>
  v == null || Number.isNaN(v) ? "N/A" : v.toLocaleString(undefined, { maximumFractionDigits: digits });

const fmtCompact = (v: number | null | undefined) =>
  v == null ? "N/A" : new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(v);

const fmtTick = (d: string) => {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
};

interface ChartRow extends TechnicalPoint {
  bb?: [number, number] | null;
  hist_pos?: number | null;
}

interface TipProps {
  active?: boolean;
  label?: string;
  payload?: { name?: string; value?: number | [number, number] | null; color?: string }[];
}

function ChartTooltip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background p-2 text-xs shadow-lg">
      <p className="mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <div key={`${p.name}-${i}`} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span>{p.name}</span>
          <span className="ml-auto pl-3 tabular-nums">
            {Array.isArray(p.value) ? `${fmtNum(p.value[0])} - ${fmtNum(p.value[1])}` : fmtNum(p.value as number | null)}
          </span>
        </div>
      ))}
    </div>
  );
}

function rsiPhrase(rsi: number): string {
  if (rsi >= 70) return "above 70: often described as overbought";
  if (rsi <= 30) return "below 30: often described as oversold";
  return "between 30 and 70: in the range commonly seen as neutral";
}

interface TechnicalTabProps {
  ticker: string;
  currency?: string;
}

export default function TechnicalTab({ ticker, currency }: TechnicalTabProps) {
  const [period, setPeriod] = useState<PeriodValue>("1y");
  const [active, setActive] = useState<Record<OverlayKey, boolean>>({
    sma20: false,
    sma50: true,
    sma200: true,
    ema12: false,
    ema26: false,
    bollinger: false,
    levels: false,
  });

  const { data: response, isLoading, error } = useStockTechnicalsApiV1StockTickerTechnicalsGet(
    ticker,
    { period },
    { query: { staleTime: 15 * 60 * 1000 } },
  );
  const tech = response?.data;
  const cur = tech?.currency || currency || "";

  const rows = useMemo<ChartRow[]>(
    () =>
      (tech?.series ?? []).map((p) => ({
        ...p,
        bb: p.bb_lower != null && p.bb_upper != null ? [p.bb_lower, p.bb_upper] : null,
      })),
    [tech],
  );

  const toggle = (k: OverlayKey) => setActive((s) => ({ ...s, [k]: !s[k] }));

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error || !tech || rows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Technical analysis</CardTitle>
          <CardDescription>Technical data is not available for this instrument right now.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const latest = tech.latest;
  const rsi = latest.rsi14;
  const close = latest.close;

  const axisProps = {
    tick: { fontSize: 11 },
    tickLine: false,
    axisLine: false,
  } as const;
  const xAxis = (hide: boolean) => (
    <XAxis
      dataKey="date"
      {...axisProps}
      hide={hide}
      tickFormatter={fmtTick}
      interval="preserveStartEnd"
      minTickGap={50}
    />
  );

  const vsAvg = (label: string, termId: string, value: number | null | undefined, above: boolean | null | undefined) => (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">
        <Term id={termId}>{label}</Term>
      </p>
      <p className="font-medium tabular-nums">{fmtNum(value)}</p>
      <p className="text-xs text-muted-foreground">
        {above == null ? "Not enough history" : above ? "Price is above this average" : "Price is below this average"}
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="space-y-3 pb-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-1 text-lg">
              Technical analysis
              <ExplainThis
                context={{
                  label: "price chart with moving averages",
                  ticker,
                  value: close != null ? `last close ${fmtNum(close)}${cur ? ` ${cur}` : ""}` : undefined,
                  detail: `period ${period}`,
                }}
              />
            </CardTitle>
            <div className="flex gap-1" role="group" aria-label="Period">
              {PERIODS.map((p) => (
                <Button
                  key={p.value}
                  size="sm"
                  variant={period === p.value ? "default" : "outline"}
                  className="h-7 px-2.5 text-xs"
                  aria-pressed={period === p.value}
                  onClick={() => setPeriod(p.value)}
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Chart overlays">
            {OVERLAYS.map((o) => (
              <span
                key={o.key}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border pr-2 text-xs transition-colors",
                  active[o.key] ? "bg-accent font-medium" : "text-muted-foreground hover:bg-accent/50",
                )}
              >
                <button
                  type="button"
                  aria-pressed={active[o.key]}
                  onClick={() => toggle(o.key)}
                  className="inline-flex items-center gap-1.5 rounded-full py-1 pl-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: o.color }} />
                  {o.label}
                </button>
                <Term id={o.termId} className="no-underline">
                  <span className="sr-only">What is {o.label}?</span>
                  <Info className="h-3 w-3 opacity-60" aria-hidden />
                </Term>
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-1 p-1 sm:p-6 sm:pt-2">
          {/* Price */}
          <div className="h-72 w-full" aria-label={`Price chart for ${ticker}${cur ? ` in ${cur}` : ""}`}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={rows} syncId={SYNC_ID} margin={MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                {xAxis(true)}
                <YAxis domain={["auto", "auto"]} width={Y_WIDTH} {...axisProps} tickFormatter={(v) => fmtNum(v, 0)} />
                <Tooltip content={<ChartTooltip />} />
                {active.bollinger && (
                  <Area
                    dataKey="bb"
                    name="Bollinger"
                    stroke="#94a3b8"
                    strokeWidth={1}
                    fill="#94a3b8"
                    fillOpacity={0.15}
                    isAnimationActive={false}
                    connectNulls
                  />
                )}
                <Line dataKey="close" name="Close" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                {OVERLAYS.filter((o) => o.key !== "bollinger" && o.key !== "levels" && active[o.key]).map((o) => (
                  <Line
                    key={o.key}
                    dataKey={o.key}
                    name={o.label}
                    stroke={o.color}
                    strokeWidth={1.25}
                    dot={false}
                    connectNulls
                    isAnimationActive={false}
                  />
                ))}
                {active.levels &&
                  tech.levels.support?.map((y) => (
                    <ReferenceLine key={`s${y}`} y={y} stroke="#94a3b8" strokeDasharray="4 4" strokeOpacity={0.7} />
                  ))}
                {active.levels &&
                  tech.levels.resistance?.map((y) => (
                    <ReferenceLine key={`r${y}`} y={y} stroke="#94a3b8" strokeDasharray="4 4" strokeOpacity={0.7} />
                  ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Volume */}
          <div className="h-20 w-full">
            <p className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground sm:px-0">
              <Term id="volume">Volume</Term>
              <ExplainThis
                context={{ label: "volume chart", ticker, value: `20-day average volume ${fmtCompact(latest.avg_volume_20)}` }}
              />
            </p>
            <ResponsiveContainer width="100%" height="85%">
              <ComposedChart data={rows} syncId={SYNC_ID} margin={MARGIN}>
                {xAxis(true)}
                <YAxis width={Y_WIDTH} {...axisProps} tickFormatter={fmtCompact} tickCount={3} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="volume" name="Volume" fill="#64748b" fillOpacity={0.6} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* RSI */}
          <div className="h-32 w-full">
            <p className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground sm:px-0">
              <Term id="rsi">RSI (14)</Term>
              <ExplainThis
                context={{ label: "RSI (14)", ticker, value: fmtNum(rsi, 1) }}
              />
            </p>
            <ResponsiveContainer width="100%" height="85%">
              <ComposedChart data={rows} syncId={SYNC_ID} margin={MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                {xAxis(true)}
                <YAxis domain={[0, 100]} ticks={[0, 30, 70, 100]} width={Y_WIDTH} {...axisProps} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={70} stroke="#94a3b8" strokeDasharray="4 4" strokeOpacity={0.6} />
                <ReferenceLine y={30} stroke="#94a3b8" strokeDasharray="4 4" strokeOpacity={0.6} />
                <Line dataKey="rsi14" name="RSI" stroke="#8b5cf6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* MACD */}
          <div className="h-36 w-full">
            <p className="flex items-center gap-1 px-1 text-[11px] text-muted-foreground sm:px-0">
              <Term id="macd">MACD (12, 26, 9)</Term>
              <ExplainThis
                context={{
                  label: "MACD (12, 26, 9)",
                  ticker,
                  value: `MACD ${fmtNum(latest.macd)} vs signal ${fmtNum(latest.macd_signal)}`,
                }}
              />
            </p>
            <ResponsiveContainer width="100%" height="88%">
              <ComposedChart data={rows} syncId={SYNC_ID} margin={MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                {xAxis(false)}
                <YAxis width={Y_WIDTH} {...axisProps} tickFormatter={(v) => fmtNum(v, 1)} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={0} stroke="#64748b" strokeOpacity={0.6} />
                <Bar dataKey="macd_hist" name="Histogram" fill="#94a3b8" fillOpacity={0.6} isAnimationActive={false} />
                <Line dataKey="macd" name="MACD" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line dataKey="macd_signal" name="Signal" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Current readings</CardTitle>
          <CardDescription>
            Descriptive only{close != null ? `. Last close: ${fmtNum(close)}${cur ? ` ${cur}` : ""}` : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">
                <Term id="rsi">RSI (14)</Term>
              </p>
              <p className="font-medium tabular-nums">{fmtNum(rsi, 1)}</p>
              <p className="text-xs text-muted-foreground">{rsi == null ? "Not enough history" : rsiPhrase(rsi)}</p>
            </div>
            {vsAvg("SMA50", "sma", latest.sma50, latest.above_sma50)}
            {vsAvg("SMA200", "sma", latest.sma200, latest.above_sma200)}
            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">
                <Term id="average-volume">Average volume</Term>
              </p>
              <p className="font-medium tabular-nums">20d: {fmtCompact(latest.avg_volume_20)}</p>
              <p className="text-xs text-muted-foreground tabular-nums">50d: {fmtCompact(latest.avg_volume_50)}</p>
            </div>
          </div>
          <div className="rounded-lg border p-3 text-sm">
            <p className="text-xs text-muted-foreground">
              <Term id="macd">MACD</Term>
            </p>
            <p>
              MACD {fmtNum(latest.macd)} vs signal {fmtNum(latest.macd_signal)}
              {latest.macd != null && latest.macd_signal != null
                ? latest.macd > latest.macd_signal
                  ? ": MACD is above its signal line."
                  : ": MACD is below its signal line."
                : "."}
            </p>
          </div>
          {(latest.golden_cross_recent || latest.death_cross_recent) && (
            <div className="rounded-lg border p-3 text-sm">
              <Term id="ma-crossover">Moving average crossover</Term>
              {latest.golden_cross_recent && (
                <p className="text-muted-foreground">
                  The SMA50 crossed above the SMA200 recently (a golden cross).
                </p>
              )}
              {latest.death_cross_recent && (
                <p className="text-muted-foreground">
                  The SMA50 crossed below the SMA200 recently (a death cross).
                </p>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Indicators describe past prices; they are not reliable signals on their own.
          </p>
        </CardContent>
      </Card>

      <EducationalDisclaimer />
    </div>
  );
}

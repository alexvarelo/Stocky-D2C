import { useMemo } from "react";
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
import { useStockTechnicalsApiV1StockTickerTechnicalsGet } from "@/api/technicals/technicals";
import type { TechnicalPoint, TechnicalsResponse } from "@/api/financialDataApi.schemas";
import { Term } from "@/components/glossary/Term";
import {
  CHART_AXIS,
  CHART_MARGIN,
  ChartTitle,
  Reading,
  TOOLTIP_STYLE,
  WidgetError,
  WidgetLoading,
  fmtNum,
  fmtTick,
  type WidgetProps,
} from "./shared";

const MAX_POINTS = 130;

function useTechnicals(ticker: string) {
  const q = useStockTechnicalsApiV1StockTickerTechnicalsGet(
    ticker,
    { period: "1y" },
    { query: { staleTime: 15 * 60 * 1000, retry: 1 } },
  );
  const tech = q.data?.data as TechnicalsResponse | undefined;
  const rows = useMemo<(TechnicalPoint & { bb?: [number, number] | null })[]>(
    () =>
      (tech?.series ?? []).slice(-MAX_POINTS).map((p) => ({
        ...p,
        bb: p.bb_lower != null && p.bb_upper != null ? [p.bb_lower, p.bb_upper] : null,
      })),
    [tech],
  );
  return { ...q, tech, rows };
}

function Frame({ ticker, children }: { ticker: string; children: (_t: TechnicalsResponse, _rows: TechnicalPoint[]) => React.ReactNode }) {
  const { tech, rows, isLoading, isError } = useTechnicals(ticker);
  if (isLoading) return <WidgetLoading />;
  if (isError || !tech || rows.length === 0) return <WidgetError />;
  return <>{children(tech, rows)}</>;
}

const xAxis = (
  <XAxis dataKey="date" {...CHART_AXIS} tickFormatter={fmtTick} interval="preserveStartEnd" minTickGap={50} />
);

function Box({ h = "h-48", children }: { h?: string; children: React.ReactElement }) {
  return (
    <div className={`${h} w-full`}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export function RsiWidget({ ticker }: WidgetProps) {
  return (
    <Frame ticker={ticker}>
      {(tech, rows) => {
        const rsi = tech.latest.rsi14;
        return (
          <div className="space-y-3">
            <Reading
              label={<Term id="rsi">RSI (14)</Term>}
              value={fmtNum(rsi, 1)}
              note={
                rsi == null
                  ? "Not enough history"
                  : rsi >= 70
                    ? "Above 70: often described as overbought"
                    : rsi <= 30
                      ? "Below 30: often described as oversold"
                      : "Between 30 and 70: the range commonly seen as neutral"
              }
            />
            <ChartTitle explain={{ label: "RSI (14) chart", ticker, value: fmtNum(rsi, 1) }}>
              <Term id="rsi">RSI</Term> over the last year
            </ChartTitle>
            <Box h="h-40">
              <ComposedChart data={rows} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                {xAxis}
                <YAxis domain={[0, 100]} ticks={[0, 30, 70, 100]} width={36} {...CHART_AXIS} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmtNum(v, 1)} />
                <ReferenceLine y={70} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.6} />
                <ReferenceLine y={30} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.6} />
                <Line dataKey="rsi14" name="RSI" stroke="#8b5cf6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </ComposedChart>
            </Box>
          </div>
        );
      }}
    </Frame>
  );
}

export function MovingAveragesWidget({ ticker }: WidgetProps) {
  return (
    <Frame ticker={ticker}>
      {(tech, rows) => {
        const l = tech.latest;
        const pos = (above: boolean | null | undefined) =>
          above == null ? "Not enough history" : above ? "Price is above this average" : "Price is below this average";
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Reading label={<Term id="sma">SMA 50</Term>} value={fmtNum(l.sma50)} note={pos(l.above_sma50)} />
              <Reading label={<Term id="sma">SMA 200</Term>} value={fmtNum(l.sma200)} note={pos(l.above_sma200)} />
            </div>
            {(l.golden_cross_recent || l.death_cross_recent) && (
              <p className="text-xs text-muted-foreground">
                <Term id="ma-crossover">{l.golden_cross_recent ? "A golden cross" : "A death cross"}</Term> happened recently.
              </p>
            )}
            <ChartTitle
              explain={{ label: "price with 50 and 200 day moving averages", ticker, value: `last close ${fmtNum(l.close)}` }}
            >
              Close, <Term id="sma">SMA</Term> 50 and 200
            </ChartTitle>
            <Box>
              <ComposedChart data={rows} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                {xAxis}
                <YAxis domain={["auto", "auto"]} width={44} {...CHART_AXIS} tickFormatter={(v) => fmtNum(v, 0)} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmtNum(v)} />
                <Line dataKey="close" name="Close" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line dataKey="sma50" name="SMA 50" stroke="#3b82f6" strokeWidth={1.25} dot={false} connectNulls isAnimationActive={false} />
                <Line dataKey="sma200" name="SMA 200" stroke="#a855f7" strokeWidth={1.25} dot={false} connectNulls isAnimationActive={false} />
              </ComposedChart>
            </Box>
          </div>
        );
      }}
    </Frame>
  );
}

export function MacdWidget({ ticker }: WidgetProps) {
  return (
    <Frame ticker={ticker}>
      {(tech, rows) => {
        const { macd, macd_signal } = tech.latest;
        return (
          <div className="space-y-3">
            <Reading
              label={<Term id="macd">MACD (12, 26, 9)</Term>}
              value={`${fmtNum(macd)} / ${fmtNum(macd_signal)}`}
              note={
                macd == null || macd_signal == null
                  ? "Not enough history"
                  : macd > macd_signal
                    ? "MACD is above its signal line"
                    : "MACD is below its signal line"
              }
            />
            <ChartTitle explain={{ label: "MACD chart", ticker, value: `MACD ${fmtNum(macd)}, signal ${fmtNum(macd_signal)}` }}>
              <Term id="macd">MACD</Term>, signal and histogram
            </ChartTitle>
            <Box h="h-40">
              <ComposedChart data={rows} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                {xAxis}
                <YAxis width={40} {...CHART_AXIS} tickFormatter={(v) => fmtNum(v, 1)} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmtNum(v)} />
                <ReferenceLine y={0} stroke="#64748b" strokeOpacity={0.6} />
                <Bar dataKey="macd_hist" name="Histogram" fill="#94a3b8" fillOpacity={0.6} isAnimationActive={false} />
                <Line dataKey="macd" name="MACD" stroke="#3b82f6" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line dataKey="macd_signal" name="Signal" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </ComposedChart>
            </Box>
          </div>
        );
      }}
    </Frame>
  );
}

export function BollingerWidget({ ticker }: WidgetProps) {
  return (
    <Frame ticker={ticker}>
      {(tech, rows) => {
        const last = rows[rows.length - 1];
        const { close, bb_upper, bb_lower } = last;
        const pos =
          close != null && bb_upper != null && bb_lower != null && bb_upper > bb_lower
            ? ((close - bb_lower) / (bb_upper - bb_lower)) * 100
            : null;
        return (
          <div className="space-y-3">
            <Reading
              label={<Term id="bollinger-bands">Position inside the bands</Term>}
              value={pos == null ? "N/A" : `${pos.toFixed(0)}%`}
              note={
                pos == null
                  ? "Not enough history"
                  : "0% is the lower band, 100% the upper band. Values outside that range mean the price is beyond a band."
              }
            />
            <ChartTitle explain={{ label: "Bollinger Bands chart", ticker, value: `last close ${fmtNum(close)}` }}>
              Close with <Term id="bollinger-bands">Bollinger Bands</Term> (20, 2)
            </ChartTitle>
            <Box>
              <ComposedChart data={rows} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                {xAxis}
                <YAxis domain={["auto", "auto"]} width={44} {...CHART_AXIS} tickFormatter={(v) => fmtNum(v, 0)} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number | number[]) => (Array.isArray(v) ? `${fmtNum(v[0])} - ${fmtNum(v[1])}` : fmtNum(v))} />
                <Area dataKey="bb" name="Bands" stroke="#94a3b8" strokeWidth={1} fill="#94a3b8" fillOpacity={0.15} isAnimationActive={false} connectNulls />
                <Line dataKey="close" name="Close" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line dataKey="bb_middle" name="Middle (SMA 20)" stroke="#f59e0b" strokeWidth={1} dot={false} connectNulls isAnimationActive={false} />
              </ComposedChart>
            </Box>
            <p className="sr-only">{tech.ticker}</p>
          </div>
        );
      }}
    </Frame>
  );
}

const fmtCompact = (v: number | null | undefined) =>
  v == null ? "N/A" : new Intl.NumberFormat(undefined, { notation: "compact", maximumFractionDigits: 1 }).format(v);

export function VolumeWidget({ ticker }: WidgetProps) {
  return (
    <Frame ticker={ticker}>
      {(tech, rows) => {
        const last = rows[rows.length - 1].volume;
        const avg = tech.latest.avg_volume_20;
        const ratio = last != null && avg ? last / avg : null;
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Reading label={<Term id="volume">Last session volume</Term>} value={fmtCompact(last)} />
              <Reading
                label={<Term id="average-volume">20-day average</Term>}
                value={fmtCompact(avg)}
                note={ratio == null ? undefined : `Last session was ${ratio.toFixed(1)}x the average`}
              />
            </div>
            <ChartTitle explain={{ label: "volume chart", ticker, value: `last session ${fmtCompact(last)}, 20-day average ${fmtCompact(avg)}` }}>
              <Term id="volume">Volume</Term> over the last year
            </ChartTitle>
            <Box h="h-36">
              <ComposedChart data={rows} margin={CHART_MARGIN}>
                {xAxis}
                <YAxis width={40} {...CHART_AXIS} tickFormatter={fmtCompact} tickCount={3} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmtCompact(v)} />
                <Bar dataKey="volume" name="Volume" fill="#64748b" fillOpacity={0.7} isAnimationActive={false} />
              </ComposedChart>
            </Box>
          </div>
        );
      }}
    </Frame>
  );
}

export function SupportResistanceWidget({ ticker }: WidgetProps) {
  return (
    <Frame ticker={ticker}>
      {(tech, rows) => {
        const support = tech.levels.support ?? [];
        const resistance = tech.levels.resistance ?? [];
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <Reading
                label={<Term id="support-resistance">Support levels</Term>}
                value={support.length ? support.map((v) => fmtNum(v, 0)).join(", ") : "None found"}
              />
              <Reading
                label={<Term id="support-resistance">Resistance levels</Term>}
                value={resistance.length ? resistance.map((v) => fmtNum(v, 0)).join(", ") : "None found"}
              />
            </div>
            <ChartTitle explain={{ label: "price chart with support and resistance levels", ticker, value: `last close ${fmtNum(tech.latest.close)}` }}>
              Close with <Term id="support-resistance">support and resistance</Term> levels
            </ChartTitle>
            <Box>
              <ComposedChart data={rows} margin={CHART_MARGIN}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                {xAxis}
                <YAxis domain={["auto", "auto"]} width={44} {...CHART_AXIS} tickFormatter={(v) => fmtNum(v, 0)} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmtNum(v)} />
                <Line dataKey="close" name="Close" stroke="#10b981" strokeWidth={2} dot={false} isAnimationActive={false} />
                {support.map((y) => (
                  <ReferenceLine key={`s${y}`} y={y} stroke="#10b981" strokeDasharray="4 4" strokeOpacity={0.7} />
                ))}
                {resistance.map((y) => (
                  <ReferenceLine key={`r${y}`} y={y} stroke="#ef4444" strokeDasharray="4 4" strokeOpacity={0.7} />
                ))}
              </ComposedChart>
            </Box>
          </div>
        );
      }}
    </Frame>
  );
}

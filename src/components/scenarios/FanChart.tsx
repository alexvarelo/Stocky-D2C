import { useMemo } from "react";
import { Area, ComposedChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PercentilePoint } from "@/api/financialDataApi.schemas";
import { fmtMoney } from "./format";

const TRADING_DAYS_PER_YEAR = 252;

interface Props {
  percentiles: PercentilePoint[];
  currency: string;
  height?: number;
}

/** Fan chart: outer band p5-p95, inner band p25-p75, median line. X axis in years. */
export function FanChart({ percentiles, currency, height = 300 }: Props) {
  const data = useMemo(
    () =>
      percentiles.map((p) => ({
        year: p.day / TRADING_DAYS_PER_YEAR,
        outer: [p.p5, p.p95] as [number, number],
        inner: [p.p25, p.p75] as [number, number],
        p5: p.p5,
        p25: p.p25,
        p50: p.p50,
        p75: p.p75,
        p95: p.p95,
      })),
    [percentiles],
  );
  const maxYear = data.length ? data[data.length - 1].year : 1;

  return (
    <div style={{ height }} className="w-full" role="img" aria-label="Fan chart of simulated portfolio value over time with 5th to 95th percentile range and median">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
          <XAxis
            dataKey="year"
            type="number"
            domain={[0, maxYear]}
            tickFormatter={(v: number) => `${Number.isInteger(v) ? v : v.toFixed(1)}y`}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            width={52}
            tickFormatter={(v: number) => fmtMoney(v, currency, true)}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            tickLine={false}
            axisLine={false}
            domain={["auto", "auto"]}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as (typeof data)[number];
              return (
                <div className="rounded-xl border border-border bg-popover p-2.5 text-xs shadow-md space-y-0.5">
                  <p className="font-semibold">Year {d.year.toFixed(1)}</p>
                  <p>95th: {fmtMoney(d.p95, currency)}</p>
                  <p>75th: {fmtMoney(d.p75, currency)}</p>
                  <p className="font-medium">Median: {fmtMoney(d.p50, currency)}</p>
                  <p>25th: {fmtMoney(d.p25, currency)}</p>
                  <p>5th: {fmtMoney(d.p5, currency)}</p>
                </div>
              );
            }}
          />
          <Area type="monotone" dataKey="outer" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.15} isAnimationActive={false} />
          <Area type="monotone" dataKey="inner" stroke="none" fill="hsl(var(--primary))" fillOpacity={0.3} isAnimationActive={false} />
          <Line type="monotone" dataKey="p50" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

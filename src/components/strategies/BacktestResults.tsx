import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { BacktestMetrics, BacktestResponse } from "@/api/financialDataApi.schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ExplainThis } from "@/components/explain/ExplainThis";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { fmtMoney, fmtNum, fmtPct } from "@/components/scenarios/format";
import { SaveButton } from "@/components/scenarios/shared";
import { TEMPLATES } from "./templates";

interface Props {
  result: BacktestResponse;
  onSave: (_name: string) => Promise<unknown>;
  saving?: boolean;
}

type Row = { label: React.ReactNode; get: (_m: BacktestMetrics) => string };

export function BacktestResults({ result, onSave, saving }: Props) {
  const cur = result.base_currency;
  const [showTrades, setShowTrades] = useState(false);
  const tpl = TEMPLATES.find((t) => t.id === result.strategy);
  const data = useMemo(() => result.equity_curve, [result.equity_curve]);

  const rows: Row[] = [
    { label: "Final value", get: (m) => fmtMoney(m.final_value, cur) },
    { label: "Total invested", get: (m) => fmtMoney(m.total_invested, cur) },
    { label: <Term id="total-return">Total return</Term>, get: (m) => fmtPct(m.total_return, 1, true) },
    { label: <Term id="cagr">CAGR</Term>, get: (m) => fmtPct(m.cagr, 1, true) },
    { label: <Term id="max-drawdown">Max drawdown</Term>, get: (m) => fmtPct(m.max_drawdown, 1) },
    { label: <Term id="volatility">Volatility</Term>, get: (m) => fmtPct(m.volatility_annual, 1) },
    { label: "Trades", get: (m) => String(m.trades) },
    { label: "Time in market", get: (m) => fmtPct(m.time_in_market, 0) },
  ];

  return (
    <Card className="rounded-3xl border-border/50">
      <CardContent className="p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="flex items-center gap-1 font-semibold">
              <span>
                <Term id="backtest">Backtest</Term> result{tpl ? ` · ${tpl.name}` : ""}
              </span>
              <ExplainThis
                context={{
                  label: `backtest of the ${tpl?.name ?? result.strategy} strategy against buy and hold`,
                  value: `strategy total return ${fmtPct(result.metrics.strategy.total_return, 1, true)} vs buy and hold ${fmtPct(result.metrics.benchmark.total_return, 1, true)}`,
                  detail: `${result.start_date} to ${result.end_date}`,
                }}
              />
            </h3>
            <p className="text-xs text-muted-foreground">
              {result.start_date} to {result.end_date}. This strategy would have produced the values below; past results do not predict future results.
            </p>
          </div>
          <SaveButton label="Save strategy" title="Save strategy" defaultName={tpl?.name} saving={saving} onSave={onSave} />
        </div>

        <div style={{ height: 300 }} className="w-full" role="img" aria-label="Equity curve of the strategy versus buy and hold and money invested">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} minTickGap={40} tickFormatter={(d: string) => d.slice(0, 7)} />
              <YAxis width={52} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => fmtMoney(v, cur, true)} domain={["auto", "auto"]} />
              <Tooltip
                formatter={(v: number, name: string) => [fmtMoney(v, cur), name]}
                contentStyle={{ borderRadius: 12, fontSize: 12, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))" }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="strategy_value" name="Strategy" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="benchmark_value" name="Buy and hold" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="stepAfter" dataKey="invested" name="Money invested" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 3" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm min-w-[320px]">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border/50">
                <th className="text-left font-medium p-2.5">Metric</th>
                <th className="text-right font-medium p-2.5">Strategy</th>
                <th className="text-right font-medium p-2.5">Buy and hold</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/30 last:border-0">
                  <td className="p-2.5 text-muted-foreground">{r.label}</td>
                  <td className="p-2.5 text-right tabular-nums font-medium">{r.get(result.metrics.strategy)}</td>
                  <td className="p-2.5 text-right tabular-nums">{r.get(result.metrics.benchmark)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {result.notes.length > 0 && (
          <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
            {result.notes.map((n) => <li key={n}>{n}</li>)}
          </ul>
        )}

        <Collapsible open={showTrades} onOpenChange={setShowTrades}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground">
              <ChevronDown className={`h-4 w-4 transition-transform ${showTrades ? "rotate-180" : ""}`} aria-hidden />
              {showTrades ? "Hide" : "Show"} trades ({result.trades.length}, most recent 200)
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            {result.trades.length === 0 ? (
              <p className="text-sm text-muted-foreground mt-2">No trades were made in this period.</p>
            ) : (
              <div className="overflow-auto max-h-80 rounded-xl border border-border/50 mt-2">
                <table className="w-full text-sm min-w-[420px]">
                  <thead className="text-xs text-muted-foreground sticky top-0 bg-card">
                    <tr className="border-b border-border/50">
                      <th className="text-left font-medium p-2">Date</th>
                      <th className="text-left font-medium p-2">Ticker</th>
                      <th className="text-left font-medium p-2">Side</th>
                      <th className="text-right font-medium p-2">Quantity</th>
                      <th className="text-right font-medium p-2">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.trades.map((t, i) => (
                      <tr key={i} className="border-b border-border/30 last:border-0">
                        <td className="p-2 whitespace-nowrap">{t.date}</td>
                        <td className="p-2 font-medium">{t.ticker}</td>
                        <td className="p-2 capitalize">{t.side}</td>
                        <td className="p-2 text-right tabular-nums">{fmtNum(t.quantity, 4)}</td>
                        <td className="p-2 text-right tabular-nums">{fmtNum(t.price, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
        <EducationalDisclaimer />
      </CardContent>
    </Card>
  );
}

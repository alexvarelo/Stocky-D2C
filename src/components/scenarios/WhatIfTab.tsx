import { useMemo, useState } from "react";
import { Play, Plus, X } from "lucide-react";
import { useWhatifApiV1ScenariosWhatifPost } from "@/api/scenarios/scenarios";
import { MonteCarloRequestLookback, type RiskSnapshot, type WhatIfResponse } from "@/api/financialDataApi.schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { StockSearch } from "@/components/stock/StockSearch";
import { apiErrorMessage } from "@/lib/apiError";
import { fmtMoney, fmtNum, fmtPct, toneClass } from "./format";
import { ErrorBox, ExcludedNote, ResultsSkeleton, SaveButton } from "./shared";
import { HorizonLookbackInputs, PATHS, SIM_EXPLAINER } from "./MonteCarloTab";
import type { TabProps } from "./StressTab";

interface Row {
  ticker: string;
  quantity: string;
}

const asRows = (v: unknown): Row[] =>
  Array.isArray(v)
    ? (v as { ticker: string; quantity: number }[]).map((r) => ({ ticker: r.ticker, quantity: String(r.quantity) }))
    : [];

function Compare({
  label,
  current,
  modified,
  format,
  delta,
  lowerIsBetter: _lowerIsBetter,
}: {
  label: React.ReactNode;
  current: number | null | undefined;
  modified: number | null | undefined;
  format: (_v: number | null | undefined) => string;
  delta?: number | null;
  lowerIsBetter?: boolean;
}) {
  const d = delta ?? (current != null && modified != null ? modified - current : null);
  return (
    <tr className="border-b border-border/30 last:border-0">
      <td className="p-2.5 text-muted-foreground">{label}</td>
      <td className="p-2.5 text-right tabular-nums">{format(current)}</td>
      <td className="p-2.5 text-right tabular-nums font-medium">{format(modified)}</td>
      <td className={`p-2.5 text-right tabular-nums ${toneClass(d)}`}>
        {d == null || !Number.isFinite(d) ? "—" : (d > 0 ? "+" : "") + format(d)}
      </td>
    </tr>
  );
}

export function WhatIfTab({ positions, baseCurrency, initial, onSave, saving }: TabProps) {
  const held = useMemo(() => new Map(positions.map((p) => [p.ticker, p.quantity])), [positions]);
  const [sell, setSell] = useState<Row[]>(asRows(initial?.sell));
  const [buy, setBuy] = useState<Row[]>(asRows(initial?.buy));
  const [horizon, setHorizon] = useState<number>(typeof initial?.horizon_years === "number" ? initial.horizon_years : 3);
  const [lookback, setLookback] = useState<MonteCarloRequestLookback>(
    (initial?.lookback as MonteCarloRequestLookback) ?? MonteCarloRequestLookback["5y"],
  );
  const [contribution, setContribution] = useState<string>(String(initial?.monthly_contribution ?? 0));
  const [newContribution, setNewContribution] = useState<string>(
    typeof initial?.new_monthly_contribution === "number" ? String(initial.new_monthly_contribution) : "",
  );
  const mutation = useWhatifApiV1ScenariosWhatifPost();
  const result: WhatIfResponse | undefined = mutation.data?.data;

  const sellValid = sell.every((r) => {
    const q = Number(r.quantity);
    const max = held.get(r.ticker) ?? 0;
    return r.ticker && Number.isFinite(q) && q > 0 && q <= max;
  });
  const buyValid = buy.every((r) => r.ticker && Number(r.quantity) > 0 && Number.isFinite(Number(r.quantity)));
  const contribNum = Number(contribution);
  const contribValid = contribution.trim() !== "" && Number.isFinite(contribNum) && contribNum >= 0;
  const newNum = Number(newContribution);
  const newValid = newContribution.trim() === "" || (Number.isFinite(newNum) && newNum >= 0);
  const hasChanges = sell.length + buy.length > 0 || newContribution.trim() !== "";
  const canRun = sellValid && buyValid && contribValid && newValid && hasChanges && positions.length > 0;

  const params = {
    sell: sell.map((r) => ({ ticker: r.ticker, quantity: Number(r.quantity) })),
    buy: buy.map((r) => ({ ticker: r.ticker, quantity: Number(r.quantity) })),
    horizon_years: horizon,
    lookback,
    monthly_contribution: contribValid ? contribNum : 0,
    ...(newContribution.trim() !== "" && newValid ? { new_monthly_contribution: newNum } : {}),
  };

  const run = () =>
    mutation.mutate({
      data: {
        current: {
          positions,
          base_currency: baseCurrency,
          horizon_years: horizon,
          paths: PATHS,
          monthly_contribution: params.monthly_contribution,
          lookback,
        },
        changes: {
          sell: params.sell,
          buy: params.buy,
          ...(newContribution.trim() !== "" && newValid ? { monthly_contribution: newNum } : {}),
        },
      },
    });

  const unusedHeld = positions.filter((p) => !sell.some((r) => r.ticker === p.ticker));
  const cur = result?.base_currency ?? baseCurrency;
  const rc: RiskSnapshot | undefined = result?.risk_current;
  const rm: RiskSnapshot | undefined = result?.risk_modified;

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">What if</CardTitle>
          <p className="text-sm text-muted-foreground">
            Try hypothetical changes to your holdings and compare the simulated outcomes side by side. Nothing is traded. {SIM_EXPLAINER}
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Hypothetical sales (held tickers only)</Label>
            {sell.map((r, i) => {
              const max = held.get(r.ticker) ?? 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <Select value={r.ticker} onValueChange={(v) => setSell((p) => p.map((x, j) => (j === i ? { ...x, ticker: v } : x)))}>
                    <SelectTrigger className="w-32 sm:w-40" aria-label="Ticker to sell">
                      <SelectValue placeholder="Ticker" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...unusedHeld, ...positions.filter((p) => p.ticker === r.ticker)].map((p) => (
                        <SelectItem key={p.ticker} value={p.ticker}>
                          {p.ticker}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={max || undefined}
                    step="any"
                    aria-label={`Quantity of ${r.ticker || "ticker"} to sell`}
                    className="w-28"
                    value={r.quantity}
                    onChange={(e) => setSell((p) => p.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))}
                  />
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{r.ticker ? `of ${max}` : ""}</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Remove sale" onClick={() => setSell((p) => p.filter((_, j) => j !== i))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
            {unusedHeld.length > 0 && (
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setSell((p) => [...p, { ticker: "", quantity: "" }])}>
                <Plus className="h-4 w-4" aria-hidden /> Add sale
              </Button>
            )}
            {!sellValid && <p className="text-xs text-destructive">Pick a ticker and a quantity up to what you hold.</p>}
          </div>

          <div className="space-y-2">
            <Label>Hypothetical purchases</Label>
            {buy.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex-1 min-w-0 max-w-xs">
                  {r.ticker ? (
                    <div className="flex h-10 items-center justify-between rounded-md border border-input px-3 text-sm font-medium">
                      {r.ticker}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        aria-label="Change ticker"
                        onClick={() => setBuy((p) => p.map((x, j) => (j === i ? { ...x, ticker: "" } : x)))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <StockSearch
                      placeholder="Search ticker..."
                      onSelect={(s) => setBuy((p) => p.map((x, j) => (j === i ? { ...x, ticker: s.symbol.toUpperCase() } : x)))}
                    />
                  )}
                </div>
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="any"
                  aria-label="Quantity to buy"
                  className="w-24 sm:w-28"
                  value={r.quantity}
                  onChange={(e) => setBuy((p) => p.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Remove purchase" onClick={() => setBuy((p) => p.filter((_, j) => j !== i))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setBuy((p) => [...p, { ticker: "", quantity: "" }])}>
              <Plus className="h-4 w-4" aria-hidden /> Add purchase
            </Button>
            {!buyValid && <p className="text-xs text-destructive">Pick a ticker and a quantity above zero.</p>}
          </div>

          <HorizonLookbackInputs
            horizon={horizon}
            setHorizon={setHorizon}
            lookback={lookback}
            setLookback={setLookback}
            contribution={contribution}
            setContribution={setContribution}
            contributionLabel="Current monthly contribution"
          />
          <div className="space-y-2 max-w-xs">
            <Label htmlFor="wi-new-contrib">Modified monthly contribution (optional)</Label>
            <Input
              id="wi-new-contrib"
              type="number"
              inputMode="decimal"
              min={0}
              step={50}
              placeholder="Same as current"
              value={newContribution}
              onChange={(e) => setNewContribution(e.target.value)}
            />
          </div>
          <Button onClick={run} disabled={mutation.isPending || !canRun} className="gap-2">
            <Play className="h-4 w-4" aria-hidden />
            {result ? "Compare again" : "Compare"}
          </Button>
          {!hasChanges && <p className="text-xs text-muted-foreground">Add at least one change to compare.</p>}
        </CardContent>
      </Card>

      {mutation.isPending && <ResultsSkeleton />}
      {mutation.isError && !mutation.isPending && <ErrorBox message={apiErrorMessage(mutation.error)} onRetry={run} />}

      {result && !mutation.isPending && (
        <Card className="rounded-3xl border-border/50">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">Current vs modified ({result.horizon_years}y simulation)</h3>
              <SaveButton
                label="Save scenario"
                title="Save what-if"
                defaultName="What if"
                saving={saving}
                onSave={(name) =>
                  onSave(name, params, {
                    base_currency: result.base_currency,
                    current: { p5: result.current.final.p5, p50: result.current.final.p50, p95: result.current.final.p95, prob_loss: result.current.prob_loss },
                    modified: { p5: result.modified.final.p5, p50: result.modified.final.p50, p95: result.modified.final.p95, prob_loss: result.modified.prob_loss },
                    delta: result.delta,
                  })
                }
              />
            </div>
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm min-w-[420px]">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <th className="text-left font-medium p-2.5">Metric</th>
                    <th className="text-right font-medium p-2.5">Current</th>
                    <th className="text-right font-medium p-2.5">Modified</th>
                    <th className="text-right font-medium p-2.5">Change</th>
                  </tr>
                </thead>
                <tbody>
                  <Compare label={<Term id="percentile">5th percentile</Term>} current={result.current.final.p5} modified={result.modified.final.p5} delta={result.delta.p5} format={(v) => fmtMoney(v, cur)} />
                  <Compare label="Median (50th)" current={result.current.final.p50} modified={result.modified.final.p50} delta={result.delta.p50} format={(v) => fmtMoney(v, cur)} />
                  <Compare label="95th percentile" current={result.current.final.p95} modified={result.modified.final.p95} format={(v) => fmtMoney(v, cur)} />
                  <Compare label="Probability of loss" current={result.current.prob_loss} modified={result.modified.prob_loss} delta={result.delta.prob_loss} format={(v) => fmtPct(v, 1)} />
                  <Compare label={<Term id="volatility">Volatility</Term>} current={rc?.volatility_annual} modified={rm?.volatility_annual} format={(v) => fmtPct(v, 1)} />
                  <Compare label={<Term id="beta">Beta</Term>} current={rc?.beta} modified={rm?.beta} format={(v) => fmtNum(v)} />
                  <Compare label={<Term id="max-drawdown">Max drawdown</Term>} current={rc?.max_drawdown} modified={rm?.max_drawdown} format={(v) => fmtPct(v, 1)} />
                  <Compare label={<Term id="concentration-hhi">Concentration (HHI)</Term>} current={rc?.hhi} modified={rm?.hhi} format={(v) => fmtNum(v, 3)} />
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {result.paths.toLocaleString()} simulated paths and {result.observations.toLocaleString()} daily observations from the last{" "}
              {result.lookback_used}. This shows how the simulated range would differ, not what you should do. Past results do not predict future results.
            </p>
            <ExcludedNote excluded={result.excluded} />
            <EducationalDisclaimer />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

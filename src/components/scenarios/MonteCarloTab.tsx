import { useState } from "react";
import { Play } from "lucide-react";
import { useMontecarloApiV1ScenariosMontecarloPost } from "@/api/scenarios/scenarios";
import type { MonteCarloRequestLookback, MonteCarloResponse } from "@/api/financialDataApi.schemas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ExplainThis } from "@/components/explain/ExplainThis";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { apiErrorMessage } from "@/lib/apiError";
import { FanChart } from "./FanChart";
import { MAX_AMOUNT, fmtMoney, fmtPct } from "./format";
import { isAmount, loadAmount, loadHorizon, loadLookback } from "./params";
import { ChangedHint, ErrorBox, ExcludedNote, ResultsSkeleton, SaveButton, Stat } from "./shared";
import type { TabProps } from "./StressTab";

export const PATHS = 5000;

export function HorizonLookbackInputs({
  idPrefix = "mc",
  horizon,
  setHorizon,
  lookback,
  setLookback,
  contribution,
  setContribution,
  contributionLabel = "Monthly contribution",
}: {
  idPrefix?: string;
  horizon: number;
  setHorizon: (_n: number) => void;
  lookback: MonteCarloRequestLookback;
  setLookback: (_l: MonteCarloRequestLookback) => void;
  contribution: string;
  setContribution: (_s: string) => void;
  contributionLabel?: string;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <Label id={`${idPrefix}-horizon`}>Horizon</Label>
        <ToggleGroup
          aria-labelledby={`${idPrefix}-horizon`}
          type="single"
          variant="outline"
          value={String(horizon)}
          onValueChange={(v) => v && setHorizon(Number(v))}
          className="justify-start"
        >
          {[1, 2, 3, 4, 5].map((y) => (
            <ToggleGroupItem key={y} value={String(y)} aria-label={`${y} years`} className="px-3">
              {y}y
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-contrib`}>{contributionLabel}</Label>
        <Input
          id={`${idPrefix}-contrib`}
          max={MAX_AMOUNT}
          type="number"
          inputMode="decimal"
          min={0}
          step={50}
          value={contribution}
          onChange={(e) => setContribution(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label id={`${idPrefix}-lookback`}>Past data used</Label>
        <ToggleGroup
          aria-labelledby={`${idPrefix}-lookback`}
          type="single"
          variant="outline"
          value={lookback}
          onValueChange={(v) => v && setLookback(v as MonteCarloRequestLookback)}
          className="justify-start"
        >
          {(["3y", "5y", "10y"] as const).map((l) => (
            <ToggleGroupItem key={l} value={l} aria-label={`${l} of history`} className="px-3">
              {l}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}

interface Params {
  horizon_years: number;
  lookback: MonteCarloRequestLookback;
  monthly_contribution: number;
}

export const SIM_EXPLAINER =
  "This is a simulation built by reshuffling your holdings' past daily returns. It shows a range of possible outcomes and is not a forecast.";

export function MonteCarloTab({ positions, baseCurrency, initial, onSave, saving }: TabProps) {
  const [horizon, setHorizon] = useState<number>(loadHorizon(initial?.horizon_years));
  const [lookback, setLookback] = useState<MonteCarloRequestLookback>(loadLookback(initial?.lookback));
  const [contribution, setContribution] = useState<string>(loadAmount(initial?.monthly_contribution));
  const [ran, setRan] = useState<Params | null>(null);
  const mutation = useMontecarloApiV1ScenariosMontecarloPost();
  const result: MonteCarloResponse | undefined = mutation.data?.data;

  const contribNum = Number(contribution);
  const valid = isAmount(contribution);
  const params: Params = { horizon_years: horizon, lookback, monthly_contribution: valid ? contribNum : 0 };
  const changed = !!result && !!ran && JSON.stringify(ran) !== JSON.stringify(params);

  const run = () => {
    setRan(params);
    mutation.mutate({
      data: { positions, base_currency: baseCurrency!, paths: PATHS, ...params },
    });
  };

  const cur = result?.base_currency ?? baseCurrency ?? "USD";

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <Term id="monte-carlo">Monte Carlo simulation</Term>
          </CardTitle>
          <p className="text-sm text-muted-foreground">{SIM_EXPLAINER}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <HorizonLookbackInputs
            horizon={horizon}
            setHorizon={setHorizon}
            lookback={lookback}
            setLookback={setLookback}
            contribution={contribution}
            setContribution={setContribution}
          />
          {!valid && <p className="text-xs text-destructive">Contribution must be between 0 and 1,000,000,000.</p>}
          <Button onClick={run} disabled={mutation.isPending || !valid || positions.length === 0 || !baseCurrency} className="gap-2">
            <Play className="h-4 w-4" aria-hidden />
            {result ? "Run again" : "Run simulation"}
          </Button>
          <ChangedHint show={changed} />
        </CardContent>
      </Card>

      {mutation.isPending && <ResultsSkeleton />}
      {mutation.isError && !mutation.isPending && <ErrorBox message={apiErrorMessage(mutation.error)} onRetry={run} />}

      {result && !mutation.isPending && (
        <Card className="rounded-3xl border-border/50">
          <CardContent className="p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-1 font-semibold">
                Simulated value over {result.horizon_years} {result.horizon_years === 1 ? "year" : "years"}
                <ExplainThis
                  context={{
                    label: "Monte Carlo simulation of portfolio value",
                    value: `median final value ${fmtMoney(result.final.p50, cur)}, 5th to 95th percentile ${fmtMoney(result.final.p5, cur)} to ${fmtMoney(result.final.p95, cur)}`,
                    detail: `over ${result.horizon_years} years; probability of ending below money put in ${fmtPct(result.prob_loss, 0)}`,
                  }}
                />
              </h3>
              {onSave && (
              <SaveButton
                label="Save scenario"
                title="Save simulation"
                defaultName={`Simulation ${result.horizon_years}y`}
                saving={saving}
                onSave={(name) =>
                  onSave(name, { ...(ran ?? params) }, {
                    base_currency: result.base_currency,
                    start_value: result.start_value,
                    total_contributions: result.total_contributions,
                    final: { p5: result.final.p5, p50: result.final.p50, p95: result.final.p95 },
                    prob_loss: result.prob_loss,
                    prob_drawdown_20: result.prob_drawdown_20,
                  })
                }
              />
              )}
            </div>
            <FanChart percentiles={result.percentiles} currency={cur} />
            <p className="text-xs text-muted-foreground">
              Dark band: 25th to 75th <Term id="percentile">percentile</Term>. Light band: 5th to 95th. Line: median.
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              <Stat label={<Term id="percentile">5th percentile</Term>} value={fmtMoney(result.final.p5, cur)} sub="Weaker outcome" />
              <Stat label="25th percentile" value={fmtMoney(result.final.p25, cur)} />
              <Stat label="Median (50th)" value={fmtMoney(result.final.p50, cur)} sub="Middle outcome" />
              <Stat label="75th percentile" value={fmtMoney(result.final.p75, cur)} />
              <Stat label="95th percentile" value={fmtMoney(result.final.p95, cur)} sub="Stronger outcome" />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Stat label="Starting value" value={fmtMoney(result.start_value, cur)} />
              <Stat label="Contributions" value={fmtMoney(result.total_contributions, cur)} />
              <Stat
                label="Simulated paths ending below money put in"
                value={fmtPct(result.prob_loss, 0)}
                sub="Probability of loss"
              />
              <Stat
                label={
                  <>
                    Paths with a 20% fall (<Term id="max-drawdown">drawdown</Term>)
                  </>
                }
                value={fmtPct(result.prob_drawdown_20, 0)}
                sub="At some point along the way"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Based on {result.paths.toLocaleString()} simulated paths using {result.observations.toLocaleString()} daily observations
              from the last {result.lookback_used}. {SIM_EXPLAINER} Past results do not predict future results.
            </p>
            <ExcludedNote excluded={result.excluded} />
            <EducationalDisclaimer />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

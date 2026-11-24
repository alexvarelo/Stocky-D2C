import { useState } from "react";
import { ChevronDown, Plus, Play, X } from "lucide-react";
import { useStressApiV1ScenariosStressPost } from "@/api/scenarios/scenarios";
import type { StressResponse, StressScenario } from "@/api/financialDataApi.schemas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { apiErrorMessage } from "@/lib/apiError";
import type { Position } from "@/lib/portfolioPositions";
import { fmtMoney, fmtPct, toneClass } from "./format";
import { ErrorBox, ExcludedNote, ResultsSkeleton, SaveButton } from "./shared";

export interface TabProps {
  positions: Position[];
  baseCurrency: string;
  initial?: Record<string, unknown>;
  onSave: (_name: string, _params: Record<string, unknown>, _summary: Record<string, unknown>) => Promise<unknown>;
  saving?: boolean;
}

const DEFAULT_SHOCKS = ["-10", "-20", "-30"];
const MAX_SHOCKS = 6;

function MethodBadge({ method }: { method: StressScenario["method"] }) {
  const map = {
    historical: { label: "Historical", tip: "Every holding has its own price history for this period." },
    beta_proxy: {
      label: "Estimated from beta",
      tip: "At least one holding did not exist back then, so its move is estimated from its beta times the market's move. This is an approximation.",
    },
    shock: { label: "Assumed shock", tip: "A hypothetical market drop applied to each holding through its beta." },
  } as const;
  const m = map[method];
  return (
    <Badge variant={method === "historical" ? "secondary" : "outline"} title={m.tip} className="font-normal">
      {m.label}
    </Badge>
  );
}

function ScenarioCard({ s, currency }: { s: StressScenario; currency: string }) {
  const [open, setOpen] = useState(false);
  const period = s.period_start && s.period_end ? `${s.period_start} to ${s.period_end}` : null;
  return (
    <Card className="rounded-2xl border-border/50">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold leading-tight">{s.label}</h3>
              {period && <p className="text-xs text-muted-foreground mt-0.5">{period}</p>}
            </div>
            <MethodBadge method={s.method} />
          </div>
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Portfolio return</dt>
              <dd className={`font-semibold tabular-nums ${toneClass(s.portfolio_return)}`}>{fmtPct(s.portfolio_return, 1, true)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Value after</dt>
              <dd className="font-semibold tabular-nums">{fmtMoney(s.value_after, currency)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Profit / loss</dt>
              <dd className={`font-semibold tabular-nums ${toneClass(s.pnl)}`}>{fmtMoney(s.pnl, currency)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                <Term id="benchmark">S&amp;P 500</Term> in same case
              </dt>
              <dd className={`font-semibold tabular-nums ${toneClass(s.benchmark_return)}`}>{fmtPct(s.benchmark_return, 1, true)}</dd>
            </div>
          </dl>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 -ml-2 text-muted-foreground">
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden />
              {open ? "Hide" : "Show"} breakdown by holding
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="overflow-x-auto rounded-xl border border-border/50">
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border/50">
                    <th className="text-left font-medium p-2">Holding</th>
                    <th className="text-right font-medium p-2">Weight</th>
                    <th className="text-right font-medium p-2">Return</th>
                    <th className="text-left font-medium p-2">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {[...s.positions]
                    .sort((a, b) => b.weight - a.weight)
                    .map((p) => (
                      <tr key={p.ticker} className="border-b border-border/30 last:border-0">
                        <td className="p-2 font-medium">{p.ticker}</td>
                        <td className="p-2 text-right tabular-nums">{fmtPct(p.weight)}</td>
                        <td className={`p-2 text-right tabular-nums ${toneClass(p.return)}`}>{fmtPct(p.return, 1, true)}</td>
                        <td className="p-2 text-muted-foreground whitespace-nowrap">
                          {p.method === "historical" ? "historical" : p.method === "beta_proxy" ? "from beta" : "shock"}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CollapsibleContent>
        </CardContent>
      </Collapsible>
    </Card>
  );
}

export function StressTab({ positions, baseCurrency, initial, onSave, saving }: TabProps) {
  const initShocks = Array.isArray(initial?.shocks)
    ? (initial.shocks as number[]).map((s) => String(Math.round(s * 1000) / 10))
    : DEFAULT_SHOCKS;
  const [shocks, setShocks] = useState<string[]>(initShocks);
  const mutation = useStressApiV1ScenariosStressPost();
  const result: StressResponse | undefined = mutation.data?.data;

  const parsed = shocks.map((s) => Number(s));
  const shocksValid = shocks.every((s, i) => s.trim() !== "" && Number.isFinite(parsed[i]) && parsed[i] >= -95 && parsed[i] <= 100);
  const shockDecimals = parsed.map((p) => Math.round(p * 100) / 10000);

  const run = () =>
    mutation.mutate({
      data: { positions, base_currency: baseCurrency, shocks: shocksValid ? shockDecimals : [] },
    });

  return (
    <div className="space-y-4">
      <Card className="rounded-3xl border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            <Term id="stress-test">Stress test</Term>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            See how your current holdings would have fared in past market crises (2008, COVID-19, 2022), plus market drops you choose below. It describes
            what would have happened, not what will happen.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Market drop sizes (%)</Label>
            <div className="flex flex-wrap gap-2 items-center">
              {shocks.map((s, i) => (
                <div key={i} className="flex items-center gap-1">
                  <Input
                    type="number"
                    inputMode="decimal"
                    aria-label={`Market shock ${i + 1} in percent`}
                    className="w-20 h-9"
                    value={s}
                    min={-95}
                    max={100}
                    step={1}
                    onChange={(e) => setShocks((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={`Remove shock ${i + 1}`}
                    onClick={() => setShocks((prev) => prev.filter((_, j) => j !== i))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {shocks.length < MAX_SHOCKS && (
                <Button variant="outline" size="sm" className="gap-1" onClick={() => setShocks((p) => [...p, "-15"])}>
                  <Plus className="h-4 w-4" aria-hidden /> Add
                </Button>
              )}
            </div>
            {!shocksValid && <p className="text-xs text-destructive">Enter values between -95 and 100.</p>}
          </div>
          <Button onClick={run} disabled={mutation.isPending || !shocksValid || positions.length === 0} className="gap-2">
            <Play className="h-4 w-4" aria-hidden />
            {result ? "Run again" : "Run stress test"}
          </Button>
        </CardContent>
      </Card>

      {mutation.isPending && <ResultsSkeleton />}
      {mutation.isError && !mutation.isPending && (
        <ErrorBox message={apiErrorMessage(mutation.error)} onRetry={run} retrying={mutation.isPending} />
      )}

      {result && !mutation.isPending && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              Current value: <span className="font-semibold text-foreground">{fmtMoney(result.current_value, result.base_currency)}</span>
            </p>
            <SaveButton
              label="Save scenario"
              title="Save stress test"
              defaultName="Stress test"
              saving={saving}
              onSave={(name) =>
                onSave(
                  name,
                  { shocks: shockDecimals },
                  {
                    current_value: result.current_value,
                    base_currency: result.base_currency,
                    scenarios: result.scenarios.map((s) => ({
                      key: s.key,
                      label: s.label,
                      portfolio_return: s.portfolio_return,
                      pnl: s.pnl,
                    })),
                  },
                )
              }
            />
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {result.scenarios.map((s) => (
              <ScenarioCard key={s.key} s={s} currency={result.base_currency} />
            ))}
          </div>
          <ExcludedNote excluded={result.excluded} />
          <EducationalDisclaimer />
        </div>
      )}
    </div>
  );
}

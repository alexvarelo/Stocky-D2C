import { useState } from "react";
import { LineChart } from "lucide-react";
import { useBacktestStrategyApiV1StrategiesBacktestPost } from "@/api/strategies/strategies";
import type { BacktestRequest } from "@/api/financialDataApi.schemas";
import { Card, CardContent } from "@/components/ui/card";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { BacktestForm } from "@/components/strategies/BacktestForm";
import { BacktestResults } from "@/components/strategies/BacktestResults";
import { SavedStrategiesList } from "@/components/strategies/SavedStrategiesList";
import { TEMPLATES, defaultForm, formFromSaved, type FormState } from "@/components/strategies/templates";
import { ErrorBox, ResultsSkeleton } from "@/components/scenarios/shared";
import { apiErrorMessage } from "@/lib/apiError";
import { VALID_TICKER } from "@/lib/portfolioPositions";
import { useCreateSavedStrategy, type SavedStrategy } from "@/hooks/useSavedStrategies";

function validate(f: FormState): string[] {
  const errs: string[] = [];
  const tpl = TEMPLATES.find((t) => t.id === f.strategy)!;
  if (f.tickers.some((t) => !t.ticker || !VALID_TICKER.test(t.ticker))) errs.push("Choose a valid ticker for every row.");
  if (!tpl.singleTicker && f.tickers.some((t) => !(Number(t.weight) > 0))) errs.push("Weights must be above zero.");
  if (new Set(f.tickers.map((t) => t.ticker)).size !== f.tickers.length) errs.push("Each ticker can only appear once.");
  const start = Date.parse(f.start_date);
  const end = Date.parse(f.end_date);
  if (!f.start_date || !f.end_date || Number.isNaN(start) || Number.isNaN(end)) errs.push("Enter both dates.");
  else {
    if (f.start_date < "2000-01-01") errs.push("Start date must be 2000-01-01 or later.");
    if (f.end_date > new Date().toISOString().slice(0, 10)) errs.push("End date cannot be in the future.");
    if ((end - start) / 86400000 < 180) errs.push("The period must span at least 180 days.");
  }
  if (!(Number(f.initial_capital) >= 0) || f.initial_capital.trim() === "") errs.push("Initial capital must be 0 or more.");
  if (f.strategy === "dca" && (!(Number(f.monthly_amount) >= 0) || f.monthly_amount.trim() === "")) errs.push("Monthly amount must be 0 or more.");
  if (f.strategy === "ma_cross" && !(Number(f.fast) >= 2 && Number(f.fast) < Number(f.slow) && Number(f.slow) <= 600)) errs.push("Fast average must be at least 2 and below the slow one (max 600).");
  if (f.strategy === "rsi" && !(Number(f.rsi_buy) < Number(f.rsi_sell))) errs.push("RSI buy level must be below the sell level.");
  const fee = Number(f.fee_bps);
  if (!(fee >= 0 && fee <= 100) || f.fee_bps.trim() === "") errs.push("Fee must be between 0 and 100 bps.");
  return errs;
}

function toRequest(f: FormState): BacktestRequest {
  const single = TEMPLATES.find((t) => t.id === f.strategy)!.singleTicker;
  const params =
    f.strategy === "dca"
      ? { monthly_amount: Number(f.monthly_amount) }
      : f.strategy === "rebalance"
        ? { rebalance_frequency: f.rebalance_frequency }
        : f.strategy === "ma_cross"
          ? { fast: Number(f.fast), slow: Number(f.slow) }
          : { rsi_buy: Number(f.rsi_buy), rsi_sell: Number(f.rsi_sell) };
  return {
    strategy: f.strategy,
    tickers: f.tickers.map((t) => ({ ticker: t.ticker, weight: single ? 1 : Number(t.weight) })),
    start_date: f.start_date,
    end_date: f.end_date,
    base_currency: f.base_currency,
    initial_capital: Number(f.initial_capital),
    params,
    fee_bps: Number(f.fee_bps),
  };
}

export default function Strategies() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const mutation = useBacktestStrategyApiV1StrategiesBacktestPost();
  const create = useCreateSavedStrategy();
  const errors = validate(form);
  const result = mutation.data?.data;

  const run = () => mutation.mutate({ data: toRequest(form) });

  const load = (s: SavedStrategy) => {
    setForm(formFromSaved(s.strategy, s.params));
    mutation.reset();
  };

  return (
    <div className="container mx-auto px-1 sm:px-4 space-y-4 max-w-5xl">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <LineChart className="h-6 w-6 text-muted-foreground" aria-hidden />
          Strategies
        </h1>
        <p className="text-sm text-muted-foreground">
          Replay simple, rule-based approaches on historical prices to learn how they behave. Results describe the past only.
        </p>
        <EducationalDisclaimer />
      </div>

      <Card className="rounded-3xl border-border/50">
        <CardContent className="p-4 sm:p-6">
          <BacktestForm form={form} onChange={setForm} onRun={run} running={mutation.isPending} errors={errors} />
        </CardContent>
      </Card>

      {mutation.isPending && <ResultsSkeleton />}
      {mutation.isError && !mutation.isPending && <ErrorBox message={apiErrorMessage(mutation.error)} onRetry={run} />}
      {result && !mutation.isPending && (
        <BacktestResults
          result={result}
          saving={create.isPending}
          onSave={(name) =>
            create.mutateAsync({
              name,
              strategy: form.strategy,
              params: { ...form },
              result_summary: {
                base_currency: result.base_currency,
                start_date: result.start_date,
                end_date: result.end_date,
                strategy: {
                  final_value: result.metrics.strategy.final_value,
                  total_return: result.metrics.strategy.total_return,
                  cagr: result.metrics.strategy.cagr ?? null,
                  max_drawdown: result.metrics.strategy.max_drawdown ?? null,
                },
                benchmark: {
                  final_value: result.metrics.benchmark.final_value,
                  total_return: result.metrics.benchmark.total_return,
                },
              },
            })
          }
        />
      )}

      <SavedStrategiesList onLoad={load} />
    </div>
  );
}

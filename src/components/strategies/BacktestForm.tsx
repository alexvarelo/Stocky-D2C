import { Plus, Play, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Term } from "@/components/glossary/Term";
import { StockSearch } from "@/components/stock/StockSearch";
import { TEMPLATES, type FormState } from "./templates";

interface Props {
  form: FormState;
  onChange: (_f: FormState) => void;
  onRun: () => void;
  running: boolean;
  errors: string[];
}

const CURRENCIES = ["USD", "EUR", "GBP", "CHF", "JPY"];

function Field({ id, label, children }: { id?: string; label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5 min-w-0">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

export function BacktestForm({ form, onChange, onRun, running, errors }: Props) {
  const tpl = TEMPLATES.find((t) => t.id === form.strategy)!;
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => onChange({ ...form, [k]: v });
  const num = (k: keyof FormState, id: string, label: React.ReactNode, step: number | "any" = "any") => (
    <Field id={id} label={label}>
      <Input id={id} type="number" inputMode="decimal" step={step} value={form[k] as string} onChange={(e) => set(k, e.target.value as never)} />
    </Field>
  );

  return (
    <div className="space-y-5">
      <div role="radiogroup" aria-label="Strategy template" className="grid gap-2 sm:grid-cols-2">
        {TEMPLATES.map((t) => {
          const active = t.id === form.strategy;
          return (
            <div
              key={t.id}
              role="radio"
              aria-checked={active}
              tabIndex={0}
              onClick={() =>
                onChange({
                  ...form,
                  strategy: t.id,
                  tickers: t.singleTicker ? form.tickers.slice(0, 1).map((x) => ({ ...x, weight: "100" })) : form.tickers,
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  (e.currentTarget as HTMLElement).click();
                }
              }}
              className={`cursor-pointer rounded-2xl border p-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                active ? "border-primary bg-primary/5" : "border-border/50 hover:bg-muted/50"
              }`}
            >
              <p className="font-semibold text-sm">{t.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
            </div>
          );
        })}
      </div>

      <div className="space-y-2">
        <Label>
          {tpl.singleTicker ? "Ticker" : "Tickers and weights"}
          {!tpl.singleTicker && <span className="text-xs text-muted-foreground font-normal"> (weights are normalised to 100%)</span>}
        </Label>
        {form.tickers.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 min-w-0 max-w-xs">
              {r.ticker ? (
                <div className="flex h-10 items-center justify-between rounded-md border border-input px-3 text-sm font-medium">
                  {r.ticker}
                  <Button variant="ghost" size="icon" className="h-6 w-6" aria-label="Change ticker" onClick={() => set("tickers", form.tickers.map((x, j) => (j === i ? { ...x, ticker: "" } : x)))}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <StockSearch placeholder="Search ticker..." onSelect={(s) => set("tickers", form.tickers.map((x, j) => (j === i ? { ...x, ticker: s.symbol.toUpperCase() } : x)))} />
              )}
            </div>
            {!tpl.singleTicker && (
              <Input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                aria-label={`Weight for ${r.ticker || "ticker"}`}
                className="w-20 sm:w-24"
                value={r.weight}
                onChange={(e) => set("tickers", form.tickers.map((x, j) => (j === i ? { ...x, weight: e.target.value } : x)))}
              />
            )}
            {form.tickers.length > 1 && (
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Remove ticker" onClick={() => set("tickers", form.tickers.filter((_, j) => j !== i))}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        {!tpl.singleTicker && form.tickers.length < 15 && (
          <Button variant="outline" size="sm" className="gap-1" onClick={() => set("tickers", [...form.tickers, { ticker: "", weight: "1" }])}>
            <Plus className="h-4 w-4" aria-hidden /> Add ticker
          </Button>
        )}
      </div>

      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Field id="bt-start" label="Start date">
          <Input id="bt-start" type="date" min="2000-01-01" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
        </Field>
        <Field id="bt-end" label="End date">
          <Input id="bt-end" type="date" max={new Date().toISOString().slice(0, 10)} value={form.end_date} onChange={(e) => set("end_date", e.target.value)} />
        </Field>
        <Field label="Currency">
          <Select value={form.base_currency} onValueChange={(v) => set("base_currency", v)}>
            <SelectTrigger aria-label="Currency"><SelectValue /></SelectTrigger>
            <SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        {num("initial_capital", "bt-cap", "Initial capital", 100)}
        {form.strategy === "dca" && num("monthly_amount", "bt-monthly", <Term id="dollar-cost-averaging">Monthly amount</Term>, 50)}
        {form.strategy === "rebalance" && (
          <Field label={<Term id="rebalancing">Rebalance</Term>}>
            <Select value={form.rebalance_frequency} onValueChange={(v) => set("rebalance_frequency", v as FormState["rebalance_frequency"])}>
              <SelectTrigger aria-label="Rebalance period"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        )}
        {form.strategy === "ma_cross" && (
          <>
            {num("fast", "bt-fast", <Term id="sma">Fast average (days)</Term>, 1)}
            {num("slow", "bt-slow", <Term id="sma">Slow average (days)</Term>, 1)}
          </>
        )}
        {form.strategy === "rsi" && (
          <>
            {num("rsi_buy", "bt-rsib", <Term id="rsi">RSI buy level</Term>, 1)}
            {num("rsi_sell", "bt-rsis", <Term id="rsi">RSI sell level</Term>, 1)}
          </>
        )}
        {num("fee_bps", "bt-fee", "Fee per trade (bps)", 1)}
      </div>

      {errors.length > 0 && (
        <ul className="text-xs text-destructive space-y-0.5 list-disc pl-4">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
      <Button onClick={onRun} disabled={running || errors.length > 0} className="gap-2">
        <Play className="h-4 w-4" aria-hidden />
        Run backtest
      </Button>
    </div>
  );
}

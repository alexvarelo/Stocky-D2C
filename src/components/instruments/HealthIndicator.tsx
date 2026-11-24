import { useGetHealthApiV1StockTickerHealthGet } from "@/api/analysis/analysis";
import type { HealthMetric, HealthMetricStatus, HealthResponse } from "@/api/financialDataApi.schemas";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatHealthValue } from "@/lib/financialFormat";
import { cn } from "@/lib/utils";

const STALE_TIME_MS = 60 * 60 * 1000;

const STATUS: Record<HealthMetricStatus, { label: string; dot: string; chip: string }> = {
  good: { label: "Good", dot: "bg-success", chip: "bg-success/15 text-success border-success/40" },
  warn: { label: "Warn", dot: "bg-amber-500", chip: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40" },
  bad: { label: "Bad", dot: "bg-destructive", chip: "bg-destructive/15 text-destructive border-destructive/40" },
  na: { label: "N/A", dot: "bg-muted-foreground/50", chip: "bg-muted text-muted-foreground border-border" },
};

const TERM_IDS: Record<string, string> = {
  cash_runway_months: "cash-runway",
  dilution_yoy: "share-dilution",
  net_debt_to_ebitda: "net-debt-ebitda",
  interest_coverage: "interest-coverage",
  altman_z: "altman-z-score",
  piotroski_f: "piotroski-f-score",
};

function MetricList({ metrics }: { metrics: HealthMetric[] }) {
  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {metrics.map((m) => (
          <li key={m.key} className="space-y-1 border-b pb-3 last:border-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {TERM_IDS[m.key] ? <Term id={TERM_IDS[m.key]}>{m.label}</Term> : m.label}
              </span>
              <span className="flex items-center gap-2">
                <span className="text-sm tabular-nums">{formatHealthValue(m)}</span>
                <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", STATUS[m.status].chip)}>
                  {STATUS[m.status].label}
                </span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{m.explanation}</p>
          </li>
        ))}
      </ul>
      <EducationalDisclaimer />
    </div>
  );
}

export function HealthIndicator({ ticker }: { ticker: string }) {
  const isMobile = useIsMobile();
  const { data, isError } = useGetHealthApiV1StockTickerHealthGet(ticker, {
    query: { staleTime: STALE_TIME_MS, retry: 1 },
  });
  const metrics = ((data?.data as HealthResponse | undefined)?.metrics ?? []).slice(0, 6);

  if (isError || metrics.length === 0 || metrics.every((m) => m.status === "na")) return null;

  const count = (s: HealthMetricStatus) => metrics.filter((m) => m.status === s).length;
  const summary = `Health: ${count("good")} good · ${count("warn")} warn · ${count("bad")} bad`;

  const trigger = (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${summary}. Show details`}
    >
      <span className="flex items-center gap-1" aria-hidden="true">
        {metrics.map((m) => (
          <span key={m.key} className={cn("h-2.5 w-2.5 rounded-full", STATUS[m.status].dot)} />
        ))}
      </span>
      <span>{summary}</span>
    </button>
  );

  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Financial health</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <MetricList metrics={metrics} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-96 max-h-[70vh] overflow-y-auto">
        <h3 className="mb-3 text-sm font-semibold">Financial health</h3>
        <MetricList metrics={metrics} />
      </PopoverContent>
    </Popover>
  );
}

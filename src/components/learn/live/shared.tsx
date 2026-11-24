import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ExplainThis, type ExplainContext } from "@/components/explain/ExplainThis";

export interface WidgetProps {
  ticker: string;
}

export const CHART_AXIS = { fontSize: 11, tickLine: false, axisLine: false } as const;
export const CHART_MARGIN = { top: 5, right: 8, bottom: 0, left: 0 };
export const TOOLTIP_STYLE = {
  backgroundColor: "hsl(var(--background))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
};

export const fmtNum = (v: number | null | undefined, digits = 2) =>
  v == null || Number.isNaN(v) ? "N/A" : v.toLocaleString(undefined, { maximumFractionDigits: digits });

export const fmtTick = (d: string) => {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
};

export function WidgetLoading() {
  return (
    <div className="space-y-2" aria-busy="true">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

export function WidgetError({ message }: { message?: string }) {
  return (
    <p className="flex items-start gap-2 text-sm text-muted-foreground">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      {message ?? "This data is not available right now. Try another ticker."}
    </p>
  );
}

export function Reading({ label, value, note }: { label: ReactNode; value: ReactNode; note?: ReactNode }) {
  return (
    <div className="min-w-0 rounded-xl border border-border/50 bg-card/50 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      {note && <p className="text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function ChartTitle({ children, explain }: { children: ReactNode; explain: ExplainContext }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span>{children}</span>
      <ExplainThis className="h-5 w-5" context={explain} />
    </div>
  );
}

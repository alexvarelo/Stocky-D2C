import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtPct } from "@/components/scenarios/format";
import { ErrorBox } from "@/components/scenarios/shared";
import { useDeleteSavedStrategy, useSavedStrategies, type SavedStrategy } from "@/hooks/useSavedStrategies";
import { TEMPLATES } from "./templates";

export function SavedStrategiesList({ onLoad }: { onLoad: (_s: SavedStrategy) => void }) {
  const { data, isLoading, isError, refetch } = useSavedStrategies();
  const del = useDeleteSavedStrategy();
  return (
    <Card className="rounded-3xl border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Saved strategies</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && [...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}
        {isError && <ErrorBox message="Could not load saved strategies." onRetry={() => refetch()} />}
        {data && data.length === 0 && <p className="text-sm text-muted-foreground">Nothing saved yet. Run a backtest and use Save strategy.</p>}
        {data?.map((s) => {
          const m = (s.result_summary as { strategy?: { total_return?: number; cagr?: number | null } }).strategy;
          return (
            <div key={s.id} className="flex items-center gap-2 rounded-2xl border border-border/50 p-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">{s.name}</span>
                  <Badge variant="secondary" className="font-normal">{TEMPLATES.find((t) => t.id === s.strategy)?.name ?? s.strategy}</Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {new Date(s.created_at).toLocaleDateString()}
                  {m ? ` · total return ${fmtPct(m.total_return, 1, true)} (past result)` : ""}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onLoad(s)}>Load</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" aria-label={`Delete ${s.name}`} disabled={del.isPending} onClick={() => del.mutate(s.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

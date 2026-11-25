import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeleteSavedScenario, useSavedScenarios, type SavedScenario } from "@/hooks/useSavedScenarios";
import { fmtMoney, fmtPct } from "./format";
import { ConfirmDeleteButton, ErrorBox } from "./shared";

const KIND_LABEL = { stress: "Stress", montecarlo: "Monte Carlo", whatif: "What if" } as const;

interface Summary {
  base_currency?: string;
  prob_loss?: number;
  final?: { p50?: number };
  current?: { p50?: number };
  modified?: { p50?: number };
  scenarios?: { label: string; portfolio_return: number }[];
}

function headline(s: SavedScenario): string {
  const r = (s.result_summary ?? {}) as Summary;
  const cur = r.base_currency || "USD";
  if (s.kind === "montecarlo") return `Median ${fmtMoney(r.final?.p50, cur)} · loss prob. ${fmtPct(r.prob_loss, 0)}`;
  if (s.kind === "whatif") return `Median ${fmtMoney(r.current?.p50, cur)} → ${fmtMoney(r.modified?.p50, cur)}`;
  const first = r.scenarios?.[0];
  return first ? `${first.label}: ${fmtPct(first.portfolio_return, 1, true)}` : "";
}

export function SavedScenariosList({ portfolioId, onLoad }: { portfolioId: string; onLoad: (_s: SavedScenario) => void }) {
  const { data, isLoading, isError, refetch } = useSavedScenarios(portfolioId);
  const del = useDeleteSavedScenario();
  return (
    <Card className="rounded-3xl border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Saved scenarios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {isLoading && [...Array(2)].map((_, i) => <Skeleton key={i} className="h-14 rounded-2xl" />)}
        {isError && <ErrorBox message="Could not load saved scenarios." onRetry={() => refetch()} />}
        {data && data.length === 0 && <p className="text-sm text-muted-foreground">Nothing saved yet. Run an analysis and use Save scenario.</p>}
        {data?.map((s) => (
          <div key={s.id} className="flex items-center gap-2 rounded-2xl border border-border/50 p-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium truncate">{s.name}</span>
                <Badge variant="secondary" className="font-normal">{KIND_LABEL[s.kind]}</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {new Date(s.created_at).toLocaleDateString()} · {headline(s)}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onLoad(s)}>
              Load
            </Button>
            <ConfirmDeleteButton name={s.name} disabled={del.isPending} onConfirm={() => del.mutate(s.id)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

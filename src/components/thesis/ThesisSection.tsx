import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useThesesByTicker, type InvestmentThesis } from "@/hooks/useInvestmentTheses";
import { ThesisCard } from "./ThesisCard";
import { ThesisForm } from "./ThesisForm";

/** Thesis list + create/edit for a ticker, shown in the instrument Notes tab. */
export function ThesisSection({ ticker }: { ticker: string }) {
  const { user } = useAuth();
  const { data: theses, isLoading } = useThesesByTicker(ticker);
  const [editing, setEditing] = useState<InvestmentThesis | null>(null);
  const [creating, setCreating] = useState(false);

  if (!user) return null;

  const formOpen = creating || !!editing;
  const close = () => {
    setCreating(false);
    setEditing(null);
  };

  return (
    <section className="space-y-3" aria-label="Investment thesis">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Thesis</h3>
        <Button size="sm" variant="outline" className="gap-1" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Add thesis
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-28 w-full" />
      ) : theses && theses.length > 0 ? (
        <div className="space-y-3">
          {theses.map((t) => (
            <ThesisCard key={t.id} thesis={t} onEdit={() => setEditing(t)} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Write down why you hold {ticker}, what could go right, and what would make you reconsider.
          </CardContent>
        </Card>
      )}

      <Dialog open={formOpen} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit thesis" : "New thesis"} · {ticker}</DialogTitle>
          </DialogHeader>
          {formOpen && <ThesisForm key={editing?.id ?? "new"} ticker={ticker} thesis={editing} onDone={close} />}
        </DialogContent>
      </Dialog>
    </section>
  );
}

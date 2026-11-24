import { useState } from "react";
import { FileText, FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { isThesisDue, useThesesForPosition, type InvestmentThesis } from "@/hooks/useInvestmentTheses";
import { ThesisCard } from "./ThesisCard";
import { ThesisForm } from "./ThesisForm";

interface PositionThesisButtonProps {
  ticker: string;
  portfolioId: string;
  className?: string;
}

/** Compact thesis indicator for a position. Opens the thesis (or the form to add one) in a sheet. */
export function PositionThesisButton({ ticker, portfolioId, className }: PositionThesisButtonProps) {
  const { user } = useAuth();
  const { data: theses } = useThesesForPosition(ticker, portfolioId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InvestmentThesis | null>(null);
  const [adding, setAdding] = useState(false);

  if (!user) return null;

  const forTicker = (theses ?? []).filter((t) => t.ticker === ticker.toUpperCase());
  const current = forTicker.find((t) => t.status === "active") ?? forTicker[0];
  const due = current ? isThesisDue(current) : false;
  const showForm = adding || !!editing || forTicker.length === 0;

  const reset = () => {
    setAdding(false);
    setEditing(null);
  };

  const label = current ? (due ? "Thesis review due" : "View thesis") : "Add thesis";
  const Icon = current ? FileText : FilePlus2;

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 shrink-0", className)}
            aria-label={`${label} for ${ticker}`}
            onClick={() => setOpen(true)}
          >
            <Icon
              className={cn(
                "h-4 w-4",
                !current && "text-muted-foreground",
                current && !due && "text-primary",
                due && "text-amber-500",
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{label}</TooltipContent>
      </Tooltip>

      <Sheet
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) reset();
        }}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader className="mb-4">
            <SheetTitle>Thesis · {ticker}</SheetTitle>
          </SheetHeader>
          {open && showForm ? (
            <ThesisForm
              key={editing?.id ?? "new"}
              ticker={ticker}
              thesis={editing}
              portfolioId={portfolioId}
              lockPortfolio
              onDone={() => {
                reset();
                if (forTicker.length === 0) setOpen(false);
              }}
            />
          ) : (
            <div className="space-y-3">
              {forTicker.map((t) => (
                <ThesisCard
                  key={t.id}
                  thesis={t}
                  onEdit={() => setEditing(t)}
                  scopeLabel={t.portfolio_id === portfolioId ? undefined : "General thesis"}
                />
              ))}
              <Button variant="outline" size="sm" onClick={() => setAdding(true)}>
                Add another thesis
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

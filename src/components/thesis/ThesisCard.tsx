import { parseISO } from "date-fns";
import { format } from "@/lib/dateFormat";
import { useState } from "react";
import { CalendarClock, Pencil, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { isThesisDue, useDeleteThesis, useUpdateThesisStatus, type InvestmentThesis } from "@/hooks/useInvestmentTheses";

const HORIZON_LABEL = { short: "Short term", medium: "Medium term", long: "Long term" } as const;
const STATUS_LABEL = { active: "Active", closed: "Closed", invalidated: "Invalidated" } as const;

interface ThesisCardProps {
  thesis: InvestmentThesis;
  onEdit: () => void;
  /** Shown as a badge, e.g. "General thesis". */
  scopeLabel?: string;
}

export function ThesisCard({ thesis, onEdit, scopeLabel }: ThesisCardProps) {
  const updateStatus = useUpdateThesisStatus();
  const remove = useDeleteThesis();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const due = isThesisDue(thesis);
  const isActive = thesis.status === "active";

  return (
    <Card className={cn(due && "border-amber-500/60")}>
      <CardContent className="space-y-4 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={isActive ? "default" : "secondary"}>{STATUS_LABEL[thesis.status]}</Badge>
          {scopeLabel && <Badge variant="outline">{scopeLabel}</Badge>}
          {thesis.horizon && <Badge variant="outline">{HORIZON_LABEL[thesis.horizon]}</Badge>}
          {thesis.review_date && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-xs",
                due ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground",
              )}
            >
              <CalendarClock className="h-3.5 w-3.5" />
              {due ? "Review due " : "Review "}
              {format(parseISO(thesis.review_date), "PP")}
            </span>
          )}
        </div>

        {thesis.why_bought && <p className="whitespace-pre-wrap text-sm">{thesis.why_bought}</p>}

        <div className="grid gap-4 sm:grid-cols-2">
          {thesis.catalysts.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Catalysts</h4>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {thesis.catalysts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
          {thesis.exit_triggers.length > 0 && (
            <div>
              <h4 className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Exit triggers</h4>
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {thesis.exit_triggers.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
          {isActive && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: thesis.id, status: "closed" })}
              >
                <CheckCircle2 className="h-3.5 w-3.5" /> Close
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                disabled={updateStatus.isPending}
                onClick={() => updateStatus.mutate({ id: thesis.id, status: "invalidated" })}
              >
                <XCircle className="h-3.5 w-3.5" /> Mark invalidated
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this thesis?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => remove.mutate(thesis.id, { onSettled: () => setConfirmOpen(false) })}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

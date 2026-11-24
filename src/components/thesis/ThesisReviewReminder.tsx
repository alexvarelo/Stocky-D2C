import { useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { CalendarClock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useThesesDueForReview } from "@/hooks/useInvestmentTheses";

const DISMISS_KEY = "thesis-reminder-dismissed";

const readDismissed = () => {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

/** Dashboard card listing active theses whose review date has arrived. Dismissible per session. */
export function ThesisReviewReminder() {
  const { data: due } = useThesesDueForReview();
  const [dismissed, setDismissed] = useState(readDismissed);

  if (dismissed || !due || due.length === 0) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <Card className="border-amber-500/50">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <CalendarClock className="h-4 w-4 text-amber-500" />
            {due.length === 1 ? "1 thesis is ready for review" : `${due.length} theses are ready for review`}
          </div>
          <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Dismiss reminder" onClick={dismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ul className="space-y-1.5 text-sm">
          {due.map((t) => (
            <li key={t.id} className="flex items-center justify-between gap-2">
              <Link to={`/instrument/${t.ticker}`} className="font-semibold hover:underline">
                {t.ticker}
              </Link>
              <span className="text-xs text-muted-foreground">
                due {t.review_date ? format(parseISO(t.review_date), "PP") : ""}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

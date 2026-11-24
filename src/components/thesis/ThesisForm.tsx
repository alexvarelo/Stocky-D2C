import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { EditableList } from "./EditableList";
import { usePortfolios } from "@/api/portfolio/usePortfolios";
import { useAuth } from "@/lib/auth";
import {
  THESIS_MAX_LIST_ITEMS,
  THESIS_MAX_WHY,
  useSaveThesis,
  type InvestmentThesis,
  type ThesisHorizon,
  type ThesisStatus,
} from "@/hooks/useInvestmentTheses";

const NONE = "none";

interface ThesisFormProps {
  ticker: string;
  thesis?: InvestmentThesis | null;
  /** Fixed portfolio (e.g. opened from a position). Omit to let the user pick one. */
  portfolioId?: string | null;
  lockPortfolio?: boolean;
  onDone: () => void;
}

export function ThesisForm({ ticker, thesis, portfolioId, lockPortfolio = false, onDone }: ThesisFormProps) {
  const { user } = useAuth();
  const { data: portfolios } = usePortfolios(user?.id);
  const save = useSaveThesis();

  const [whyBought, setWhyBought] = useState(thesis?.why_bought ?? "");
  const [catalysts, setCatalysts] = useState<string[]>(thesis?.catalysts ?? []);
  const [exitTriggers, setExitTriggers] = useState<string[]>(thesis?.exit_triggers ?? []);
  const [horizon, setHorizon] = useState<ThesisHorizon | null>(thesis?.horizon ?? null);
  const [reviewDate, setReviewDate] = useState<string | null>(thesis?.review_date ?? null);
  const [status, setStatus] = useState<ThesisStatus>(thesis?.status ?? "active");
  const [portfolioChoice, setPortfolioChoice] = useState<string | null | undefined>(undefined);

  // When creating from the instrument page, preselect the portfolio if the user holds the ticker in exactly one.
  const holdingPortfolios = (portfolios ?? []).filter((p) =>
    ((p as { holdings?: { ticker: string }[] }).holdings ?? []).some(
      (h) => h.ticker?.toUpperCase() === ticker.toUpperCase(),
    ),
  );
  const autoPortfolio = holdingPortfolios.length === 1 ? holdingPortfolios[0].id : null;
  const portfolio =
    portfolioChoice !== undefined
      ? portfolioChoice
      : thesis
        ? thesis.portfolio_id
        : portfolioId ?? autoPortfolio;
  const setPortfolio = (v: string | null) => setPortfolioChoice(v);
  const whyTooLong = whyBought.length > THESIS_MAX_WHY;
  const canSubmit = whyBought.trim().length > 0 && !whyTooLong;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    save.mutate(
      {
        id: thesis?.id,
        values: {
          ticker,
          portfolio_id: portfolio,
          why_bought: whyBought.trim(),
          catalysts: catalysts.map((c) => c.trim()).filter(Boolean),
          exit_triggers: exitTriggers.map((c) => c.trim()).filter(Boolean),
          horizon,
          review_date: reviewDate,
          status,
        },
      },
      { onSuccess: onDone },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="why_bought">Why do you hold {ticker}?</Label>
        <Textarea
          id="why_bought"
          rows={4}
          value={whyBought}
          onChange={(e) => setWhyBought(e.target.value)}
          maxLength={THESIS_MAX_WHY}
          required
          placeholder="Your reasoning in your own words"
        />
        <p
          className={
            whyBought.length >= THESIS_MAX_WHY * 0.9 ? "text-xs text-amber-600 dark:text-amber-400" : "text-xs text-muted-foreground"
          }
        >
          {whyBought.length.toLocaleString()} / {THESIS_MAX_WHY.toLocaleString()}
          {whyBought.length >= THESIS_MAX_WHY && " · limit reached"}
        </p>
      </div>

      <EditableList label="Catalysts" placeholder="What could make this work out?" items={catalysts} onChange={setCatalysts} maxItems={THESIS_MAX_LIST_ITEMS} />
      <EditableList
        label="Exit triggers"
        placeholder="What would make you reconsider?"
        items={exitTriggers}
        onChange={setExitTriggers}
        maxItems={THESIS_MAX_LIST_ITEMS}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Time horizon</Label>
          <Select value={horizon ?? NONE} onValueChange={(v) => setHorizon(v === NONE ? null : (v as ThesisHorizon))}>
            <SelectTrigger>
              <SelectValue placeholder="Not set" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE}>Not set</SelectItem>
              <SelectItem value="short">Short term</SelectItem>
              <SelectItem value="medium">Medium term</SelectItem>
              <SelectItem value="long">Long term</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Review date</Label>
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="outline" className="flex-1 justify-start font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {reviewDate ? format(parseISO(reviewDate), "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={reviewDate ? parseISO(reviewDate) : undefined}
                  onSelect={(d) => setReviewDate(d ? format(d, "yyyy-MM-dd") : null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {reviewDate && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setReviewDate(null)}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {!lockPortfolio && (
          <div className="space-y-2">
            <Label>Portfolio (optional)</Label>
            <Select value={portfolio ?? NONE} onValueChange={(v) => setPortfolio(v === NONE ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder="No portfolio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>No portfolio</SelectItem>
                {(portfolios ?? []).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {thesis && (
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ThesisStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="invalidated">Invalidated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <EducationalDisclaimer />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending || !canSubmit}>
          {save.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {thesis ? "Save thesis" : "Create thesis"}
        </Button>
      </div>
    </form>
  );
}

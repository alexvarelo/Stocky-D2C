import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";

export type ReportTargetType = "post" | "comment" | "user" | "article";

// Keep in sync with the CHECK constraint on content_reports.reason.
const REASONS = [
  { value: "market_manipulation", label: "Market manipulation or pump-and-dump" },
  { value: "undisclosed_promotion", label: "Paid or undisclosed promotion" },
  { value: "scam_or_fraud", label: "Scam or fraud" },
  { value: "misinformation", label: "False or misleading information" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_speech", label: "Hate speech" },
  { value: "spam", label: "Spam" },
  { value: "other", label: "Something else" },
] as const;

type Reason = (typeof REASONS)[number]["value"];

interface ReportContentDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  targetType: ReportTargetType;
  targetId: string;
}

export function ReportContentDialog({ open, onOpenChange, targetType, targetId }: ReportContentDialogProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState<Reason | "">("");
  const [details, setDetails] = useState("");

  const report = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to report content.");
      const { error } = await supabase.from("content_reports").insert({
        reporter_id: user.id,
        target_type: targetType,
        target_id: targetId,
        reason,
        details: details.trim() || null,
      });
      // 23505 = unique violation: this user already reported this item.
      if (error && error.code !== "23505") throw error;
    },
    onSuccess: () => {
      toast.success("Thanks, we'll review this report.");
      onOpenChange(false);
      setReason("");
      setDetails("");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Couldn't send the report. Please try again.");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report this {targetType}</DialogTitle>
          <DialogDescription>
            Reports are confidential. We review them against our Terms and may remove the content.
          </DialogDescription>
        </DialogHeader>

        <form
          id="report-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (reason) report.mutate();
          }}
          className="space-y-4"
        >
          <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-medium">What's wrong?</legend>
            <RadioGroup value={reason} onValueChange={(v) => setReason(v as Reason)}>
              {REASONS.map((r) => (
                <div key={r.value} className="flex items-center gap-2">
                  <RadioGroupItem value={r.value} id={`report-${r.value}`} />
                  <Label htmlFor={`report-${r.value}`} className="font-normal">
                    {r.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </fieldset>

          <div className="space-y-2">
            <Label htmlFor="report-details">Details (optional)</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              maxLength={1000}
              placeholder="Anything that helps us understand the problem"
              className="min-h-[80px]"
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="report-form" disabled={!reason || report.isPending}>
            {report.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Send report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

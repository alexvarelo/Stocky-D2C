import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const EDUCATIONAL_DISCLAIMER_TEXT = "Educational information, not financial advice.";

interface EducationalDisclaimerProps {
  className?: string;
}

/** Short compliance notice shown wherever analysis, risk or planning content appears. */
export function EducationalDisclaimer({ className }: EducationalDisclaimerProps) {
  return (
    <p className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{EDUCATIONAL_DISCLAIMER_TEXT}</span>
    </p>
  );
}

export default EducationalDisclaimer;

import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import i18n from "@/i18n";

/**
 * The notice in the current UI language. A function (not a constant) so it
 * follows language changes; prefer <EducationalDisclaimer /> in JSX.
 */
export const getEducationalDisclaimerText = () => i18n.t("compliance.educational", { ns: "common" });

interface EducationalDisclaimerProps {
  className?: string;
}

/** Short compliance notice shown wherever analysis, risk or planning content appears. */
export function EducationalDisclaimer({ className }: EducationalDisclaimerProps) {
  const { t } = useTranslation();
  return (
    <p className={cn("flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <Info className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{t("compliance.educational")}</span>
    </p>
  );
}

export default EducationalDisclaimer;

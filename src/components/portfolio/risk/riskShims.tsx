// INTEGRATION: replace with re-exports from @/components/glossary/Term and @/components/compliance/EducationalDisclaimer
import type { ReactNode } from "react";
import { getGlossaryEntry } from "@/content/glossary";
import { cn } from "@/lib/utils";

export function Term({
  id,
  children,
  className,
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      title={getGlossaryEntry(id)?.short}
      className={cn("underline decoration-dotted underline-offset-4 cursor-help", className)}
    >
      {children}
    </span>
  );
}

export function EducationalDisclaimer({ className }: { className?: string }) {
  return (
    <p className={cn("text-xs text-muted-foreground", className)}>
      Educational information, not financial advice.
    </p>
  );
}

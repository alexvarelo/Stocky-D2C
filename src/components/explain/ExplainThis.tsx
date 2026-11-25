import { Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useStockyChatActions } from "@/contexts/StockyChatContext";
import { cn } from "@/lib/utils";

export interface ExplainContext {
  /** What is being shown, e.g. "RSI (14)" or "Revenue vs Net income chart". */
  label: string;
  /** What kind of thing is shown ("chart", "indicator", "calculator", "lesson"...). Defaults to "chart/metric". */
  noun?: string;
  ticker?: string;
  /** Current value as already formatted for display. */
  value?: string;
  /** Extra neutral detail, e.g. the period. */
  detail?: string;
}

export function buildExplainPrompt({ label, noun, ticker, value, detail }: ExplainContext): string {
  const parts = [`Explain what this ${noun ?? "chart/metric"} shows: ${label}`];
  if (ticker) parts[0] += ` for ${ticker}`;
  if (value) parts.push(`current value ${value}`);
  if (detail) parts.push(detail);
  return `${parts.join(", ")}. Explain didactically; no buy/sell advice.`;
}

interface ExplainThisProps {
  context: ExplainContext;
  className?: string;
}

/** Small icon button that opens Stocky with a neutral, prefilled question. Do not nest it inside another button. */
export function ExplainThis({ context, className }: ExplainThisProps) {
  const chat = useStockyChatActions();
  if (!chat) return null;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={`Explain this: ${context.label}`}
          onClick={() => chat.openWithDraft(buildExplainPrompt(context))}
          className={cn(
            "inline-flex h-7 min-h-6 w-7 min-w-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
        </button>
      </TooltipTrigger>
      <TooltipContent>Explain this</TooltipContent>
    </Tooltip>
  );
}

export default ExplainThis;

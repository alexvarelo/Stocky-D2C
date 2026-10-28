import { AlertTriangle, HelpCircle, PieChart, RefreshCw } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { usePortfolioAISummary } from "@/api/portfolio/usePortfolioAISummary";
import { StockyLogo } from "@/components/brand/StockyLogo";
import { useTypewriterRotation } from "@/hooks/useTypewriterRotation";

interface AISummaryContentProps {
  portfolioId: string;
  open: boolean;
}

const LOADING_PHRASES = [
  "Reading your holdings…",
  "Weighing today's moves…",
  "Checking the risks…",
];

function AISummaryLoading() {
  const prefersReducedMotion = useReducedMotion();
  const { text } = useTypewriterRotation(LOADING_PHRASES, {
    holdMs: 1600,
    typeSpeedMs: 22,
    reduced: prefersReducedMotion || false,
  });

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <motion.div
        animate={prefersReducedMotion ? undefined : { scale: [1, 1.08, 1] }}
        transition={prefersReducedMotion ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <StockyLogo variant="ink" size={40} />
      </motion.div>
      <p className="min-h-[20px] text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export const AISummaryContent = ({ portfolioId, open }: AISummaryContentProps) => {
  const { data, isLoading, error, refetch, isFetching } = usePortfolioAISummary(portfolioId, open);

  if (!open) return null;

  if (isLoading || isFetching) {
    return <AISummaryLoading />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertTriangle className="h-6 w-6 text-danger" />
        <p className="text-sm text-muted-foreground">Couldn't generate a summary right now.</p>
        <button
          className="text-sm font-medium text-primary underline underline-offset-4"
          onClick={() => refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  const result = data?.result;
  if (!result) {
    return <div className="py-16 text-center text-sm text-muted-foreground">No summary available.</div>;
  }

  // Responses cached from the previous summarizer version lack these fields.
  const overview = result.overview ?? "";
  const risks = result.risks ?? [];
  const considerations = result.considerations ?? [];
  const assumptions = result.assumptions ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-6 pb-6">
      {/* Overview */}
      <div className="flex items-start gap-4 rounded-3xl border border-border bg-card p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <PieChart className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-bold tracking-tight">Overview</h3>
            <button
              onClick={() => refetch()}
              className="shrink-0 rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              title="Regenerate"
              aria-label="Regenerate summary"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{overview}</p>
        </div>
      </div>

      {/* Risks */}
      {risks.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">Risk exposures</h3>
            <span className="rounded-full bg-danger-light px-2 py-0.5 text-xs font-semibold text-danger">
              {risks.length}
            </span>
          </div>
          <div className="space-y-2">
            {risks.map((risk, idx) => (
              <div key={idx} className="flex gap-3 rounded-2xl border border-border bg-card/50 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-danger-light">
                  <AlertTriangle className="h-4 w-4 text-danger" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{risk.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{risk.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions to review: neutral prompts, never instructions to trade */}
      {considerations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">Questions to review</h3>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {considerations.length}
            </span>
          </div>
          <div className="space-y-2">
            {considerations.map((item, idx) => (
              <div key={idx} className="flex gap-3 rounded-2xl border border-border bg-card/50 p-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <HelpCircle className="h-4 w-4 text-primary" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assumptions - de-emphasized, collapsed by default */}
      {assumptions.length > 0 && (
        <details className="group rounded-2xl border border-border/60 px-4 py-3">
          <summary className="cursor-pointer list-none text-xs font-medium text-muted-foreground marker:content-none">
            <span className="inline-flex items-center gap-1">
              Based on {assumptions.length} assumption{assumptions.length === 1 ? "" : "s"}
              <span className="transition-transform group-open:rotate-180">⌄</span>
            </span>
          </summary>
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {assumptions.map((a, idx) => (
              <li key={idx}>· {a}</li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-center text-xs text-muted-foreground">
        AI-generated from your holdings. Information only, not investment advice.
      </p>
    </div>
  );
};

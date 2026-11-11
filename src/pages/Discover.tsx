import { lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { WorldMarkets } from "@/components/discover/world/WorldMarkets";

// The community tab pulls in the leaderboard and its tables; load it on demand.
const CommunityTab = lazy(() =>
  import("@/components/discover/CommunityTab").then((m) => ({ default: m.CommunityTab }))
);

const TABS = [
  { id: "markets", label: "Markets" },
  { id: "community", label: "Community" },
] as const;

export default function DiscoverPage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "community" ? "community" : "markets";

  return (
    <motion.div
      className="mx-auto w-full max-w-[1280px] pb-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div role="tablist" aria-label="Discovery" className="mb-4 inline-flex gap-1 rounded-full bg-secondary p-1">
        {TABS.map((t) => {
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              role="tab"
              type="button"
              id={`discover-tab-${t.id}`}
              aria-selected={active}
              aria-controls="discover-panel"
              onClick={() => setParams(t.id === "markets" ? {} : { tab: t.id }, { replace: true })}
              className={cn(
                "relative h-11 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-9",
                active ? "text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="discover-tab-pill"
                  className="absolute inset-0 rounded-full bg-foreground"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>

      <div id="discover-panel" role="tabpanel" aria-labelledby={`discover-tab-${tab}`}>
        {tab === "markets" ? (
          <WorldMarkets />
        ) : (
          <Suspense
            fallback={
              <div role="status" className="flex min-h-[40vh] items-center justify-center">
                <span className="sr-only">Loading</span>
                <span
                  aria-hidden="true"
                  className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground"
                />
              </div>
            }
          >
            <CommunityTab />
          </Suspense>
        )}
      </div>
    </motion.div>
  );
}

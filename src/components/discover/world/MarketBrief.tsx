import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { invokeFunction } from "@/api/functions";
import { StockyLogo } from "@/components/brand/StockyLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { REGIONS } from "./companies";
import { formatPercent, type WorldQuote } from "./useWorldQuotes";

interface Brief {
  headline: string;
  summary: string;
  themes: { title: string; detail: string }[];
}

const average = (values: number[]) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0);

function strongest<T extends string>(quotes: WorldQuote[], keyOf: (_q: WorldQuote) => T) {
  const groups = new Map<T, number[]>();
  quotes.forEach((q) => groups.set(keyOf(q), [...(groups.get(keyOf(q)) ?? []), q.changePercent ?? 0]));
  return [...groups.entries()].map(([key, moves]) => ({ key, avg: average(moves) })).sort((a, b) => b.avg - a.avg)[0];
}

/** The same kind of read, worked out from the prices alone. Shown when the AI brief is unavailable. */
function computedBrief(priced: WorldQuote[]): Brief {
  const rising = priced.filter((q) => (q.changePercent ?? 0) > 0).length;
  const sorted = [...priced].sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0));
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const region = strongest(priced, (q) => q.region);
  const sector = strongest(priced, (q) => q.sector);
  const regionLabel = REGIONS.find((r) => r.id === region?.key)?.label ?? "";

  return {
    headline: `${rising} of ${priced.length} companies are rising today`,
    summary: `${top.name} has the biggest gain at ${formatPercent(top.changePercent)}, and ${bottom.name} the biggest fall at ${formatPercent(bottom.changePercent)}.`,
    themes: [
      { title: `${regionLabel} leads`, detail: `Companies there are moving ${formatPercent(region.avg)} on average.` },
      { title: `${sector.key} is strongest`, detail: `The sector's average move today is ${formatPercent(sector.avg)}.` },
      {
        title: "Average move",
        detail: `Across all ${priced.length} companies the average is ${formatPercent(average(priced.map((q) => q.changePercent ?? 0)))}.`,
      },
    ],
  };
}

export function MarketBrief({ quotes }: { quotes: WorldQuote[] }) {
  const reducedMotion = useReducedMotion();
  const priced = useMemo(() => quotes.filter((q) => q.changePercent !== null), [quotes]);
  const latest = useRef(priced);
  latest.current = priced;

  // One brief per half hour: enough to follow the session without an LLM call on every price tick.
  const slot = Math.floor(Date.now() / (30 * 60_000));
  const ready = priced.length >= Math.min(30, quotes.length);

  const ai = useQuery({
    queryKey: ["discover-market-brief", slot],
    queryFn: () =>
      invokeFunction<Brief>("discover-market-brief", {
        companies: latest.current.map((q) => ({
          symbol: q.symbol,
          name: q.name,
          region: q.region,
          sector: q.sector,
          changePercent: q.changePercent,
        })),
      }),
    enabled: ready,
    staleTime: 30 * 60_000,
    retry: 0,
  });

  if (!ready) {
    return <Skeleton className="h-[220px] rounded-[20px]" />;
  }

  const isAi = !!ai.data?.summary;
  const loading = ai.isLoading;
  const brief = isAi ? ai.data! : computedBrief(priced);
  const words = brief.summary.split(" ");

  return (
    <section
      aria-label="Market brief"
      aria-busy={loading}
      className="grid gap-8 rounded-[20px] border border-border bg-card p-6 md:p-8 lg:grid-cols-5"
    >
      <div className="lg:col-span-3">
        <div className="flex flex-wrap items-center gap-3">
          <motion.div
            animate={loading && !reducedMotion ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={loading ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
          >
            <StockyLogo variant="ink" size={36} />
          </motion.div>
          <h3 className="text-xl font-medium">Stocky's market brief</h3>
          {isAi ? (
            <span className="rounded-full bg-primary px-3 py-1 text-[13px] text-primary-foreground">AI-generated</span>
          ) : (
            !loading && (
              <span className="rounded-full bg-secondary px-3 py-1 text-[13px] text-foreground">
                Calculated from prices
              </span>
            )
          )}
        </div>

        {loading ? (
          <div className="mt-6 space-y-3">
            <p className="text-base text-muted-foreground">Reading today's moves…</p>
            <Skeleton className="h-8 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
          </div>
        ) : (
          <div key={isAi ? "ai" : "computed"}>
            <p className="mt-6 text-2xl font-medium leading-[1.33] md:text-[32px] md:leading-[1.19] md:tracking-[-0.32px]">
              {brief.headline}
            </p>
            <p className="mt-4 text-base text-muted-foreground md:text-lg md:leading-[1.56]">
              {reducedMotion
                ? brief.summary
                : words.map((word, i) => (
                    <motion.span
                      key={`${i}-${word}`}
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      whileInView={{ opacity: 1, filter: "blur(0px)" }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.02, 1.4) }}
                    >
                      {word}{" "}
                    </motion.span>
                  ))}
            </p>
          </div>
        )}
      </div>

      <ol className="flex flex-col justify-center gap-5 border-t border-border pt-6 lg:col-span-2 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
        {loading
          ? [0, 1, 2].map((i) => (
              <li key={i} className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </li>
            ))
          : brief.themes.map((theme, i) => (
              <motion.li
                key={theme.title}
                initial={reducedMotion ? false : { opacity: 0, x: 12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                className="flex gap-4"
              >
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-[13px] font-semibold tabular-nums">
                  {i + 1}
                </span>
                <div>
                  <p className="text-base font-semibold">{theme.title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{theme.detail}</p>
                </div>
              </motion.li>
            ))}
      </ol>

      <p className="text-[13px] text-muted-foreground lg:col-span-5">
        {isAi
          ? "Written by AI from today's price moves only. It can be wrong, and it is information only, not investment advice."
          : "Worked out directly from today's price moves. Information only, not investment advice."}
      </p>
    </section>
  );
}

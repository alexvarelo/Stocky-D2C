import { useId, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { invokeFunction } from "@/api/functions";
import { useGetHistoricalDataApiV1StockTickerHistoryGet } from "@/api/stock/stock";
import { StockyLogo } from "@/components/brand/StockyLogo";
import { CompanyLogo } from "@/components/stock/CompanyLogo";
import { Skeleton } from "@/components/ui/skeleton";
import { useTypewriterRotation } from "@/hooks/useTypewriterRotation";
import {
  DOWN_COLOR,
  FLAT_COLOR,
  UP_COLOR,
  formatMarketCap,
  formatMoney,
  formatPercent,
  moveColor,
  type WorldQuote,
} from "./useWorldQuotes";

const PERIODS = [
  { id: "1mo", label: "1M" },
  { id: "6mo", label: "6M" },
  { id: "1y", label: "1Y" },
  { id: "5y", label: "5Y" },
] as const;
type PeriodId = (typeof PERIODS)[number]["id"];

interface SpotlightPanelProps {
  company: WorldQuote | null;
}

export function SpotlightPanel({ company }: SpotlightPanelProps) {
  if (!company) {
    return (
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-[420px] rounded-[20px] lg:col-span-3" />
        <Skeleton className="h-[420px] rounded-[20px] lg:col-span-2" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <PriceCard company={company} />
      <StockyRead company={company} />
    </div>
  );
}

// ── Price history ──────────────────────────────────────────────────────────

function PriceCard({ company }: { company: WorldQuote }) {
  const [period, setPeriod] = useState<PeriodId>("6mo");
  const gradientId = useId().replace(/:/g, "");

  const { data: history, isLoading } = useGetHistoricalDataApiV1StockTickerHistoryGet(
    company.symbol,
    { period },
    {
      query: {
        staleTime: 10 * 60_000,
        select: (response) =>
          (response.data?.data ?? [])
            .filter((point) => typeof point.close === "number")
            .map((point) => ({ t: new Date(point.date).getTime(), close: point.close as number })),
      },
    }
  );

  const points = history ?? [];
  const first = points[0]?.close;
  const lastClose = points[points.length - 1]?.close;
  const periodChange = first && lastClose ? ((lastClose - first) / first) * 100 : null;
  const stroke = periodChange === null ? FLAT_COLOR : periodChange >= 0 ? UP_COLOR : DOWN_COLOR;
  const periodLabel = PERIODS.find((p) => p.id === period)?.label ?? "";

  const range =
    company.dayLow !== null && company.dayHigh !== null && company.price !== null && company.dayHigh > company.dayLow
      ? clamp01((company.price - company.dayLow) / (company.dayHigh - company.dayLow))
      : null;

  return (
    <section
      aria-label={`${company.name} price history`}
      className="flex flex-col rounded-[20px] border border-border bg-card p-6 md:p-8 lg:col-span-3"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <CompanyLogo ticker={company.symbol} companyName={company.name} size={44} />
          <div className="min-w-0">
            <AnimatePresence mode="wait" initial={false}>
              <motion.h2
                key={company.symbol}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18 }}
                className="truncate text-2xl font-bold tracking-tight"
              >
                {company.name}
              </motion.h2>
            </AnimatePresence>
            <p className="truncate text-sm text-muted-foreground">
              {company.label} · {company.sector} · {company.city}, {company.country}
            </p>
          </div>
        </div>

        <div role="group" aria-label="Chart period" className="flex gap-1 rounded-full bg-secondary p-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={p.id === period}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "h-9 min-w-11 rounded-full px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                p.id === period ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1 tabular-nums">
        <span className="text-[40px] font-bold leading-none tracking-tight">
          {formatMoney(company.price, company.currency)}
        </span>
        <span className="text-base font-semibold" style={{ color: moveColor(company.changePercent) }}>
          {formatPercent(company.changePercent)}
        </span>
        <span className="text-sm text-muted-foreground">today</span>
        {periodChange !== null && (
          <span className="text-sm text-muted-foreground">
            ·{" "}
            <span className="font-semibold" style={{ color: stroke }}>
              {formatPercent(periodChange)}
            </span>{" "}
            over {periodLabel}
          </span>
        )}
      </div>

      <div className="mt-6 h-[220px] w-full md:h-[260px]">
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-[12px]" />
        ) : points.length < 2 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No price history available for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="t"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(t) => format(new Date(t), period === "1mo" ? "d MMM" : period === "5y" ? "yyyy" : "MMM yy")}
                tick={{ fontSize: 13, fill: "hsl(var(--muted-foreground))" }}
                tickLine={false}
                axisLine={false}
                minTickGap={56}
              />
              <YAxis hide domain={["auto", "auto"]} />
              <Tooltip
                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const point = payload[0].payload as { t: number; close: number };
                  return (
                    <div className="rounded-[12px] border border-border bg-popover px-3 py-2 text-popover-foreground">
                      <p className="text-[13px] text-muted-foreground">{format(new Date(point.t), "d MMM yyyy")}</p>
                      <p className="text-sm font-semibold tabular-nums">{formatMoney(point.close, company.currency)}</p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="close"
                stroke={stroke}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "hsl(var(--card))" }}
                animationDuration={700}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-5 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-muted-foreground">Market value</dt>
          <dd className="mt-1 font-semibold tabular-nums">{formatMarketCap(company.marketCap, company.currency)}</dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="text-muted-foreground">Today's range</dt>
          <dd className="mt-1">
            {range === null ? (
              <span className="font-semibold">—</span>
            ) : (
              <DayRange low={company.dayLow!} high={company.dayHigh!} position={range} currency={company.currency} />
            )}
          </dd>
        </div>
        <div className="col-span-2 flex items-end sm:col-span-1 sm:justify-end">
          <Link
            to={`/instrument/${encodeURIComponent(company.symbol)}`}
            className="inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Company page <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </dl>
    </section>
  );
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

export function DayRange({
  low,
  high,
  position,
  currency,
  compact = false,
}: {
  low: number;
  high: number;
  position: number;
  currency: string;
  compact?: boolean;
}) {
  return (
    <div>
      <div
        className="relative h-1.5 rounded-full bg-foreground/15"
        role="img"
        aria-label={`Trading at ${Math.round(position * 100)}% of today's range, from ${formatMoney(low, currency)} to ${formatMoney(high, currency)}`}
      >
        <motion.span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground"
          initial={false}
          animate={{ left: `${position * 100}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 26 }}
        />
      </div>
      {!compact && (
        <div className="mt-1.5 flex justify-between text-[13px] tabular-nums text-muted-foreground">
          <span>{formatMoney(low, currency)}</span>
          <span>{formatMoney(high, currency)}</span>
        </div>
      )}
    </div>
  );
}

// ── Stocky's read (AI) ─────────────────────────────────────────────────────

interface NewsRead {
  sentiment: "BULLISH" | "BEARISH" | "NEUTRAL";
  narrative: string;
  key_topics?: string[];
  article_count: number;
  raw_articles?: { title: string; url: string; source?: { name?: string } }[];
}

const TONE: Record<NewsRead["sentiment"], { label: string; color: string }> = {
  BULLISH: { label: "Mostly positive coverage", color: UP_COLOR },
  BEARISH: { label: "Mostly negative coverage", color: DOWN_COLOR },
  NEUTRAL: { label: "Mixed coverage", color: FLAT_COLOR },
};

function StockyRead({ company }: { company: WorldQuote }) {
  const reducedMotion = useReducedMotion();

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["discover-stocky-read", company.symbol],
    // The news search works on the company name; foreign tickers return little.
    queryFn: () => invokeFunction<NewsRead>("analyze-ticker-news", { ticker: company.name }),
    staleTime: 30 * 60_000,
    retry: 0,
  });

  const loadingPhrases = useMemo(
    () => [`Reading this week's ${company.name} headlines…`, "Weighing the coverage…", "Writing it up…"],
    [company.name]
  );
  const { text: loadingText } = useTypewriterRotation(loadingPhrases, {
    holdMs: 1500,
    typeSpeedMs: 22,
    reduced: !!reducedMotion,
  });

  const words = data?.narrative ? data.narrative.split(" ") : [];
  const tone = data ? TONE[data.sentiment] ?? TONE.NEUTRAL : null;
  const hasCoverage = !!data && data.article_count > 0;

  return (
    <section
      aria-label={`Stocky's read on ${company.name}`}
      className="flex flex-col rounded-[20px] border border-border bg-card p-6 md:p-8 lg:col-span-2"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div
            animate={isLoading && !reducedMotion ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={isLoading ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" } : undefined}
          >
            <StockyLogo variant="ink" size={36} />
          </motion.div>
          <h2 className="text-xl font-semibold tracking-tight">Stocky's read</h2>
        </div>
        <span className="rounded-full bg-primary px-3 py-1 text-[13px] text-primary-foreground">AI-generated</span>
      </div>

      <div className="mt-6 flex-1" aria-live="polite" aria-busy={isLoading}>
        {isLoading || isFetching ? (
          <div>
            <p className="min-h-[24px] text-base text-muted-foreground">{loadingText}</p>
            <div className="mt-5 space-y-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : isError || !data || !data.narrative?.trim() ? (
          <div>
            <p className="text-base text-muted-foreground">
              Stocky couldn't read the news on {company.name} just now.
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 inline-flex h-11 items-center rounded-full bg-secondary px-5 text-sm font-semibold text-foreground hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Try again
            </button>
          </div>
        ) : (
          <div key={company.symbol}>
            {hasCoverage && tone && (
              <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: tone.color }} aria-hidden="true" />
                {tone.label}
                <span className="font-normal text-muted-foreground">· {data.article_count} articles</span>
              </p>
            )}

            <p className="text-lg leading-[1.56] tracking-[-0.09px]">
              {reducedMotion
                ? data.narrative
                : words.map((word, i) => (
                    <motion.span
                      key={`${i}-${word}`}
                      initial={{ opacity: 0, filter: "blur(4px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.3, delay: Math.min(i * 0.025, 1.6) }}
                    >
                      {word}{" "}
                    </motion.span>
                  ))}
            </p>

            {!!data.key_topics?.length && (
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Topics in the coverage">
                {data.key_topics.slice(0, 5).map((topic, i) => (
                  <motion.li
                    key={topic}
                    initial={reducedMotion ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.07 }}
                    className="rounded-full bg-secondary px-3 py-1 text-[13px] text-foreground"
                  >
                    {topic}
                  </motion.li>
                ))}
              </ul>
            )}

            {!!data.raw_articles?.length && (
              <div className="mt-6 border-t border-border pt-4">
                <p className="text-[13px] text-muted-foreground">Based on coverage including</p>
                <ul className="mt-2 space-y-2">
                  {data.raw_articles.slice(0, 3).map((article) => (
                    <li key={article.url}>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-start gap-2 text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="line-clamp-2">
                          {article.title}
                          {article.source?.name && (
                            <span className="text-muted-foreground"> · {article.source.name}</span>
                          )}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="mt-6 text-[13px] text-muted-foreground">
        A summary of recent news written by AI. It can be wrong, and it is information only, not investment advice.
      </p>
    </section>
  );
}

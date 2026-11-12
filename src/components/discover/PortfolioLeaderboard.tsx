import { useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTopPortfolios, type TopPortfolio } from "@/api/portfolio/useTopPortfolios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyLogo } from "@/components/stock/CompanyLogo";
import { cn } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

const SORTS = [
  { id: "total_return_percentage", label: "Best return" },
  { id: "total_value", label: "Largest" },
  { id: "holdings_count", label: "Most holdings" },
  { id: "created_at", label: "Newest" },
] as const;
type SortId = (typeof SORTS)[number]["id"];

const UP = "hsl(var(--success))";
const DOWN = "hsl(var(--danger))";

const formatReturn = (value: number) => `${value > 0 ? "+" : value < 0 ? "−" : ""}${Math.abs(value).toFixed(2)}%`;
const formatValue = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const initial = (p: TopPortfolio) => (p.user.full_name || p.user.username || "U")[0]?.toUpperCase();
const authorName = (p: TopPortfolio) => p.user.full_name || p.user.username;

export function PortfolioLeaderboard() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortId>("total_return_percentage");
  const reducedMotion = useReducedMotion();

  const { data, isLoading, error, isPlaceholderData } = useTopPortfolios({
    page,
    limit: ITEMS_PER_PAGE,
    sortBy: sort,
    sortOrder: "desc",
  });

  const portfolios = data?.portfolios ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const startIndex = (page - 1) * ITEMS_PER_PAGE;

  // The first page opens with a podium; the rest of the list follows below it.
  const podium = page === 1 ? portfolios.slice(0, 3) : [];
  const rows = page === 1 ? portfolios.slice(3) : portfolios;
  const maxReturn = Math.max(1, ...portfolios.map((p) => Math.abs(p.total_return_percentage)));

  return (
    <section aria-labelledby="leaderboard-title">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
        <div className="max-w-2xl">
          <h1
            id="leaderboard-title"
            className="text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Portfolios people share
          </h1>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base">
            Public portfolios from the community, ranked. Open one to see what it holds and how it got there.
          </p>
        </div>

        <div role="group" aria-label="Rank by" className="-mx-1 flex max-w-full gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {SORTS.map((s) => {
            const active = s.id === sort;
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  setSort(s.id);
                  setPage(1);
                }}
                className={cn(
                  "h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-9",
                  active ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-secondary/70"
                )}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={cn("mt-8 transition-opacity", isPlaceholderData && "opacity-60")} aria-busy={isLoading}>
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-[300px] rounded-[20px]" />
              ))}
            </div>
            <Skeleton className="h-[360px] rounded-[20px]" />
          </div>
        ) : error ? (
          <p className="rounded-[20px] border border-border bg-card p-8 text-center text-muted-foreground">
            The leaderboard couldn't be loaded. Refresh the page to try again.
          </p>
        ) : portfolios.length === 0 ? (
          <p className="rounded-[20px] border border-border bg-card p-8 text-center text-muted-foreground">
            No public portfolios yet. Make one of yours public to appear here.
          </p>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${sort}-${page}`}
              initial={reducedMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reducedMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {podium.length > 0 && (
                <ol className="grid gap-4 md:grid-cols-3">
                  {podium.map((p, i) => (
                    <PodiumCard key={p.id} portfolio={p} rank={i + 1} delay={i * 0.08} />
                  ))}
                </ol>
              )}

              {rows.length > 0 && (
                <ol className="overflow-hidden rounded-[20px] border border-border bg-card">
                  {rows.map((p, i) => (
                    <RankRow
                      key={p.id}
                      portfolio={p}
                      rank={startIndex + (page === 1 ? 3 : 0) + i + 1}
                      share={Math.abs(p.total_return_percentage) / maxReturn}
                      index={i}
                    />
                  ))}
                </ol>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Leaderboard pages" className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground tabular-nums">
            {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, totalCount)} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <PageButton label="Previous page" disabled={page === 1} onClick={() => setPage((v) => Math.max(1, v - 1))}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </PageButton>
            <span className="min-w-16 text-center text-sm font-semibold tabular-nums">
              {page} / {totalPages}
            </span>
            <PageButton
              label="Next page"
              disabled={page === totalPages}
              onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </PageButton>
          </div>
        </nav>
      )}
    </section>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function PodiumCard({ portfolio: p, rank, delay }: { portfolio: TopPortfolio; rank: number; delay: number }) {
  const reducedMotion = useReducedMotion();
  // First place is the page's single cobalt surface; the others stay neutral.
  const featured = rank === 1;
  const positive = p.total_return_percentage >= 0;
  const allocation = Math.min(100, Math.max(0, p.top_holding_allocation ?? 0));

  return (
    <motion.li
      initial={reducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
    >
      <Link
        to={`/portfolio/${p.id}`}
        className={cn(
          "group flex h-full flex-col rounded-[20px] p-6 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:p-8",
          featured
            ? "bg-primary text-primary-foreground hover:bg-[#3a40c4]"
            : "border border-border bg-card hover:border-foreground/40"
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <span
            className={cn(
              "text-[48px] font-bold leading-none tracking-tight tabular-nums",
              !featured && "text-muted-foreground"
            )}
            aria-label={`Rank ${rank}`}
          >
            {rank}
          </span>
          <Avatar className="h-12 w-12">
            <AvatarImage src={p.user.avatar_url || ""} alt="" />
            <AvatarFallback className="text-base font-semibold text-foreground">{initial(p)}</AvatarFallback>
          </Avatar>
        </div>

        <p className="mt-6 line-clamp-2 text-xl font-semibold leading-[1.2] tracking-tight">{p.name}</p>
        <p className={cn("mt-1 truncate text-sm", featured ? "text-white/75" : "text-muted-foreground")}>
          {authorName(p)} · @{p.user.username}
        </p>

        <div className="mt-6 flex items-end justify-between gap-4 tabular-nums">
          <div>
            <p
              className="text-[32px] font-bold leading-none tracking-tight"
              style={featured ? undefined : { color: positive ? UP : DOWN }}
            >
              {formatReturn(p.total_return_percentage)}
            </p>
            <p className={cn("mt-1.5 text-[13px]", featured ? "text-white/75" : "text-muted-foreground")}>
              total return
            </p>
          </div>
          <div className="text-right">
            <p className="text-base font-semibold">{formatValue(p.total_value)}</p>
            <p className={cn("mt-1 text-[13px]", featured ? "text-white/75" : "text-muted-foreground")}>
              {p.holdings_count} {p.holdings_count === 1 ? "holding" : "holdings"}
            </p>
          </div>
        </div>

        {p.top_holding_ticker && (
          <div className={cn("mt-auto pt-6")}>
            <div
              className={cn("flex items-center gap-3 border-t pt-5", featured ? "border-white/25" : "border-border")}
            >
              <CompanyLogo ticker={p.top_holding_ticker} size={32} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate">
                    <span className={featured ? "text-white/75" : "text-muted-foreground"}>Largest holding </span>
                    <span className="font-semibold">{p.top_holding_ticker}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{allocation.toFixed(0)}%</span>
                </div>
                <div className={cn("mt-2 h-1.5 rounded-full", featured ? "bg-white/25" : "bg-foreground/15")}>
                  <motion.div
                    className={cn("h-full rounded-full", featured ? "bg-white" : "bg-foreground")}
                    initial={reducedMotion ? false : { width: 0 }}
                    animate={{ width: `${allocation}%` }}
                    transition={{ duration: 0.8, delay: delay + 0.25, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Link>
    </motion.li>
  );
}

function RankRow({
  portfolio: p,
  rank,
  share,
  index,
}: {
  portfolio: TopPortfolio;
  rank: number;
  share: number;
  index: number;
}) {
  const reducedMotion = useReducedMotion();
  const positive = p.total_return_percentage >= 0;

  return (
    <li className="border-b border-border last:border-b-0">
      <Link
        to={`/portfolio/${p.id}`}
        className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-x-4 px-5 py-4 transition-colors hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:grid-cols-[2.5rem_minmax(0,1.4fr)_minmax(0,1fr)_7rem_minmax(0,1fr)] md:px-8"
      >
        <span className="text-base font-semibold tabular-nums text-muted-foreground">{rank}</span>

        <span className="flex min-w-0 items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={p.user.avatar_url || ""} alt="" />
            <AvatarFallback className="text-sm font-semibold">{initial(p)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold">{p.name}</span>
            <span className="block truncate text-[13px] text-muted-foreground">
              {authorName(p)} · @{p.user.username}
            </span>
          </span>
        </span>

        <span className="hidden min-w-0 items-center gap-2 text-sm text-muted-foreground md:flex">
          {p.top_holding_ticker ? (
            <>
              <CompanyLogo ticker={p.top_holding_ticker} size={24} />
              <span className="truncate">
                <span className="font-semibold text-foreground">{p.top_holding_ticker}</span> · {p.holdings_count}{" "}
                {p.holdings_count === 1 ? "holding" : "holdings"}
              </span>
            </>
          ) : (
            <span>No holdings yet</span>
          )}
        </span>

        <span className="hidden text-right text-sm font-semibold tabular-nums md:block">
          {formatValue(p.total_value)}
        </span>

        <span className="flex items-center justify-end gap-3">
          <span className="hidden h-1.5 flex-1 rounded-full bg-foreground/10 md:block" aria-hidden="true">
            <motion.span
              className="block h-full rounded-full"
              style={{ background: positive ? UP : DOWN }}
              initial={reducedMotion ? false : { width: 0 }}
              animate={{ width: `${Math.max(2, share * 100)}%` }}
              transition={{ duration: 0.7, delay: 0.1 + index * 0.04, ease: [0.22, 1, 0.36, 1] }}
            />
          </span>
          <span
            className="w-[5.5rem] shrink-0 text-right text-base font-semibold tabular-nums"
            style={{ color: positive ? UP : DOWN }}
          >
            {formatReturn(p.total_return_percentage)}
          </span>
        </span>
      </Link>
    </li>
  );
}

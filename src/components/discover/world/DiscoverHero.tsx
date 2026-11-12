import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/components/magicui/marquee";
import { CompanyLogo } from "@/components/stock/CompanyLogo";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";
import { EXCHANGES, REGIONS, openExchanges, type RegionId } from "./companies";
import { MarketGlobe } from "./MarketGlobe";
import {
  DOWN_COLOR,
  UP_COLOR,
  formatMoney,
  formatPercent,
  moveColor,
  type WorldQuote,
} from "./useWorldQuotes";

interface DiscoverHeroProps {
  quotes: WorldQuote[];
  isLoading: boolean;
  isError: boolean;
  updatedAt: number;
  region: RegionId;
  onRegionChange: (_region: RegionId) => void;
  selected: WorldQuote | null;
  onSelect: (_symbol: string) => void;
  focus: [number, number];
}

function Count({ value }: { value: number }) {
  const animated = useAnimatedNumber(value, 1.2);
  return <span className="tabular-nums">{Math.round(animated)}</span>;
}

export function DiscoverHero({
  quotes,
  isLoading,
  isError,
  updatedAt,
  region,
  onRegionChange,
  selected,
  onSelect,
  focus,
}: DiscoverHeroProps) {
  const inRegion = useMemo(
    () => quotes.filter((q) => region === "all" || q.region === region),
    [quotes, region]
  );
  const priced = inRegion.filter((q) => q.changePercent !== null);
  const rising = priced.filter((q) => (q.changePercent ?? 0) > 0).length;
  const falling = priced.filter((q) => (q.changePercent ?? 0) < 0).length;

  // Which exchanges are in session, re-checked every minute.
  const [open, setOpen] = useState(() => openExchanges());
  useEffect(() => {
    const id = setInterval(() => setOpen(openExchanges()), 60_000);
    return () => clearInterval(id);
  }, []);

  const openLabel =
    open.length === 0
      ? "All markets closed"
      : open
          .slice(0, 3)
          .map((id) => EXCHANGES[id].name)
          .join(", ") + (open.length > 3 ? ` +${open.length - 3}` : "");

  const tape = quotes.filter((q) => q.price !== null);

  return (
    <section
      aria-labelledby="discover-title"
      className="relative overflow-hidden rounded-[28px] bg-black text-white dark:border dark:border-white/10"
    >
      <div className="relative z-10 flex flex-col items-center px-5 pt-10 text-center md:pt-12">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-sm text-white/70"
        >
          <span className="relative flex h-2 w-2">
            {open.length > 0 && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70 motion-reduce:hidden" />
            )}
            <span className={cn("relative inline-flex h-2 w-2 rounded-full", open.length ? "bg-white" : "bg-white/40")} />
          </span>
          {open.length > 0 ? `Trading now: ${openLabel}` : openLabel}
        </motion.p>

        <motion.h1
          id="discover-title"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-5 max-w-[16ch] text-[40px] font-medium leading-none tracking-[-0.03em] sm:text-[56px] lg:text-[64px]"
        >
          The companies you know, on one planet
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12 }}
          className="mt-5 max-w-xl text-base text-white/70 md:text-lg"
        >
          {quotes.length} household names placed where they are headquartered. Turn the globe and pick one to see how it
          is trading today.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-base"
          aria-live="polite"
        >
          {isError ? (
            <span className="text-white/70">Live prices are unavailable right now.</span>
          ) : (
            <>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: UP_COLOR }} />
                <span className="font-semibold">{isLoading ? "—" : <Count value={rising} />}</span>
                <span className="text-white/60">rising</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: DOWN_COLOR }} />
                <span className="font-semibold">{isLoading ? "—" : <Count value={falling} />}</span>
                <span className="text-white/60">falling</span>
              </span>
              {updatedAt > 0 && (
                <span className="text-sm text-white/50">
                  Updated {new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              )}
            </>
          )}
        </motion.div>

        <div
          role="group"
          aria-label="Region"
          className="mt-6 flex max-w-full gap-2 overflow-x-auto pb-1 [scrollbar-width:none]"
        >
          {REGIONS.map((r) => {
            const active = r.id === region;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={active}
                onClick={() => onRegionChange(r.id)}
                className={cn(
                  "relative h-11 shrink-0 rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white md:h-9 md:px-4",
                  active ? "text-black" : "bg-[#16181a] text-white hover:bg-white/15"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="discover-region-pill"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative">{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="relative -mt-2">
        <MarketGlobe
          quotes={quotes}
          selectedSymbol={selected?.symbol ?? null}
          onSelect={onSelect}
          region={region}
          focus={focus}
          className="h-[340px] sm:h-[440px] lg:h-[540px]"
        />

        {/* Selected company */}
        <div className="pointer-events-none relative -mt-10 flex items-end justify-between gap-4 px-4 pb-4 sm:absolute sm:inset-x-0 sm:bottom-0 sm:mt-0 sm:px-5 sm:pb-5 md:px-8 md:pb-7">
          <AnimatePresence mode="wait">
            {selected && (
              <motion.div
                key={selected.symbol}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="pointer-events-auto w-full rounded-[20px] bg-[#16181a] p-4 text-left sm:max-w-sm sm:p-5"
              >
                <div className="flex items-center gap-3">
                  <CompanyLogo ticker={selected.symbol} companyName={selected.name} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold">{selected.name}</p>
                    <p className="truncate text-[13px] text-white/60">
                      {selected.label} · {selected.city}, {selected.country}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="tabular-nums">
                    <p className="text-2xl font-medium leading-none tracking-[-0.01em]">
                      {formatMoney(selected.price, selected.currency)}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold" style={{ color: moveColor(selected.changePercent) }}>
                      {formatPercent(selected.changePercent)} <span className="font-normal text-white/50">today</span>
                    </p>
                  </div>
                  <Link
                    to={`/instrument/${encodeURIComponent(selected.symbol)}`}
                    className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-[#c9c9cd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    Open <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ul className="hidden shrink-0 flex-col gap-1.5 text-right text-[13px] text-white/60 lg:flex">
            <li>Dot size shows the size of today's move</li>
            <li>A pulsing dot means its market is open</li>
            <li>Drag to turn the globe</li>
          </ul>
        </div>
      </div>

      {/* Tape */}
      {tape.length > 0 && (
        <div className="relative border-t border-white/10 py-3">
          <Marquee pauseOnHover repeat={2} className="p-0 [--duration:90s] [--gap:2rem]">
            {tape.map((q) => (
              <button
                key={q.symbol}
                type="button"
                onClick={() => onSelect(q.symbol)}
                className="flex items-center gap-2 rounded-full px-1 text-sm tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <span className="font-semibold">{q.label}</span>
                <span className="text-white/60">{formatMoney(q.price, q.currency)}</span>
                <span className="font-semibold" style={{ color: moveColor(q.changePercent) }}>
                  {formatPercent(q.changePercent)}
                </span>
              </button>
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent" />
        </div>
      )}
    </section>
  );
}

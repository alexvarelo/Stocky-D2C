import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "@/components/stock/CompanyLogo";
import { REGIONS, SECTORS, type RegionId, type Sector } from "./companies";
import { DayRange } from "./SpotlightPanel";
import {
  DOWN_COLOR,
  UP_COLOR,
  formatMoney,
  formatPercent,
  moveColor,
  type WorldQuote,
} from "./useWorldQuotes";

// ── Region tiles ───────────────────────────────────────────────────────────

interface RegionTilesProps {
  quotes: WorldQuote[];
  region: RegionId;
  onRegionChange: (_region: RegionId) => void;
}

export function RegionTiles({ quotes, region, onRegionChange }: RegionTilesProps) {
  const tiles = REGIONS.filter((r) => r.id !== "all").map((r) => {
    const priced = quotes.filter((q) => q.region === r.id && q.changePercent !== null);
    const rising = priced.filter((q) => (q.changePercent ?? 0) > 0).length;
    const falling = priced.filter((q) => (q.changePercent ?? 0) < 0).length;
    const average = priced.length
      ? priced.reduce((sum, q) => sum + (q.changePercent ?? 0), 0) / priced.length
      : null;
    return { ...r, total: priced.length, rising, falling, average };
  });

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {tiles.map((tile, i) => {
        const active = region === tile.id;
        const flat = tile.total - tile.rising - tile.falling;
        return (
          <motion.button
            key={tile.id}
            type="button"
            aria-pressed={active}
            onClick={() => onRegionChange(active ? "all" : tile.id)}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className={cn(
              "rounded-[20px] border bg-card p-5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active ? "border-foreground" : "border-border hover:border-foreground/40"
            )}
          >
            <p className="text-sm text-muted-foreground">{tile.label}</p>
            <p className="mt-2 text-[32px] font-medium leading-none tracking-[-0.01em] tabular-nums">
              {formatPercent(tile.average)}
            </p>
            <p className="mt-1 text-[13px] text-muted-foreground">average move today</p>

            {/* Share rising vs falling */}
            <div className="mt-4 flex h-1.5 gap-0.5" aria-hidden="true">
              {tile.total === 0 ? (
                <span className="h-full w-full rounded-full bg-foreground/15" />
              ) : (
                <>
                  {tile.rising > 0 && (
                    <span className="h-full rounded-full" style={{ flex: tile.rising, background: UP_COLOR }} />
                  )}
                  {flat > 0 && <span className="h-full rounded-full bg-foreground/15" style={{ flex: flat }} />}
                  {tile.falling > 0 && (
                    <span className="h-full rounded-full" style={{ flex: tile.falling, background: DOWN_COLOR }} />
                  )}
                </>
              )}
            </div>
            <p className="mt-2 text-[13px] tabular-nums text-muted-foreground">
              {tile.total === 0 ? "Waiting for prices" : `${tile.rising} rising · ${tile.falling} falling`}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Today's moves ──────────────────────────────────────────────────────────
// One column per company, ordered from the biggest gain to the biggest fall,
// growing up or down from a shared zero line.

interface MovesSkylineProps {
  quotes: WorldQuote[];
  region: RegionId;
  selectedSymbol: string | null;
  onSelect: (_symbol: string) => void;
}

const HALF = 96; // px available above and below the zero line

export function MovesSkyline({ quotes, region, selectedSymbol, onSelect }: MovesSkylineProps) {
  const reducedMotion = useReducedMotion();
  const [hovered, setHovered] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      quotes
        .filter((q) => q.changePercent !== null && (region === "all" || q.region === region))
        .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0)),
    [quotes, region]
  );

  const max = Math.max(1, ...rows.map((q) => Math.abs(q.changePercent ?? 0)));
  // Name the biggest gain and fall; the rest are named on hover.
  const labelled = new Set([rows[0], rows[rows.length - 1]].map((q) => q?.symbol));
  const active = rows.find((q) => q.symbol === hovered) ?? null;

  if (rows.length === 0) {
    return (
      <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
        Waiting for today's prices.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex min-h-[44px] flex-wrap items-center justify-between gap-x-6 gap-y-1">
        <div className="flex items-center gap-5 text-[13px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: UP_COLOR }} /> Up today
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: DOWN_COLOR }} /> Down today
          </span>
        </div>
        <p className="text-sm tabular-nums" aria-live="polite">
          {active ? (
            <>
              <span className="font-semibold">{active.name}</span>{" "}
              <span className="text-muted-foreground">{formatMoney(active.price, active.currency)}</span>{" "}
              <span className="font-semibold" style={{ color: moveColor(active.changePercent) }}>
                {formatPercent(active.changePercent)}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Select a bar to spotlight that company</span>
          )}
        </p>
      </div>

      <div className="overflow-x-auto pb-1">
        <div
          className="relative flex min-w-[560px] items-stretch gap-0.5"
          style={{ height: HALF * 2 + 44 }}
          onMouseLeave={() => setHovered(null)}
        >
          {/* zero line */}
          <div className="pointer-events-none absolute inset-x-0 h-px bg-border" style={{ top: HALF + 22 }} />

          {rows.map((q, i) => {
            const value = q.changePercent ?? 0;
            const up = value >= 0;
            const size = Math.max(3, (Math.abs(value) / max) * HALF);
            const isSelected = q.symbol === selectedSymbol;
            const dim = hovered !== null && hovered !== q.symbol;
            return (
              <motion.button
                layout={!reducedMotion}
                key={q.symbol}
                type="button"
                onMouseEnter={() => setHovered(q.symbol)}
                onFocus={() => setHovered(q.symbol)}
                onBlur={() => setHovered(null)}
                onClick={() => onSelect(q.symbol)}
                aria-label={`${q.name}, ${formatPercent(q.changePercent)} today`}
                aria-pressed={isSelected}
                className="group relative min-w-0 flex-1 rounded-[6px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                transition={{ type: "spring", stiffness: 300, damping: 32 }}
              >
                <motion.span
                  className="absolute inset-x-0 mx-auto block w-full max-w-[26px] transition-opacity"
                  style={{
                    background: up ? UP_COLOR : DOWN_COLOR,
                    opacity: dim ? 0.35 : 1,
                    borderRadius: up ? "4px 4px 0 0" : "0 0 4px 4px",
                    ...(up ? { bottom: HALF + 22 + 1 } : { top: HALF + 22 + 1 }),
                    transformOrigin: up ? "bottom" : "top",
                    outline: isSelected ? "2px solid hsl(var(--foreground))" : "none",
                    outlineOffset: 2,
                  }}
                  initial={reducedMotion ? false : { height: 0 }}
                  animate={{ height: size }}
                  transition={{ duration: 0.6, delay: reducedMotion ? 0 : i * 0.012, ease: [0.22, 1, 0.36, 1] }}
                />
                {(labelled.has(q.symbol) || isSelected || hovered === q.symbol) && (
                  <span
                    className={cn(
                      "pointer-events-none absolute whitespace-nowrap text-[11px] font-semibold",
                      i === 0 ? "left-0" : i === rows.length - 1 ? "right-0" : "left-1/2 -translate-x-1/2",
                      hovered === q.symbol || isSelected ? "z-10 text-foreground" : "text-muted-foreground",
                      hovered !== null && hovered !== q.symbol && "opacity-0"
                    )}
                    style={up ? { bottom: HALF + 22 + size + 6 } : { top: HALF + 22 + size + 6 }}
                  >
                    {q.label}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Household names ────────────────────────────────────────────────────────

interface HouseholdGridProps {
  quotes: WorldQuote[];
  region: RegionId;
  isLoading: boolean;
}

export function HouseholdGrid({ quotes, region, isLoading }: HouseholdGridProps) {
  const [sector, setSector] = useState<Sector | "All">("All");
  const reducedMotion = useReducedMotion();

  const inRegion = quotes.filter((q) => region === "all" || q.region === region);
  const available = SECTORS.filter((s) => inRegion.some((q) => q.sector === s));
  const activeSector = sector !== "All" && !available.includes(sector) ? "All" : sector;
  const visible = inRegion.filter((q) => activeSector === "All" || q.sector === activeSector);

  return (
    <div>
      <div
        role="group"
        aria-label="Sector"
        className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2 [scrollbar-width:none]"
      >
        {(["All", ...available] as const).map((s) => {
          const active = s === activeSector;
          return (
            <button
              key={s}
              type="button"
              aria-pressed={active}
              onClick={() => setSector(s)}
              className={cn(
                "h-11 shrink-0 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:h-9",
                active ? "bg-foreground text-background" : "bg-secondary text-foreground hover:bg-secondary/70"
              )}
            >
              {s}
            </button>
          );
        })}
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((q) => {
            const range =
              q.dayLow !== null && q.dayHigh !== null && q.price !== null && q.dayHigh > q.dayLow
                ? Math.min(1, Math.max(0, (q.price - q.dayLow) / (q.dayHigh - q.dayLow)))
                : null;
            return (
              <motion.li
                key={q.symbol}
                layout={!reducedMotion}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22 }}
              >
                <Link
                  to={`/instrument/${encodeURIComponent(q.symbol)}`}
                  className="group flex h-full flex-col rounded-[20px] border border-border bg-card p-5 transition-colors hover:border-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <div className="flex items-center gap-3">
                    <CompanyLogo ticker={q.symbol} companyName={q.name} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-base font-semibold">{q.name}</p>
                      <p className="truncate text-[13px] text-muted-foreground">
                        {q.label} · {q.city}
                      </p>
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-5 flex items-baseline justify-between gap-3 tabular-nums">
                    <span className="text-xl font-medium">
                      {isLoading && q.price === null ? "…" : formatMoney(q.price, q.currency)}
                    </span>
                    <span className="text-sm font-semibold" style={{ color: moveColor(q.changePercent) }}>
                      {formatPercent(q.changePercent)}
                    </span>
                  </div>

                  <div className="mt-4">
                    {range !== null ? (
                      <DayRange low={q.dayLow!} high={q.dayHigh!} position={range} currency={q.currency} compact />
                    ) : (
                      <div className="h-1.5 rounded-full bg-foreground/15" aria-hidden="true" />
                    )}
                    <p className="mt-2 text-[13px] text-muted-foreground">Today's low to high</p>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}

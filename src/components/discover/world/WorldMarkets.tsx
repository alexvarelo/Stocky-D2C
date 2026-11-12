import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { REGIONS, type RegionId } from "./companies";
import { DiscoverHero } from "./DiscoverHero";
import { MarketBrief } from "./MarketBrief";
import { HouseholdGrid, MovesSkyline, RegionTiles } from "./MarketSections";
import { SpotlightPanel } from "./SpotlightPanel";
import { useWorldQuotes } from "./useWorldQuotes";

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45 }}
      className="mb-6 max-w-2xl"
    >
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">{description}</p>
    </motion.div>
  );
}

export function WorldMarkets() {
  const { quotes, isLoading, isError, updatedAt } = useWorldQuotes();
  const [region, setRegion] = useState<RegionId>("all");
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [focus, setFocus] = useState<[number, number]>(REGIONS[0].focus);
  const spotlightRef = useRef<HTMLDivElement>(null);

  // Open on the day's biggest mover, so the page never starts on a blank pick.
  useEffect(() => {
    if (selectedSymbol) return;
    const movers = quotes
      .filter((q) => q.changePercent !== null)
      .sort((a, b) => Math.abs(b.changePercent ?? 0) - Math.abs(a.changePercent ?? 0));
    if (movers[0]) setSelectedSymbol(movers[0].symbol);
  }, [quotes, selectedSymbol]);

  const selected = useMemo(
    () => quotes.find((q) => q.symbol === selectedSymbol) ?? null,
    [quotes, selectedSymbol]
  );

  const changeRegion = (next: RegionId) => {
    setRegion(next);
    setFocus([...(REGIONS.find((r) => r.id === next) ?? REGIONS[0]).focus] as [number, number]);
  };

  // Picking a company anywhere turns the globe to it.
  const select = (symbol: string, turnGlobe = true) => {
    setSelectedSymbol(symbol);
    const company = quotes.find((q) => q.symbol === symbol);
    if (!company) return;
    if (region !== "all" && company.region !== region) setRegion("all");
    if (turnGlobe) setFocus([company.lng, company.lat]);
  };

  return (
    <div className="space-y-16 md:space-y-[88px]">
      <div className="space-y-4">
        <DiscoverHero
          quotes={quotes}
          isLoading={isLoading}
          isError={isError}
          updatedAt={updatedAt}
          region={region}
          onRegionChange={changeRegion}
          selected={selected}
          onSelect={(symbol) => select(symbol, false)}
          focus={focus}
        />
        <div ref={spotlightRef} className="scroll-mt-20">
          <SpotlightPanel company={selected} />
        </div>
      </div>

      <section aria-label="Today's moves">
        <SectionHeading
          title="Today's moves, side by side"
          description="Every company ordered from the biggest gain to the biggest fall. Pick a region to narrow it down."
        />
        <MarketBrief quotes={quotes} />
        <div className="mt-4">
          <RegionTiles quotes={quotes} region={region} onRegionChange={changeRegion} />
        </div>
        <div className="mt-4 rounded-[20px] border border-border bg-card p-6 md:p-8">
          <MovesSkyline
            quotes={quotes}
            region={region}
            selectedSymbol={selectedSymbol}
            onSelect={(symbol) => {
              select(symbol);
              spotlightRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          />
        </div>
      </section>

      <section aria-label="Household names">
        <SectionHeading
          title="Household names"
          description="Browse by sector and open any company for its full page: financials, news and what the community says."
        />
        <HouseholdGrid quotes={quotes} region={region} isLoading={isLoading} />
      </section>

      <p className="text-[13px] text-muted-foreground">
        Prices may be delayed and are shown in each company's trading currency. Market hours reflect regular sessions and
        ignore public holidays. Nothing on this page is investment advice.
      </p>
    </div>
  );
}

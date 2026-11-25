import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, FlaskConical } from "lucide-react";
import { usePortfolio } from "@/api/portfolio/portfolio";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MAX_POSITIONS, invalidTickers, toPositions } from "@/lib/portfolioPositions";
import { useAuth } from "@/lib/auth";
import { CURRENCIES } from "@/components/scenarios/format";
import { MAX_WHATIF_TICKERS } from "@/components/scenarios/WhatIfTab";
import { StressTab } from "@/components/scenarios/StressTab";
import { MonteCarloTab } from "@/components/scenarios/MonteCarloTab";
import { WhatIfTab } from "@/components/scenarios/WhatIfTab";
import { SavedScenariosList } from "@/components/scenarios/SavedScenariosList";
import { ErrorBox } from "@/components/scenarios/shared";
import { useCreateSavedScenario, type SavedScenario, type ScenarioKind } from "@/hooks/useSavedScenarios";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";

export default function PortfolioScenarios() {
  const { portfolioId } = useParams<{ portfolioId: string }>();
  const { data: portfolio, isLoading, error } = usePortfolio(portfolioId ?? "");
  const { user } = useAuth();
  const create = useCreateSavedScenario();
  const [tab, setTab] = useState<ScenarioKind>("stress");
  const [loaded, setLoaded] = useState<{ nonce: number; kind: ScenarioKind; params: Record<string, unknown> } | null>(null);

  const holdings = useMemo(() => portfolio?.holdings ?? [], [portfolio?.holdings]);
  const positions = useMemo(() => toPositions(holdings), [holdings]);
  const whatIfPositions = useMemo(() => toPositions(holdings, MAX_WHATIF_TICKERS), [holdings]);
  const uniqueCount = useMemo(() => toPositions(holdings, Infinity).length, [holdings]);
  const skipped = useMemo(() => invalidTickers(holdings), [holdings]);
  const isOwner = !!user?.id && user.id === portfolio?.user_id;
  const rawCurrency = portfolio?.currency?.trim().toUpperCase();
  // undefined until the portfolio currency is known; runs stay disabled meanwhile.
  const currencyKnown = !!rawCurrency && rawCurrency.length === 3;
  const supported = currencyKnown && (CURRENCIES as readonly string[]).includes(rawCurrency);
  const baseCurrency: string | undefined = currencyKnown ? (supported ? rawCurrency : "USD") : undefined;

  const makeSave = isOwner
    ? (kind: ScenarioKind) => (name: string, params: Record<string, unknown>, summary: Record<string, unknown>) =>
        create.mutateAsync({ portfolio_id: portfolioId ?? null, name, kind, params, result_summary: summary })
    : () => undefined;

  const initialFor = (kind: ScenarioKind) => (loaded?.kind === kind ? loaded.params : undefined);
  const keyFor = (kind: ScenarioKind) => `${kind}-${loaded?.kind === kind ? loaded.nonce : 0}`;

  const onLoad = (s: SavedScenario) => {
    setLoaded({ nonce: Date.now(), kind: s.kind, params: s.params });
    setTab(s.kind);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-1 sm:px-4 space-y-4">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>
    );
  }

  if (error || !portfolio) {
    return (
      <div className="container mx-auto px-1 sm:px-4 space-y-4">
        <ErrorBox message="We could not load this portfolio." onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-1 sm:px-4 space-y-4 max-w-5xl">
      <Button asChild variant="ghost" size="sm" className="-ml-2 text-muted-foreground">
        <Link to={`/portfolio/${portfolioId}`}>
          <ArrowLeft className="h-4 w-4 mr-2" aria-hidden />
          Back to portfolio
        </Link>
      </Button>
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <FlaskConical className="h-6 w-6 text-muted-foreground" aria-hidden />
          Scenarios
        </h1>
        <p className="text-sm text-muted-foreground">
          {portfolio.name} · amounts in {baseCurrency ?? "…"}. Explore how your holdings would have reacted to past events and what ranges of outcomes
          a simulation produces.
        </p>
        <EducationalDisclaimer />
      </div>

      {positions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border p-8 text-center space-y-3">
          <p className="font-medium">This portfolio has no holdings yet.</p>
          <p className="text-sm text-muted-foreground">Add holdings to run stress tests and simulations.</p>
          <Button asChild variant="outline">
            <Link to={`/portfolio/${portfolioId}`}>Go to portfolio</Link>
          </Button>
        </div>
      ) : (
        <>
          {uniqueCount > MAX_POSITIONS && <p className="text-xs text-muted-foreground">Using the {MAX_POSITIONS} largest positions.</p>}
          {uniqueCount > MAX_WHATIF_TICKERS && tab === "whatif" && (
            <p className="text-xs text-muted-foreground">What if uses the {MAX_WHATIF_TICKERS} largest positions.</p>
          )}
          {skipped.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Skipped (unsupported ticker format): {skipped.join(", ")}.
            </p>
          )}
          {currencyKnown && !supported && (
            <p className="text-xs text-muted-foreground">
              {rawCurrency} is not supported for scenarios; amounts are calculated in USD.
            </p>
          )}
          {!currencyKnown && <p className="text-xs text-muted-foreground">Waiting for the portfolio currency before simulations can run.</p>}
          <Tabs value={tab} onValueChange={(v) => setTab(v as ScenarioKind)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-grid">
              <TabsTrigger value="stress">Stress</TabsTrigger>
              <TabsTrigger value="montecarlo">Monte Carlo</TabsTrigger>
              <TabsTrigger value="whatif">What if</TabsTrigger>
            </TabsList>
            {/* forceMount keeps each tab's inputs and results while switching tabs. */}
            <TabsContent value="stress" forceMount className="data-[state=inactive]:hidden mt-0">
              <StressTab key={keyFor("stress")} positions={positions} baseCurrency={baseCurrency} initial={initialFor("stress")} onSave={makeSave("stress")} saving={create.isPending} />
            </TabsContent>
            <TabsContent value="montecarlo" forceMount className="data-[state=inactive]:hidden mt-0">
              <MonteCarloTab key={keyFor("montecarlo")} positions={positions} baseCurrency={baseCurrency} initial={initialFor("montecarlo")} onSave={makeSave("montecarlo")} saving={create.isPending} />
            </TabsContent>
            <TabsContent value="whatif" forceMount className="data-[state=inactive]:hidden mt-0">
              <WhatIfTab key={keyFor("whatif")} positions={whatIfPositions} baseCurrency={baseCurrency} initial={initialFor("whatif")} onSave={makeSave("whatif")} saving={create.isPending} />
            </TabsContent>
          </Tabs>
          {portfolioId && isOwner && <SavedScenariosList portfolioId={portfolioId} onLoad={onLoad} />}
        </>
      )}
    </div>
  );
}

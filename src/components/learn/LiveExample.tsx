import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockSearch } from "@/components/stock/StockSearch";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import type { Lesson } from "@/content/learn";
import { LIVE_WIDGETS } from "./live/registry";

interface Props {
  example: NonNullable<Lesson["liveExample"]>;
}

/** Real-data (or calculator) illustration for a lesson. The ticker can be changed to explore. */
export function LiveExample({ example }: Props) {
  const def = LIVE_WIDGETS[example.id];
  const [ticker, setTicker] = useState((example.ticker ?? "AAPL").toUpperCase());
  if (!def) return null;
  const { Component, usesTicker } = def;

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader className="space-y-2 pb-2">
        <CardTitle className="text-base">Live example{usesTicker ? `: ${ticker}` : ""}</CardTitle>
        <p className="text-sm text-muted-foreground">{example.caption}</p>
        {usesTicker && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Try another ticker</p>
            <StockSearch onSelect={(s) => setTicker(s.symbol.toUpperCase())} placeholder="Search a stock or ETF" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <Component ticker={ticker} />
        <div className="space-y-1 border-t border-border/50 pt-3">
          <p className="text-xs font-medium text-muted-foreground">Example only — not a recommendation.</p>
          <EducationalDisclaimer />
        </div>
      </CardContent>
    </Card>
  );
}

export default LiveExample;

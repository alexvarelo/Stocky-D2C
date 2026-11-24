import type { ComponentType } from "react";
import type { LiveExampleId } from "@/content/learn";
import type { WidgetProps } from "./shared";
import { BollingerWidget, MacdWidget, MovingAveragesWidget, RsiWidget, SupportResistanceWidget, VolumeWidget } from "./TechnicalWidgets";
import {
  CashRunwayWidget,
  DilutionWidget,
  FreeCashFlowWidget,
  MarginsWidget,
  NetDebtWidget,
  PeRatioWidget,
} from "./FinancialWidgets";
import { DollarIndexWidget, MarketBreadthWidget, Treasury10yWidget, VixWidget, YieldCurveWidget } from "./MarketWidgets";
import { BetaWidget, CorrelationWidget, DrawdownWidget, VolatilityWidget } from "./RiskWidgets";
import { CompoundGrowthWidget, DiversificationWidget } from "./Calculators";

export interface LiveWidgetDef {
  Component: ComponentType<WidgetProps>;
  /** false when the widget does not depend on a ticker (market-wide data or a calculator). */
  usesTicker: boolean;
}

export const LIVE_WIDGETS: Record<LiveExampleId, LiveWidgetDef> = {
  "pe-ratio": { Component: PeRatioWidget, usesTicker: true },
  margins: { Component: MarginsWidget, usesTicker: true },
  "free-cash-flow": { Component: FreeCashFlowWidget, usesTicker: true },
  "net-debt": { Component: NetDebtWidget, usesTicker: true },
  "cash-runway": { Component: CashRunwayWidget, usesTicker: true },
  dilution: { Component: DilutionWidget, usesTicker: true },
  rsi: { Component: RsiWidget, usesTicker: true },
  "moving-averages": { Component: MovingAveragesWidget, usesTicker: true },
  macd: { Component: MacdWidget, usesTicker: true },
  bollinger: { Component: BollingerWidget, usesTicker: true },
  volume: { Component: VolumeWidget, usesTicker: true },
  "support-resistance": { Component: SupportResistanceWidget, usesTicker: true },
  beta: { Component: BetaWidget, usesTicker: true },
  volatility: { Component: VolatilityWidget, usesTicker: true },
  drawdown: { Component: DrawdownWidget, usesTicker: true },
  correlation: { Component: CorrelationWidget, usesTicker: true },
  vix: { Component: VixWidget, usesTicker: false },
  "treasury-10y": { Component: Treasury10yWidget, usesTicker: false },
  "yield-curve": { Component: YieldCurveWidget, usesTicker: false },
  "dollar-index": { Component: DollarIndexWidget, usesTicker: false },
  "market-breadth": { Component: MarketBreadthWidget, usesTicker: false },
  "compound-growth": { Component: CompoundGrowthWidget, usesTicker: false },
  diversification: { Component: DiversificationWidget, usesTicker: false },
};

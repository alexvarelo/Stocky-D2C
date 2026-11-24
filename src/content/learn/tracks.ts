import type { Track } from "./types";

export const TRACKS: Track[] = [
  {
    id: "fundamentals-basics",
    title: "Investing fundamentals",
    description:
      "Start here: what a stock is, how returns compound, what funds hold and what costs you pay.",
    lessonIds: [
      "what-is-a-stock",
      "market-cap-basics",
      "how-returns-compound",
      "dividends",
      "index-funds-etfs",
      "diversification-basics",
      "fees-and-costs",
      "reading-a-price-chart",
    ],
  },
  {
    id: "fundamental-analysis",
    title: "Fundamental analysis",
    description:
      "Read financial statements and valuation ratios to understand what a business earns, owes and is priced at.",
    lessonIds: [
      "income-statement",
      "margins",
      "free-cash-flow-lesson",
      "balance-sheet-net-debt",
      "valuation-multiples",
      "growth-vs-value",
      "cash-runway-dilution",
      "quality-scores",
    ],
  },
  {
    id: "technical-analysis",
    title: "Technical analysis",
    description:
      "Learn what common chart indicators describe, and why none of them is a reliable signal on its own.",
    lessonIds: [
      "trends",
      "sma-ema",
      "golden-death-cross",
      "rsi-lesson",
      "macd-lesson",
      "bollinger-bands-lesson",
      "volume-lesson",
      "support-resistance-lesson",
      "timeframes",
      "limits-of-ta",
    ],
  },
  {
    id: "macro-market",
    title: "Macro and market context",
    description:
      "Interest rates, inflation, volatility, the yield curve, the dollar and breadth: the backdrop behind prices.",
    lessonIds: [
      "interest-rates",
      "inflation",
      "vix-lesson",
      "yield-curve-lesson",
      "us-dollar",
      "market-breadth-lesson",
    ],
  },
  {
    id: "risk-psychology",
    title: "Risk and psychology",
    description:
      "Measure risk with beta, correlation and drawdowns, and recognize the biases that affect decisions.",
    lessonIds: [
      "beta-lesson",
      "diversification-correlation",
      "drawdowns",
      "averaging-down",
      "loss-aversion-biases",
    ],
  },
];

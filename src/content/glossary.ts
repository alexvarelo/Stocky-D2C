// Glossary of investing concepts used by <Term> tooltips and the learning section.
// Educational content only; never a recommendation to buy or sell.

export type GlossaryCategory =
  | "valuation"
  | "fundamentals"
  | "risk"
  | "technical"
  | "market"
  | "corporate";

export interface GlossaryEntry {
  /** Stable id used by <Term id="...">, kebab-case, e.g. "pe-ratio" */
  id: string;
  /** Display name, e.g. "P/E ratio" */
  term: string;
  /** Common abbreviation, e.g. "P/E" */
  abbr?: string;
  category: GlossaryCategory;
  /** One or two sentences, plain language */
  short: string;
  /** Short worked example with numbers */
  example?: string;
  /** A frequent misunderstanding to avoid */
  pitfall?: string;
  /** Ids of related entries */
  related?: string[];
}

export const GLOSSARY: GlossaryEntry[] = [
  {
    id: "pe-ratio",
    term: "Price-to-earnings ratio",
    abbr: "P/E",
    category: "valuation",
    short: "Share price divided by earnings per share. It shows how much investors pay for each unit of yearly profit.",
    example: "A stock at $50 with $2.50 of earnings per share trades at a P/E of 20.",
    pitfall: "A low P/E is not automatically cheap: earnings may be about to fall.",
    related: ["peg-ratio", "eps"],
  },
  {
    id: "beta",
    term: "Beta",
    category: "risk",
    short: "How much a stock or portfolio has tended to move relative to the market. 1 moves with the market; above 1 moves more.",
    example: "With a beta of 1.3, a 10% market fall has historically come with about a 13% fall.",
    pitfall: "Beta is measured on the past and only captures market-related risk, not company-specific risk.",
    related: ["volatility", "correlation"],
  },
  {
    id: "volatility",
    term: "Volatility",
    category: "risk",
    short: "How widely returns swing around their average, usually the annualised standard deviation of daily returns.",
    example: "An annualised volatility of 25% means yearly swings of ±25% are common.",
    pitfall: "Low past volatility does not guarantee calm in the future.",
    related: ["beta", "max-drawdown"],
  },
];

export const GLOSSARY_BY_ID: Record<string, GlossaryEntry> = Object.fromEntries(
  GLOSSARY.map((e) => [e.id, e]),
);

export function getGlossaryEntry(id: string): GlossaryEntry | undefined {
  return GLOSSARY_BY_ID[id];
}

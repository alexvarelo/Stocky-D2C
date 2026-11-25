// Types for the Learn section content. Educational only; never a recommendation to buy or sell.

export type LiveExampleId =
  | "pe-ratio"
  | "margins"
  | "free-cash-flow"
  | "net-debt"
  | "cash-runway"
  | "dilution"
  | "rsi"
  | "moving-averages"
  | "macd"
  | "bollinger"
  | "volume"
  | "support-resistance"
  | "beta"
  | "volatility"
  | "drawdown"
  | "correlation"
  | "vix"
  | "treasury-10y"
  | "yield-curve"
  | "dollar-index"
  | "market-breadth"
  | "sma-ema"
  | "price-snapshot"
  | "dividend-yield"
  | "etf-vs-stock"
  | "income-statement"
  | "value-growth-compare"
  | "quality-scores"
  | "sp500-trend"
  | "compound-growth"
  | "diversification";

export type TrackId =
  | "fundamentals-basics"
  | "fundamental-analysis"
  | "technical-analysis"
  | "macro-market"
  | "risk-psychology";

/** Animated illustrations a lesson step can show beside its text. */
export type LessonVisualId = "ownership-grid" | "ownership-bar" | "business-vs-price" | "total-return" | "beta-amplify";

export interface LessonStepExtra {
  /** Headline for the step; the section name then becomes the small label above it. */
  title?: string;
  visual?: LessonVisualId;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  /** Why the correct answer is correct */
  explanation: string;
}

export interface Lesson {
  id: string;
  trackId: TrackId;
  order: number;
  title: string;
  summary: string;
  minutes: number;
  /** Markdown, 250-450 words: "## What it is", "## How to read it", "## Common mistake" */
  body: string;
  liveExample?: {
    id: LiveExampleId;
    /** Default example ticker; an illustration only, not a recommendation */
    ticker?: string;
    caption: string;
  };
  /** Ids that must exist in glossary.ts */
  glossaryIds: string[];
  /**
   * Optional per-step extras for the step-by-step reader. Keys: "intro", "what-<n>", "read-<n>",
   * "mistake" (n is the 0-based chunk of that section). Lessons without extras still split into steps.
   */
  steps?: Partial<Record<string, LessonStepExtra>>;
  /** Optional question shown before the "Common mistake" text; the text is the feedback. */
  mistakeCheck?: {
    prompt: string;
    options: string[];
    correctIndex: number;
  };
  quiz: [QuizQuestion, QuizQuestion, QuizQuestion];
}

export interface Track {
  id: TrackId;
  title: string;
  description: string;
  lessonIds: string[];
}

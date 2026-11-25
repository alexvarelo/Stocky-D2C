import { FUNDAMENTALS_BASICS_LESSONS } from "./fundamentals-basics";
import { FUNDAMENTAL_ANALYSIS_LESSONS } from "./fundamental-analysis";
import { TECHNICAL_ANALYSIS_LESSONS } from "./technical-analysis";
import { MACRO_MARKET_LESSONS } from "./macro-market";
import { RISK_PSYCHOLOGY_LESSONS } from "./risk-psychology";
import { TRACKS } from "./tracks";
import type { Lesson, TrackId } from "./types";

export * from "./types";
export { TRACKS };

export const LESSONS: Lesson[] = [
  ...FUNDAMENTALS_BASICS_LESSONS,
  ...FUNDAMENTAL_ANALYSIS_LESSONS,
  ...TECHNICAL_ANALYSIS_LESSONS,
  ...MACRO_MARKET_LESSONS,
  ...RISK_PSYCHOLOGY_LESSONS,
];

export const LESSONS_BY_ID: Record<string, Lesson> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l]),
);

export function getLesson(id: string): Lesson | undefined {
  return LESSONS_BY_ID[id];
}

export function lessonsForTrack(trackId: TrackId): Lesson[] {
  return LESSONS.filter((l) => l.trackId === trackId).sort((a, b) => a.order - b.order);
}

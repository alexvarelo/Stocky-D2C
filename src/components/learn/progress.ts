import { LESSONS, TRACKS, getLesson, lessonsForTrack, type Lesson, type TrackId } from "@/content/learn";
import type { LessonProgressRow } from "@/hooks/useLessonProgress";

export type ProgressMap = Record<string, LessonProgressRow>;

export const isDone = (progress: ProgressMap, lessonId: string) => !!progress[lessonId]?.completed_at;

export function trackProgress(progress: ProgressMap, trackId: TrackId) {
  const lessons = lessonsForTrack(trackId);
  const done = lessons.filter((l) => isDone(progress, l.id)).length;
  return { done, total: lessons.length, percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0 };
}

/** The lesson to resume: the next unfinished one after the most recent activity, else the first unfinished. */
export function nextLessonToContinue(progress: ProgressMap): { lesson: Lesson; started: boolean } | null {
  const rows = Object.values(progress).filter((r) => r.completed_at && getLesson(r.lesson_id));
  const ordered = TRACKS.flatMap((t) => lessonsForTrack(t.id));
  if (rows.length > 0) {
    const last = rows.sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? ""))[0];
    const lastLesson = getLesson(last.lesson_id)!;
    const sameTrack = lessonsForTrack(lastLesson.trackId);
    const next = sameTrack.find((l) => l.order > lastLesson.order && !isDone(progress, l.id));
    if (next) return { lesson: next, started: true };
    const any = ordered.find((l) => !isDone(progress, l.id));
    return any ? { lesson: any, started: true } : null;
  }
  return LESSONS.length ? { lesson: ordered[0], started: false } : null;
}

export const lessonPath = (l: Pick<Lesson, "trackId" | "id">) => `/learn/${l.trackId}/${l.id}`;

import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { TRACKS, lessonsForTrack } from "@/content/learn";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { isDone, lessonPath, trackProgress } from "@/components/learn/progress";

export default function LearnTrack() {
  const { trackId } = useParams();
  const track = TRACKS.find((t) => t.id === trackId);
  const { progress, available } = useLessonProgress();

  if (!track) {
    return (
      <div className="mx-auto max-w-[720px] space-y-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">We could not find that track.</p>
        <Button asChild variant="outline">
          <Link to="/learn">Back to Learn</Link>
        </Button>
      </div>
    );
  }

  const lessons = lessonsForTrack(track.id);
  const p = trackProgress(progress, track.id);

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-5 pb-10">
      <Link to="/learn" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All tracks
      </Link>
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{track.title}</h1>
        <p className="text-sm text-muted-foreground">{track.description}</p>
        {available && (
          <div className="space-y-1">
            <Progress value={p.percent} className="h-1.5" aria-label="Track progress" />
            <p className="text-xs tabular-nums text-muted-foreground">
              {p.done} of {p.total} completed
            </p>
          </div>
        )}
      </header>
      <ol className="space-y-2">
        {lessons.map((l, i) => {
          const done = available && isDone(progress, l.id);
          const score = progress[l.id]?.score;
          return (
            <li key={l.id}>
              <Link
                to={lessonPath(l)}
                className="flex items-center gap-3 rounded-2xl border border-border/50 bg-card/50 p-3 transition-colors hover:bg-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {done ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-label="Completed" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground/50" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {i + 1}. {l.title}
                  </p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{l.summary}</p>
                </div>
                <div className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                  <p>{l.minutes} min</p>
                  {done && score != null && <p>{score}/3</p>}
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
      <EducationalDisclaimer />
    </div>
  );
}

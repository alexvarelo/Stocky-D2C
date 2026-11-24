import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { ExplainThis } from "@/components/explain/ExplainThis";
import { LessonBody } from "@/components/learn/LessonBody";
import { LessonQuiz } from "@/components/learn/LessonQuiz";
import { LiveExample } from "@/components/learn/LiveExample";
import { isDone, lessonPath } from "@/components/learn/progress";
import { TRACKS, getLesson, lessonsForTrack } from "@/content/learn";
import { getGlossaryEntry } from "@/content/glossary";
import { useLessonProgress, useSaveQuizResult } from "@/hooks/useLessonProgress";
import { useToast } from "@/components/ui/use-toast";

export default function LearnLesson() {
  const { trackId, lessonId } = useParams();
  const lesson = lessonId ? getLesson(lessonId) : undefined;
  const track = TRACKS.find((t) => t.id === trackId);
  const { progress, available } = useLessonProgress();
  const save = useSaveQuizResult();
  const { toast } = useToast();

  if (!lesson || !track || lesson.trackId !== track.id) {
    return (
      <div className="mx-auto max-w-[720px] space-y-3 py-10 text-center">
        <p className="text-sm text-muted-foreground">We could not find that lesson.</p>
        <Button asChild variant="outline">
          <Link to="/learn">Back to Learn</Link>
        </Button>
      </div>
    );
  }

  const siblings = lessonsForTrack(track.id);
  const idx = siblings.findIndex((l) => l.id === lesson.id);
  const prev = siblings[idx - 1];
  const next = siblings[idx + 1];
  const done = available && isDone(progress, lesson.id);
  const terms = lesson.glossaryIds.filter((id) => getGlossaryEntry(id));

  return (
    <article className="mx-auto w-full max-w-[720px] space-y-6 pb-10">
      <Link to={`/learn/${track.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {track.title}
      </Link>

      <header className="space-y-1">
        <p className="text-xs text-muted-foreground">
          Lesson {idx + 1} of {siblings.length} · {lesson.minutes} min
        </p>
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{lesson.title}</h1>
          {done && <CheckCircle2 className="mt-1.5 h-5 w-5 shrink-0 text-emerald-500" aria-label="Completed" />}
        </div>
        <p className="text-sm text-muted-foreground">{lesson.summary}</p>
      </header>

      <LessonBody body={lesson.body} />

      {terms.length > 0 && (
        <section aria-label="Key terms" className="space-y-2">
          <h2 className="text-sm font-semibold">Key terms</h2>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {terms.map((id) => (
              <li key={id}>
                <Term id={id}>{getGlossaryEntry(id)!.term}</Term>
              </li>
            ))}
          </ul>
        </section>
      )}

      {lesson.liveExample && <LiveExample key={lesson.id} example={lesson.liveExample} />}

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Still unclear? Ask Stocky to explain it.</span>
        <ExplainThis context={{ label: `the lesson "${lesson.title}"` }} />
      </div>

      <LessonQuiz
        key={lesson.id}
        lesson={lesson}
        onComplete={(score) =>
          save.mutate(
            { lessonId: lesson.id, score },
            {
              onError: () =>
                toast({ title: "Progress could not be saved", description: "Your quiz result is shown here but was not stored." }),
            },
          )
        }
      />

      <nav aria-label="Lesson navigation" className="flex items-center justify-between gap-3">
        {prev ? (
          <Button asChild variant="outline" className="min-w-0 gap-2">
            <Link to={lessonPath(prev)}>
              <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
              <span className="truncate">{prev.title}</span>
            </Link>
          </Button>
        ) : (
          <span />
        )}
        {next ? (
          <Button asChild className="min-w-0 gap-2">
            <Link to={lessonPath(next)}>
              <span className="truncate">{next.title}</span>
              <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
            </Link>
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link to="/learn">Back to Learn</Link>
          </Button>
        )}
      </nav>
      <EducationalDisclaimer />
    </article>
  );
}

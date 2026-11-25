import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LessonStepper } from "@/components/learn/LessonStepper";
import { isDone } from "@/components/learn/progress";
import { TRACKS, getLesson, lessonsForTrack } from "@/content/learn";
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
          <Link to="/learn">Back to Academy</Link>
        </Button>
      </div>
    );
  }

  const siblings = lessonsForTrack(track.id);

  return (
    <LessonStepper
      key={lesson.id}
      lesson={lesson}
      track={track}
      index={siblings.findIndex((l) => l.id === lesson.id)}
      siblings={siblings}
      done={available && isDone(progress, lesson.id)}
      bestScore={progress[lesson.id]?.score}
      onQuizComplete={(score) =>
        save.mutate(
          { lessonId: lesson.id, score },
          {
            onError: () =>
              toast({ title: "Progress could not be saved", description: "Your quiz result is shown here but was not stored." }),
          },
        )
      }
    />
  );
}

import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { AcademyIcon } from "@/components/learn/AcademyIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EducationalDisclaimer } from "@/components/compliance/EducationalDisclaimer";
import { TRACKS } from "@/content/learn";
import { useLessonProgress } from "@/hooks/useLessonProgress";
import { lessonPath, nextLessonToContinue, trackProgress } from "@/components/learn/progress";

export default function Learn() {
  const { progress, available } = useLessonProgress();
  const next = available ? nextLessonToContinue(progress) : null;

  return (
    <div className="mx-auto w-full max-w-[960px] space-y-6 pb-10">
      <header className="space-y-1">
        <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
          <AcademyIcon size={40} />
          <span>
            Stocky <span className="text-primary">Academy</span>
          </span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Short lessons with live examples and a quick quiz. They explain how things work and never tell you what to buy or sell.
        </p>
      </header>

      {next && (
        <Card className="rounded-2xl border-border/50 bg-card/50">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{next.started ? "Continue where you left off" : "Start here"}</p>
              <p className="truncate font-medium">{next.lesson.title}</p>
            </div>
            <Button asChild className="shrink-0 gap-2 self-start sm:self-auto">
              <Link to={lessonPath(next.lesson)}>
                {next.started ? "Continue" : "Start"}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {TRACKS.map((track) => {
          const p = trackProgress(progress, track.id);
          return (
            <Link
              key={track.id}
              to={`/learn/${track.id}`}
              className="rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full rounded-2xl border-border/50 transition-colors hover:bg-accent/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{track.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{track.description}</p>
                  {available ? (
                    <div className="space-y-1">
                      <Progress value={p.percent} className="h-1.5" aria-label={`${track.title} progress`} />
                      <p className="text-xs tabular-nums text-muted-foreground">
                        {p.done} of {p.total} completed
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">{track.lessonIds.length} lessons</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      <EducationalDisclaimer />
    </div>
  );
}

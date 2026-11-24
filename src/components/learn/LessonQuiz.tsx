import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lesson } from "@/content/learn";
import { cn } from "@/lib/utils";

interface Props {
  lesson: Lesson;
  /** Called once per attempt with the score (0-3). */
  onComplete: (_score: number) => void;
}

export function LessonQuiz({ lesson, onComplete }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null]);
  const [submitted, setSubmitted] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const score = lesson.quiz.reduce((n, q, i) => n + (answers[i] === q.correctIndex ? 1 : 0), 0);
  const allAnswered = answers.every((a) => a !== null);

  const submit = () => {
    setSubmitted(true);
    onComplete(score);
  };
  const retry = () => {
    setAnswers([null, null, null]);
    setSubmitted(false);
    setAttempt((a) => a + 1);
  };

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Check your understanding</CardTitle>
        <p className="text-sm text-muted-foreground">Three questions. You can retry as often as you like.</p>
      </CardHeader>
      <CardContent className="space-y-5">
        {lesson.quiz.map((q, qi) => {
          const picked = answers[qi];
          return (
            <fieldset key={`${attempt}-${q.id}`} className="space-y-2" disabled={submitted}>
              <legend className="text-sm font-medium">
                {qi + 1}. {q.prompt}
              </legend>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => {
                  const isPicked = picked === oi;
                  const isCorrect = submitted && oi === q.correctIndex;
                  const isWrong = submitted && isPicked && oi !== q.correctIndex;
                  return (
                    <label
                      key={oi}
                      className={cn(
                        "flex min-h-11 cursor-pointer items-start gap-2.5 rounded-xl border border-border/60 px-3 py-2.5 text-sm transition-colors",
                        !submitted && "hover:bg-accent/50",
                        isPicked && !submitted && "border-primary bg-primary/5",
                        isCorrect && "border-emerald-500/60 bg-emerald-500/10",
                        isWrong && "border-red-500/60 bg-red-500/10",
                        submitted && "cursor-default",
                      )}
                    >
                      <input
                        type="radio"
                        name={`${attempt}-${q.id}`}
                        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                        checked={isPicked}
                        onChange={() => setAnswers((a) => a.map((v, i) => (i === qi ? oi : v)))}
                      />
                      <span className="min-w-0 flex-1">{opt}</span>
                      {isCorrect && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" aria-label="Correct answer" />}
                      {isWrong && <XCircle className="h-4 w-4 shrink-0 text-red-500" aria-label="Your answer, incorrect" />}
                    </label>
                  );
                })}
              </div>
              {submitted && <p className="rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">{q.explanation}</p>}
            </fieldset>
          );
        })}

        {submitted ? (
          <div className="flex flex-wrap items-center justify-between gap-3" role="status">
            <p className="text-sm font-semibold">Score: {score} / 3</p>
            <Button variant="outline" size="sm" onClick={retry} className="gap-2">
              <RotateCcw className="h-4 w-4" aria-hidden />
              Try again
            </Button>
          </div>
        ) : (
          <Button onClick={submit} disabled={!allAnswered}>
            Check answers
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default LessonQuiz;

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, ListOrdered, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Term } from "@/components/glossary/Term";
import { EducationalDisclaimer, EDUCATIONAL_DISCLAIMER_TEXT } from "@/components/compliance/EducationalDisclaimer";
import { ExplainThis, buildExplainPrompt } from "@/components/explain/ExplainThis";
import { useStockyChatActions } from "@/contexts/StockyChatContext";
import { getGlossaryEntry } from "@/content/glossary";
import type { Lesson, Track } from "@/content/learn";
import { cn } from "@/lib/utils";
import { AcademyIcon } from "./AcademyIcon";
import { LessonBody } from "./LessonBody";
import { LessonQuiz } from "./LessonQuiz";
import { LessonVisual } from "./LessonVisuals";
import { LiveExample } from "./LiveExample";
import { lessonPath } from "./progress";
import { buildLessonSteps, type LessonStep } from "./steps";

/** Entry animation for step content; skipped when the user prefers reduced motion. */
const RISE =
  "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500 motion-safe:fill-mode-both";
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/** Arrow keys must keep their normal job inside form controls, radio groups and editable text. */
function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return true;
  return !!target.closest('[role="radiogroup"], [role="dialog"], [role="listbox"], [role="menu"], [role="slider"]');
}

const stepTitle = (s: LessonStep, lesson: Lesson) => ("title" in s ? s.title : s.kind === "intro" ? lesson.title : s.label);

interface Props {
  lesson: Lesson;
  track: Track;
  /** Position of the lesson in its track, 0-based, and the track's lessons. */
  index: number;
  siblings: Lesson[];
  done: boolean;
  bestScore?: number | null;
  onQuizComplete: (_score: number) => void;
}

/**
 * Full-screen lesson reader ("focus mode"): a fixed top bar (exit, lesson, steps, Ask Stocky), a
 * scrolling step in the middle and a fixed bottom bar with Back and Continue.
 */
export function LessonStepper({ lesson, track, index: lessonIndex, siblings, done, bestScore, onQuizComplete }: Props) {
  const steps = useMemo(() => buildLessonSteps(lesson), [lesson]);
  const [params, setParams] = useSearchParams();
  const requested = Number.parseInt(params.get("step") ?? "1", 10);
  const current = Number.isFinite(requested) ? Math.min(Math.max(requested - 1, 0), steps.length - 1) : 0;
  const step = steps[current];
  const chat = useStockyChatActions();

  const [furthest, setFurthest] = useState(current);
  const [checkPick, setCheckPick] = useState<number | null>(null);
  const [outlineOpen, setOutlineOpen] = useState(false);
  const [moreBelow, setMoreBelow] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const nextLesson = siblings[lessonIndex + 1];
  const isLast = current === steps.length - 1;
  const blocked = step.kind === "mistake" && !!step.check && checkPick === null;
  const primaryLabel = step.kind === "intro" ? "Start lesson" : blocked ? "Pick an answer" : "Continue";
  const trackPath = `/learn/${track.id}`;

  const goTo = useCallback(
    (i: number) => {
      const next = Math.min(Math.max(i, 0), steps.length - 1);
      setParams(
        (p) => {
          const copy = new URLSearchParams(p);
          copy.set("step", String(next + 1));
          return copy;
        },
        { replace: true },
      );
    },
    [setParams, steps.length],
  );

  const updateMoreBelow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setMoreBelow(el.scrollHeight - el.scrollTop - el.clientHeight > 24);
  }, []);

  useEffect(() => {
    setFurthest((f) => Math.max(f, current));
    // Each step starts at its top. The content animates in, so the jump is instant.
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    const t = window.setTimeout(updateMoreBelow, 600);
    if (firstRender.current) {
      firstRender.current = false;
    } else {
      // Announce the new step to screen readers.
      headingRef.current?.focus({ preventScroll: true });
    }
    return () => window.clearTimeout(t);
  }, [current, updateMoreBelow]);

  useEffect(() => {
    window.addEventListener("resize", updateMoreBelow);
    return () => window.removeEventListener("resize", updateMoreBelow);
  }, [updateMoreBelow]);

  // ← and → move between steps on a keyboard.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || outlineOpen) return;
      if (isTypingTarget(e.target)) return;
      if (e.key === "ArrowRight" && !isLast && !blocked) {
        e.preventDefault();
        goTo(current + 1);
      } else if (e.key === "ArrowLeft" && current > 0) {
        e.preventDefault();
        goTo(current - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [blocked, current, goTo, isLast, outlineOpen]);

  const askStocky = () =>
    chat?.openWithDraft(
      buildExplainPrompt({ label: `"${stepTitle(step, lesson)}" from the lesson "${lesson.title}"`, noun: "lesson step" }),
    );

  return (
    <div className="flex h-[100dvh] flex-col bg-background text-foreground">
      <header className="shrink-0 border-b border-border/60">
        <div className="flex h-16 items-center gap-2 px-3 sm:gap-4 sm:px-6">
          <Button asChild variant="secondary" size="sm" className="h-11 w-11 shrink-0 gap-2 px-0 sm:w-auto sm:px-4">
            <Link to={trackPath} aria-label={`Exit lesson, back to ${track.title}`}>
              <X className="h-5 w-5" aria-hidden />
              <span className="hidden sm:inline">Exit</span>
            </Link>
          </Button>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
            <AcademyIcon size={28} className="hidden sm:block" />
            <div className="min-w-0 text-center sm:text-left">
              <p className="truncate text-[15px] font-semibold leading-tight">{lesson.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {track.title} · Lesson {lessonIndex + 1} of {siblings.length}
              </p>
            </div>
          </div>

          <Button variant="secondary" size="sm" className="hidden h-11 shrink-0 gap-2 px-4 sm:inline-flex" onClick={() => setOutlineOpen(true)}>
            <ListOrdered className="h-4 w-4" aria-hidden />
            Steps
          </Button>
          {chat && (
            <Button
              variant="secondary"
              size="sm"
              onClick={askStocky}
              className="h-11 w-11 shrink-0 gap-2 bg-primary/15 px-0 text-primary hover:bg-primary/25 sm:w-auto sm:px-4"
              aria-label="Ask Stocky about this step"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Ask Stocky</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3 px-3 pb-3 sm:px-6 sm:pb-0">
          <div
            className="flex flex-1 gap-1"
            role="progressbar"
            aria-label="Lesson progress"
            aria-valuemin={1}
            aria-valuemax={steps.length}
            aria-valuenow={current + 1}
          >
            {steps.map((s, i) => (
              <div key={s.key} className="h-1 flex-1 overflow-hidden rounded-full bg-border sm:h-[3px] sm:rounded-none">
                <div className="h-full bg-primary transition-[width] duration-500" style={{ width: i <= current ? "100%" : "0%" }} />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setOutlineOpen(true)}
            className="-my-2 min-h-11 shrink-0 rounded-full px-2 text-xs tabular-nums text-muted-foreground hover:text-foreground sm:hidden"
            aria-label={`Step ${current + 1} of ${steps.length}. Show all steps`}
          >
            {current + 1}/{steps.length}
          </button>
        </div>
      </header>

      <div className="relative min-h-0 flex-1">
        <div ref={scrollRef} onScroll={updateMoreBelow} className="h-full overflow-y-auto overscroll-contain">
          <section
            key={step.key}
            aria-labelledby="lesson-step-heading"
            className="mx-auto w-full max-w-[1120px] px-5 pb-10 pt-6 sm:px-8 md:px-12 md:pt-12"
          >
            <StepContent
              step={step}
              lesson={lesson}
              stepCount={steps.length}
              done={done}
              bestScore={bestScore}
              headingRef={headingRef}
              checkPick={checkPick}
              onCheckPick={setCheckPick}
              onQuizComplete={onQuizComplete}
            />
          </section>
        </div>
        {/* Hint that the step continues below the fold. */}
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background to-transparent transition-opacity duration-300",
            moreBelow ? "opacity-100" : "opacity-0",
          )}
          aria-hidden
        />
      </div>

      <footer className="shrink-0 border-t border-border/60 bg-background px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8 md:px-12">
        <div className="mx-auto flex w-full max-w-[1120px] items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => goTo(current - 1)}
            aria-label="Previous step"
            className={cn("h-12 w-12 shrink-0 gap-2 px-0 md:w-auto md:px-6", current === 0 && "max-md:hidden md:invisible")}
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
            <span className="hidden md:inline">Back</span>
          </Button>

          <div className="hidden min-w-0 flex-1 flex-col items-center text-center md:flex">
            <span className="text-sm font-semibold tabular-nums">
              Step {current + 1} of {steps.length}
            </span>
            <span className="text-[11px] text-muted-foreground">{EDUCATIONAL_DISCLAIMER_TEXT} · Use ← → to move</span>
          </div>

          {isLast ? (
            <Button asChild className="h-12 min-w-0 flex-1 gap-2 md:flex-none md:px-8">
              {nextLesson ? (
                <Link to={lessonPath(nextLesson)}>
                  <span className="truncate">Next: {nextLesson.title}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                </Link>
              ) : (
                <Link to="/learn">Back to Academy</Link>
              )}
            </Button>
          ) : (
            <Button className="h-12 flex-1 gap-2 md:flex-none md:px-8" onClick={() => goTo(current + 1)} disabled={blocked}>
              {primaryLabel}
              {!blocked && <ArrowRight className="h-4 w-4" aria-hidden />}
            </Button>
          )}
        </div>
        <EducationalDisclaimer className="mt-2 justify-center md:hidden" />
      </footer>

      <Sheet open={outlineOpen} onOpenChange={setOutlineOpen}>
        <SheetContent side="right" className="w-[320px] max-w-[85vw] space-y-6">
          <SheetHeader className="space-y-3 text-left">
            <Link to="/learn" className="flex items-center gap-2.5" onClick={() => setOutlineOpen(false)}>
              <AcademyIcon size={32} />
              <span className="font-semibold tracking-tight">
                Stocky <span className="text-primary">Academy</span>
              </span>
            </Link>
            <SheetTitle className="text-base">{lesson.title}</SheetTitle>
            <SheetDescription>
              {track.title} · {lesson.minutes} min
            </SheetDescription>
          </SheetHeader>
          <ol className="space-y-1">
            {steps.map((s, i) => {
              const isCurrent = i === current;
              const reachable = i <= furthest;
              const seen = reachable && !isCurrent;
              return (
                <li key={s.key}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!reachable) return;
                      goTo(i);
                      setOutlineOpen(false);
                    }}
                    disabled={!reachable}
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                      isCurrent ? "bg-primary/15 text-foreground" : reachable ? "text-foreground/80 hover:bg-muted" : "text-muted-foreground/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold",
                        isCurrent && "border-primary bg-primary text-primary-foreground",
                        seen && "border-success text-success",
                        !reachable && "border-border",
                      )}
                      aria-hidden
                    >
                      {seen ? <Check className="h-3.5 w-3.5" /> : i + 1}
                    </span>
                    <span className="min-w-0 truncate">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </SheetContent>
      </Sheet>
    </div>
  );
}

interface StepContentProps {
  step: LessonStep;
  lesson: Lesson;
  stepCount: number;
  done: boolean;
  bestScore?: number | null;
  headingRef: React.RefObject<HTMLHeadingElement>;
  checkPick: number | null;
  onCheckPick: (_i: number) => void;
  onQuizComplete: (_score: number) => void;
}

function StepContent({ step, lesson, stepCount, done, bestScore, headingRef, checkPick, onCheckPick, onQuizComplete }: StepContentProps) {
  const headingProps = { id: "lesson-step-heading", ref: headingRef, tabIndex: -1 } as const;
  const kickerClass = cn(RISE, "text-xs font-semibold uppercase tracking-[0.08em] text-primary");
  const headingClass = cn(RISE, "text-2xl font-bold leading-tight tracking-tight focus:outline-none md:text-3xl");

  switch (step.kind) {
    case "intro":
      return (
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          <div className="space-y-4">
            <span className={cn(RISE, "inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary")}>
              {lesson.minutes} min · {stepCount} short steps
            </span>
            <h1 {...headingProps} className={cn(headingClass, "text-3xl md:text-4xl")} style={delay(80)}>
              {lesson.title}
            </h1>
            <p className={cn(RISE, "text-base leading-relaxed text-foreground/80 md:text-lg")} style={delay(180)}>
              {lesson.summary}
            </p>
            {done && (
              <p className={cn(RISE, "flex items-center gap-1.5 text-sm text-muted-foreground")} style={delay(260)}>
                <CheckCircle2 className="h-4 w-4 text-success" aria-hidden />
                Completed{bestScore != null ? ` · best score ${bestScore} / 3` : ""}
              </p>
            )}
          </div>
          <div className={RISE} style={delay(300)}>
            {step.visual ? (
              <LessonVisual id={step.visual} />
            ) : (
              <div className="flex justify-center">
                <AcademyIcon size={160} className="motion-safe:animate-lesson-pop" />
              </div>
            )}
          </div>
        </div>
      );

    case "text":
      return (
        <div className={cn(step.visual && "grid items-start gap-8 md:grid-cols-2 md:gap-12")}>
          <div className="max-w-[680px] space-y-3">
            <p className={kickerClass}>{step.kicker}</p>
            <h2 {...headingProps} className={headingClass} style={delay(80)}>
              {step.title}
            </h2>
            <div className={RISE} style={delay(180)}>
              <LessonBody body={step.markdown} />
            </div>
          </div>
          {step.visual && (
            <div className={cn(RISE, "md:sticky md:top-6")} style={delay(300)}>
              <LessonVisual id={step.visual} />
            </div>
          )}
        </div>
      );

    case "live":
      return lesson.liveExample ? (
        <div className="max-w-[760px] space-y-4">
          <p className={kickerClass}>Try it</p>
          <h2 {...headingProps} className={headingClass} style={delay(80)}>
            See it with real data
          </h2>
          <div className={RISE} style={delay(180)}>
            <LiveExample example={lesson.liveExample} />
          </div>
        </div>
      ) : null;

    case "mistake": {
      const check = step.check;
      const answered = checkPick !== null;
      const correct = check && checkPick === check.correctIndex;
      return (
        <div className="max-w-[680px] space-y-4">
          <p className={cn(kickerClass, "text-[#ec7e00]")}>Common mistake</p>
          <h2 {...headingProps} className={headingClass} style={delay(80)}>
            {step.title}
          </h2>
          {check ? (
            <>
              <div className={cn(RISE, "space-y-2")} style={delay(180)} role="radiogroup" aria-label={check.prompt}>
                {check.options.map((opt, i) => {
                  const isRight = answered && i === check.correctIndex;
                  const isWrong = checkPick === i && i !== check.correctIndex;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={checkPick === i}
                      disabled={answered}
                      onClick={() => onCheckPick(i)}
                      className={cn(
                        "flex min-h-12 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[15px] transition-colors",
                        !answered && "border-border hover:bg-muted",
                        isRight && "border-success bg-success/10",
                        isWrong && "border-[#ec7e00] bg-[#ec7e00]/10",
                        answered && !isRight && !isWrong && "border-border opacity-70",
                      )}
                    >
                      <span
                        className={cn(
                          "h-5 w-5 shrink-0 rounded-full border-2 border-border",
                          isRight && "border-success bg-success",
                          isWrong && "border-[#ec7e00] bg-[#ec7e00]",
                        )}
                        aria-hidden
                      />
                      {opt}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <div
                  role="status"
                  className={cn(RISE, "space-y-1 rounded-2xl p-4", correct ? "bg-success/10" : "bg-[#ec7e00]/10")}
                >
                  <p className={cn("font-semibold", correct ? "text-success" : "text-[#ec7e00]")}>
                    {correct ? "Right." : "Not quite."}
                  </p>
                  <LessonBody body={step.markdown} />
                </div>
              )}
            </>
          ) : (
            <div className={cn(RISE, "flex gap-3 rounded-2xl bg-[#ec7e00]/10 p-4")} style={delay(180)}>
              <AlertTriangle className="mt-1 h-5 w-5 shrink-0 text-[#ec7e00]" aria-hidden />
              <div className="min-w-0">
                <LessonBody body={step.markdown} />
              </div>
            </div>
          )}
        </div>
      );
    }

    case "wrap": {
      const terms = lesson.glossaryIds.filter((id) => getGlossaryEntry(id));
      return (
        <div className="mx-auto max-w-[680px] space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 motion-safe:animate-lesson-pop">
              <Check className="h-10 w-10 text-success" aria-hidden />
            </span>
            <h2 {...headingProps} className={headingClass} style={delay(80)}>
              You reached the end
            </h2>
            <p className={cn(RISE, "text-sm text-muted-foreground")} style={delay(160)}>
              Check what stuck with three quick questions.
            </p>
          </div>
          {terms.length > 0 && (
            <section aria-label="Key terms" className={cn(RISE, "space-y-2")} style={delay(220)}>
              <h3 className="text-sm font-semibold">Key terms</h3>
              <ul className="flex flex-wrap gap-2 text-sm">
                {terms.map((id) => (
                  <li key={id} className="rounded-full bg-muted px-3 py-1.5">
                    <Term id={id}>{getGlossaryEntry(id)!.term}</Term>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <div className={RISE} style={delay(300)}>
            <LessonQuiz lesson={lesson} onComplete={onQuizComplete} />
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Still unclear? Ask Stocky to explain it.</span>
            <ExplainThis context={{ label: `the lesson "${lesson.title}"`, noun: "lesson" }} />
          </div>
        </div>
      );
    }
  }
}

export default LessonStepper;

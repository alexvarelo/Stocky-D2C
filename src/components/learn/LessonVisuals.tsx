import type { ComponentType } from "react";
import type { LessonVisualId } from "@/content/learn";

/*
 * Animated illustrations for lesson steps. They are drawn with fixed example numbers taken from
 * the lesson text, never live data, and each is labelled as illustrative where it shows a chart.
 * Animations are skipped for people who prefer reduced motion.
 */

const BRAND = "#494fdf";
const TEAL = "#00a87e";
const ORANGE = "#ec7e00";

function OwnershipGrid() {
  const cells = Array.from({ length: 100 }, (_, i) => i);
  return (
    <figure className="mx-auto w-full max-w-[280px] space-y-3">
      <div className="grid grid-cols-10 gap-1.5 rounded-3xl bg-muted/60 p-5" aria-hidden>
        {cells.map((i) => (
          <div
            key={i}
            className="aspect-square rounded-[4px] motion-safe:animate-lesson-pop"
            style={{
              background: i === 44 ? BRAND : "hsl(var(--border))",
              animationDelay: `${i === 44 ? 900 : ((i % 10) + Math.floor(i / 10)) * 25}ms`,
            }}
          />
        ))}
      </div>
      <figcaption className="text-center text-xs text-muted-foreground">
        A company cut into 100 equal pieces. The blue square is one share: 1% of it.
      </figcaption>
    </figure>
  );
}

function OwnershipBar() {
  return (
    <figure className="space-y-4 rounded-3xl bg-muted/60 p-5">
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <dt>Company shares</dt>
          <dd className="tabular-nums text-foreground">1,000,000</dd>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <dt>You hold</dt>
          <dd className="tabular-nums text-foreground">1,000</dd>
        </div>
      </dl>
      <div className="h-2.5 overflow-hidden rounded-full bg-border" aria-hidden>
        <div
          className="h-full w-[22%] origin-left rounded-full motion-safe:animate-lesson-grow-x"
          style={{ background: BRAND, animationDelay: "300ms" }}
        />
      </div>
      <p className="flex items-baseline gap-2">
        <span className="text-4xl font-bold tabular-nums motion-safe:animate-lesson-pop" style={{ animationDelay: "450ms" }}>
          0.1%
        </span>
        <span className="text-sm text-muted-foreground">of the company is yours</span>
      </p>
      <figcaption className="text-[11px] text-muted-foreground">Bar not to scale.</figcaption>
    </figure>
  );
}

function BusinessVsPrice() {
  return (
    <figure className="space-y-2 rounded-3xl bg-muted/60 p-5">
      <svg viewBox="0 0 300 150" className="w-full" role="img" aria-label="Illustrative chart: a steady business line and a share price line that swings above and below it">
        <line x1="0" y1="140" x2="300" y2="140" stroke="hsl(var(--border))" />
        <path
          d="M0 110 C 60 100, 120 88, 180 74 S 260 52, 300 44"
          fill="none"
          stroke="hsl(var(--foreground))"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="420"
          className="motion-safe:animate-lesson-draw"
          style={{ animationDelay: "300ms" }}
        />
        <path
          d="M0 112 C 30 80, 50 130, 80 96 S 120 40, 150 70 S 190 128, 220 92 S 270 20, 300 60"
          fill="none"
          stroke={ORANGE}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="420"
          className="motion-safe:animate-lesson-draw"
          style={{ animationDelay: "700ms" }}
        />
      </svg>
      <figcaption className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-3.5 rounded bg-foreground" aria-hidden />
          Business
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-3.5 rounded" style={{ background: ORANGE }} aria-hidden />
          Share price
        </span>
        <span className="ml-auto">Illustrative</span>
      </figcaption>
    </figure>
  );
}

function TotalReturn() {
  return (
    <figure className="flex flex-col items-center gap-4 rounded-3xl bg-muted/60 p-5">
      <div className="flex h-[150px] w-16 flex-col justify-end" aria-hidden>
        <div
          className="h-[40px] origin-bottom rounded-t-lg motion-safe:animate-lesson-grow-y"
          style={{ background: TEAL, animationDelay: "500ms" }}
        />
        <div className="h-[110px] origin-bottom motion-safe:animate-lesson-grow-y" style={{ background: BRAND, animationDelay: "200ms" }} />
      </div>
      <figcaption className="w-full space-y-2 text-sm">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-[3px]" style={{ background: BRAND }} aria-hidden />
          <span>
            <strong className="font-semibold">Price change</strong>
            <span className="text-muted-foreground">: worth more, or less, than you paid</span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 shrink-0 rounded-[3px]" style={{ background: TEAL }} aria-hidden />
          <span>
            <strong className="font-semibold">Dividends</strong>
            <span className="text-muted-foreground">: profits some companies pay out</span>
          </span>
        </span>
        <span className="block text-[11px] text-muted-foreground">Illustrative split, not real figures.</span>
      </figcaption>
    </figure>
  );
}

export const LESSON_VISUALS: Record<LessonVisualId, ComponentType> = {
  "ownership-grid": OwnershipGrid,
  "ownership-bar": OwnershipBar,
  "business-vs-price": BusinessVsPrice,
  "total-return": TotalReturn,
};

export function LessonVisual({ id }: { id: LessonVisualId }) {
  const Visual = LESSON_VISUALS[id];
  return Visual ? <Visual /> : null;
}

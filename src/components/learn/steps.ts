import type { Lesson, LessonVisualId } from "@/content/learn";

/** Longest a text step gets before the section is split into another step. */
const MAX_WORDS_PER_STEP = 120;

export type LessonStep =
  | { kind: "intro"; key: "intro"; label: string; visual?: LessonVisualId }
  | {
      kind: "text";
      key: string;
      label: string;
      kicker: string;
      title: string;
      markdown: string;
      visual?: LessonVisualId;
    }
  | { kind: "live"; key: "live"; label: string }
  | {
      kind: "mistake";
      key: "mistake";
      label: string;
      title: string;
      markdown: string;
      check?: NonNullable<Lesson["mistakeCheck"]>;
    }
  | { kind: "wrap"; key: "wrap"; label: string };

interface Section {
  heading: string;
  text: string;
}

const SECTION_SLUGS: Record<string, string> = {
  "what it is": "what",
  "how to read it": "read",
  "common mistake": "mistake",
};

const slugFor = (heading: string) =>
  SECTION_SLUGS[heading.trim().toLowerCase()] ?? heading.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

/** Splits a lesson body on its "## " headings. Text before the first heading is ignored. */
export function parseSections(body: string): Section[] {
  const sections: Section[] = [];
  let current: Section | null = null;
  for (const line of body.split("\n")) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      current = { heading: m[1], text: "" };
      sections.push(current);
    } else if (current) {
      current.text += `${line}\n`;
    }
  }
  return sections.map((s) => ({ ...s, text: s.text.trim() })).filter((s) => s.text.length > 0);
}

/**
 * Groups a section's paragraphs into chunks of at most MAX_WORDS_PER_STEP words, never splitting
 * a paragraph. A paragraph ending in ":" stays with the one after it (usually a list).
 */
export function chunkParagraphs(text: string, maxWords = MAX_WORDS_PER_STEP): string[] {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks: string[][] = [];
  let current: string[] = [];
  let words = 0;
  paragraphs.forEach((p, i) => {
    const prevEndsWithColon = i > 0 && paragraphs[i - 1].endsWith(":");
    const n = wordCount(p);
    if (current.length > 0 && words + n > maxWords && !prevEndsWithColon) {
      chunks.push(current);
      current = [];
      words = 0;
    }
    current.push(p);
    words += n;
  });
  if (current.length) chunks.push(current);
  return chunks.map((c) => c.join("\n\n"));
}

/** Turns a lesson into the ordered steps of the step-by-step reader. Every word of the body is kept. */
export function buildLessonSteps(lesson: Lesson): LessonStep[] {
  const extras = lesson.steps ?? {};
  const steps: LessonStep[] = [{ kind: "intro", key: "intro", label: "Intro", visual: extras.intro?.visual }];
  let mistake: Section | undefined;

  for (const section of parseSections(lesson.body)) {
    const slug = slugFor(section.heading);
    if (slug === "mistake") {
      mistake = section;
      continue;
    }
    const chunks = chunkParagraphs(section.text);
    chunks.forEach((markdown, i) => {
      const key = `${slug}-${i}`;
      const extra = extras[key];
      const part = chunks.length > 1 ? ` · ${i + 1}/${chunks.length}` : "";
      steps.push({
        kind: "text",
        key,
        label: `${section.heading}${chunks.length > 1 ? ` (${i + 1})` : ""}`,
        kicker: extra?.title ? `${section.heading}${part}` : `${lesson.title}${part}`,
        title: extra?.title ?? section.heading,
        markdown,
        visual: extra?.visual,
      });
    });
  }

  if (lesson.liveExample) steps.push({ kind: "live", key: "live", label: "Try it" });

  if (mistake) {
    steps.push({
      kind: "mistake",
      key: "mistake",
      label: "Common mistake",
      title: extras.mistake?.title ?? (lesson.mistakeCheck ? lesson.mistakeCheck.prompt : "A common mistake"),
      markdown: mistake.text,
      check: lesson.mistakeCheck,
    });
  }

  steps.push({ kind: "wrap", key: "wrap", label: "Quiz & wrap-up" });
  return steps;
}

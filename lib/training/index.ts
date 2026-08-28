import type {
  LessonProgressRow,
  RubricScores,
  TrainingLesson,
  TrainingModule,
} from "../types";
import { QUIZ_PASS_PCT } from "../types";
import type { EncounterWithGrade } from "../store";

/**
 * Pure training-progress computations, shared by pages, APIs, and tests.
 * Content itself comes through the store (pack file in dev, DB in prod).
 */

export type ModuleUiStatus = "completed" | "current" | "locked";

export interface ModuleStatus {
  module: TrainingModule;
  lessons: TrainingLesson[];
  lessonsCompleted: number;
  status: ModuleUiStatus;
}

export interface TrainingStatus {
  modules: ModuleStatus[];
  coreComplete: boolean;
  lessonsCompleted: number;
  lessonsTotal: number;
  /** Mean best quiz score across attempted lessons, 0–100; null before any attempt. */
  quizAvg: number | null;
}

export function isLessonComplete(lesson: TrainingLesson, row: LessonProgressRow | undefined): boolean {
  if (!row) return false;
  if (row.status !== "completed") return false;
  if (lesson.quiz.length > 0 && (row.quizScore === null || row.quizScore < QUIZ_PASS_PCT)) return false;
  if (lesson.drill && row.drillPassed !== true) return false;
  return true;
}

/**
 * Module ladder: a module is completed when all its lessons are complete;
 * the first incomplete module is "current"; everything after is locked.
 * (Locking applies to the ladder only — Stations always keep the test-out
 * path, so nobody is hard-walled behind content.)
 */
export function computeTrainingStatus(
  modules: TrainingModule[],
  lessons: TrainingLesson[],
  progress: LessonProgressRow[]
): TrainingStatus {
  const byLesson = new Map(progress.map((p) => [p.lessonSlug, p]));
  const ordered = [...modules].sort((a, b) => a.order - b.order);

  let sawCurrent = false;
  let lessonsCompleted = 0;
  const moduleStatuses: ModuleStatus[] = ordered.map((m) => {
    const mLessons = lessons
      .filter((l) => l.moduleSlug === m.slug)
      .sort((a, b) => a.order - b.order);
    const done = mLessons.filter((l) => isLessonComplete(l, byLesson.get(l.slug))).length;
    lessonsCompleted += done;
    const complete = mLessons.length > 0 && done === mLessons.length;
    let status: ModuleUiStatus;
    if (complete) status = "completed";
    else if (!sawCurrent) {
      status = "current";
      sawCurrent = true;
    } else status = "locked";
    return { module: m, lessons: mLessons, lessonsCompleted: done, status };
  });

  const core = moduleStatuses.filter((s) => s.module.core);
  const coreComplete = core.length > 0 && core.every((s) => s.status === "completed");

  const quizScores = progress
    .filter((p) => p.quizScore !== null)
    .map((p) => p.quizScore as number);
  const quizAvg =
    quizScores.length > 0
      ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
      : null;

  return {
    modules: moduleStatuses,
    coreComplete,
    lessonsCompleted,
    lessonsTotal: lessons.length,
    quizAvg,
  };
}

/* -------------------- rep analytics → training cross-link -------------------- */

export interface WeakSkill {
  rubricKey: keyof RubricScores;
  avg: number;
  reps: number;
}

const RUBRIC_KEYS: (keyof RubricScores)[] = ["rapport", "framing", "price", "objections", "close"];

/**
 * The cross-link: over the user's last `window` graded reps, find the rubric
 * category averaging under `threshold`/20 (the weakest one, if several).
 */
export function findWeakSkill(
  history: EncounterWithGrade[],
  { window = 10, threshold = 12, minReps = 3 }: { window?: number; threshold?: number; minReps?: number } = {}
): WeakSkill | null {
  const graded = history
    .filter((r) => r.grade !== null && (r.encounter.kind ?? "rep") === "rep")
    .slice(0, window);
  if (graded.length < minReps) return null;

  let weakest: WeakSkill | null = null;
  for (const key of RUBRIC_KEYS) {
    const avg = graded.reduce((s, r) => s + r.grade!.scores[key], 0) / graded.length;
    if (avg < threshold && (!weakest || avg < weakest.avg)) {
      weakest = { rubricKey: key, avg, reps: graded.length };
    }
  }
  return weakest;
}

/** Module that trains a rubric category (for "review Module 3" links). */
export function moduleForRubric(
  modules: TrainingModule[],
  rubricKey: keyof RubricScores
): TrainingModule | null {
  return modules.find((m) => m.rubricKey === rubricKey) ?? null;
}

/* -------------------- section-level recommendations -------------------- */

export interface SectionRecommendation {
  moduleSlug: string;
  sectionId: string;
  sectionTitle: string;
}

/**
 * Map a weak rubric dimension — plus the grader's own words about the
 * losing moment — to the specific module SECTION to review, not just the
 * module. Keyword routing is deliberately conservative; each module has a
 * sensible default section.
 */
export function recommendSection(
  rubricKey: keyof RubricScores,
  gradeText: string,
  specialty?: string
): SectionRecommendation {
  const rec = recommendSectionBase(rubricKey, gradeText);
  // Module slugs are a global PK; non-podiatry ladders prefix them. Section
  // ids are shared across specialties by design, so deep links carry over.
  if (specialty && specialty !== "podiatry") {
    return { ...rec, moduleSlug: `${specialty}-${rec.moduleSlug}` };
  }
  return rec;
}

function recommendSectionBase(
  rubricKey: keyof RubricScores,
  gradeText: string
): SectionRecommendation {
  const t = gradeText.toLowerCase();
  switch (rubricKey) {
    case "objections": {
      if (/spouse|husband|wife|partner|talk to my|decide together/.test(t))
        return { moduleSlug: "objections", sectionId: "spouse-tools", sectionTitle: "The spouse play" };
      if (/think about it|call (you|the office)|next week|sleep on/.test(t))
        return { moduleSlug: "objections", sectionId: "think-tools", sectionTitle: "“I'll think about it”" };
      if (/evidence|does (this|it) work|success rate|skeptic|study|studies|data|control group/.test(t))
        return { moduleSlug: "objections", sectionId: "skepticism-tools", sectionTitle: "Skepticism" };
      if (/price|cost|money|expensive|afford|insurance|cover/.test(t))
        return { moduleSlug: "objections", sectionId: "price-tools", sectionTitle: "Price objections" };
      return { moduleSlug: "objections", sectionId: "loop", sectionTitle: "The four-step loop" };
    }
    case "price":
      if (/silence|quiet|pause|babbl|justif/.test(t))
        return { moduleSlug: "price", sectionId: "silence", sectionTitle: "The silence rule" };
      if (/anchor|per.?session|program|month|financ/.test(t))
        return { moduleSlug: "price", sectionId: "anchors", sectionTitle: "Anchoring honestly" };
      return { moduleSlug: "price", sectionId: "plain-delivery", sectionTitle: "Say it like a diagnosis" };
    case "framing":
      if (/fear|scare|surgery|urgen|oversell/.test(t))
        return { moduleSlug: "framing", sectionId: "weather-report", sectionTitle: "Consequence without fear" };
      if (/finding|ultrasound|exam|specific|generic/.test(t))
        return { moduleSlug: "framing", sectionId: "this-patient", sectionTitle: "THIS patient's findings" };
      return { moduleSlug: "framing", sectionId: "sequence", sectionTitle: "The 4-beat sequence" };
    case "rapport":
      if (/silence|pause|hesitat/.test(t))
        return { moduleSlug: "rapport", sectionId: "hesitation-vs-objection", sectionTitle: "Hesitation vs. objection" };
      if (/reflect|their words|paraphrase|generic empathy/.test(t))
        return { moduleSlug: "rapport", sectionId: "reflect-then-add", sectionTitle: "Reflect, then add" };
      return { moduleSlug: "rapport", sectionId: "seventy-thirty", sectionTitle: "The 70/30 rule" };
    case "close":
      if (/after (the )?yes|kept selling|backup/.test(t))
        return { moduleSlug: "close", sectionId: "after", sectionTitle: "After yes. After no." };
      if (/deliberat|overwhelm|decision style|match/.test(t))
        return { moduleSlug: "close", sectionId: "match-patient", sectionTitle: "Match the close" };
      return { moduleSlug: "close", sectionId: "three-closes", sectionTitle: "The three closes" };
  }
}

/**
 * Estimated reading minutes for a module doc (≈200 wpm; constraint ≤ 8).
 * Scripts and worked dialogues render collapsed and are expanded selectively,
 * so they count at half weight; the linear read (objectives, concept,
 * mistakes) counts in full.
 */
export function readingMinutes(doc: {
  objectives: string[];
  concept: { body: string; title: string }[];
  scripts: { lines: { line: string; why: string }[]; title: string; context?: string }[];
  dialogues: { patient: string; weak: string; strong: string; annotation: string }[];
  mistakes: { wrong: string; right: string; note: string }[];
}): number {
  const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
  let n = 0;
  doc.objectives.forEach((o) => (n += words(o)));
  doc.concept.forEach((c) => (n += words(c.title) + words(c.body)));
  let collapsed = 0;
  doc.scripts.forEach((g) => {
    collapsed += words(g.title) + words(g.context ?? "");
    g.lines.forEach((l) => (collapsed += words(l.line) + words(l.why)));
  });
  doc.dialogues.forEach(
    (d) => (collapsed += words(d.patient) + words(d.weak) + words(d.strong) + words(d.annotation))
  );
  n += Math.round(collapsed / 2);
  doc.mistakes.forEach((m) => (n += words(m.wrong) + words(m.right) + words(m.note)));
  return Math.max(1, Math.round(n / 200));
}

/** Average of one rubric dimension over the last `window` real reps. */
export function rubricAverage(
  history: EncounterWithGrade[],
  rubricKey: keyof RubricScores,
  window = 10
): { avg: number; reps: number } | null {
  const graded = history
    .filter((r) => r.grade !== null && !["drill", "redo"].includes(r.encounter.kind ?? "rep"))
    .slice(0, window);
  if (graded.length === 0) return null;
  return {
    avg: graded.reduce((s, r) => s + r.grade!.scores[rubricKey], 0) / graded.length,
    reps: graded.length,
  };
}

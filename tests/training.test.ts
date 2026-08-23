import { describe, expect, it } from "vitest";
import {
  computeTrainingStatus,
  findWeakSkill,
  isLessonComplete,
  moduleForRubric,
} from "@/lib/training";
import { PODIATRY_MODULES, PODIATRY_LESSONS } from "@/lib/training/podiatry-pack";
import type { LessonProgressRow } from "@/lib/types";
import type { EncounterWithGrade } from "@/lib/store";

function progressRow(
  lessonSlug: string,
  patch: Partial<LessonProgressRow> = {}
): LessonProgressRow {
  return {
    userId: "u1",
    lessonSlug,
    status: "completed",
    quizScore: 100,
    drillPassed: true,
    completedAt: new Date().toISOString(),
    ...patch,
  };
}

describe("podiatry pack shape", () => {
  it("mirrors the five rubric categories plus the intro module", () => {
    expect(PODIATRY_MODULES).toHaveLength(6);
    const keys = PODIATRY_MODULES.map((m) => m.rubricKey);
    expect(keys).toEqual([null, "rapport", "framing", "price", "objections", "close"]);
  });

  it("every module has exactly one `-core` tracking record; modules 2–5 carry the drill", () => {
    for (const m of PODIATRY_MODULES) {
      const lessons = PODIATRY_LESSONS.filter((l) => l.moduleSlug === m.slug);
      expect(lessons).toHaveLength(1);
      expect(lessons[0].slug).toBe(`${m.slug}-core`);
      expect(lessons[0].quiz.length).toBeGreaterThanOrEqual(3);
      expect(lessons[0].quiz.length).toBeLessThanOrEqual(5);
      if (m.order >= 2) {
        expect(lessons[0].drill?.rubricKey).toBe(m.rubricKey);
      } else {
        expect(lessons[0].drill).toBeNull();
      }
    }
  });

  it("quiz answers are in range and every question explains why", () => {
    for (const l of PODIATRY_LESSONS) {
      for (const q of l.quiz) {
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.options.length);
        expect(q.why.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("isLessonComplete", () => {
  const quizLesson = PODIATRY_LESSONS.find((l) => l.quiz.length > 0 && !l.drill)!;
  const drillLesson = PODIATRY_LESSONS.find((l) => l.drill)!;

  it("requires a passing quiz score", () => {
    expect(isLessonComplete(quizLesson, progressRow(quizLesson.slug, { quizScore: 75 }))).toBe(false);
    expect(isLessonComplete(quizLesson, progressRow(quizLesson.slug, { quizScore: 80 }))).toBe(true);
  });

  it("requires the drill to be passed when the lesson has one", () => {
    expect(isLessonComplete(drillLesson, progressRow(drillLesson.slug, { drillPassed: false }))).toBe(false);
    expect(isLessonComplete(drillLesson, progressRow(drillLesson.slug, { drillPassed: true }))).toBe(true);
  });
});

describe("computeTrainingStatus", () => {
  it("locks modules after the first incomplete one", () => {
    const done = PODIATRY_LESSONS.filter((l) => l.moduleSlug === "mindset").map((l) =>
      progressRow(l.slug)
    );
    const s = computeTrainingStatus(PODIATRY_MODULES, PODIATRY_LESSONS, done);
    expect(s.modules[0].status).toBe("completed");
    expect(s.modules[1].status).toBe("current");
    expect(s.modules[2].status).toBe("locked");
    expect(s.coreComplete).toBe(false);
  });

  it("reports core complete when every lesson is earned", () => {
    const all = PODIATRY_LESSONS.map((l) => progressRow(l.slug));
    const s = computeTrainingStatus(PODIATRY_MODULES, PODIATRY_LESSONS, all);
    expect(s.coreComplete).toBe(true);
    expect(s.lessonsCompleted).toBe(PODIATRY_LESSONS.length);
  });
});

describe("findWeakSkill", () => {
  function rep(scores: Partial<Record<string, number>>): EncounterWithGrade {
    const base = { rapport: 15, framing: 15, price: 15, objections: 15, close: 15, ...scores };
    return {
      encounter: {
        id: Math.random().toString(),
        userId: "u1",
        scenarioSlug: "s",
        difficulty: "moderate",
        persona: { personaId: "p", archetype: "a", name: "n", age: 50, insurance: "i", occupation: "o" },
        transcript: [],
        status: "graded",
        startedAt: new Date().toISOString(),
        endedAt: null,
        usage: { modelInputTokens: 0, modelOutputTokens: 0, ttsCharacters: 0, sttSeconds: 0 },
        kind: "rep",
      },
      grade: {
        id: "g",
        encounterId: "e",
        closed: true,
        scores: base as never,
        total: 75,
        moment: "",
        momentIndex: null,
        rewrite: null,
        worked: [],
        fixes: [],
        drill: "",
        createdAt: new Date().toISOString(),
      },
    };
  }

  it("surfaces the weakest category under the threshold", () => {
    const history = [rep({ price: 8 }), rep({ price: 10 }), rep({ price: 9, objections: 11 })];
    const weak = findWeakSkill(history);
    expect(weak?.rubricKey).toBe("price");
    const mod = moduleForRubric(PODIATRY_MODULES, weak!.rubricKey);
    expect(mod?.slug).toBe("price");
  });

  it("returns null with too few reps or no weak category", () => {
    expect(findWeakSkill([rep({}), rep({})])).toBeNull();
    expect(findWeakSkill([rep({}), rep({}), rep({})])).toBeNull();
  });

  it("ignores drills in the window", () => {
    const drill = rep({ price: 2 });
    drill.encounter.kind = "drill";
    expect(findWeakSkill([drill, rep({}), rep({}), rep({})])).toBeNull();
  });
});

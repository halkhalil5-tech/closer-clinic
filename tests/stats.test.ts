import { describe, expect, it } from "vitest";
import { computeStats } from "@/lib/stats";
import type { EncounterWithGrade } from "@/lib/store";
import type { EncounterRow, GradeRow, RubricScores } from "@/lib/types";

let seq = 0;
function rep(
  startedAt: string,
  opts: { closed?: boolean; total?: number; scores?: Partial<RubricScores>; scenario?: string; graded?: boolean } = {}
): EncounterWithGrade {
  const id = `enc-${seq++}`;
  const encounter: EncounterRow = {
    id,
    userId: "u1",
    scenarioSlug: opts.scenario ?? "shockwave-plantar-fasciitis",
    difficulty: "moderate",
    persona: {
      personaId: "one-word-stoic",
      archetype: "Stoic",
      name: "Dale",
      age: 60,
      insurance: "Medicare",
      occupation: "farmer",
    },
    transcript: [],
    status: opts.graded === false ? "active" : "graded",
    startedAt,
    endedAt: null,
    usage: { modelInputTokens: 0, modelOutputTokens: 0, ttsCharacters: 0, sttSeconds: 0 },
  };
  const grade: GradeRow | null =
    opts.graded === false
      ? null
      : {
          id: `g-${id}`,
          encounterId: id,
          closed: opts.closed ?? true,
          momentIndex: null,
          rewrite: null,
          scores: {
            rapport: 10,
            framing: 10,
            price: 10,
            objections: 10,
            close: 10,
            ...opts.scores,
          },
          total: opts.total ?? 50,
          moment: "m",
          worked: ["w"],
          fixes: ["f"],
          drill: "d",
          createdAt: startedAt,
        };
  return { encounter, grade };
}

describe("computeStats", () => {
  it("returns null rates with no graded reps", () => {
    const stats = computeStats([]);
    expect(stats.reps).toBe(0);
    expect(stats.closeRate).toBeNull();
    expect(stats.avgTotal).toBeNull();
    expect(stats.weakestRubric).toBeNull();
  });

  it("ignores ungraded encounters in rate math but counts them for streaks", () => {
    const now = new Date("2026-08-20T15:00:00Z");
    const stats = computeStats(
      [
        rep("2026-08-20T10:00:00Z", { graded: false }),
        rep("2026-08-19T10:00:00Z", { closed: true }),
      ],
      now
    );
    expect(stats.reps).toBe(1);
    expect(stats.closeRate).toBe(1);
    expect(stats.streakDays).toBe(2);
  });

  it("computes close rate and average total", () => {
    const stats = computeStats([
      rep("2026-08-18T10:00:00Z", { closed: true, total: 80 }),
      rep("2026-08-18T11:00:00Z", { closed: false, total: 40 }),
      rep("2026-08-18T12:00:00Z", { closed: true, total: 60 }),
    ]);
    expect(stats.closeRate).toBeCloseTo(2 / 3);
    expect(stats.avgTotal).toBe(60);
  });

  it("identifies the weakest rubric category", () => {
    const stats = computeStats([
      rep("2026-08-18T10:00:00Z", { scores: { price: 3 } }),
      rep("2026-08-18T11:00:00Z", { scores: { price: 5 } }),
    ]);
    expect(stats.weakestRubric?.key).toBe("price");
    expect(stats.weakestRubric?.avg).toBe(4);
  });

  it("breaks streaks on a missed day", () => {
    const now = new Date("2026-08-20T15:00:00Z");
    const stats = computeStats(
      [
        rep("2026-08-20T10:00:00Z"),
        rep("2026-08-19T10:00:00Z"),
        // gap on the 18th
        rep("2026-08-17T10:00:00Z"),
      ],
      now
    );
    expect(stats.streakDays).toBe(2);
  });

  it("keeps yesterday's streak alive before today's first rep", () => {
    const now = new Date("2026-08-20T08:00:00Z");
    const stats = computeStats([rep("2026-08-19T10:00:00Z")], now);
    expect(stats.streakDays).toBe(1);
  });

  it("aggregates per scenario", () => {
    const stats = computeStats([
      rep("2026-08-18T10:00:00Z", { scenario: "a", closed: true, total: 90 }),
      rep("2026-08-18T11:00:00Z", { scenario: "a", closed: false, total: 50 }),
      rep("2026-08-18T12:00:00Z", { scenario: "b", closed: true, total: 70 }),
    ]);
    const a = stats.byScenario.find((s) => s.scenarioSlug === "a")!;
    expect(a.reps).toBe(2);
    expect(a.closeRate).toBe(0.5);
    expect(a.avgTotal).toBe(70);
  });
});

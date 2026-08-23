import type { RubricScores } from "./types";
import { RUBRIC_LABELS } from "./types";
import type { EncounterWithGrade } from "./store";

export interface DayPoint {
  date: string; // YYYY-MM-DD
  reps: number;
  closes: number;
  closeRate: number | null;
  avgTotal: number | null;
}

export interface ScenarioAgg {
  scenarioSlug: string;
  reps: number;
  closes: number;
  closeRate: number;
  avgTotal: number;
}

export interface StatsSummary {
  reps: number;
  closes: number;
  closeRate: number | null; // 0-1, null when no graded reps
  avgTotal: number | null;
  streakDays: number;
  weakestRubric: { key: keyof RubricScores; label: string; avg: number } | null;
  rubricAverages: Record<keyof RubricScores, number> | null;
  byDay: DayPoint[];
  byScenario: ScenarioAgg[];
}

const RUBRIC_KEYS: (keyof RubricScores)[] = ["rapport", "framing", "price", "objections", "close"];

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Pure aggregate computation over a user's encounter history. */
export function computeStats(rows: EncounterWithGrade[], now: Date = new Date()): StatsSummary {
  const graded = rows.filter((r) => r.grade !== null);
  const reps = graded.length;
  const closes = graded.filter((r) => r.grade!.closed).length;

  // Per-day series (only days with activity; the chart fills gaps visually).
  const days = new Map<string, { reps: number; closes: number; totalSum: number }>();
  for (const r of graded) {
    const k = dayKey(r.encounter.startedAt);
    const d = days.get(k) ?? { reps: 0, closes: 0, totalSum: 0 };
    d.reps += 1;
    if (r.grade!.closed) d.closes += 1;
    d.totalSum += r.grade!.total;
    days.set(k, d);
  }
  const byDay: DayPoint[] = [...days.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      date,
      reps: d.reps,
      closes: d.closes,
      closeRate: d.reps > 0 ? d.closes / d.reps : null,
      avgTotal: d.reps > 0 ? d.totalSum / d.reps : null,
    }));

  // Per-scenario
  const scen = new Map<string, { reps: number; closes: number; totalSum: number }>();
  for (const r of graded) {
    const k = r.encounter.scenarioSlug;
    const s = scen.get(k) ?? { reps: 0, closes: 0, totalSum: 0 };
    s.reps += 1;
    if (r.grade!.closed) s.closes += 1;
    s.totalSum += r.grade!.total;
    scen.set(k, s);
  }
  const byScenario: ScenarioAgg[] = [...scen.entries()]
    .map(([scenarioSlug, s]) => ({
      scenarioSlug,
      reps: s.reps,
      closes: s.closes,
      closeRate: s.closes / s.reps,
      avgTotal: s.totalSum / s.reps,
    }))
    .sort((a, b) => b.reps - a.reps);

  // Rubric averages + weakest category
  let rubricAverages: Record<keyof RubricScores, number> | null = null;
  let weakestRubric: StatsSummary["weakestRubric"] = null;
  if (reps > 0) {
    rubricAverages = { rapport: 0, framing: 0, price: 0, objections: 0, close: 0 };
    for (const r of graded) {
      for (const k of RUBRIC_KEYS) rubricAverages[k] += r.grade!.scores[k];
    }
    for (const k of RUBRIC_KEYS) rubricAverages[k] = rubricAverages[k] / reps;
    const weakestKey = RUBRIC_KEYS.reduce((min, k) =>
      rubricAverages![k] < rubricAverages![min] ? k : min
    );
    weakestRubric = {
      key: weakestKey,
      label: RUBRIC_LABELS[weakestKey],
      avg: rubricAverages[weakestKey],
    };
  }

  // Streak: consecutive UTC calendar days (ending today or yesterday) with ≥1 rep.
  const activeDays = new Set(rows.map((r) => dayKey(r.encounter.startedAt)));
  let streakDays = 0;
  const cursor = new Date(now);
  if (!activeDays.has(utcDayKey(cursor))) {
    cursor.setUTCDate(cursor.getUTCDate() - 1); // today hasn't had a rep yet; streak can still be alive
  }
  while (activeDays.has(utcDayKey(cursor))) {
    streakDays += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return {
    reps,
    closes,
    closeRate: reps > 0 ? closes / reps : null,
    avgTotal: reps > 0 ? graded.reduce((s, r) => s + r.grade!.total, 0) / reps : null,
    streakDays,
    weakestRubric,
    rubricAverages,
    byDay,
    byScenario,
  };
}

function utcDayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

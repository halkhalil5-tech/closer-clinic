import "server-only";
import type { Store } from "../store";
import type { TrainingLesson, LessonProgressRow } from "../types";
import { QUIZ_PASS_PCT } from "../types";
import { computeTrainingStatus } from "./index";

/**
 * Server-side training helpers shared by the progress, quiz, and drill routes.
 */

/** Whether every gradable part of a lesson has been earned. */
export function lessonEarned(lesson: TrainingLesson, row: LessonProgressRow): boolean {
  const quizOk = lesson.quiz.length === 0 || (row.quizScore ?? 0) >= QUIZ_PASS_PCT;
  const drillOk = !lesson.drill || row.drillPassed === true;
  const opened = row.status !== "not_started";
  return opened && quizOk && drillOk;
}

/** Promote a lesson to completed when earned; returns the fresh row. */
export async function settleLessonStatus(
  store: Store,
  userId: string,
  lesson: TrainingLesson,
  row: LessonProgressRow
): Promise<LessonProgressRow> {
  if (row.status !== "completed" && lessonEarned(lesson, row)) {
    return store.upsertLessonProgress(userId, lesson.slug, {
      status: "completed",
      completedAt: new Date().toISOString(),
    });
  }
  return row;
}

/**
 * If the core curriculum is now complete and the user has no unlocks yet,
 * unlock all base stations (via "curriculum"). Returns true when stations
 * are unlocked (by any route) after the check.
 */
export async function maybeUnlockCore(
  store: Store,
  userId: string,
  specialty: string
): Promise<{ unlocked: boolean; justUnlocked: boolean }> {
  const existing = await store.listUnlocks(userId);
  if (existing.length > 0) return { unlocked: true, justUnlocked: false };

  const [modules, lessons, progress] = await Promise.all([
    store.listTrainingModules(specialty),
    store.listTrainingLessons(specialty),
    store.getLessonProgress(userId),
  ]);
  const status = computeTrainingStatus(modules, lessons, progress);
  if (!status.coreComplete) return { unlocked: false, justUnlocked: false };

  const stations = await store.listScenarios(specialty);
  await store.addUnlocks(
    userId,
    stations.map((s) => s.slug),
    "curriculum"
  );
  return { unlocked: true, justUnlocked: true };
}

/** Whether this user may start standard reps (test-out is always allowed). */
export async function stationsUnlocked(store: Store, userId: string): Promise<boolean> {
  const unlocks = await store.listUnlocks(userId);
  return unlocks.length > 0;
}

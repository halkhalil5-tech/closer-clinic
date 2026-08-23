import type { AssignmentRow, AssignmentSeatStatus } from "./types";
import type { EncounterWithGrade } from "./store";
import { letterFor, minTotalFor } from "./letter-grades";

/**
 * Pure assignment-status math, shared by the seat's Home chips and the
 * admin completion matrix.
 */

/** Reps that count: on the assigned station, since assignment, graded,
 *  and at/above the minimum letter when one is set. */
export function assignmentStatus(
  assignment: AssignmentRow,
  history: EncounterWithGrade[],
  cardSessions: number = 0
): AssignmentSeatStatus {
  if (assignment.kind === "cards") {
    const counted = cardSessions;
    return {
      state: counted >= assignment.targetReps ? "done" : counted > 0 ? "in_progress" : "not_started",
      countedReps: Math.min(counted, assignment.targetReps),
      bestLetter: null,
    };
  }

  const since = assignment.createdAt;
  const floor = assignment.minGrade ? minTotalFor(assignment.minGrade) : 0;
  const onStation = history.filter(
    (r) =>
      r.encounter.scenarioSlug === assignment.stationSlug &&
      r.encounter.startedAt >= since &&
      r.grade !== null &&
      !["drill", "redo"].includes(r.encounter.kind ?? "rep")
  );
  const counted = onStation.filter((r) => r.grade!.total >= floor).length;
  const best = onStation.reduce<number | null>(
    (max, r) => (max === null || r.grade!.total > max ? r.grade!.total : max),
    null
  );
  const attempted = onStation.length > 0;
  return {
    state: counted >= assignment.targetReps ? "done" : attempted ? "in_progress" : "not_started",
    countedReps: Math.min(counted, assignment.targetReps),
    bestLetter: best !== null ? letterFor(best) : null,
  };
}

export type DueTone = "normal" | "soon" | "overdue";

/** Chip color: amber inside 48h, red past due. */
export function dueTone(dueAt: string, now: Date = new Date()): DueTone {
  const ms = new Date(dueAt).getTime() - now.getTime();
  if (ms < 0) return "overdue";
  if (ms < 48 * 3600_000) return "soon";
  return "normal";
}

export function dueLabel(dueAt: string, now: Date = new Date()): string {
  const due = new Date(dueAt);
  const ms = due.getTime() - now.getTime();
  if (ms < 0) return "overdue";
  const hours = Math.round(ms / 3600_000);
  if (hours < 24) return `due in ${hours}h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "due tomorrow" : `due in ${days}d`;
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore, listRosterForUser } from "@/lib/store";
import { assignmentStatus, dueLabel, dueTone } from "@/lib/assignments";
import type { AssignmentSeatStatus } from "@/lib/types";
import { RequireCurriculumToggle } from "@/components/require-curriculum-toggle";
import { AssignmentCreate, AssignmentRetire } from "@/components/assignment-admin";
import { SeatRoleToggle } from "@/components/seat-role-toggle";

export const dynamic = "force-dynamic";

/** Clinic admin: each seat's training standing + the curriculum-before-reps policy. */
export default async function AdminTrainingPage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const store = await getStore();
  const profile = await store.getCurrentUser();
  const [team, requireCurriculum, customs, assignments, roster] = await Promise.all([
    store.listTeamTraining(user.id),
    store.getRequireCurriculum(user.id),
    store.listCustomScenarios(user.id),
    store.listAssignmentsByAdmin(user.id),
    listRosterForUser(store, user.id, profile?.specialty ?? "podiatry"),
  ]);
  const customServices = customs.filter((s) => !s.isPrep);

  // Completion matrix: seat × assignment. The signed-in seat is computed from
  // real history; dev-seeded teammates get stable illustrative states.
  const myHistory =
    assignments.length > 0 ? await store.listEncountersWithGrades(user.id, { limit: 300 }) : [];
  const matrix = await Promise.all(
    assignments.map(async (a) => {
      const sessions = a.kind === "cards" ? await store.countCardSessions(user.id, a.createdAt) : 0;
      const seatStates = team.map((seat, i): { name: string; status: AssignmentSeatStatus } => {
        if (seat.userId === user.id) {
          return { name: seat.name, status: assignmentStatus(a, myHistory, sessions) };
        }
        const canned: AssignmentSeatStatus[] = [
          { state: "done", countedReps: a.targetReps, bestLetter: "B+" },
          { state: "in_progress", countedReps: 1, bestLetter: "C" },
          { state: "not_started", countedReps: 0, bestLetter: null },
        ];
        return { name: seat.name, status: canned[i % canned.length] };
      });
      return { assignment: a, seatStates };
    })
  );

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-10 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="flex items-center justify-between">
        <span className="microlabel">Clinic admin</span>
        <Link
          href="/settings"
          className="py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted"
        >
          Settings ✕
        </Link>
      </div>
      <h1 className="display mt-2 text-[28px] text-bone">Team training</h1>

      <RequireCurriculumToggle initial={requireCurriculum} />

      <section className="mt-5">
        <div className="flex items-baseline justify-between">
          <div className="microlabel">Seats</div>
          <div className="text-xs text-muted">{team.length} active</div>
        </div>
        {team.length === 0 ? (
          <p className="mt-3 py-6 text-center text-sm text-dim">
            No clinic seats yet — invites land in Phase 2.
          </p>
        ) : (
          <div className="mt-1 divide-y divide-hairline">
            {team.map((m) => {
              const pct =
                m.lessonsTotal > 0 ? Math.round((m.lessonsCompleted / m.lessonsTotal) * 100) : 0;
              return (
                <div key={m.userId} className="py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-ink">
                      {m.name}
                    </span>
                    <SeatRoleToggle userId={m.userId} initial={m.seatRole} self={m.userId === user.id} />
                    <span className="shrink-0 font-mono text-[12px] tabular-nums text-bone">
                      {m.lessonsCompleted}/{m.lessonsTotal}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-panel-2">
                      <div
                        className={`h-full ${m.coreComplete ? "bg-success" : "bg-bone/60"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted">
                      {m.quizAvg !== null ? `quiz ${m.quizAvg}` : "no quizzes"}
                      {" · "}
                      {m.coreComplete
                        ? "complete"
                        : m.unlockedVia === "test_out"
                          ? "tested out"
                          : "in progress"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <div className="microlabel">Assigned drills</div>
          <div className="text-xs text-muted">{assignments.length} active</div>
        </div>
        <AssignmentCreate
          stations={[...roster.custom, ...roster.builtIn].map((s) => ({
            slug: s.slug,
            title: s.title,
            custom: Boolean(s.isCustom),
          }))}
        />
        {matrix.map(({ assignment: a, seatStates }) => (
          <div key={a.id} className="mt-4">
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 flex-1 truncate text-[13.5px] font-semibold text-ink">
                {a.title}
              </span>
              <span
                className={`shrink-0 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${
                  dueTone(a.dueAt) === "overdue"
                    ? "text-red"
                    : dueTone(a.dueAt) === "soon"
                      ? "text-amber"
                      : "text-muted"
                }`}
              >
                {dueLabel(a.dueAt)}
              </span>
              <AssignmentRetire id={a.id} />
            </div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-muted">
              {a.targetReps} {a.kind === "cards" ? "shuffles" : "reps"}
              {a.minGrade ? ` · min ${a.minGrade}` : ""} · all seats
            </div>
            <div className="mt-1.5 divide-y divide-hairline border-t border-hairline">
              {seatStates.map(({ name, status }) => (
                <div key={name} className="flex items-center gap-2.5 py-2">
                  <span
                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                      status.state === "done"
                        ? "bg-success"
                        : status.state === "in_progress"
                          ? "bg-bone"
                          : "bg-faint"
                    }`}
                  />
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-dim">{name}</span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted">
                    {status.state === "done"
                      ? `done${status.bestLetter ? ` · ${status.bestLetter}` : ""}`
                      : status.state === "in_progress"
                        ? `${status.countedReps}/${a.targetReps}${status.bestLetter ? ` · best ${status.bestLetter}` : ""}`
                        : "not started"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <div className="microlabel">Custom services</div>
          <div className="text-xs text-muted">{customServices.length} active</div>
        </div>
        {customServices.length === 0 ? (
          <p className="mt-3 py-4 text-center text-sm text-dim">
            No custom services yet —{" "}
            <Link href="/stations/new" className="font-semibold text-bone underline">
              add one
            </Link>
            .
          </p>
        ) : (
          <div className="mt-1 divide-y divide-hairline">
            {customServices.map((s) => (
              <div key={s.slug} className="flex items-center gap-3 py-3">
                <span className="min-w-0 flex-1 truncate text-[14px] text-ink">{s.title}</span>
                <span className="shrink-0 font-mono text-[12px] tabular-nums text-bone">
                  {s.priceDisplay}
                </span>
                <Link
                  href={`/stations/edit/${s.slug}`}
                  className="shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted underline"
                >
                  Edit / retire
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

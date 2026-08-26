import Link from "next/link";
import { Flame, Zap } from "lucide-react";
import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore, listRosterForUser } from "@/lib/store";
import { computeStats } from "@/lib/stats";
import { pickFirstRepStation } from "@/lib/first-rep";
import { WARMUP_CARDS } from "@/lib/training/podiatry-pack";
import { FirstRepStart } from "@/components/first-rep-start";
import { findWeakSkill, moduleForRubric } from "@/lib/training";
import { RUBRIC_LABELS } from "@/lib/types";
import { AppNav } from "@/components/app-nav";
import { AssignedList, type AssignedItem } from "@/components/assigned-list";
import { assignmentStatus, dueTone, dueLabel } from "@/lib/assignments";
import { HomeClient } from "@/components/home-client";
import { LogReminderBanner } from "@/components/log-reminder-banner";
import { isSupabaseConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ launch?: string; difficulty?: string }>;
}) {
  const sp = await searchParams;
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const store = await getStore();
  const profile = await store.getCurrentUser();
  if (isSupabaseConfigured() && profile && !profile.onboarded) {
    // First rep before any setup: a brand-new user goes straight to a patient.
    const prior = await store.listEncountersWithGrades(user.id, { limit: 1 });
    redirect(prior.length === 0 ? "/first-rep" : "/onboarding");
  }

  const specialty = profile?.specialty ?? "podiatry";
  const [roster, history, unlocks] = await Promise.all([
    listRosterForUser(store, user.id, specialty),
    store.listEncountersWithGrades(user.id, { sinceDays: 7 }),
    store.listUnlocks(user.id),
  ]);
  const stats = computeStats(history);
  const locked = unlocks.length === 0;

  // Rep analytics → training cross-link: weakest rubric category over the
  // last 10 reps, when it averages under 12/20.
  const [recent, modules, outcomes] = await Promise.all([
    store.listEncountersWithGrades(user.id, { limit: 10 }),
    store.listTrainingModules(specialty),
    store.listOutcomeLogs(user.id, { sinceDays: 7 }),
  ]);
  // Activation: curriculum done (stations open) but not one graded rep yet —
  // one tap starts the highest-priced warmup-covered station. Gone after rep 1.
  const gradedEver = recent.some((r) => r.grade);
  const firstRepStation =
    !locked && !gradedEver ? pickFirstRepStation(roster.builtIn, WARMUP_CARDS) : null;

  // Assigned drills, pinned atop Home.
  const seatAssignments = await store.listAssignmentsForSeat(user.id);
  const fullHistory =
    seatAssignments.length > 0
      ? await store.listEncountersWithGrades(user.id, { limit: 300 })
      : [];
  const assignedItems: AssignedItem[] = await Promise.all(
    seatAssignments.map(async (a) => {
      const sessions =
        a.kind === "cards" ? await store.countCardSessions(user.id, a.createdAt) : 0;
      const st = assignmentStatus(a, fullHistory, sessions);
      return {
        id: a.id,
        kind: a.kind,
        stationSlug: a.stationSlug,
        title: a.title,
        dueLabel: dueLabel(a.dueAt),
        tone: dueTone(a.dueAt),
        state: st.state,
        counted: st.countedReps,
        target: a.targetReps,
        bestLetter: st.bestLetter,
        minGrade: a.minGrade,
      };
    })
  );

  const weak = findWeakSkill(recent);
  const weakModule = weak ? moduleForRubric(modules, weak.rubricKey) : null;

  // "Log today's consults" reminder: only when nothing is logged today.
  // Outcome logs stamp UTC dates (see /api/outcomes), so compare in UTC;
  // the banner itself additionally gates on the device's local clock (3pm+).
  const today = new Date().toISOString().slice(0, 10);
  const loggedToday = outcomes.some((o) => o.date === today);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md pb-24">
      <header className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="flex items-baseline justify-between">
          <span className="microlabel">Closer Clinic</span>
          <span className="text-xs capitalize text-muted">{specialty}</span>
        </div>
        <h1 className="display mt-2 text-[28px] text-bone">Stations</h1>

        {/* slim stat strip — tap for the full Progress dashboard */}
        <Link
          href="/progress"
          className="raised mt-3 flex min-h-[46px] items-center gap-3 rounded-card px-3.5 py-2 transition-opacity active:opacity-80"
        >
          <span className="font-mono text-[20px] font-semibold leading-none tabular-nums">
            {stats.closeRate === null ? (
              <span className="text-faint">--</span>
            ) : (
              <span className="text-bone">
                {Math.round(stats.closeRate * 100)}
                <span className="text-[12px] font-normal text-dim">%</span>
              </span>
            )}
          </span>
          <span className="microlabel">7d</span>
          <span className="flex items-center gap-1">
            <Flame className="h-3.5 w-3.5 text-amber" strokeWidth={1.5} aria-hidden="true" />
            <span className="font-mono text-[13px] font-semibold tabular-nums text-dim">
              {stats.streakDays}
            </span>
          </span>
          <span className="ml-auto text-[11px] text-muted">
            {stats.reps > 0
              ? `${stats.closes} of ${stats.reps} closed`
              : firstRepStation
                ? "day one"
                : "no graded reps yet"}
          </span>
          <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>

        {firstRepStation && (
          <div className="mt-3">
            <FirstRepStart
              scenarioSlug={firstRepStation.slug}
              label={`Run your first rep — ${firstRepStation.title}`}
            />
          </div>
        )}

        {/* daily-use bridges into the real clinic day */}
        {!locked && (
          <div className="mt-2 flex items-center justify-between">
            <Link
              href="/train/cards?shuffle=5"
              className="flex items-center gap-1 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-bone"
            >
              <Zap className="h-3.5 w-3.5 text-teal" strokeWidth={1.5} /> Warmup
            </Link>
            <Link
              href="/prep"
              className="py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-bone"
            >
              + Prep a consult
            </Link>
            <Link
              href="/drive"
              className="py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-bone"
            >
              Drive →
            </Link>
          </div>
        )}
      </header>

      <div className="px-4">
        <LogReminderBanner loggedToday={loggedToday} />
      </div>

      <AssignedList items={assignedItems} />

      {weak && weakModule && (
        <div className="px-4">
          <Link
            href={`/train/module/${weakModule.slug}`}
            className="mt-4 block border-l-2 border-l-amber py-1 pl-3 transition-opacity active:opacity-70"
          >
            <span className="text-[13.5px] leading-snug text-dim">
              Your{" "}
              <span className="font-semibold text-ink">{RUBRIC_LABELS[weak.rubricKey]}</span>{" "}
              is your weakest skill —{" "}
              <span className="font-mono text-[12px] tabular-nums text-amber">
                {weak.avg.toFixed(1)}/20
              </span>{" "}
              over your last {weak.reps} reps.{" "}
              <span className="font-semibold text-bone underline">
                Review Module {weakModule.order} — {weakModule.title}
              </span>
            </span>
          </Link>
        </div>
      )}

      <HomeClient
        scenarios={roster.builtIn}
        customScenarios={roster.custom}
        packs={roster.packs}
        editedSlugs={roster.editedSlugs}
        overrideConfigs={roster.overrideConfigs}
        locked={locked}
        initialLaunchSlug={sp.launch}
        initialDifficulty={
          sp.difficulty === "easy" || sp.difficulty === "moderate" || sp.difficulty === "hard"
            ? sp.difficulty
            : undefined
        }
      />
      <AppNav />
    </div>
  );
}

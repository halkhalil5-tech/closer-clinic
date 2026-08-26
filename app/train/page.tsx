import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { computeTrainingStatus, readingMinutes } from "@/lib/training";
import { AppNav } from "@/components/app-nav";
import { TrainLadder, type LadderModule } from "@/components/train-ladder";
import { isSupabaseConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function TrainPage() {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const store = await getStore();
  const profile = await store.getCurrentUser();
  if (isSupabaseConfigured() && profile && !profile.onboarded) redirect("/onboarding");
  const specialty = profile?.specialty ?? "podiatry";

  const [modules, lessons, progress, unlocks] = await Promise.all([
    store.listTrainingModules(specialty),
    store.listTrainingLessons(specialty),
    store.getLessonProgress(user.id),
    store.listUnlocks(user.id),
  ]);
  const status = computeTrainingStatus(modules, lessons, progress);
  const byLesson = new Map(progress.map((p) => [p.lessonSlug, p]));
  const unlockedVia = unlocks[0]?.via ?? null;

  const ladder: LadderModule[] = await Promise.all(
    status.modules.map(async (m) => {
      const doc = await store.getModuleDoc(m.module.slug);
      const row = byLesson.get(`${m.module.slug}-core`);
      const lesson = m.lessons[0];
      return {
        slug: m.module.slug,
        order: m.module.order,
        title: m.module.title,
        subtitle: m.module.subtitle,
        status: m.status,
        checkDone: (row?.quizScore ?? 0) >= 80,
        drill: lesson?.drill ? (row?.drillPassed ? ("passed" as const) : ("pending" as const)) : ("none" as const),
        minutes: doc ? readingMinutes(doc) : lesson?.minutes ?? 5,
      };
    })
  );

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md pb-24">
      <header className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="flex items-baseline justify-between">
          <span className="microlabel">Closer Clinic</span>
          <span className="text-xs capitalize text-muted">{specialty}</span>
        </div>
        <h1 className="display mt-2 text-[28px] text-bone">Train</h1>

        {/* the one raised panel: curriculum standing */}
        <div className="raised mt-3 rounded-card px-4 pb-3.5 pt-3">
          <div className="flex items-baseline justify-between">
            <div className="microlabel">Core curriculum</div>
            {status.quizAvg !== null && (
              <div className="text-xs text-muted">
                quiz avg{" "}
                <span className="font-mono text-sm font-semibold tabular-nums text-dim">
                  {status.quizAvg}
                </span>
              </div>
            )}
          </div>
          <div className="mt-1.5 flex items-end justify-between gap-4">
            <div className="font-mono text-[44px] font-semibold leading-none tabular-nums text-bone">
              {status.lessonsCompleted}
              <span className="text-xl font-normal text-dim">/{status.lessonsTotal}</span>
              <span className="ml-2 text-sm font-normal text-muted">lessons</span>
            </div>
          </div>
          <div className="mt-2.5 border-t border-hairline pt-2 text-[12px] leading-snug">
            {unlockedVia ? (
              <span className="text-success">
                ✓ Stations unlocked{unlockedVia === "test_out" ? " · test-out" : unlockedVia === "curriculum" ? " · curriculum complete" : ""}
              </span>
            ) : (
              <span className="text-dim">
                Finish the core curriculum to unlock Stations — or{" "}
                <a href="/test-out" className="font-semibold text-bone underline">
                  test out
                </a>{" "}
                with one challenge rep (score 75+).
              </span>
            )}
          </div>
        </div>
        {/* the flashcard deck */}
        <a
          href="/train/cards"
          className="mt-3 flex items-center gap-2.5 border-b border-hairline py-3 transition-colors hover:bg-raised active:bg-raised"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-bone" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="3" y="4.5" width="11" height="13" rx="1.5" />
            <path d="M6.5 2.5H15A2 2 0 0 1 17 4.5V15" />
          </svg>
          <span className="display-title text-[14px] text-bone">Objection cards</span>
          <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            Flip the deck →
          </span>
        </a>
      </header>

      <TrainLadder modules={ladder} />
      <AppNav />
    </div>
  );
}

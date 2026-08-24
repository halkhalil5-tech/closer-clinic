import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore, listRosterForUser } from "@/lib/store";
import { computeStats } from "@/lib/stats";
import { computeTrainingStatus } from "@/lib/training";
import { averageLetter, isoDaysAgo } from "@/lib/letter-grades";
import { AppNav } from "@/components/app-nav";
import { SimVsRealChart, ScenarioBars, type RealDayPoint } from "@/components/charts";
import { OutcomeLog, type LogService } from "@/components/outcome-log";
import {
  closedRevenue,
  defaultAmountCents,
  formatCents,
  paybackMultiple,
  revenueByDay,
  revenueDelta,
  stationLeaks,
} from "@/lib/revenue";
import { PLAN_PRICE_CLINIC_CENTS, PLAN_PRICE_INDIVIDUAL_CENTS } from "@/lib/config";

export const dynamic = "force-dynamic";

const WINDOWS = [7, 30, 90] as const;

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ window?: string; tab?: string }>;
}) {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const sp = await searchParams;
  const windowDays = WINDOWS.includes(Number(sp.window) as 7 | 30 | 90)
    ? (Number(sp.window) as 7 | 30 | 90)
    : 30;
  const tab = sp.tab === "training" ? "training" : "reps";

  const store = await getStore();
  const profile = await store.getCurrentUser();
  const specialty = profile?.specialty ?? "podiatry";
  const [rows, scenarios, outcomes, allOutcomes, modules, lessons, progress, unlocks, roster] = await Promise.all([
    store.listEncountersWithGrades(user.id, { sinceDays: windowDays }),
    store.listScenarios(),
    store.listOutcomeLogs(user.id, { sinceDays: windowDays }),
    store.listOutcomeLogs(user.id),
    store.listTrainingModules(specialty),
    store.listTrainingLessons(specialty),
    store.getLessonProgress(user.id),
    store.listUnlocks(user.id),
    listRosterForUser(store, user.id, specialty),
  ]);
  const stats = computeStats(rows.filter((r) => (r.encounter.kind ?? "rep") !== "drill"));

  // Grade trend: last-10 average letter now vs. as of 30 days ago.
  const allGraded = (await store.listEncountersWithGrades(user.id, { limit: 300 }))
    .filter((r) => r.grade && !["drill", "redo"].includes(r.encounter.kind ?? "rep"))
    .sort((a, b) => b.encounter.startedAt.localeCompare(a.encounter.startedAt));
  const cutoff = isoDaysAgo(30);
  const currentLetter = averageLetter(allGraded.map((r) => r.grade!.total));
  const pastLetter = averageLetter(
    allGraded.filter((r) => r.encounter.startedAt <= cutoff).map((r) => r.grade!.total)
  );
  const titleOf = (slug: string) => scenarios.find((s) => s.slug === slug)?.title ?? slug;
  const training = computeTrainingStatus(modules, lessons, progress);
  const byProgress = new Map(progress.map((p) => [p.lessonSlug, p]));

  // Aggregate real-world logs per day for the proof chart.
  const realByDay = new Map<string, RealDayPoint>();
  for (const o of outcomes) {
    if (!o.presented) continue;
    const d = realByDay.get(o.date) ?? { date: o.date, presented: 0, closed: 0 };
    d.presented += 1;
    if (o.closed) d.closed += 1;
    realByDay.set(o.date, d);
  }
  const real = [...realByDay.values()];

  // ------------------------- revenue attribution -------------------------
  const rosterAll = [...roster.custom, ...roster.builtIn];
  const priceBySlug = new Map(rosterAll.map((s) => [s.slug, defaultAmountCents(s)]));
  const titleBySlug = new Map(rosterAll.map((s) => [s.slug, s.title]));
  const logServices: LogService[] = rosterAll.map((s) => ({
    slug: s.slug,
    title: s.title,
    defaultCents: defaultAmountCents(s),
  }));

  const today = new Date().toISOString().slice(0, 10);
  const revenue = closedRevenue(outcomes, priceBySlug);
  const delta = revenueDelta(allOutcomes, priceBySlug, today);
  const monthStart = isoDaysAgo(30).slice(0, 10);
  const monthRevenue = closedRevenue(
    allOutcomes.filter((o) => o.date >= monthStart),
    priceBySlug
  );
  const planCents = profile?.clinicId ? PLAN_PRICE_CLINIC_CENTS : PLAN_PRICE_INDIVIDUAL_CENTS;
  const payback = paybackMultiple(monthRevenue.cents, planCents);
  const leaks = stationLeaks(outcomes, priceBySlug, titleBySlug).slice(0, 5);
  const revByDay = [...revenueByDay(outcomes, priceBySlug)].map(([date, cents]) => ({
    date,
    cents,
  }));
  const neverLogged = allOutcomes.length === 0;

  // The consult logger lives here now; week counts always cover the last 7
  // days regardless of the selected chart window.
  const weekFloor = isoDaysAgo(7).slice(0, 10);
  const weekLogs = (
    windowDays >= 7 ? outcomes : await store.listOutcomeLogs(user.id, { sinceDays: 7 })
  ).filter((o) => o.presented && o.date >= weekFloor);

  const recent = rows.filter((r) => r.grade).slice(0, 15);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md pb-24">
      <header className="px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <div className="flex items-baseline justify-between">
          <h1 className="display text-[28px] text-bone">Progress</h1>
          {tab === "reps" && (
            <div className="flex border border-line">
              {WINDOWS.map((w, i) => (
                <Link
                  key={w}
                  href={`/progress?window=${w}`}
                  className={`px-3 py-1.5 font-mono text-[11px] font-semibold ${
                    i > 0 ? "border-l border-line" : ""
                  } ${windowDays === w ? "bg-mint text-mint-ink" : "bg-panel text-muted"}`}
                >
                  {w}D
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* pillar tabs */}
        <div className="mt-3 flex border-b border-hairline">
          {(["reps", "training"] as const).map((t) => (
            <Link
              key={t}
              href={t === "reps" ? "/progress" : "/progress?tab=training"}
              className={`display relative flex-1 pb-2.5 pt-1 text-center text-[13px] transition-colors ${
                tab === t ? "text-mint" : "text-muted"
              }`}
            >
              {t === "reps" ? "Reps" : "Training"}
              {tab === t && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-mint" />}
            </Link>
          ))}
        </div>

        {tab === "reps" && (
          <div className="mt-1 grid grid-cols-4 divide-x divide-line">
            <Stat label="Reps" value={String(stats.reps)} />
            <Stat
              label="Close"
              value={stats.closeRate === null ? "--" : `${Math.round(stats.closeRate * 100)}%`}
              accent
            />
            <Stat label="Avg" value={stats.avgTotal === null ? "--" : String(Math.round(stats.avgTotal))} />
            <Stat label="Streak" value={`${stats.streakDays}D`} />
          </div>
        )}
      </header>

      {tab === "training" ? (
        <main className="px-4">
          <div className="mt-3 grid grid-cols-3 divide-x divide-line">
            <Stat
              label="Modules"
              value={`${training.modules.filter((m) => m.status === "completed").length}/${training.modules.length}`}
            />
            <Stat
              label="Lessons"
              value={`${training.lessonsCompleted}/${training.lessonsTotal}`}
            />
            <Stat label="Quiz avg" value={training.quizAvg === null ? "--" : String(training.quizAvg)} />
          </div>

          <section className="mt-4">
            <div className="flex items-baseline justify-between">
              <div className="microlabel">Curriculum</div>
              <div className="text-xs text-muted">
                {unlocks.length > 0
                  ? unlocks[0].via === "test_out"
                    ? "unlocked via test-out"
                    : "unlocked via curriculum"
                  : "stations locked"}
              </div>
            </div>
            <div className="mt-1 divide-y divide-hairline">
              {training.modules.map((m) => {
                const quizzes = m.lessons
                  .map((l) => byProgress.get(l.slug)?.quizScore)
                  .filter((q): q is number => q !== null && q !== undefined);
                const drills = m.lessons.filter((l) => l.drill);
                const drillsPassed = m.lessons.filter(
                  (l) => l.drill && byProgress.get(l.slug)?.drillPassed
                ).length;
                return (
                  <div key={m.module.slug} className="flex items-center gap-3 py-3">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        m.status === "completed"
                          ? "bg-mint"
                          : m.status === "current"
                            ? "bg-bone"
                            : "bg-faint"
                      }`}
                    />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-ink">
                      <span className="mr-1.5 font-mono text-[11px] text-muted">{m.module.order}</span>
                      {m.module.title}
                    </span>
                    <span className="shrink-0 font-mono text-[11px] tabular-nums text-muted">
                      {m.lessonsCompleted}/{m.lessons.length}
                      {quizzes.length > 0 &&
                        ` · quiz ${Math.round(quizzes.reduce((a, b) => a + b, 0) / quizzes.length)}`}
                      {drills.length > 0 && ` · drill ${drillsPassed}/${drills.length}`}
                    </span>
                  </div>
                );
              })}
            </div>
            <Link
              href="/train"
              className="display mt-4 block w-full rounded-card border border-line-strong py-3 text-center text-[13px] tracking-wide text-bone"
            >
              Go to Train
            </Link>
          </section>
        </main>
      ) : (
      <main className="px-4">
        {/* -------- closed revenue: the number a clinic renews on -------- */}
        <section className="mt-3 border border-line bg-panel p-3">
          <div className="flex items-baseline justify-between">
            <div className="microlabel">Closed revenue · {windowDays}D</div>
            {revenue.estimated && revenue.cents > 0 && (
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-muted">
                est.
              </span>
            )}
          </div>
          {neverLogged ? (
            <div className="mt-2">
              <p className="text-[13px] text-dim">
                Log today&apos;s consults to see what you&apos;re closing.
              </p>
              <div className="mt-3">
                <OutcomeLog
                  title="Log today's consults"
                  services={logServices}
                  weekPresented={weekLogs.length}
                  weekClosed={weekLogs.filter((o) => o.closed).length}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="mt-1 font-mono text-[34px] font-semibold leading-none tabular-nums text-bone">
                {formatCents(revenue.cents)}
              </div>
              <div className="mt-1.5 text-[12px] text-muted">
                {delta?.kind === "delta" ? (
                  <>
                    vs. your first 30 days:{" "}
                    <span className={`font-mono font-semibold tabular-nums ${delta.cents >= 0 ? "text-mint" : "text-red"}`}>
                      {delta.cents >= 0 ? "+" : ""}
                      {formatCents(delta.cents)}
                    </span>
                    {delta.estimated && " est."}
                  </>
                ) : delta ? (
                  <>logging since {new Date(`${delta.date}T00:00:00Z`).toLocaleDateString()}</>
                ) : null}
              </div>
              {monthRevenue.cents > 0 && (
                <div className="mt-2 border-t border-hairline pt-2 text-[12px] text-dim">
                  This month&apos;s closes ={" "}
                  <span className="font-mono font-semibold tabular-nums text-mint">{payback}×</span>{" "}
                  your subscription.
                </div>
              )}
            </>
          )}
        </section>

        {!neverLogged && (
          <section className="mt-3 border border-line bg-panel p-3">
            <OutcomeLog
              title="Log today's consults"
              services={logServices}
              weekPresented={weekLogs.length}
              weekClosed={weekLogs.filter((o) => o.closed).length}
            />
          </section>
        )}

        {/* -------- the leak table: which station to drill next -------- */}
        {leaks.length > 0 && leaks.some((l) => l.presented > 0 || l.didntPresent > 0) && (
          <section className="mt-3 border border-line bg-panel p-3">
            <div className="microlabel">Where consults leak · {windowDays}D</div>
            <div className="mt-1 divide-y divide-hairline">
              {leaks.map((l, i) => (
                <div key={l.slug} className="flex items-center gap-2 py-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="truncate text-[13px] font-semibold text-ink">{l.title}</span>
                      {i === 0 && l.leakCents > 0 && (
                        <span className="shrink-0 font-mono text-[8px] font-bold uppercase tracking-[0.14em] text-amber">
                          Biggest leak
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-tight text-muted">
                      {l.presented} presented · {l.closed} closed
                      {l.didntPresent > 0 && ` · ${l.didntPresent} not presented`}
                    </div>
                  </div>
                  <span className={`shrink-0 font-mono text-[14px] font-semibold tabular-nums ${l.leakCents > 0 ? "text-amber" : "text-muted"}`}>
                    {l.leakCents > 0 ? formatCents(l.leakCents) : "—"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {stats.weakestRubric && (
          <section className="mt-3 flex items-baseline justify-between border border-amber/40 bg-amber/[0.07] px-3 py-2.5">
            <div>
              <div className="microlabel text-amber">Weakest category</div>
              <div className="display mt-0.5 text-[15px] text-ink">{stats.weakestRubric.label}</div>
            </div>
            <span className="font-mono text-[15px] font-semibold tabular-nums text-amber">
              {stats.weakestRubric.avg.toFixed(1)}<span className="text-faint">/20</span>
            </span>
          </section>
        )}

        {currentLetter && (
          <section className="mt-3 flex items-center justify-between border border-line bg-panel px-3 py-3">
            <div>
              <div className="microlabel">Grade trend · 10-rep avg</div>
              <div className="mt-1 text-[11px] text-muted">
                {pastLetter && pastLetter !== currentLetter
                  ? "vs. 30 days ago"
                  : pastLetter
                    ? "holding steady vs. 30 days ago"
                    : "not enough history for a 30-day comparison"}
              </div>
            </div>
            <div className="display flex items-center gap-2 text-[30px] text-bone">
              {pastLetter && pastLetter !== currentLetter ? (
                <>
                  <span className="text-dim">{pastLetter}</span>
                  <svg viewBox="0 0 24 24" className="h-5 w-5 text-mint" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M4 12h15m-5-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{currentLetter}</span>
                </>
              ) : (
                <span>{currentLetter}</span>
              )}
            </div>
          </section>
        )}

        <section className="mt-3 border border-line bg-panel p-3">
          <div className="microlabel">Close rate — sim reps vs real world</div>
          <div className="mt-2">
            <SimVsRealChart byDay={stats.byDay} real={real} windowDays={windowDays} revenueByDay={revByDay} />
          </div>
        </section>

        <section className="mt-3 border border-line bg-panel p-3">
          <div className="microlabel">Average score by station</div>
          <div className="mt-2.5">
            <ScenarioBars
              data={stats.byScenario.map((s) => ({ ...s, title: titleOf(s.scenarioSlug) }))}
            />
          </div>
        </section>

        <section className="mt-4">
          <div className="microlabel">Recent reps</div>
          {recent.length === 0 ? (
            <div className="mt-2 border border-line bg-panel p-5 text-center text-sm text-dim">
              No graded encounters in this window.{" "}
              <Link href="/home" className="font-semibold text-mint">
                Walk into a room →
              </Link>
            </div>
          ) : (
            <div className="mt-1.5 border border-line">
              {recent.map(({ encounter, grade }, i) => (
                <Link
                  key={encounter.id}
                  href={`/scorecard/${encounter.id}`}
                  className={`flex items-center justify-between gap-3 bg-panel px-3 py-2.5 ${
                    i > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-ink">
                      {titleOf(encounter.scenarioSlug)}
                      {encounter.kind === "prep" && (
                        <span className="ml-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-bone/70">
                          Prep
                        </span>
                      )}
                      {encounter.kind === "test_out" && (
                        <span className="ml-1.5 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-muted">
                          Test-out
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-tight text-muted">
                      {encounter.persona.name} · {encounter.difficulty} ·{" "}
                      {new Date(encounter.startedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span
                      className={`font-mono text-[9px] font-bold uppercase tracking-[0.14em] ${
                        grade!.closed ? "text-mint" : "text-red"
                      }`}
                    >
                      {grade!.closed ? "Closed" : "No close"}
                    </span>
                    <span className="font-mono text-[17px] font-semibold tabular-nums text-ink">
                      {grade!.total}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      )}

      <AppNav />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="px-2 py-2.5 first:pl-0">
      <div className="microlabel">{label}</div>
      <div className="mt-0.5 font-mono text-[26px] font-semibold leading-none tabular-nums text-bone">
        {value}
      </div>
    </div>
  );
}

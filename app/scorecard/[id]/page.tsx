import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { RUBRIC_LABELS, TEST_OUT_PASS_TOTAL, type RubricScores } from "@/lib/types";
import { letterFor } from "@/lib/letter-grades";
import { recommendSection } from "@/lib/training";
import { RerunButton } from "@/components/rerun-button";
import { RedoButton } from "@/components/redo-button";
import { PairPlayer } from "@/components/pair-player";
import { PrepRerunButton } from "@/components/prep-rerun-button";

export const dynamic = "force-dynamic";

const RUBRIC_KEYS: (keyof RubricScores)[] = ["rapport", "framing", "price", "objections", "close"];

export default async function ScorecardPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const store = await getStore();
  const encounter = await store.getEncounter(id, user.id);
  if (!encounter) notFound();

  // Redo replays get a focused verdict, not a full scorecard.
  if (encounter.kind === "redo") {
    const result = encounter.meta?.redoResult;
    if (!result) redirect(`/encounter/${id}`);
    const parentId = encounter.meta?.parentEncounterId;
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="microlabel">Redo the moment</div>
        <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
          <div
            className={`stamp-in display border-[3px] px-4 py-2 text-[20px] tracking-wide ${
              result.handledBetter ? "border-mint text-mint" : "border-red text-red"
            }`}
          >
            {result.handledBetter ? "Handled better" : "Same trap"}
          </div>
          <p className="mt-5 max-w-[36ch] text-[14px] leading-relaxed text-dim">{result.feedback}</p>
        </div>
        <div className="flex flex-col gap-2">
          {parentId && !result.handledBetter && <RedoButton encounterId={parentId} primary />}
          {parentId && (
            <Link
              href={`/scorecard/${parentId}`}
              className="display w-full rounded-card border border-line py-3 text-center text-[13px] tracking-wide text-ink"
            >
              Back to the scorecard
            </Link>
          )}
          <Link
            href="/home"
            className="block w-full py-2.5 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
          >
            Stations
          </Link>
        </div>
      </main>
    );
  }

  const grade = await store.getGradeByEncounter(id, user.id);
  if (!grade) redirect(`/encounter/${id}`);

  const scenario = await store.getScenario(encounter.scenarioSlug);
  const profile = await store.getCurrentUser();
  const reportDate = new Date(encounter.startedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1rem)]">
      {/* dark desk margin */}
      <div className="microlabel flex items-baseline justify-between">
        <span>{scenario?.title ?? "Scorecard"}</span>
        <span>{encounter.difficulty}</span>
      </div>

      {/* the printed chart — one paper document slid across the desk */}
      <div className="mt-3 border-2 border-paper-ink bg-paper px-4 pb-5 pt-3.5 text-paper-ink">
        {/* letterhead */}
        <div className="flex items-baseline justify-between gap-3 border-b-2 border-paper-ink pb-2">
          <span className="whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.14em]">
            Closer Clinic
          </span>
          <span className="whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.14em] text-paper-ink/65">
            Encounter report
          </span>
        </div>

        {/* hero letter grade + verdict stamp */}
        <div className="flex items-start justify-between gap-3 pt-4">
          <div className="flex items-end gap-2.5">
            <div className="display text-[96px] leading-[0.82]">{letterFor(grade.total)}</div>
            <div className="pb-1.5 font-mono text-[15px] font-semibold tabular-nums text-paper-ink/65">
              {grade.total}
              <span className="text-[11px] font-normal">/100</span>
            </div>
          </div>
          <div
            className={`stamp-in display mt-3 shrink-0 border-[3px] px-3 py-1.5 text-[17px] tracking-wide opacity-85 mix-blend-multiply ${
              grade.closed
                ? "border-paper-mint text-paper-mint"
                : "border-paper-red text-paper-red"
            }`}
          >
            {grade.closed ? "Closed ✓" : "No close"}
          </div>
        </div>
        <div className="mt-2.5 truncate font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-paper-ink/65">
          {encounter.persona.name} · {encounter.difficulty} · {reportDate}
        </div>

        {/* rubric — ink tracks, mint/amber/red fills */}
        <section className="mt-5 flex flex-col gap-2.5 border-t border-paper-ink/15 pt-4">
          {RUBRIC_KEYS.map((key, i) => {
            const score = grade.scores[key];
            const pct = (score / 20) * 100;
            return (
              <div key={key}>
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-paper-ink/65">
                    {RUBRIC_LABELS[key]}
                  </span>
                  <span className="font-mono text-[13px] font-semibold tabular-nums">
                    {score}
                    <span className="text-paper-ink/65">/20</span>
                  </span>
                </div>
                <div className="mt-1 h-1.5 bg-paper-ink/10">
                  <div
                    className={`bar-fill h-full ${
                      score >= 14 ? "bg-paper-mint" : score >= 8 ? "bg-paper-amber" : "bg-paper-red"
                    }`}
                    style={{ width: `${pct}%`, animationDelay: `${120 + i * 70}ms` }}
                  />
                </div>
              </div>
            );
          })}
        </section>

        {/* receptivity trace — post-hoc for every difficulty */}
        {(() => {
          const pts = encounter.transcript
            .filter((m) => m.role === "patient" && typeof m.receptivity === "number")
            .map((m) => m.receptivity as number);
          if (pts.length < 2) return null;
          const W = 300;
          const H = 56;
          const x = (i: number) => (pts.length === 1 ? W / 2 : (i / (pts.length - 1)) * W);
          const y = (v: number) => 4 + (1 - v / 100) * (H - 8);
          // Mark the two biggest swings — these usually coincide with The Moment.
          const deltas = pts.map((v, i) => (i === 0 ? 0 : Math.abs(v - pts[i - 1])));
          const marked = [...deltas.keys()].sort((a, b) => deltas[b] - deltas[a]).slice(0, 2);
          return (
            <section className="mt-4 border-t border-paper-ink/15 pt-3.5">
              <div className="flex items-baseline justify-between">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-paper-ink/65">
                  Patient receptivity
                </div>
                <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-paper-ink/65">
                  ● biggest swings
                </div>
              </div>
              <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 w-full">
                {[0, 50, 100].map((v) => (
                  <line key={v} x1={0} x2={W} y1={y(v)} y2={y(v)} stroke="var(--color-paper-ink)" strokeOpacity="0.12" strokeWidth="1" />
                ))}
                <polyline
                  points={pts.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}
                  fill="none"
                  stroke="var(--color-paper-ink)"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {pts.map((v, i) => (
                  <circle
                    key={i}
                    cx={x(i)}
                    cy={y(v)}
                    r={marked.includes(i) && i > 0 ? 3.4 : 1.8}
                    fill={
                      marked.includes(i) && i > 0
                        ? v > pts[i - 1]
                          ? "var(--color-paper-mint)"
                          : "var(--color-paper-red)"
                        : "var(--color-paper-ink)"
                    }
                  />
                ))}
              </svg>
            </section>
          );
        })()}

        {/* debrief */}
        <section className="mt-4 border-t border-paper-ink/15 pt-3.5">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-paper-ink/65">
            The moment
          </div>
          <p className="mt-1 text-[14px] leading-relaxed">{grade.moment}</p>
        </section>

        {/* what you should've said */}
        {grade.rewrite && (
          <section className="mt-3.5 border-t border-paper-ink/15 pt-3.5">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-paper-ink/65">
              What you said
            </div>
            <p className="mt-1 text-[13.5px] italic leading-snug text-paper-ink/65">
              &ldquo;{grade.rewrite.youSaid}&rdquo;
            </p>
            <div className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-paper-ink/65">
              The better line
            </div>
            <div className="mt-1 border-l-2 border-l-paper-mint pl-3">
              <p className="text-[14px] font-semibold leading-snug">
                &ldquo;{grade.rewrite.better}&rdquo;
              </p>
            </div>
            <div className="mt-3.5">
              <RedoButton encounterId={encounter.id} paper />
            </div>
            <PairPlayer endpoint="/api/audio/replay" fetchBody={{ encounterId: encounter.id }} paper />
          </section>
        )}

        <section className="mt-3.5 border-t border-paper-ink/15 pt-3.5">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-paper-ink/65">
            What worked
          </div>
          <ul className="mt-1 flex flex-col gap-1.5">
            {grade.worked.map((w, i) => (
              <li key={i} className="flex gap-2 text-[14px] leading-snug">
                <span className="font-mono font-bold text-paper-mint">+</span> {w}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-3.5 border-t border-paper-ink/15 pt-3.5">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-paper-ink/65">
            Fix this
          </div>
          <ul className="mt-1 flex flex-col gap-1.5">
            {grade.fixes.map((f, i) => (
              <li key={i} className="flex gap-2 text-[14px] leading-snug">
                <span className="font-mono font-bold text-paper-amber">→</span> {f}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-3.5 border-t-2 border-paper-ink pt-3">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.13em] text-paper-ink/65">
            Next-rep drill
          </div>
          <p className="mt-1 text-[14px] font-semibold leading-relaxed">{grade.drill}</p>
        </section>
      </div>

      {/* test-out verdict */}
      {encounter.kind === "test_out" && (
        <div
          className={`mt-4 border-l-2 py-1 pl-3 text-[13.5px] leading-snug ${
            grade.total >= TEST_OUT_PASS_TOTAL ? "border-l-mint" : "border-l-amber"
          }`}
        >
          {grade.total >= TEST_OUT_PASS_TOTAL ? (
            <span className="font-semibold text-mint">
              Test-out passed — all stations are unlocked.
            </span>
          ) : (
            <span className="text-dim">
              Test-out needs {TEST_OUT_PASS_TOTAL}+.{" "}
              <Link href="/train" className="font-semibold text-bone underline">
                Train the gaps
              </Link>{" "}
              or{" "}
              <Link href="/test-out" className="font-semibold text-bone underline">
                run it again
              </Link>
              .
            </span>
          )}
        </div>
      )}

      {/* lowest-scoring dimension → the exact module section to review */}
      {(() => {
        const keys = ["rapport", "framing", "price", "objections", "close"] as const;
        const lowest = keys.reduce((min, k) => (grade.scores[k] < grade.scores[min] ? k : min));
        const rec = recommendSection(
          lowest,
          `${grade.moment} ${grade.fixes.join(" ")} ${grade.rewrite?.youSaid ?? ""}`
        );
        const mod = RUBRIC_KEYS.indexOf(lowest) + 1; // module order = rubric order + 1
        return (
          <Link
            href={`/train/module/${rec.moduleSlug}#${rec.sectionId}`}
            className="mt-4 flex items-center gap-3 border-l-2 border-l-amber py-1.5 pl-3 transition-opacity active:opacity-70"
          >
            <span className="min-w-0 flex-1 text-[13px] leading-snug text-dim">
              Weakest here: <span className="font-semibold text-ink">{RUBRIC_LABELS[lowest]}</span>{" "}
              <span className="font-mono text-[12px] tabular-nums text-amber">{grade.scores[lowest]}/20</span>
              {" — "}review{" "}
              <span className="font-semibold text-bone underline">
                Module {mod}: {rec.sectionTitle}
              </span>
            </span>
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m8 5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        );
      })()}

      <div className="mt-5 flex flex-col gap-2">
        {encounter.kind === "prep" && <PrepRerunButton encounterId={encounter.id} />}
        {profile && !profile.onboarded && (
          <Link
            href="/onboarding"
            className="display w-full rounded-card bg-mint py-3.5 text-center text-[15px] tracking-wide text-mint-ink"
          >
            That was rep one — set up your clinic
          </Link>
        )}
        {grade.rewrite ? (
          // The redo action lives on the paper, right under "The better line".
          <RerunButton scenarioSlug={encounter.scenarioSlug} difficulty={encounter.difficulty} />
        ) : grade.closed ? (
          <>
            <RerunButton scenarioSlug={encounter.scenarioSlug} difficulty={encounter.difficulty} />
            <RedoButton encounterId={encounter.id} />
          </>
        ) : (
          <>
            <RedoButton encounterId={encounter.id} primary />
            <RerunButton scenarioSlug={encounter.scenarioSlug} difficulty={encounter.difficulty} secondary />
          </>
        )}
        <Link
          href="/home"
          className="display w-full rounded-card border border-line bg-panel py-3 text-center text-[13px] tracking-wide text-ink"
        >
          Change scenario
        </Link>
      </div>
    </main>
  );
}

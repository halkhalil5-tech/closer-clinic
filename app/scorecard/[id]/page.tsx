import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { rubricLabelsFor, TEST_OUT_PASS_TOTAL, type RubricScores } from "@/lib/types";
import { letterFor } from "@/lib/letter-grades";
import { recommendSection } from "@/lib/training";
import { RerunButton } from "@/components/rerun-button";
import { RedoButton } from "@/components/redo-button";
import { PairPlayer } from "@/components/pair-player";
import { PrepRerunButton } from "@/components/prep-rerun-button";
import { GradeHero } from "@/components/grade-hero";
import { ScoreBars } from "@/components/score-bars";
import { RewriteCards } from "@/components/rewrite-cards";
import { ReceptivityChart } from "@/components/receptivity-chart";

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
            className={`stamp-in display rounded-xl border-[3px] px-5 py-2.5 text-[22px] tracking-tight ${
              result.handledBetter
                ? "border-[#2ec4a5] text-[#1d8f77]"
                : "border-danger text-danger"
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
              className="display w-full rounded-card border border-line py-3 text-center text-[14px] tracking-tight text-ink"
            >
              Back to the scorecard
            </Link>
          )}
          <Link
            href="/home"
            className="block w-full py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
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
  const labels = rubricLabelsFor(scenario?.role);
  const receptivitySeries = encounter.transcript
    .filter((m) => m.role === "patient" && typeof m.receptivity === "number")
    .map((m) => m.receptivity as number);

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1rem)]">
      <div className="microlabel flex items-baseline justify-between">
        <span>{scenario?.title ?? "Scorecard"}</span>
        <span>Encounter report</span>
      </div>

      {/* the grade moment */}
      <section className="mt-3 rounded-xl border border-line bg-bg p-6 shadow-sm">
        <GradeHero
          letter={letterFor(grade.total)}
          total={grade.total}
          closed={grade.closed}
          meta={`${encounter.persona.name} · ${encounter.difficulty} · ${reportDate}`}
          encounterId={encounter.id}
        />
      </section>

      {/* sub-scores */}
      <section className="mt-3 rounded-xl border border-line bg-bg p-6 shadow-sm">
        <ScoreBars
          bars={RUBRIC_KEYS.map((key) => ({
            key,
            label: labels[key],
            score: grade.scores[key],
          }))}
        />
      </section>

      {/* receptivity timeline */}
      {receptivitySeries.length >= 2 && (
        <section className="mt-3 rounded-xl border border-line bg-bg p-6 pb-3 shadow-sm">
          <div className="flex items-baseline justify-between">
            <div className="microlabel">Patient receptivity</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.1em] text-danger">
              Sharpest dips marked
            </div>
          </div>
          <div className="mt-2">
            <ReceptivityChart values={receptivitySeries} />
          </div>
        </section>
      )}

      {/* the moment */}
      <section className="mt-3 rounded-xl border border-line bg-card p-6">
        <div className="microlabel">The moment</div>
        <p className="mt-1.5 text-[14px] leading-relaxed text-ink">{grade.moment}</p>
      </section>

      {/* what you should've said */}
      {grade.rewrite && (
        <section className="mt-3">
          <RewriteCards youSaid={grade.rewrite.youSaid} better={grade.rewrite.better} />
          <div className="mt-2.5">
            <RedoButton encounterId={encounter.id} paper />
          </div>
          <PairPlayer endpoint="/api/audio/replay" fetchBody={{ encounterId: encounter.id }} paper />
        </section>
      )}

      {/* debrief */}
      <section className="mt-3 rounded-xl border border-line bg-bg p-6 shadow-sm">
        <div className="microlabel text-[#1d8f77]">What worked</div>
        <ul className="mt-1.5 flex flex-col gap-1.5">
          {grade.worked.map((w, i) => (
            <li key={i} className="flex gap-2 text-[14px] leading-snug text-ink">
              <span className="font-semibold text-[#1d8f77]">+</span> {w}
            </li>
          ))}
        </ul>
        <div className="microlabel mt-5 text-[#a3831c]">Fix this</div>
        <ul className="mt-1.5 flex flex-col gap-1.5">
          {grade.fixes.map((f, i) => (
            <li key={i} className="flex gap-2 text-[14px] leading-snug text-ink">
              <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[#a3831c]" strokeWidth={2} />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-line pt-4">
          <div className="microlabel">Next-rep drill</div>
          <p className="mt-1 text-[14px] font-semibold leading-relaxed text-ink">{grade.drill}</p>
        </div>
      </section>

      {/* test-out verdict */}
      {encounter.kind === "test_out" && (
        <div
          className={`mt-4 rounded-lg border-l-2 py-1.5 pl-3 text-[13.5px] leading-snug ${
            grade.total >= TEST_OUT_PASS_TOTAL ? "border-l-[#2ec4a5]" : "border-l-amber"
          }`}
        >
          {grade.total >= TEST_OUT_PASS_TOTAL ? (
            <span className="font-semibold text-[#1d8f77]">
              Test-out passed — all stations are unlocked.
            </span>
          ) : (
            <span className="text-dim">
              Test-out needs {TEST_OUT_PASS_TOTAL}+.{" "}
              <Link href="/train" className="font-semibold text-teal underline">
                Train the gaps
              </Link>{" "}
              or{" "}
              <Link href="/test-out" className="font-semibold text-teal underline">
                run it again
              </Link>
              .
            </span>
          )}
        </div>
      )}

      {/* lowest-scoring dimension → the exact module section to review */}
      {(() => {
        const lowest = RUBRIC_KEYS.reduce((min, k) => (grade.scores[k] < grade.scores[min] ? k : min));
        const rec = recommendSection(
          lowest,
          `${grade.moment} ${grade.fixes.join(" ")} ${grade.rewrite?.youSaid ?? ""}`
        );
        const mod = RUBRIC_KEYS.indexOf(lowest) + 1; // module order = rubric order + 1
        return (
          <Link
            href={`/train/module/${rec.moduleSlug}#${rec.sectionId}`}
            className="mt-4 flex items-center gap-3 rounded-lg border-l-2 border-l-amber py-1.5 pl-3 transition-opacity duration-150 active:opacity-70"
          >
            <span className="min-w-0 flex-1 text-[13px] leading-snug text-dim">
              Weakest here: <span className="font-semibold text-ink">{labels[lowest]}</span>{" "}
              <span className="font-mono text-[12px] tabular-nums text-[#a3831c]">
                {grade.scores[lowest]}/20
              </span>
              {" — "}review{" "}
              <span className="font-semibold text-teal underline">
                Module {mod}: {rec.sectionTitle}
              </span>
            </span>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.5} />
          </Link>
        );
      })()}

      <div className="mt-5 flex flex-col gap-2">
        {encounter.kind === "prep" && <PrepRerunButton encounterId={encounter.id} />}
        {profile && !profile.onboarded && (
          <Link
            href="/onboarding"
            className="display w-full rounded-card bg-teal py-3.5 text-center text-[15px] tracking-tight text-white"
          >
            That was rep one — set up your clinic
          </Link>
        )}
        {grade.rewrite ? (
          // The redo action lives right under the rewrite cards.
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
          className="display w-full rounded-card border border-line bg-card py-3 text-center text-[14px] tracking-tight text-ink"
        >
          Change scenario
        </Link>
      </div>
    </main>
  );
}

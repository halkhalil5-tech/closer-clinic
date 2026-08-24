import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { readingMinutes, rubricAverage } from "@/lib/training";
import { RUBRIC_LABELS } from "@/lib/types";
import { ModuleDocView } from "@/components/module-doc-view";

export const dynamic = "force-dynamic";

export default async function ModulePage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await getAuthedUser();
  if (!user) redirect("/login");

  const { slug } = await params;
  const store = await getStore();
  const profile = await store.getCurrentUser();
  const specialty = profile?.specialty ?? "podiatry";

  const [modules, doc, lesson] = await Promise.all([
    store.listTrainingModules(specialty),
    store.getModuleDoc(slug),
    store.getTrainingLesson(`${slug}-core`),
  ]);
  const mod = modules.find((m) => m.slug === slug);
  if (!mod || !doc || !lesson) notFound();

  // The forward path once this module is complete.
  const nextMod =
    [...modules]
      .sort((a, b) => a.order - b.order)
      .find((m) => m.order > mod.order) ?? null;

  const progress = (await store.getLessonProgress(user.id)).find(
    (p) => p.lessonSlug === lesson.slug
  );

  // Why you're here: the user's current score on this module's skill.
  const skill = mod.rubricKey
    ? rubricAverage(await store.listEncountersWithGrades(user.id, { limit: 30 }), mod.rubricKey)
    : null;

  const minutes = readingMinutes(doc);

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md px-4 pb-8 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="flex items-center justify-between">
        <Link href="/train" className="-ml-1 flex items-center gap-1 py-1 pr-2 text-muted">
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m12 4-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">Train</span>
        </Link>
        <span className="microlabel">
          Module {mod.order} · ~{minutes} min read
        </span>
      </div>

      <h1 className="display mt-3 text-[26px] leading-tight text-bone">{mod.title}</h1>
      <p className="mt-1 text-[13px] italic leading-snug text-ink/60">{mod.subtitle}</p>

      {/* the performance link: why you're here */}
      {mod.rubricKey && skill && (
        <div
          className={`mt-3 flex items-baseline justify-between border-l-2 py-1 pl-3 ${
            skill.avg < 12 ? "border-l-amber" : "border-l-line-strong"
          }`}
        >
          <span className="text-[12.5px] text-dim">
            Your {RUBRIC_LABELS[mod.rubricKey]} · last {skill.reps} reps
          </span>
          <span
            className={`font-mono text-[14px] font-semibold tabular-nums ${
              skill.avg < 12 ? "text-amber" : "text-bone"
            }`}
          >
            {skill.avg.toFixed(1)}
            <span className="text-[10px] font-normal text-muted">/20</span>
          </span>
        </div>
      )}

      <div className="mt-5">
        <ModuleDocView
          doc={doc}
          lesson={lesson}
          moduleTitle={mod.title}
          initial={{
            quizScore: progress?.quizScore ?? null,
            drillPassed: progress?.drillPassed ?? null,
          }}
          next={nextMod ? { slug: nextMod.slug, title: nextMod.title, order: nextMod.order } : null}
          voiceCaps={{
            tts: Boolean(process.env.ELEVENLABS_API_KEY),
            stt: Boolean(process.env.DEEPGRAM_API_KEY),
          }}
        />
      </div>
    </main>
  );
}

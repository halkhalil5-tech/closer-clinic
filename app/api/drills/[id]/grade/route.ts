import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { buildDrillGraderPrompt } from "@/lib/prompts";
import { generateGrade, hasModelAccess } from "@/lib/anthropic";
import { settleLessonStatus, maybeUnlockCore } from "@/lib/training/server";

export const maxDuration = 60;

const ResultSchema = z.object({
  passed: z.boolean(),
  feedback: z.string().min(1),
});

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await ctx.params;
  const store = await getStore();
  const encounter = await store.getEncounter(id, user.id);
  if (!encounter || encounter.kind !== "drill" || !encounter.meta?.lessonSlug) {
    return NextResponse.json({ error: "Drill not found" }, { status: 404 });
  }
  // Idempotent: return the stored result if already graded.
  if (encounter.meta.drillResult) {
    return NextResponse.json(encounter.meta.drillResult);
  }
  if (!encounter.transcript.some((m) => m.role === "provider")) {
    return NextResponse.json({ error: "Say something before grading." }, { status: 400 });
  }

  const lesson = await store.getTrainingLesson(encounter.meta.lessonSlug);
  const scenario = await store.getScenario(encounter.scenarioSlug);
  if (!lesson?.drill || !scenario) {
    return NextResponse.json({ error: "Drill config missing" }, { status: 500 });
  }

  let result: z.infer<typeof ResultSchema>;
  if (!hasModelAccess()) {
    result = {
      passed: true,
      feedback:
        "[DEV STUB] Set ANTHROPIC_API_KEY for real drill grading. You held the number through the silence.",
    };
  } else {
    const prompt = buildDrillGraderPrompt(scenario, lesson.drill, encounter.transcript);
    let parsed: z.infer<typeof ResultSchema> | null = null;
    for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
      try {
        const res = await generateGrade(prompt);
        const raw = res.raw.trim();
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        parsed = ResultSchema.parse(JSON.parse(raw.slice(start, end + 1)));
        await store.recordUsage(id, user.id, {
          modelInputTokens: res.usage.inputTokens,
          modelOutputTokens: res.usage.outputTokens,
        });
      } catch (err) {
        console.error(`Drill grade attempt ${attempt + 1} failed`, err);
      }
    }
    if (!parsed) {
      return NextResponse.json({ error: "Grading failed. Try again." }, { status: 502 });
    }
    result = parsed;
  }

  await store.updateEncounter(id, user.id, {
    status: "graded",
    endedAt: new Date().toISOString(),
    meta: { drillResult: result },
  });

  // Record on the lesson: pass is sticky (a later failed retry can't undo it).
  const existing = (await store.getLessonProgress(user.id)).find(
    (p) => p.lessonSlug === lesson.slug
  );
  let row = await store.upsertLessonProgress(user.id, lesson.slug, {
    status: "in_progress",
    drillPassed: result.passed || existing?.drillPassed === true,
  });
  row = await settleLessonStatus(store, user.id, lesson, row);

  const profile = await store.getCurrentUser();
  const unlock = await maybeUnlockCore(store, user.id, profile?.specialty ?? "podiatry");

  return NextResponse.json({
    ...result,
    lessonComplete: row.status === "completed",
    stationsUnlocked: unlock.unlocked,
    justUnlockedStations: unlock.justUnlocked,
  });
}

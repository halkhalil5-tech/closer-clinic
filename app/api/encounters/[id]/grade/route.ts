import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { buildGraderPrompt, buildRedoGraderPrompt } from "@/lib/prompts";
import { withPriceSnapshot } from "@/lib/pricing";
import { generateGrade, hasModelAccess } from "@/lib/anthropic";
import { parseGradeResult, type GradeResult } from "@/lib/grading";
import { TEST_OUT_PASS_TOTAL } from "@/lib/types";

/** Read a stored grade (drive mode uses this for the spoken summary). */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const { id } = await ctx.params;
  const store = await getStore();
  const grade = await store.getGradeByEncounter(id, user.id);
  if (!grade) return NextResponse.json({ error: "Not graded" }, { status: 404 });
  return NextResponse.json({
    closed: grade.closed,
    total: grade.total,
    scores: grade.scores,
    drill: grade.drill,
    moment: grade.moment,
    compliance: grade.compliance ?? null,
  });
}

export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await ctx.params;
  const store = await getStore();

  const encounter = await store.getEncounter(id, user.id);
  if (!encounter) return NextResponse.json({ error: "Encounter not found" }, { status: 404 });

  // Idempotent: re-grading an already-graded encounter returns the stored grade.
  const existing = await store.getGradeByEncounter(id, user.id);
  if (existing) return NextResponse.json({ gradeId: existing.id, encounterId: id });

  const providerSpoke = encounter.transcript.some((m) => m.role === "provider");
  if (!providerSpoke) {
    return NextResponse.json(
      { error: "You haven't said anything yet — talk to the patient before grading." },
      { status: 400 }
    );
  }

  const baseScenario = await store.getScenario(encounter.scenarioSlug);
  if (!baseScenario) return NextResponse.json({ error: "Scenario missing" }, { status: 500 });
  const scenario = withPriceSnapshot(baseScenario, encounter.meta);

  // Redo replays get the narrowed moment-only grader, not the full rubric.
  if ((encounter.kind ?? "rep") === "redo") {
    if (encounter.meta?.redoResult) {
      return NextResponse.json({ encounterId: id, redo: true });
    }
    const parent = encounter.meta?.parentEncounterId
      ? await store.getGradeByEncounter(encounter.meta.parentEncounterId, user.id)
      : null;
    let redoResult: { handledBetter: boolean; feedback: string };
    if (!hasModelAccess()) {
      redoResult = {
        handledBetter: true,
        feedback:
          "[DEV STUB] Set ANTHROPIC_API_KEY for real redo grading. This time you isolated the objection before answering it.",
      };
    } else {
      const prompt = buildRedoGraderPrompt(
        scenario,
        parent?.moment ?? "The exchange where the close was lost.",
        encounter.transcript
      );
      let parsed: { handledBetter: boolean; feedback: string } | null = null;
      for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
        try {
          const res = await generateGrade(prompt);
          const trimmed = res.raw.trim();
          const obj = JSON.parse(trimmed.slice(trimmed.indexOf("{"), trimmed.lastIndexOf("}") + 1));
          if (typeof obj.handledBetter !== "boolean" || typeof obj.feedback !== "string") {
            throw new Error("Bad redo grade shape");
          }
          parsed = { handledBetter: obj.handledBetter, feedback: obj.feedback };
          await store.recordUsage(id, user.id, {
            modelInputTokens: res.usage.inputTokens,
            modelOutputTokens: res.usage.outputTokens,
          });
        } catch (err) {
          console.error(`Redo grade attempt ${attempt + 1} failed`, err);
        }
      }
      if (!parsed) {
        return NextResponse.json({ error: "Grading failed. Try again." }, { status: 502 });
      }
      redoResult = parsed;
    }
    await store.updateEncounter(id, user.id, {
      status: "graded",
      endedAt: new Date().toISOString(),
      meta: { redoResult },
    });
    return NextResponse.json({ encounterId: id, redo: true });
  }

  const prompt = buildGraderPrompt(
    scenario,
    encounter.persona,
    encounter.difficulty,
    encounter.transcript
  );

  // Strict JSON out of the grader; validated with zod, one retry on failure.
  let result: GradeResult | null = null;
  let raw = "";
  let lastError: unknown = null;
  let gradeUsage = { inputTokens: 0, outputTokens: 0 };
  for (let attempt = 0; attempt < 2 && !result; attempt++) {
    try {
      const res = await generateGrade(prompt);
      raw = res.raw;
      gradeUsage = {
        inputTokens: gradeUsage.inputTokens + res.usage.inputTokens,
        outputTokens: gradeUsage.outputTokens + res.usage.outputTokens,
      };
      result = parseGradeResult(raw);
    } catch (err) {
      lastError = err;
      console.error(`Grade attempt ${attempt + 1} failed`, err);
    }
  }
  if (!result) {
    console.error("Grading failed after retry", lastError);
    return NextResponse.json(
      { error: "Grading failed. Your encounter is saved — try grading again." },
      { status: 502 }
    );
  }

  const grade = await store.saveGrade({
    encounterId: id,
    userId: user.id,
    closed: result.closed,
    scores: result.scores,
    total: result.total,
    moment: result.moment,
    momentIndex: result.momentIndex ?? null,
    rewrite: result.rewrite
      ? { youSaid: result.rewrite.you_said, better: result.rewrite.better }
      : null,
    worked: result.worked,
    fixes: result.fixes,
    drill: result.drill,
    compliance: result.compliance ?? null,
    modelRaw: raw,
  });

  await store.updateEncounter(id, user.id, {
    status: "graded",
    endedAt: new Date().toISOString(),
  });
  await store.recordUsage(id, user.id, {
    modelInputTokens: gradeUsage.inputTokens,
    modelOutputTokens: gradeUsage.outputTokens,
  });

  // Test-out: passing the challenge rep unlocks all base stations at once.
  if ((encounter.kind ?? "rep") === "test_out" && result.total >= TEST_OUT_PASS_TOTAL) {
    const profile = await store.getCurrentUser();
    const stations = await store.listScenarios(profile?.specialty ?? "podiatry");
    await store.addUnlocks(
      user.id,
      stations.map((s) => s.slug),
      "test_out"
    );
  }

  return NextResponse.json({ gradeId: grade.id, encounterId: id });
}

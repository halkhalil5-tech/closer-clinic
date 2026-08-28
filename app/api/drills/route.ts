import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { rollPersona } from "@/lib/personas";
import { buildDrillPatientSystemPrompt, DRILL_OPENING_INSTRUCTION } from "@/lib/prompts";
import { generatePatientReply } from "@/lib/anthropic";
import type { TranscriptMessage } from "@/lib/types";

export const maxDuration = 60;

const Schema = z.object({ lessonSlug: z.string().min(1) });

/** Start a micro-drill: a 3-turn mini-rep against a narrowed patient. */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const store = await getStore();
  const lesson = await store.getTrainingLesson(body.data.lessonSlug);
  if (!lesson?.drill) return NextResponse.json({ error: "No drill for this lesson" }, { status: 404 });

  const scenario = await store.getScenario(lesson.drill.scenarioSlug);
  if (!scenario) return NextResponse.json({ error: "Scenario missing" }, { status: 500 });

  const persona = rollPersona();
  const systemPrompt = buildDrillPatientSystemPrompt(scenario, persona, lesson.drill);
  const opening: TranscriptMessage[] = [
    { role: "event", text: DRILL_OPENING_INSTRUCTION, at: new Date().toISOString() },
  ];

  let opener: string;
  let usage = { inputTokens: 0, outputTokens: 0 };
  try {
    const reply = await generatePatientReply(systemPrompt, opening);
    opener = reply.text;
    usage = reply.usage;
  } catch (err) {
    console.error("Drill opener failed", err);
    return NextResponse.json({ error: "Couldn't start the drill. Try again." }, { status: 502 });
  }

  const encounter = await store.createEncounter({
    userId: user.id,
    scenarioSlug: scenario.slug,
    difficulty: "moderate",
    persona,
    transcript: [...opening, { role: "patient", text: opener, at: new Date().toISOString() }],
    kind: "drill",
    meta: { lessonSlug: lesson.slug, rubricKey: lesson.drill.rubricKey },
  });
  await store.recordUsage(encounter.id, user.id, {
    modelInputTokens: usage.inputTokens,
    modelOutputTokens: usage.outputTokens,
  });

  return NextResponse.json({
    drillId: encounter.id,
    patient: opener,
    maxTurns: lesson.drill.maxTurns,
  });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { buildDrillPatientSystemPrompt } from "@/lib/prompts";
import { generatePatientReply } from "@/lib/anthropic";
import type { TranscriptMessage } from "@/lib/types";

const Schema = z.object({ text: z.string().trim().min(1).max(2000) });

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await ctx.params;
  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Say something first." }, { status: 400 });

  const store = await getStore();
  const encounter = await store.getEncounter(id, user.id);
  if (!encounter || encounter.kind !== "drill" || !encounter.meta?.lessonSlug) {
    return NextResponse.json({ error: "Drill not found" }, { status: 404 });
  }
  if (encounter.status !== "active") {
    return NextResponse.json({ error: "This drill has ended." }, { status: 409 });
  }

  const lesson = await store.getTrainingLesson(encounter.meta.lessonSlug);
  const scenario = await store.getScenario(encounter.scenarioSlug);
  if (!lesson?.drill || !scenario) {
    return NextResponse.json({ error: "Drill config missing" }, { status: 500 });
  }

  const providerTurns = encounter.transcript.filter((m) => m.role === "provider").length;
  if (providerTurns >= lesson.drill.maxTurns) {
    return NextResponse.json(
      { error: "The moment is over — grade the drill.", turnCapReached: true },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const transcript: TranscriptMessage[] = [
    ...encounter.transcript,
    { role: "provider", text: body.data.text, at: now },
  ];

  const systemPrompt = buildDrillPatientSystemPrompt(scenario, encounter.persona, lesson.drill);
  let patient: string;
  let usage = { inputTokens: 0, outputTokens: 0 };
  try {
    const reply = await generatePatientReply(systemPrompt, transcript);
    patient = reply.text;
    usage = reply.usage;
  } catch (err) {
    console.error("Drill turn failed", err);
    return NextResponse.json({ error: "Connection hiccup — try again." }, { status: 502 });
  }

  transcript.push({ role: "patient", text: patient, at: new Date().toISOString() });
  await store.updateEncounter(id, user.id, { transcript });
  await store.recordUsage(id, user.id, {
    modelInputTokens: usage.inputTokens,
    modelOutputTokens: usage.outputTokens,
  });

  const turnsUsed = providerTurns + 1;
  return NextResponse.json({
    patient,
    turnsUsed,
    turnsLeft: lesson.drill.maxTurns - turnsUsed,
  });
}

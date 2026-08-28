import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { buildPatientSystemPrompt, CLOCK_NUDGE_EVENT } from "@/lib/prompts";
import { withPriceSnapshot } from "@/lib/pricing";
import { splitReceptivity } from "@/lib/receptivity";
import { generatePatientReply } from "@/lib/anthropic";
import {
  MAX_PROVIDER_TURNS,
  NUDGE_AT_TURN,
  type TranscriptMessage,
} from "@/lib/types";

export const maxDuration = 60;

const TurnSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await ctx.params;
  const body = TurnSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Say something first." }, { status: 400 });
  }

  const store = await getStore();
  const encounter = await store.getEncounter(id, user.id);
  if (!encounter) return NextResponse.json({ error: "Encounter not found" }, { status: 404 });
  if (encounter.status !== "active") {
    return NextResponse.json({ error: "This encounter has ended." }, { status: 409 });
  }

  const providerTurns = encounter.transcript.filter((m) => m.role === "provider").length;
  if (providerTurns >= MAX_PROVIDER_TURNS) {
    return NextResponse.json(
      { error: "The visit is over — the patient has to get going. End & grade.", turnCapReached: true },
      { status: 409 }
    );
  }

  const baseScenario = await store.getScenario(encounter.scenarioSlug);
  if (!baseScenario) return NextResponse.json({ error: "Scenario missing" }, { status: 500 });
  const scenario = withPriceSnapshot(baseScenario, encounter.meta);

  const now = new Date().toISOString();
  const transcript: TranscriptMessage[] = [
    ...encounter.transcript,
    { role: "provider", text: body.data.text, at: now },
  ];

  // After 12 provider turns, the patient starts eyeing the clock.
  const newProviderTurns = providerTurns + 1;
  let nudged = false;
  if (newProviderTurns === NUDGE_AT_TURN) {
    transcript.push({ role: "event", text: CLOCK_NUDGE_EVENT, at: now });
    nudged = true;
  }

  const systemPrompt = buildPatientSystemPrompt(scenario, encounter.persona, encounter.difficulty);

  let patientText: string;
  let receptivity: number | null = null;
  let usage = { inputTokens: 0, outputTokens: 0 };
  try {
    const reply = await generatePatientReply(systemPrompt, transcript);
    const split = splitReceptivity(reply.text);
    patientText = split.text;
    receptivity = split.receptivity;
    usage = reply.usage;
  } catch (err) {
    console.error("Patient reply generation failed", err);
    return NextResponse.json(
      { error: "The patient didn't respond. Check your connection and try again." },
      { status: 502 }
    );
  }

  transcript.push({
    role: "patient",
    text: patientText,
    at: new Date().toISOString(),
    ...(receptivity !== null ? { receptivity } : {}),
  });
  await store.updateEncounter(id, user.id, { transcript });
  await store.recordUsage(id, user.id, {
    modelInputTokens: usage.inputTokens,
    modelOutputTokens: usage.outputTokens,
  });

  return NextResponse.json({
    patient: patientText,
    receptivity,
    providerTurns: newProviderTurns,
    turnsRemaining: MAX_PROVIDER_TURNS - newProviderTurns,
    nudged,
  });
}

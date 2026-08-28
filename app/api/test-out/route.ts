import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getStore, resolveScenarioForUser } from "@/lib/store";
import { rollPersona } from "@/lib/personas";
import { buildPatientSystemPrompt, PATIENT_OPENING_INSTRUCTION } from "@/lib/prompts";
import { generatePatientReply } from "@/lib/anthropic";
import { splitReceptivity } from "@/lib/receptivity";
import { TEST_OUT_PASS_TOTAL, type TranscriptMessage } from "@/lib/types";

export const maxDuration = 60;

/**
 * The test-out challenge rep: one moderate-difficulty encounter on the
 * flagship station. Score 75+ and all base stations unlock immediately —
 * experienced providers never sit through content they already live.
 */
export async function POST() {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const store = await getStore();
  const profile = await store.getCurrentUser();
  const specialty = profile?.specialty ?? "podiatry";

  // Flagship scenario for the specialty: first active station.
  const stations = await store.listScenarios(specialty);
  const flagship = stations[0];
  if (!flagship) return NextResponse.json({ error: "No stations available" }, { status: 500 });
  const scenario = (await resolveScenarioForUser(store, user.id, flagship.slug)) ?? flagship;

  const persona = rollPersona();
  if (scenario.insuranceOverride) persona.insurance = scenario.insuranceOverride;
  const systemPrompt = buildPatientSystemPrompt(scenario, persona, "moderate");

  const opening: TranscriptMessage[] = [
    { role: "event", text: PATIENT_OPENING_INSTRUCTION, at: new Date().toISOString() },
  ];
  let opener: string;
  let openerReceptivity: number | null = null;
  let usage = { inputTokens: 0, outputTokens: 0 };
  try {
    const reply = await generatePatientReply(systemPrompt, opening);
    const split = splitReceptivity(reply.text);
    opener = split.text;
    openerReceptivity = split.receptivity;
    usage = reply.usage;
  } catch (err) {
    console.error("Test-out opener failed", err);
    return NextResponse.json({ error: "Couldn't start the challenge. Try again." }, { status: 502 });
  }

  const encounter = await store.createEncounter({
    userId: user.id,
    scenarioSlug: scenario.slug,
    difficulty: "moderate",
    persona,
    transcript: [
      ...opening,
      {
        role: "patient",
        text: opener,
        at: new Date().toISOString(),
        ...(openerReceptivity !== null ? { receptivity: openerReceptivity } : {}),
      },
    ],
    kind: "test_out",
    meta: { priceDisplay: scenario.priceDisplay, priceStructure: scenario.priceStructure },
  });
  await store.recordUsage(encounter.id, user.id, {
    modelInputTokens: usage.inputTokens,
    modelOutputTokens: usage.outputTokens,
  });

  return NextResponse.json({ encounterId: encounter.id, passBar: TEST_OUT_PASS_TOTAL });
}

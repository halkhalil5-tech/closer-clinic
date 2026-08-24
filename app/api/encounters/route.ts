import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore, resolveScenarioForUser } from "@/lib/store";
import { rollPersona } from "@/lib/personas";
import { buildPatientSystemPrompt, FRONT_DESK_OPENING_INSTRUCTION, PATIENT_OPENING_INSTRUCTION } from "@/lib/prompts";
import { generatePatientReply } from "@/lib/anthropic";
import { splitReceptivity } from "@/lib/receptivity";
import { computeTrainingStatus } from "@/lib/training";
import { DAILY_ENCOUNTER_LIMIT, type TranscriptMessage } from "@/lib/types";

const CreateSchema = z.object({
  scenarioSlug: z.string().min(1),
  difficulty: z.enum(["easy", "moderate", "hard"]),
});

export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = CreateSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const store = await getStore();

  // Station gating: reps need an unlock (curriculum or test-out) — except
  // the very first rep, which is always free: a new user must hear the
  // patient talk back before any gate. The test-out path is also always
  // open (/api/test-out), so nobody is hard-walled behind content.
  const unlocks = await store.listUnlocks(user.id);
  if (unlocks.length === 0) {
    const prior = await store.listEncountersWithGrades(user.id, { limit: 1 });
    if (prior.length > 0) {
      return NextResponse.json(
        { error: "Stations are locked — finish the core curriculum or pass the test-out rep.", locked: true },
        { status: 403 }
      );
    }
  }
  // Clinic policy: admin may require the full curriculum before reps.
  if (await store.getRequireCurriculum(user.id)) {
    const profile = await store.getCurrentUser();
    const specialty = profile?.specialty ?? "podiatry";
    const [modules, lessons, progress] = await Promise.all([
      store.listTrainingModules(specialty),
      store.listTrainingLessons(specialty),
      store.getLessonProgress(user.id),
    ]);
    if (!computeTrainingStatus(modules, lessons, progress).coreComplete) {
      return NextResponse.json(
        { error: "Your clinic requires the core curriculum before reps. Head to Train.", locked: true },
        { status: 403 }
      );
    }
  }

  const todayCount = await store.countEncountersToday(user.id);
  if (todayCount >= DAILY_ENCOUNTER_LIMIT) {
    return NextResponse.json(
      { error: `Daily limit reached (${DAILY_ENCOUNTER_LIMIT} encounters). Come back tomorrow.` },
      { status: 429 }
    );
  }

  // Effective scenario: base or custom, with the user's price override applied.
  const scenario = await resolveScenarioForUser(store, user.id, body.data.scenarioSlug);
  if (!scenario || !scenario.active) {
    return NextResponse.json({ error: "Unknown scenario" }, { status: 404 });
  }

  const persona = rollPersona();
  if (scenario.insuranceOverride) persona.insurance = scenario.insuranceOverride;
  const systemPrompt = buildPatientSystemPrompt(scenario, persona, body.data.difficulty);

  // The patient opens the visit so the provider walks into a live room.
  const opening: TranscriptMessage[] = [
    {
      role: "event",
      text: scenario.role === "front_desk" ? FRONT_DESK_OPENING_INSTRUCTION : PATIENT_OPENING_INSTRUCTION,
      at: new Date().toISOString(),
    },
  ];

  let patientOpener: string;
  let openerReceptivity: number | null = null;
  let openerUsage = { inputTokens: 0, outputTokens: 0 };
  try {
    const reply = await generatePatientReply(systemPrompt, opening);
    const split = splitReceptivity(reply.text);
    patientOpener = split.text;
    openerReceptivity = split.receptivity;
    openerUsage = reply.usage;
  } catch (err) {
    console.error("Patient opener generation failed", err);
    return NextResponse.json(
      { error: "Couldn't start the encounter. Check your connection and try again." },
      { status: 502 }
    );
  }

  const transcript: TranscriptMessage[] = [
    ...opening,
    {
      role: "patient",
      text: patientOpener,
      at: new Date().toISOString(),
      ...(openerReceptivity !== null ? { receptivity: openerReceptivity } : {}),
    },
  ];

  const encounter = await store.createEncounter({
    userId: user.id,
    scenarioSlug: scenario.slug,
    difficulty: body.data.difficulty,
    persona,
    transcript,
    // Price snapshot: the patient and grader keep quoting this number even
    // if the user edits pricing mid-encounter.
    meta: { priceDisplay: scenario.priceDisplay, priceStructure: scenario.priceStructure },
  });

  await store.recordUsage(encounter.id, user.id, {
    modelInputTokens: openerUsage.inputTokens,
    modelOutputTokens: openerUsage.outputTokens,
  });

  // `patient` (the opener line) lets voice-first surfaces speak immediately.
  return NextResponse.json({ encounterId: encounter.id, patient: patientOpener });
}

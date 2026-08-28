import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore, resolveScenarioForUser } from "@/lib/store";
import { rollPersona } from "@/lib/personas";
import {
  buildPatientSystemPrompt,
  buildPrepGeneratorPrompt,
  PATIENT_OPENING_INSTRUCTION,
} from "@/lib/prompts";
import { generateGrade, generatePatientReply, hasModelAccess } from "@/lib/anthropic";
import { splitReceptivity } from "@/lib/receptivity";
import { scrubFreeText } from "@/lib/scrub";
import { agesFromBand, WORRY_MAX_CHARS } from "@/lib/prep";
import type { Scenario, TranscriptMessage } from "@/lib/types";

export const maxDuration = 60;

const Schema = z.union([
  z.object({
    rerunOf: z.string().min(1),
  }),
  z.object({
    ageBand: z.string().min(2).max(10),
    condition: z.string().trim().min(3).max(120),
    serviceSlug: z.string().min(1),
    archetypes: z.array(z.string().min(1)).max(2),
    worry: z.string().trim().max(WORRY_MAX_CHARS).optional(),
    difficulty: z.enum(["easy", "moderate", "hard"]).default("hard"),
  }),
]);

const DraftSchema = z.object({
  patientCc: z.string().min(1),
  clinicalContext: z.string().min(1),
  closeGoal: z.string().min(1),
  objectionSeeds: z.array(z.string().min(1)).min(3).max(6),
});

async function startPrepEncounter(
  userId: string,
  scenario: Scenario,
  difficulty: "easy" | "moderate" | "hard",
  archetypes: string[],
  ageBand?: string
) {
  const store = await getStore();
  const persona = rollPersona(Math.random, archetypes);
  if (ageBand) {
    const [lo, hi] = agesFromBand(ageBand);
    persona.age = lo + Math.floor(Math.random() * (hi - lo + 1));
  }
  const systemPrompt = buildPatientSystemPrompt(scenario, persona, difficulty);
  const opening: TranscriptMessage[] = [
    { role: "event", text: PATIENT_OPENING_INSTRUCTION, at: new Date().toISOString() },
  ];
  const reply = await generatePatientReply(systemPrompt, opening);
  const split = splitReceptivity(reply.text);
  const encounter = await store.createEncounter({
    userId,
    scenarioSlug: scenario.slug,
    difficulty,
    persona,
    transcript: [
      ...opening,
      {
        role: "patient",
        text: split.text,
        at: new Date().toISOString(),
        ...(split.receptivity !== null ? { receptivity: split.receptivity } : {}),
      },
    ],
    kind: "prep",
    meta: {
      prepArchetypes: archetypes,
      priceDisplay: scenario.priceDisplay,
      priceStructure: scenario.priceStructure,
    },
  });
  await store.recordUsage(encounter.id, userId, {
    modelInputTokens: reply.usage.inputTokens,
    modelOutputTokens: reply.usage.outputTokens,
  });
  return encounter.id;
}

export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Fill in the form." }, { status: 400 });
  const store = await getStore();

  // "Run it again with a different personality": same one-off scenario,
  // fresh persona (excluding the one they just faced when possible).
  if ("rerunOf" in body.data) {
    const prior = await store.getEncounter(body.data.rerunOf, user.id);
    if (!prior || prior.kind !== "prep") {
      return NextResponse.json({ error: "Prep encounter not found" }, { status: 404 });
    }
    const scenario = await store.getScenario(prior.scenarioSlug);
    if (!scenario) return NextResponse.json({ error: "Scenario missing" }, { status: 500 });
    const pool = (prior.meta?.prepArchetypes ?? []).filter((a) => a !== prior.persona.personaId);
    const encounterId = await startPrepEncounter(
      user.id,
      scenario,
      prior.difficulty,
      pool.length > 0 ? pool : []
    );
    return NextResponse.json({ encounterId });
  }

  const input = body.data;
  if (input.worry) {
    const scrub = scrubFreeText(input.worry);
    if (!scrub.ok) return NextResponse.json({ error: scrub.reason }, { status: 400 });
  }
  const scrubCondition = scrubFreeText(input.condition);
  if (!scrubCondition.ok) return NextResponse.json({ error: scrubCondition.reason }, { status: 400 });

  const service = await resolveScenarioForUser(store, user.id, input.serviceSlug);
  if (!service) return NextResponse.json({ error: "Pick a service" }, { status: 404 });

  const profile = await store.getCurrentUser();
  const specialty = profile?.specialty ?? "podiatry";

  let draft: z.infer<typeof DraftSchema>;
  if (!hasModelAccess()) {
    draft = {
      patientCc: `I've had this ${input.condition.toLowerCase()} going on for a while, and I figured it's finally time to hear my options.`,
      clinicalContext: `[DEV STUB — set ANTHROPIC_API_KEY for a fully written chart.] Typical ${input.ageBand} patient with ${input.condition}; conservative measures tried without lasting relief. ${service.title} is clinically indicated.`,
      closeGoal: `Patient agrees to ${service.title} at ${service.priceDisplay} and books the first visit.`,
      objectionSeeds: [
        ...(input.worry ? [input.worry] : []),
        "That's a lot of money.",
        "Why doesn't insurance cover this?",
        "Can I think about it?",
        "Is there a cheaper option?",
      ].slice(0, 5),
    };
  } else {
    const prompt = buildPrepGeneratorPrompt({
      specialty,
      ageBand: input.ageBand,
      condition: input.condition,
      worry: input.worry,
      service,
    });
    let parsed: z.infer<typeof DraftSchema> | null = null;
    for (let attempt = 0; attempt < 2 && !parsed; attempt++) {
      try {
        const res = await generateGrade(prompt);
        const raw = res.raw.trim();
        parsed = DraftSchema.parse(JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)));
      } catch (err) {
        console.error(`Prep draft attempt ${attempt + 1} failed`, err);
      }
    }
    if (!parsed) return NextResponse.json({ error: "Couldn't build the sim — try again." }, { status: 502 });
    draft = parsed;
  }

  const scenario = await store.createCustomScenario(user.id, {
    slug: `prep-${crypto.randomUUID().slice(0, 8)}`,
    specialty: specialty as never,
    title: `Prep: ${service.title}`,
    serviceDesc: service.serviceDesc,
    priceDisplay: service.priceDisplay,
    priceStructure: service.priceStructure,
    clinicalContext: draft.clinicalContext,
    patientCc: draft.patientCc,
    closeGoal: draft.closeGoal,
    objectionSeeds: draft.objectionSeeds,
    isPrep: true,
  });

  const encounterId = await startPrepEncounter(
    user.id,
    scenario,
    input.difficulty,
    input.archetypes,
    input.ageBand
  );
  return NextResponse.json({ encounterId });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { buildScenarioGeneratorPrompt } from "@/lib/prompts";
import { generateGrade, hasModelAccess } from "@/lib/anthropic";
import { derivePriceStrings } from "@/lib/pricing";
import { scrubFreeText } from "@/lib/scrub";
import { MAX_CUSTOM_SCENARIOS_USER } from "@/lib/types";

export const maxDuration = 60;

const Schema = z.object({
  title: z.string().trim().min(2).max(80),
  config: z.object({
    kind: z.enum(["single", "package", "program"]),
    amount: z.number().int().min(1).max(1_000_000),
    sessions: z.number().int().min(1).max(100).optional(),
    interval: z.string().trim().max(60).optional(),
    anchorAmount: z.number().int().min(1).max(1_000_000).optional(),
  }),
  condition: z.string().trim().min(3).max(300),
  typicalPatient: z.string().trim().max(300).optional(),
  objections: z.array(z.string().trim().min(1).max(200)).max(2).optional(),
  source: z.enum(["manual", "site"]).default("manual"),
});

const DraftSchema = z.object({
  valid: z.boolean(),
  reason: z.string().optional(),
  scenario: z
    .object({
      serviceDesc: z.string().min(1),
      patientCc: z.string().min(1),
      clinicalContext: z.string().min(1),
      closeGoal: z.string().min(1),
      objectionSeeds: z.array(z.string().min(1)).min(3).max(6),
    })
    .optional(),
  cards: z
    .array(
      z.object({
        front: z.string().min(1),
        isolate: z.string().min(1),
        reframe: z.string().min(1),
        close: z.string().min(1),
      })
    )
    .optional(),
});

const OFF_DOMAIN =
  /\b(crypto|bitcoin|nft|stocks?|tax(es)?|car|auto repair|lawn|roof(ing)?|guns?|firearm|dating|casino|betting)\b/i;

/** Expand the 5-answer builder form into a full reviewable scenario draft. */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Fill in the required fields." }, { status: 400 });
  const input = body.data;

  // PHI / profanity scrub on all free text. Site-imported descriptions come
  // from the user's own public website, so brand names are allowed there —
  // dates, long numbers, and profanity are still rejected.
  const allowNames = input.source === "site";
  for (const text of [input.condition, input.typicalPatient ?? "", ...(input.objections ?? [])]) {
    const scrub = scrubFreeText(text, { allowNames });
    if (!scrub.ok) return NextResponse.json({ error: scrub.reason }, { status: 400 });
  }

  const store = await getStore();
  const count = await store.countCustomScenarios(user.id);
  if (count >= MAX_CUSTOM_SCENARIOS_USER) {
    return NextResponse.json(
      { error: `You've hit the ${MAX_CUSTOM_SCENARIOS_USER}-service limit — retire one to add another.` },
      { status: 403 }
    );
  }

  const profile = await store.getCurrentUser();
  const specialty = profile?.specialty ?? "podiatry";
  const { priceDisplay, priceStructure } = derivePriceStrings(input.config);

  // Dev-mode guardrail + template draft; real model does both in prod.
  if (!hasModelAccess()) {
    if (OFF_DOMAIN.test(`${input.title} ${input.condition}`)) {
      return NextResponse.json(
        { error: "Closer Clinic trains healthcare conversations — that service looks outside the clinic. Try a clinical or wellness service." },
        { status: 422 }
      );
    }
    const userObjections = input.objections?.filter(Boolean) ?? [];
    const cards = userObjections.map((o) => ({
      front: o,
      isolate: "“Is it the cost that gives you pause — or whether it'll actually work for you?”",
      reframe: `“Fair concern. Here's the honest answer for ${input.title}: it's priced for what it is, and it's indicated by your exam.”`,
      close: "“If that answers it, let's get your first visit on the books.”",
    }));
    return NextResponse.json({
      cards,
      title: input.title,
      priceDisplay,
      priceStructure,
      serviceDesc: `${input.title} — ${input.condition}`,
      patientCc: `I've been dealing with ${input.condition.toLowerCase()} for a while now, and honestly it's starting to wear me down.`,
      clinicalContext: `[DEV STUB — set ANTHROPIC_API_KEY for a fully written chart.] ${
        input.typicalPatient ? `Typical candidate: ${input.typicalPatient}. ` : ""
      }Exam and history consistent with ${input.condition}; conservative measures have been tried without lasting relief. ${input.title} is clinically indicated.`,
      closeGoal: `Patient agrees to ${input.title} at ${priceDisplay} and books the first visit before leaving.`,
      objectionSeeds: [
        ...userObjections,
        "Why doesn't insurance cover this?",
        "That's a lot of money for something I've been living with.",
        "Can I think about it and call you back?",
        "Is there a cheaper way to handle this?",
      ].slice(0, 5),
    });
  }

  const prompt = buildScenarioGeneratorPrompt({
    specialty,
    title: input.title,
    priceDisplay,
    priceStructure,
    condition: input.condition,
    typicalPatient: input.typicalPatient,
    objections: input.objections,
  });

  let draft: z.infer<typeof DraftSchema> | null = null;
  for (let attempt = 0; attempt < 2 && !draft; attempt++) {
    try {
      const res = await generateGrade(prompt);
      const raw = res.raw.trim();
      draft = DraftSchema.parse(JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)));
    } catch (err) {
      console.error(`Scenario draft attempt ${attempt + 1} failed`, err);
    }
  }
  if (!draft) return NextResponse.json({ error: "Generation failed — try again." }, { status: 502 });
  if (!draft.valid || !draft.scenario) {
    return NextResponse.json(
      { error: draft.reason ?? "That doesn't look like a healthcare service we can build a station for." },
      { status: 422 }
    );
  }

  return NextResponse.json({
    title: input.title,
    priceDisplay,
    priceStructure,
    ...draft.scenario,
    cards: draft.cards ?? [],
  });
}

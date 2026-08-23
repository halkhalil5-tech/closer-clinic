import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { scrubFreeText } from "@/lib/scrub";
import { MAX_CUSTOM_SCENARIOS_USER } from "@/lib/types";

const Schema = z.object({
  title: z.string().trim().min(2).max(80),
  priceDisplay: z.string().trim().min(1).max(40),
  priceStructure: z.string().trim().min(1).max(300),
  serviceDesc: z.string().trim().min(3).max(300),
  patientCc: z.string().trim().min(3).max(500),
  clinicalContext: z.string().trim().min(3).max(1200),
  closeGoal: z.string().trim().min(3).max(400),
  objectionSeeds: z.array(z.string().trim().min(1).max(300)).min(3).max(6),
  cards: z
    .array(
      z.object({
        front: z.string().trim().min(1).max(300),
        isolate: z.string().trim().min(1).max(300),
        reframe: z.string().trim().min(1).max(300),
        close: z.string().trim().min(1).max(300),
      })
    )
    .max(4)
    .optional(),
});

/** Save a reviewed custom scenario into the user's "Your Services". */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Every field needs content." }, { status: 400 });

  // Relaxed scrub at save time: the strict person-name gate already ran on
  // the user's raw inputs; drafted text legitimately contains Title Case
  // service names. Dates, record-like numbers, and profanity still reject.
  for (const text of [body.data.patientCc, body.data.clinicalContext, ...body.data.objectionSeeds]) {
    const scrub = scrubFreeText(text, { allowNames: true });
    if (!scrub.ok) return NextResponse.json({ error: scrub.reason }, { status: 400 });
  }

  const store = await getStore();
  if ((await store.countCustomScenarios(user.id)) >= MAX_CUSTOM_SCENARIOS_USER) {
    return NextResponse.json(
      { error: `You've hit the ${MAX_CUSTOM_SCENARIOS_USER}-service limit — retire one to add another.` },
      { status: 403 }
    );
  }

  const profile = await store.getCurrentUser();
  const scenario = await store.createCustomScenario(user.id, {
    specialty: (profile?.specialty ?? "podiatry") as never,
    title: body.data.title,
    serviceDesc: body.data.serviceDesc,
    priceDisplay: body.data.priceDisplay,
    priceStructure: body.data.priceStructure,
    clinicalContext: body.data.clinicalContext,
    patientCc: body.data.patientCc,
    closeGoal: body.data.closeGoal,
    objectionSeeds: body.data.objectionSeeds,
  });

  // Custom stations are usable immediately for whoever created them.
  await store.addUnlocks(user.id, [scenario.slug], "module");

  // The user's stated objections become flashcards (reviewed on the same screen).
  if (body.data.cards?.length) {
    await store.addObjectionCards(
      user.id,
      body.data.cards.map((c) => ({
        specialty: (profile?.specialty ?? "podiatry") as never,
        difficulty: "moderate" as const,
        front: c.front,
        back: { isolate: c.isolate, reframe: c.reframe, close: c.close },
      }))
    );
  }

  return NextResponse.json({ slug: scenario.slug });
}

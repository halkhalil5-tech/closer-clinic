import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { scrubFreeText } from "@/lib/scrub";

const PatchSchema = z.object({
  title: z.string().trim().min(2).max(80).optional(),
  priceDisplay: z.string().trim().min(1).max(40).optional(),
  priceStructure: z.string().trim().min(1).max(300).optional(),
  serviceDesc: z.string().trim().min(3).max(300).optional(),
  patientCc: z.string().trim().min(3).max(500).optional(),
  clinicalContext: z.string().trim().min(3).max(1200).optional(),
  closeGoal: z.string().trim().min(3).max(400).optional(),
  objectionSeeds: z.array(z.string().trim().min(1).max(300)).min(3).max(6).optional(),
});

async function ownedCustom(slug: string, userId: string) {
  const store = await getStore();
  const scenario = await store.getScenario(slug);
  if (!scenario?.isCustom || scenario.createdByUserId !== userId) return { store, scenario: null };
  return { store, scenario };
}

export async function PATCH(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { slug } = await ctx.params;
  const { store, scenario } = await ownedCustom(slug, user.id);
  if (!scenario) return NextResponse.json({ error: "Not your scenario" }, { status: 404 });

  const body = PatchSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid fields." }, { status: 400 });

  for (const text of [
    body.data.patientCc ?? "",
    body.data.clinicalContext ?? "",
    ...(body.data.objectionSeeds ?? []),
  ]) {
    const scrub = scrubFreeText(text, { allowNames: true });
    if (!scrub.ok) return NextResponse.json({ error: scrub.reason }, { status: 400 });
  }

  await store.updateCustomScenario(slug, user.id, body.data);
  return NextResponse.json({ ok: true });
}

/** Retire (soft-delete): the station leaves the roster; history stays intact. */
export async function DELETE(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { slug } = await ctx.params;
  const { store, scenario } = await ownedCustom(slug, user.id);
  if (!scenario) return NextResponse.json({ error: "Not your scenario" }, { status: 404 });

  await store.retireCustomScenario(slug, user.id);
  return NextResponse.json({ ok: true });
}

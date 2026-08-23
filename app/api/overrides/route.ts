import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { derivePriceStrings } from "@/lib/pricing";

const ConfigSchema = z.object({
  kind: z.enum(["single", "package", "program"]),
  amount: z.number().int().min(1).max(1_000_000),
  sessions: z.number().int().min(1).max(100).optional(),
  interval: z.string().trim().max(60).optional(),
  anchorAmount: z.number().int().min(1).max(1_000_000).optional(),
});

const PostSchema = z.object({
  scenarioSlug: z.string().min(1),
  config: ConfigSchema,
});

/** Set (or update) the caller's price override on a scenario. */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = PostSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid pricing" }, { status: 400 });

  const store = await getStore();
  const scenario = await store.getScenario(body.data.scenarioSlug);
  if (!scenario) return NextResponse.json({ error: "Unknown scenario" }, { status: 404 });

  const { priceDisplay, priceStructure } = derivePriceStrings(body.data.config);
  const row = await store.upsertScenarioOverride({
    userId: user.id,
    scenarioSlug: scenario.slug,
    scope: "user",
    config: body.data.config,
    priceDisplay,
    priceStructure,
  });
  return NextResponse.json({ priceDisplay: row.priceDisplay });
}

const DeleteSchema = z.object({ scenarioSlug: z.string().min(1) });

/** Reset to default: remove the override entirely. */
export async function DELETE(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = DeleteSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const store = await getStore();
  await store.deleteScenarioOverride(user.id, body.data.scenarioSlug);
  return NextResponse.json({ ok: true });
}

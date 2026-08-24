import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore, resolveScenarioForUser } from "@/lib/store";
import { defaultAmountCents } from "@/lib/revenue";

const Schema = z.object({
  service: z.string().trim().min(1).max(120),
  stationSlug: z.string().trim().min(1).max(120).optional(),
  presented: z.boolean(),
  closed: z.boolean(),
  /** Provider-entered close amount, whole cents. Absent = use the default. */
  amountCents: z.number().int().min(0).max(10_000_000).optional(),
});

/** 10-second self-reported real-world outcome: presented X today, closed Y/N. */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const store = await getStore();
  const closed = body.data.presented ? body.data.closed : false;

  // Snapshot the price at log time (override-aware midpoint), so later price
  // edits never rewrite revenue history. An explicit amount wins over the default.
  let amountCents: number | null = null;
  let amountEntered = false;
  if (closed) {
    if (typeof body.data.amountCents === "number") {
      amountCents = body.data.amountCents;
      amountEntered = true;
    } else if (body.data.stationSlug) {
      const scenario = await resolveScenarioForUser(store, user.id, body.data.stationSlug);
      if (scenario) amountCents = defaultAmountCents(scenario);
    }
  }

  const row = await store.addOutcomeLog({
    userId: user.id,
    date: new Date().toISOString().slice(0, 10),
    service: body.data.service,
    stationSlug: body.data.stationSlug ?? null,
    amountCents,
    amountEntered,
    presented: body.data.presented,
    closed,
  });

  const week = await store.listOutcomeLogs(user.id, { sinceDays: 7 });
  const presented = week.filter((o) => o.presented);
  return NextResponse.json({
    id: row.id,
    weekPresented: presented.length,
    weekClosed: presented.filter((o) => o.closed).length,
  });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";

const Schema = z.object({
  kind: z.enum(["station", "cards"]),
  stationSlug: z.string().min(1).optional(),
  dueAt: z.string().min(4),
  targetReps: z.number().int().min(1).max(20),
  minGrade: z.enum(["A", "B", "C", "D"]).nullable().default(null),
  seats: z.literal("all").default("all"),
});

/** Create an assignment (clinic admin). Notification surfaces are the seats'
 *  pinned ASSIGNED section; push notifications land with Phase 2 infra. */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Fill in the assignment." }, { status: 400 });

  const store = await getStore();
  let title = "Objection cards · shuffle";
  let stationSlug: string | null = null;
  if (body.data.kind === "station") {
    if (!body.data.stationSlug) {
      return NextResponse.json({ error: "Pick a station." }, { status: 400 });
    }
    const scenario = await store.getScenario(body.data.stationSlug);
    if (!scenario) return NextResponse.json({ error: "Unknown station." }, { status: 404 });
    title = scenario.title;
    stationSlug = scenario.slug;
  }

  const due = new Date(body.data.dueAt);
  if (Number.isNaN(due.getTime()) || due.getTime() < Date.now()) {
    return NextResponse.json({ error: "Pick a future due date." }, { status: 400 });
  }

  const row = await store.createAssignment({
    adminUserId: user.id,
    kind: body.data.kind,
    stationSlug,
    title,
    seats: body.data.seats,
    dueAt: due.toISOString(),
    targetReps: body.data.targetReps,
    minGrade: body.data.minGrade,
  });
  return NextResponse.json({ id: row.id });
}

const DeleteSchema = z.object({ id: z.string().min(1) });

export async function DELETE(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const body = DeleteSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const store = await getStore();
  await store.retireAssignment(body.data.id, user.id);
  return NextResponse.json({ ok: true });
}

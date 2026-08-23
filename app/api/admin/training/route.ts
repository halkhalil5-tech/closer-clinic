import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";

const Schema = z.object({ requireCurriculum: z.boolean() });

/** Clinic training policy toggle: require curriculum complete before reps. */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const store = await getStore();
  await store.setRequireCurriculum(user.id, body.data.requireCurriculum);
  return NextResponse.json({ requireCurriculum: body.data.requireCurriculum });
}

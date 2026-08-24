import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";

const Schema = z.object({
  userId: z.string().min(1),
  role: z.enum(["provider", "front_desk"]),
});

/** Clinic admin sets a seat's role; RLS limits writes to the admin's members. */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const store = await getStore();
  await store.setSeatRole(user.id, body.data.userId, body.data.role);
  return NextResponse.json({ ok: true });
}

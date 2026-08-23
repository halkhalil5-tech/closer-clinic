import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";

const ProfileSchema = z.object({
  name: z.string().trim().max(120).optional(),
  specialty: z.enum(["podiatry", "dental", "medspa"]).optional(),
  onboarded: z.boolean().optional(),
});

export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = ProfileSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const store = await getStore();
  await store.updateProfile(user.id, body.data);
  return NextResponse.json({ ok: true });
}

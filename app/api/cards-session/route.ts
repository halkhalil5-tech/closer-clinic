import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";

/** Record a completed objection-card shuffle (feeds card-set assignments). */
export async function POST() {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const store = await getStore();
  await store.recordCardSession(user.id);
  return NextResponse.json({ ok: true });
}

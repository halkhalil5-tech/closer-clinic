import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";

const Schema = z.object({
  service: z.string().trim().min(1).max(120),
  presented: z.boolean(),
  closed: z.boolean(),
});

/** 10-second self-reported real-world outcome: presented X today, closed Y/N. */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const store = await getStore();
  const row = await store.addOutcomeLog({
    userId: user.id,
    date: new Date().toISOString().slice(0, 10),
    service: body.data.service,
    presented: body.data.presented,
    closed: body.data.presented ? body.data.closed : false,
  });

  const week = await store.listOutcomeLogs(user.id, { sinceDays: 7 });
  const presented = week.filter((o) => o.presented);
  return NextResponse.json({
    id: row.id,
    weekPresented: presented.length,
    weekClosed: presented.filter((o) => o.closed).length,
  });
}

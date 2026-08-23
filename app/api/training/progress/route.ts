import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { settleLessonStatus, maybeUnlockCore } from "@/lib/training/server";

const Schema = z.object({
  lessonSlug: z.string().min(1),
  event: z.enum(["started", "content_done"]),
});

export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const store = await getStore();
  const lesson = await store.getTrainingLesson(body.data.lessonSlug);
  if (!lesson) return NextResponse.json({ error: "Unknown lesson" }, { status: 404 });

  let row = await store.upsertLessonProgress(user.id, lesson.slug, {
    status: "in_progress",
  });
  if (body.data.event === "content_done") {
    row = await settleLessonStatus(store, user.id, lesson, row);
  }

  const profile = await store.getCurrentUser();
  const unlock = await maybeUnlockCore(store, user.id, profile?.specialty ?? "podiatry");

  return NextResponse.json({
    status: row.status,
    lessonComplete: row.status === "completed",
    stationsUnlocked: unlock.unlocked,
    justUnlockedStations: unlock.justUnlocked,
  });
}

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { QUIZ_PASS_PCT } from "@/lib/types";
import { settleLessonStatus, maybeUnlockCore } from "@/lib/training/server";

const Schema = z.object({
  lessonSlug: z.string().min(1),
  answers: z.array(z.number().int().min(0).max(8)),
});

/** Server-graded knowledge check: answers in, score + per-question truth out. */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const store = await getStore();
  const lesson = await store.getTrainingLesson(body.data.lessonSlug);
  if (!lesson) return NextResponse.json({ error: "Unknown lesson" }, { status: 404 });
  if (lesson.quiz.length === 0) {
    return NextResponse.json({ error: "This lesson has no quiz" }, { status: 400 });
  }
  if (body.data.answers.length !== lesson.quiz.length) {
    return NextResponse.json({ error: "Answer every question" }, { status: 400 });
  }

  const results = lesson.quiz.map((q, i) => ({
    correct: body.data.answers[i] === q.answer,
    answer: q.answer,
    why: q.why,
  }));
  const score = Math.round((results.filter((r) => r.correct).length / results.length) * 100);
  const passed = score >= QUIZ_PASS_PCT;

  let row = await store.upsertLessonProgress(user.id, lesson.slug, {
    status: "in_progress",
    quizScore: score,
  });
  row = await settleLessonStatus(store, user.id, lesson, row);

  const profile = await store.getCurrentUser();
  const unlock = await maybeUnlockCore(store, user.id, profile?.specialty ?? "podiatry");

  return NextResponse.json({
    score,
    passed,
    results,
    lessonComplete: row.status === "completed",
    needsDrill: Boolean(lesson.drill) && row.drillPassed !== true,
    stationsUnlocked: unlock.unlocked,
    justUnlockedStations: unlock.justUnlocked,
  });
}

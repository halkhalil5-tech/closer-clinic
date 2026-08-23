import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import type { TranscriptMessage } from "@/lib/types";

/**
 * Redo the Moment: restart the encounter from 2 provider turns before the
 * exchange where the close was lost — same persona, same conversation state.
 * The replay is graded only on whether that moment was handled better.
 */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await ctx.params;
  const store = await getStore();
  const source = await store.getEncounter(id, user.id);
  if (!source) return NextResponse.json({ error: "Encounter not found" }, { status: 404 });

  const grade = await store.getGradeByEncounter(id, user.id);
  if (!grade) return NextResponse.json({ error: "Grade this encounter first" }, { status: 400 });

  // Locate the losing provider turn: grader-reported index, clamped to range.
  const providerPositions: number[] = [];
  source.transcript.forEach((m, i) => {
    if (m.role === "provider") providerPositions.push(i);
  });
  if (providerPositions.length === 0) {
    return NextResponse.json({ error: "Nothing to replay" }, { status: 400 });
  }
  const momentIdx = Math.min(
    grade.momentIndex ?? providerPositions.length - 1,
    providerPositions.length - 1
  );
  // Rewind two provider turns before the moment; cut at that provider line so
  // the patient's preceding line is the last thing on screen.
  const restartIdx = Math.max(0, momentIdx - 2);
  const cutAt = providerPositions[restartIdx];
  const transcript: TranscriptMessage[] = source.transcript.slice(0, cutAt);

  // Guarantee the patient has the floor: the replay must start on a patient line.
  while (transcript.length > 0 && transcript[transcript.length - 1].role !== "patient") {
    transcript.pop();
  }
  if (!transcript.some((m) => m.role === "patient")) {
    return NextResponse.json({ error: "Nothing to replay" }, { status: 400 });
  }

  const redo = await store.createEncounter({
    userId: user.id,
    scenarioSlug: source.scenarioSlug,
    difficulty: source.difficulty,
    persona: source.persona,
    transcript,
    kind: "redo",
    meta: { parentEncounterId: source.id },
  });

  return NextResponse.json({ encounterId: redo.id });
}

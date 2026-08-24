import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { getOrCreateReplay } from "@/lib/audio-pairs";
import { voiceFor } from "@/lib/voice/voice-map";

export const maxDuration = 60;

const Schema = z.object({ encounterId: z.string().min(1) });

/**
 * "Hear it": voice the losing moment with the grader's rewrite in place of
 * the provider's weakest line, using the same patient voice the user heard.
 */
export async function POST(req: Request) {
  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const store = await getStore();
  const encounter = await store.getEncounter(body.data.encounterId, user.id);
  const grade = encounter ? await store.getGradeByEncounter(encounter.id, user.id) : null;
  if (!encounter || !grade?.rewrite) {
    return NextResponse.json({ error: "No rewrite for this rep" }, { status: 404 });
  }

  // The moment window: patient line before the weakest provider line, the
  // rewrite, and the patient line that actually followed.
  const t = encounter.transcript;
  let idx = t.findIndex((m) => m.role === "provider" && m.text === grade.rewrite!.youSaid);
  if (idx === -1 && grade.momentIndex !== null) {
    let seen = -1;
    idx = t.findIndex((m) => m.role === "provider" && ++seen === grade.momentIndex);
  }
  const before = idx > 0 ? [...t.slice(0, idx)].reverse().find((m) => m.role === "patient")?.text ?? null : null;
  const after = idx >= 0 ? t.slice(idx + 1).find((m) => m.role === "patient")?.text ?? null : null;

  try {
    const result = await getOrCreateReplay({
      encounterId: encounter.id,
      userId: user.id,
      patientVoiceId:
        encounter.persona.voiceId ?? voiceFor(encounter.persona.personaId, encounter.persona.gender),
      before,
      better: grade.rewrite.better,
      after,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Replay generation failed", err);
    return NextResponse.json({ status: "unavailable" });
  }
}

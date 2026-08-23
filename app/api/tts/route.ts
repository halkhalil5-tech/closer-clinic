import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { voiceFor } from "@/lib/voice/voice-map";

/**
 * Server-side ElevenLabs proxy. The API key never reaches the client. The
 * upstream response is streamed straight through so playback can start on the
 * first audio chunk. Low-latency model (Flash) by default.
 */

const TtsSchema = z.object({
  encounterId: z.string().min(1),
  text: z.string().trim().min(1).max(2000),
});

const ELEVENLABS_MODEL = process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5";

export async function POST(req: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "TTS not configured" }, { status: 503 });

  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = TtsSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const store = await getStore();
  const encounter = await store.getEncounter(body.data.encounterId, user.id);
  if (!encounter) return NextResponse.json({ error: "Encounter not found" }, { status: 404 });

  // Only speak lines that are actually in this encounter's transcript — this
  // endpoint is a patient voice, not a general TTS service.
  const isPatientLine = encounter.transcript.some(
    (m) => m.role === "patient" && m.text === body.data.text
  );
  if (!isPatientLine) {
    return NextResponse.json({ error: "Not a patient line" }, { status: 400 });
  }

  const voiceId =
    encounter.persona.voiceId ??
    voiceFor(encounter.persona.personaId, encounter.persona.gender);

  const upstream = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream?output_format=mp3_44100_64`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: body.data.text,
        model_id: ELEVENLABS_MODEL,
        // Slightly loose settings: natural pacing and imperfection over polish.
        voice_settings: { stability: 0.4, similarity_boost: 0.75 },
      }),
    }
  );

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text().catch(() => "");
    console.error("ElevenLabs error", upstream.status, detail.slice(0, 300));
    return NextResponse.json({ error: "TTS failed" }, { status: 502 });
  }

  // Log spend before streaming; character count is known up front.
  await store.recordUsage(body.data.encounterId, user.id, {
    ttsCharacters: body.data.text.length,
  });

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "no-store",
    },
  });
}

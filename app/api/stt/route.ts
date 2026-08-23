import { NextResponse } from "next/server";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { MEDICAL_KEYWORDS } from "@/lib/voice/medical-terms";

/**
 * Server-side Deepgram transcription for press-to-talk audio. Medical model +
 * boosted podiatry/dental vocabulary — browser speech recognition butchers
 * "matrixectomy". Audio arrives as the raw recorded blob (audio/mp4 on iOS
 * Safari, audio/webm elsewhere).
 */

const DEEPGRAM_MODEL = process.env.DEEPGRAM_MODEL || "nova-2-medical";
const MAX_AUDIO_BYTES = 10 * 1024 * 1024; // ~10MB ≈ several minutes; turns are short

export async function POST(req: Request) {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "STT not configured" }, { status: 503 });

  const user = await getAuthedUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const url = new URL(req.url);
  const encounterId = url.searchParams.get("encounterId");
  if (!encounterId) return NextResponse.json({ error: "Missing encounterId" }, { status: 400 });

  const store = await getStore();
  const encounter = await store.getEncounter(encounterId, user.id);
  if (!encounter) return NextResponse.json({ error: "Encounter not found" }, { status: 404 });

  const audio = await req.arrayBuffer();
  if (audio.byteLength === 0) return NextResponse.json({ error: "No audio" }, { status: 400 });
  if (audio.byteLength > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Recording too long" }, { status: 413 });
  }

  const dgUrl = new URL("https://api.deepgram.com/v1/listen");
  dgUrl.searchParams.set("model", DEEPGRAM_MODEL);
  dgUrl.searchParams.set("smart_format", "true");
  dgUrl.searchParams.set("punctuate", "true");
  dgUrl.searchParams.set("language", "en-US");
  for (const term of MEDICAL_KEYWORDS) {
    dgUrl.searchParams.append("keywords", `${term}:2`);
  }

  const upstream = await fetch(dgUrl, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": req.headers.get("content-type") || "application/octet-stream",
    },
    body: audio,
  });

  if (!upstream.ok) {
    const detail = await upstream.text().catch(() => "");
    console.error("Deepgram error", upstream.status, detail.slice(0, 300));
    return NextResponse.json({ error: "Transcription failed" }, { status: 502 });
  }

  const result = await upstream.json();
  const transcript: string =
    result?.results?.channels?.[0]?.alternatives?.[0]?.transcript ?? "";
  const durationSeconds: number = result?.metadata?.duration ?? 0;

  await store.recordUsage(encounterId, user.id, { sttSeconds: durationSeconds });

  return NextResponse.json({ transcript });
}

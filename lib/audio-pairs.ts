import "server-only";
import { createHash } from "crypto";
import type { PairLine, PairScript, Scenario } from "./types";
import { generateJson } from "./anthropic";
import { buildPairScriptPrompt } from "./prompts";
import { createAdminClient } from "./supabase/admin";
import { MP3_BYTES_PER_MS, PAIR_SCRIPT_VERSION, pairContentHash, withStartTimes } from "./audio-pairs-core";

export { PAIR_SCRIPT_VERSION, pairContentHash, withStartTimes };

/**
 * "Common close / The fix" audio pairs + personal replays.
 *
 * Cache scope is the content hash: a default station hashes identically for
 * everyone (one global cache); a customized station hashes on its resolved
 * content, so an edit regenerates and an unchanged station never does.
 */

const DOCTOR_VOICE = "nPczCjzI2devNBz1zQrb"; // Brian — polished American
const PAIR_PATIENT_VOICE = "XrExE9yKIg1WjnnlVkGX"; // Matilda — warm, distinct from Daniel
const ELEVENLABS_MODEL = process.env.ELEVENLABS_MODEL || "eleven_flash_v2_5";

export class TtsBudgetExceeded extends Error {
  constructor() {
    super("Monthly TTS character budget reached");
  }
}

/* ------------------------------ TTS budget ------------------------------ */

/**
 * Soft monthly cap on generated-audio characters (env TTS_MONTHLY_CHAR_CAP).
 * Over cap → callers surface "audio unavailable" instead of failing the page.
 */
export async function ttsBudgetAllows(chars: number): Promise<boolean> {
  const cap = Number(process.env.TTS_MONTHLY_CHAR_CAP);
  if (!Number.isFinite(cap) || cap <= 0) return true; // no cap configured
  const admin = createAdminClient();
  if (!admin) return true; // dev: no persistent counter
  const month = new Date().toISOString().slice(0, 7);
  const { data } = await admin.from("tts_usage").select("chars").eq("month", month).maybeSingle();
  const used = Number(data?.chars ?? 0);
  if (used + chars > cap) {
    console.warn(`TTS budget: ${used}+${chars} exceeds cap ${cap} — audio unavailable`);
    return false;
  }
  return true;
}

export async function recordTtsChars(chars: number): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  const month = new Date().toISOString().slice(0, 7);
  const { data } = await admin.from("tts_usage").select("chars").eq("month", month).maybeSingle();
  await admin
    .from("tts_usage")
    .upsert({ month, chars: Number(data?.chars ?? 0) + chars });
}

/* ------------------------------ generation ------------------------------ */

const MPEG1_SAMPLE_RATES = [44100, 48000, 32000];
const MPEG2_SAMPLE_RATES = [22050, 24000, 16000];
const L3_BITRATES_V1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const L3_BITRATES_V2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];

/**
 * Strip ID3v2 tags and the Xing/Info metadata frame from an MP3 segment.
 * Stitched takes must be one clean frame stream: browsers read the FIRST
 * segment's duration header and stop playback there (the "stops at 0:07" bug),
 * and mid-stream tags can stall decoders.
 */
export function stripMp3Metadata(buf: Buffer): Buffer {
  let b = buf;
  // ID3v2 tag at the start (syncsafe 28-bit size).
  if (b.length > 10 && b[0] === 0x49 && b[1] === 0x44 && b[2] === 0x33) {
    const size =
      ((b[6] & 0x7f) << 21) | ((b[7] & 0x7f) << 14) | ((b[8] & 0x7f) << 7) | (b[9] & 0x7f);
    b = b.subarray(10 + size);
  }
  // Skip to the first frame sync.
  let i = 0;
  while (i + 4 < b.length && !(b[i] === 0xff && (b[i + 1] & 0xe0) === 0xe0)) i++;
  b = b.subarray(i);
  // Drop leading Xing/Info/LAME frames (up to 2).
  for (let n = 0; n < 2; n++) {
    if (b.length < 4 || b[0] !== 0xff || (b[1] & 0xe0) !== 0xe0) break;
    const mpeg1 = (b[1] & 0x18) === 0x18;
    const bitrateIdx = (b[2] >> 4) & 0x0f;
    const srIdx = (b[2] >> 2) & 0x03;
    if (bitrateIdx === 0 || bitrateIdx === 15 || srIdx === 3) break;
    const bitrate = (mpeg1 ? L3_BITRATES_V1 : L3_BITRATES_V2)[bitrateIdx] * 1000;
    const sampleRate = (mpeg1 ? MPEG1_SAMPLE_RATES : MPEG2_SAMPLE_RATES)[srIdx];
    const padding = (b[2] >> 1) & 0x01;
    const frameLen = Math.floor(((mpeg1 ? 144 : 72) * bitrate) / sampleRate) + padding;
    const head = b.subarray(0, Math.min(frameLen, b.length)).toString("latin1");
    if (head.includes("Xing") || head.includes("Info") || head.includes("LAME")) {
      b = b.subarray(frameLen);
    } else {
      break;
    }
  }
  return b;
}

async function ttsSegment(text: string, voiceId: string): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("TTS not configured");
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_64`,
    {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL,
        voice_settings: { stability: 0.4, similarity_boost: 0.75 },
      }),
    }
  );
  if (!res.ok) throw new Error(`TTS ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return Buffer.from(await res.arrayBuffer());
}

/** Voice a scripted take: per-line TTS, stitch, annotate start times. */
async function renderTake(
  lines: PairLine[],
  voices: { patient: string; doctor: string }
): Promise<{ audio: Buffer; lines: PairLine[]; durationMs: number; chars: number }> {
  // Bounded-parallel per-line synthesis: order is preserved by index. Capped
  // at 8 in flight — ElevenLabs plans allow 10 concurrent requests and takes
  // render sequentially, so this stays under the account limit while keeping
  // long takes inside the 60s serverless budget.
  const segments: Buffer[] = new Array(lines.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(8, lines.length) }, async () => {
      while (next < lines.length) {
        const i = next++;
        const line = lines[i];
        segments[i] = stripMp3Metadata(
          await ttsSegment(line.text, line.speaker === "patient" ? voices.patient : voices.doctor)
        );
      }
    })
  );
  const chars = lines.reduce((n, l) => n + l.text.length, 0);
  const annotated = withStartTimes(
    lines,
    segments.map((s) => s.byteLength)
  );
  const audio = Buffer.concat(segments);
  return { audio, lines: annotated, durationMs: Math.round(audio.byteLength / MP3_BYTES_PER_MS), chars };
}

function parseTakes(raw: string): PairScript[] {
  const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
  const takes: PairScript[] = parsed.takes;
  if (!Array.isArray(takes) || takes.length !== 2) throw new Error("Bad pair script shape");
  for (const t of takes) {
    if (!["A", "B"].includes(t.take) || !Array.isArray(t.lines) || t.lines.length < 4) {
      throw new Error("Bad take shape");
    }
  }
  return takes;
}

export interface PairResult {
  status: "ready" | "unavailable";
  takes?: { take: "A" | "B"; url: string; durationMs: number; lines: PairLine[] }[];
}

/**
 * Fetch the cached pair for a station's current content, generating on first
 * play. Cached in the public audio-pairs bucket; never regenerated until the
 * station's content (or the script version) changes.
 */
export async function getOrCreatePair(scenario: Scenario, moduleFocus?: string): Promise<PairResult> {
  const admin = createAdminClient();
  const hash = pairContentHash(scenario, moduleFocus);
  const baseSlug = scenario.slug;

  const cachedTakes = new Map<string, { url: string; durationMs: number; lines: PairLine[] }>();
  if (admin) {
    const { data: cached } = await admin
      .from("audio_assets")
      .select("*")
      .eq("kind", "pair")
      .eq("station_slug", baseSlug)
      .eq("content_hash", hash);
    for (const r of cached ?? []) {
      cachedTakes.set(r.take, {
        url: admin.storage.from("audio-pairs").getPublicUrl(r.storage_path).data.publicUrl,
        durationMs: r.duration_ms ?? 0,
        lines: r.script.lines,
      });
    }
    if (cachedTakes.size === 2) {
      return {
        status: "ready",
        takes: ["A", "B"].map((t) => ({ take: t as "A" | "B", ...cachedTakes.get(t)! })),
      };
    }
  }

  // Generate: script first, then a budget check with real character counts.
  const { raw } = await generateJson(buildPairScriptPrompt(scenario, moduleFocus));
  const takes = parseTakes(raw);
  const totalChars = takes.flatMap((t) => t.lines).reduce((n, l) => n + l.text.length, 0);
  if (!(await ttsBudgetAllows(totalChars))) return { status: "unavailable" };

  const out: NonNullable<PairResult["takes"]> = [];
  for (const take of takes) {
    const prior = cachedTakes.get(take.take);
    if (prior) {
      out.push({ take: take.take, ...prior });
      continue;
    }
    const rendered = await renderTake(take.lines, {
      patient: PAIR_PATIENT_VOICE,
      doctor: DOCTOR_VOICE,
    });
    let url: string;
    const path = `${baseSlug}/${hash}/${take.take}.mp3`;
    if (admin) {
      const { error } = await admin.storage
        .from("audio-pairs")
        .upload(path, rendered.audio, { contentType: "audio/mpeg", upsert: true });
      if (error) throw error;
      url = admin.storage.from("audio-pairs").getPublicUrl(path).data.publicUrl;
      await admin.from("audio_assets").upsert(
        {
          kind: "pair",
          station_slug: baseSlug,
          content_hash: hash,
          take: take.take,
          script: { take: take.take, lines: rendered.lines },
          storage_path: path,
          duration_ms: rendered.durationMs,
        },
        { onConflict: "kind,station_slug,content_hash,take" }
      );
    } else {
      // Dev without Supabase: inline the audio; nothing persists.
      url = `data:audio/mpeg;base64,${rendered.audio.toString("base64")}`;
    }
    out.push({ take: take.take, url, durationMs: rendered.durationMs, lines: rendered.lines });
  }
  await recordTtsChars(totalChars);
  return { status: "ready", takes: out };
}

/* ---------------------------- personal replay ---------------------------- */

export interface ReplayResult {
  status: "ready" | "unavailable";
  url?: string;
  durationMs?: number;
  lines?: PairLine[];
}

/**
 * "Hear it": the losing moment replayed with the grader's rewrite — the
 * patient line before, the rewritten doctor line, and the patient line the
 * user actually got. Short by design (~20–30 s). Cached per rep in the
 * private bucket; served via signed URL.
 */
export async function getOrCreateReplay(input: {
  encounterId: string;
  userId: string;
  patientVoiceId: string;
  before: string | null;
  better: string;
  after: string | null;
}): Promise<ReplayResult> {
  const admin = createAdminClient();
  const hash = createHash("sha256")
    .update(JSON.stringify([PAIR_SCRIPT_VERSION, input.before, input.better, input.after]))
    .digest("hex")
    .slice(0, 16);

  if (admin) {
    const { data: cached } = await admin
      .from("audio_assets")
      .select("*")
      .eq("kind", "replay")
      .eq("encounter_id", input.encounterId)
      .eq("content_hash", hash)
      .maybeSingle();
    if (cached) {
      const { data: signed } = await admin.storage
        .from("audio-replays")
        .createSignedUrl(cached.storage_path, 3600);
      if (signed?.signedUrl) {
        return {
          status: "ready",
          url: signed.signedUrl,
          durationMs: cached.duration_ms ?? 0,
          lines: cached.script.lines,
        };
      }
    }
  }

  const lines: PairLine[] = [
    ...(input.before ? [{ speaker: "patient" as const, text: input.before }] : []),
    { speaker: "doctor" as const, text: input.better, beat: "the rewrite" },
    ...(input.after ? [{ speaker: "patient" as const, text: input.after }] : []),
  ];
  const chars = lines.reduce((n, l) => n + l.text.length, 0);
  if (!(await ttsBudgetAllows(chars))) return { status: "unavailable" };

  const rendered = await renderTake(lines, {
    patient: input.patientVoiceId,
    doctor: DOCTOR_VOICE,
  });
  await recordTtsChars(chars);

  if (!admin) {
    return {
      status: "ready",
      url: `data:audio/mpeg;base64,${rendered.audio.toString("base64")}`,
      durationMs: rendered.durationMs,
      lines: rendered.lines,
    };
  }

  const path = `${input.userId}/${input.encounterId}/${hash}.mp3`;
  const { error } = await admin.storage
    .from("audio-replays")
    .upload(path, rendered.audio, { contentType: "audio/mpeg", upsert: true });
  if (error) throw error;
  await admin.from("audio_assets").insert({
    kind: "replay",
    content_hash: hash,
    script: { lines: rendered.lines },
    storage_path: path,
    duration_ms: rendered.durationMs,
    encounter_id: input.encounterId,
    user_id: input.userId,
  });
  const { data: signed } = await admin.storage.from("audio-replays").createSignedUrl(path, 3600);
  return {
    status: "ready",
    url: signed?.signedUrl,
    durationMs: rendered.durationMs,
    lines: rendered.lines,
  };
}

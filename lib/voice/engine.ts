"use client";

import type { VoiceEngine } from "./types";
import { getVoiceEngine as getWebSpeechEngine } from "./web-speech";
import { ElevenLabsTts } from "./elevenlabs-client";
import { RecorderStt } from "./deepgram-client";

export interface VoiceCaps {
  /** Server has an ElevenLabs key → realistic patient voice via /api/tts. */
  tts: boolean;
  /** Server has a Deepgram key → accurate medical STT via /api/stt. */
  stt: boolean;
}

/**
 * Compose the voice engine for one encounter. Hosted providers when the server
 * has keys, Web Speech otherwise; ElevenLabs always carries a silent
 * speechSynthesis fallback so a TTS failure never breaks the encounter.
 */
export function buildVoiceEngine(encounterId: string, caps: VoiceCaps): VoiceEngine {
  const web = getWebSpeechEngine();
  const recorder = new RecorderStt(encounterId);
  return {
    stt: caps.stt && recorder.isSupported() ? recorder : web.stt,
    tts: caps.tts ? new ElevenLabsTts(encounterId, web.tts) : web.tts,
  };
}

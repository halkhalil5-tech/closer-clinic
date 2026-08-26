"use client";

import { useCallback, useEffect } from "react";
import { getSharedAudio } from "./elevenlabs-client";

/**
 * Read-only amplitude analysis on top of the existing voice pipeline.
 *
 * One module-level AudioContext feeds two AnalyserNodes: the TTS playback
 * element (captured via createMediaElementSource and — critically — routed
 * back to context.destination so the patient stays audible) and the mic
 * MediaStream the speech-to-text recorder already captured (published here,
 * never a second getUserMedia; analysis-only, never routed to output).
 *
 * Everything is defensive: if the context can't start, stays suspended
 * (Safari autoplay policy — we resume on the first user gesture), or the
 * element/stream never appears, getLevel() reports live:false and callers
 * keep their state-driven animation. Playback capture only happens once the
 * context is RUNNING, so a suspended context can never mute the patient.
 */

interface LevelReading {
  /** 0–1 smoothed amplitude. */
  level: number;
  /** True when a real analyser is feeding the number. */
  live: boolean;
  source: "mic" | "tts" | null;
}

// ---- mic stream registry (published by the STT recorder, read-only here) ----
let activeMicStream: MediaStream | null = null;

/** Called by the recorder when its stream opens/closes. Analysis-only tap. */
export function publishMicStream(stream: MediaStream | null): void {
  activeMicStream = stream;
}

// ------------------------- module analysis graph -------------------------
let ctx: AudioContext | null = null;
let ctxFailed = false;
let ttsAnalyser: AnalyserNode | null = null;
let micAnalyser: AnalyserNode | null = null;
let buf: Uint8Array<ArrayBuffer> | null = null;

const attachedElements = new WeakSet<HTMLAudioElement>();
let elementCaptureFailed = false;

/**
 * WebKit (Safari/iOS) renders SILENCE through createMediaElementSource when
 * the element plays MediaSource-streamed audio — and since analyser and
 * destination share the chain, capturing would mute the patient. Capture is
 * permanent per element, so on Apple engines we never take it: Safari keeps
 * native playback, the orb keeps its state-driven animation for the patient,
 * and the mic analyser (MediaStream-based, safe everywhere) still works.
 */
function elementCaptureUnsafe(): boolean {
  return typeof navigator !== "undefined" && navigator.vendor === "Apple Computer, Inc.";
}
let micSource: MediaStreamAudioSourceNode | null = null;
let micSourceStream: MediaStream | null = null;
let smoothed = 0;

type AudioContextCtor = typeof AudioContext;

function getCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { AudioContext?: AudioContextCtor; webkitAudioContext?: AudioContextCtor };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/** Create/resume the context. Must be reachable from a user gesture. */
export function ensureAudioContext(): void {
  if (ctxFailed) return;
  try {
    if (!ctx) {
      const Ctor = getCtor();
      if (!Ctor) {
        ctxFailed = true;
        return;
      }
      ctx = new Ctor();
      ttsAnalyser = ctx.createAnalyser();
      ttsAnalyser.fftSize = 512;
      micAnalyser = ctx.createAnalyser();
      micAnalyser.fftSize = 512;
      buf = new Uint8Array(new ArrayBuffer(512));
      // If the OS suspends us mid-session (call, Siri, tab switch on iOS),
      // try to come back — otherwise a captured element would go quiet.
      ctx.onstatechange = () => {
        if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => {});
      };
    }
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  } catch {
    ctxFailed = true;
  }
}

function tryAttachTts(): void {
  if (!ctx || !ttsAnalyser || ctx.state !== "running" || elementCaptureFailed) return;
  if (elementCaptureUnsafe()) return;
  const el = getSharedAudio();
  if (!el || attachedElements.has(el)) return;
  try {
    const source = ctx.createMediaElementSource(el);
    // Route through the analyser AND back to the speakers — capturing an
    // element reroutes its output, so skipping this line means silence.
    source.connect(ttsAnalyser);
    ttsAnalyser.connect(ctx.destination);
    attachedElements.add(el);
    if (process.env.NODE_ENV !== "production") {
      (window as unknown as { __ccTtsEl?: HTMLAudioElement }).__ccTtsEl = el;
    }
  } catch {
    // e.g. the element already belongs to another context — never retry into
    // a broken state; playback continues untouched and callers fall back.
    elementCaptureFailed = true;
  }
}

function tryAttachMic(): void {
  if (!ctx || !micAnalyser || ctx.state !== "running") return;
  if (activeMicStream === micSourceStream) return;
  try {
    micSource?.disconnect();
  } catch {
    /* already gone */
  }
  micSource = null;
  micSourceStream = activeMicStream;
  if (!activeMicStream) return;
  try {
    micSource = ctx.createMediaStreamSource(activeMicStream);
    micSource.connect(micAnalyser); // analysis only — never to destination
  } catch {
    micSource = null;
    micSourceStream = null;
  }
}

function rms(analyser: AnalyserNode): number {
  if (!buf) return 0;
  analyser.getByteTimeDomainData(buf);
  let sum = 0;
  for (let i = 0; i < buf.length; i++) {
    const v = (buf[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / buf.length);
}

/** Sample the current 0–1 amplitude. Safe to call every animation frame. */
export function readAudioLevel(): LevelReading {
  if (!ctx || ctx.state !== "running" || !ttsAnalyser || !micAnalyser) {
    smoothed = 0;
    return { level: 0, live: false, source: null };
  }
  tryAttachTts();
  tryAttachMic();

  const micLive = micSource !== null;
  const el = getSharedAudio();
  const ttsLive = !elementCaptureFailed && el !== null && attachedElements.has(el);
  if (!micLive && !ttsLive) {
    smoothed = 0;
    return { level: 0, live: false, source: null };
  }

  // The mic wins while it's open (the user is talking); otherwise the patient.
  const source: "mic" | "tts" = micLive ? "mic" : "tts";
  const raw = Math.min(1, rms(source === "mic" ? micAnalyser : ttsAnalyser) * 3.2);
  // fast attack, slow release — speech feels punchy, silence settles gently
  smoothed += (raw - smoothed) * (raw > smoothed ? 0.5 : 0.12);

  if (process.env.NODE_ENV !== "production") {
    (window as unknown as { __ccLevel?: LevelReading }).__ccLevel = {
      level: smoothed,
      live: true,
      source,
    };
  }
  return { level: smoothed, live: true, source };
}

/**
 * Hook: wires gesture-driven context startup/resume and hands back the
 * frame-rate sampler. Rendering stays outside React state on purpose —
 * callers poll inside their own rAF loop.
 */
export function useAudioLevels(): { getLevel: () => LevelReading } {
  useEffect(() => {
    const kick = () => ensureAudioContext();
    // Safari won't start (or resume) an AudioContext outside a gesture.
    document.addEventListener("pointerdown", kick, true);
    document.addEventListener("keydown", kick, true);
    const onVisible = () => {
      if (document.visibilityState === "visible") ensureAudioContext();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("pointerdown", kick, true);
      document.removeEventListener("keydown", kick, true);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const getLevel = useCallback(() => readAudioLevel(), []);
  return { getLevel };
}

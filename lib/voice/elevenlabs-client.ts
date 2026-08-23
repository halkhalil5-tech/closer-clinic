"use client";

import type { TextToSpeech, TtsUtteranceOptions } from "./types";

/**
 * Patient voice via the server-side ElevenLabs proxy (/api/tts). Audio is
 * streamed with MediaSource so playback starts on the first chunk — the reply
 * should feel conversational, not like a file download. Any failure falls back
 * SILENTLY to the provided fallback engine (browser speechSynthesis); the
 * encounter never breaks over a voice hiccup.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

const MIME = "audio/mpeg";

function mediaSourceCtor(): (new () => MediaSource) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  // iOS Safari 17.1+ ships MSE as ManagedMediaSource.
  const Ctor = w.ManagedMediaSource ?? w.MediaSource ?? null;
  if (!Ctor || typeof Ctor.isTypeSupported !== "function") return null;
  return Ctor.isTypeSupported(MIME) ? Ctor : null;
}

export class ElevenLabsTts implements TextToSpeech {
  private audio: HTMLAudioElement | null = null;
  private abort: AbortController | null = null;
  private objectUrl: string | null = null;

  constructor(
    private encounterId: string,
    private fallback: TextToSpeech
  ) {}

  isSupported(): boolean {
    return true;
  }

  /** Create + unlock the audio element while we're inside a user gesture. */
  prime(): void {
    if (this.audio) return;
    const audio = new Audio();
    (audio as any).disableRemotePlayback = true;
    audio.muted = true;
    // A play() attempt inside the gesture unlocks future programmatic playback.
    audio.play().catch(() => {});
    audio.pause();
    audio.muted = false;
    this.audio = audio;
  }

  async speak(text: string, opts?: TtsUtteranceOptions): Promise<void> {
    this.cancel();
    const abort = new AbortController();
    this.abort = abort;
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ encounterId: this.encounterId, text }),
        signal: abort.signal,
      });
      if (!res.ok || !res.body) throw new Error(`tts ${res.status}`);
      await this.play(res, abort);
    } catch (err) {
      if (abort.signal.aborted) return; // cancelled on purpose — stay silent
      console.warn("TTS fell back to browser voice:", err);
      await this.fallback.speak(text, opts);
    } finally {
      if (this.abort === abort) this.abort = null;
    }
  }

  cancel(): void {
    this.abort?.abort();
    this.abort = null;
    if (this.audio) {
      this.audio.pause();
      this.audio.removeAttribute("src");
    }
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
    this.fallback.cancel();
  }

  private ensureAudio(): HTMLAudioElement {
    if (!this.audio) this.audio = new Audio();
    return this.audio;
  }

  private async play(res: Response, abort: AbortController): Promise<void> {
    const MS = mediaSourceCtor();
    if (MS && res.body) {
      await this.playStreaming(MS, res.body, abort);
    } else {
      // No MSE: buffer fully, then play. Still server TTS, just not chunked.
      const blob = await res.blob();
      await this.playBlob(blob, abort);
    }
  }

  private playStreaming(
    MS: new () => MediaSource,
    body: ReadableStream<Uint8Array>,
    abort: AbortController
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const audio = this.ensureAudio();
      const ms = new MS();
      const url = URL.createObjectURL(ms as any);
      this.objectUrl = url;
      audio.src = url;

      const fail = (err: unknown) => {
        try {
          if (ms.readyState === "open") ms.endOfStream();
        } catch {}
        reject(err);
      };

      ms.addEventListener(
        "sourceopen",
        async () => {
          let sb: SourceBuffer;
          try {
            sb = ms.addSourceBuffer(MIME);
          } catch (err) {
            return fail(err);
          }
          const reader = body.getReader();
          const waitIdle = () =>
            new Promise<void>((r) => {
              if (!sb.updating) return r();
              sb.addEventListener("updateend", () => r(), { once: true });
            });
          try {
            let started = false;
            for (;;) {
              const { done, value } = await reader.read();
              if (abort.signal.aborted) return fail(new Error("aborted"));
              if (done) break;
              await waitIdle();
              sb.appendBuffer(value as unknown as BufferSource);
              if (!started) {
                started = true;
                audio.play().catch((err) => fail(err));
              }
            }
            await waitIdle();
            if (ms.readyState === "open") ms.endOfStream();
            if (!started) return resolve(); // empty stream
            audio.addEventListener("ended", () => resolve(), { once: true });
            audio.addEventListener("error", () => resolve(), { once: true });
          } catch (err) {
            fail(err);
          }
        },
        { once: true }
      );
    });
  }

  private playBlob(blob: Blob, abort: AbortController): Promise<void> {
    return new Promise((resolve, reject) => {
      if (abort.signal.aborted) return resolve();
      const audio = this.ensureAudio();
      const url = URL.createObjectURL(blob);
      this.objectUrl = url;
      audio.src = url;
      audio.addEventListener("ended", () => resolve(), { once: true });
      audio.addEventListener("error", (e) => reject(e), { once: true });
      audio.play().catch(reject);
    });
  }
}

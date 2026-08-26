"use client";

import type { SpeechToText, SttHandlers, SttSession } from "./types";
import { publishMicStream } from "./audio-levels";

/**
 * Press-to-talk STT via the server-side Deepgram route. Records with
 * MediaRecorder (audio/mp4 on iOS Safari), sends the clip on stop, and returns
 * one accurate final transcript with medical vocabulary boosted. No live
 * interim text — the UI shows a recording state instead.
 */
export class RecorderStt implements SpeechToText {
  constructor(private encounterId: string) {}

  isSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices?.getUserMedia &&
      typeof MediaRecorder !== "undefined"
    );
  }

  start(handlers: SttHandlers): SttSession {
    let recorder: MediaRecorder | null = null;
    let stream: MediaStream | null = null;
    let cancelled = false;
    let stopped = false;
    const chunks: Blob[] = [];

    const cleanup = () => {
      publishMicStream(null);
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((s) => {
        if (cancelled || stopped) {
          s.getTracks().forEach((t) => t.stop());
          handlers.onEnd();
          return;
        }
        stream = s;
        publishMicStream(s); // analysis-only tap for the session visualizer
        const mime = MediaRecorder.isTypeSupported("audio/mp4")
          ? "audio/mp4"
          : MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "";
        recorder = mime ? new MediaRecorder(s, { mimeType: mime }) : new MediaRecorder(s);
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = async () => {
          cleanup();
          if (cancelled) {
            handlers.onEnd();
            return;
          }
          try {
            const blob = new Blob(chunks, { type: recorder?.mimeType || "audio/mp4" });
            if (blob.size === 0) {
              handlers.onError("Didn't catch any audio. Try again.");
              return;
            }
            const res = await fetch(
              `/api/stt?encounterId=${encodeURIComponent(this.encounterId)}`,
              {
                method: "POST",
                headers: { "Content-Type": blob.type },
                body: blob,
              }
            );
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              handlers.onError(data.error || "Transcription failed. Try again or type.");
              return;
            }
            const transcript = (data.transcript || "").trim();
            if (transcript) {
              handlers.onFinal(transcript);
            } else {
              handlers.onError("Didn't catch that — try again or type.");
            }
          } catch {
            handlers.onError("Transcription failed. Check your connection or type instead.");
          } finally {
            handlers.onEnd();
          }
        };
        recorder.start();
      })
      .catch(() => {
        handlers.onError(
          "Microphone access was blocked. Allow the mic in your browser settings, or type instead."
        );
        handlers.onEnd();
      });

    return {
      stop() {
        stopped = true;
        if (recorder && recorder.state === "recording") {
          recorder.stop();
        } else if (!recorder) {
          // getUserMedia still pending; the .then() above handles it.
        }
      },
      cancel() {
        cancelled = true;
        if (recorder && recorder.state === "recording") recorder.stop();
        else cleanup();
      },
    };
  }
}

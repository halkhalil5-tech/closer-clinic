"use client";

import type {
  SpeechToText,
  SttHandlers,
  SttSession,
  TextToSpeech,
  TtsUtteranceOptions,
  VoiceEngine,
} from "./types";

/**
 * Default voice engine: Web Speech API. Works on iPhone Safari (14.5+,
 * webkitSpeechRecognition) and Chrome. Press-to-talk model: caller starts a
 * session on tap, stops on second tap; interim results stream to the UI.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

type SR = any;

function getRecognitionCtor(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

class WebSpeechStt implements SpeechToText {
  isSupported(): boolean {
    return getRecognitionCtor() !== null;
  }

  start(handlers: SttHandlers): SttSession {
    const Ctor = getRecognitionCtor();
    if (!Ctor) {
      handlers.onError("Voice input isn't supported in this browser. Use the keyboard instead.");
      handlers.onEnd();
      return { stop() {}, cancel() {} };
    }

    const rec: SR = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let cancelled = false;

    rec.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          if (text.trim()) handlers.onFinal(text.trim());
        } else {
          interim += text;
        }
      }
      if (interim) handlers.onInterim(interim);
    };

    rec.onerror = (event: any) => {
      if (cancelled) return;
      const code = event?.error ?? "unknown";
      if (code === "no-speech") return; // benign: silence — onend will follow
      const message =
        code === "not-allowed" || code === "service-not-allowed"
          ? "Microphone access was blocked. Allow the mic in your browser settings, or type instead."
          : `Voice input error (${code}). Try again or type instead.`;
      handlers.onError(message);
    };

    rec.onend = () => {
      if (!cancelled) handlers.onEnd();
    };

    try {
      rec.start();
    } catch {
      handlers.onError("Couldn't start the microphone. Try again.");
      handlers.onEnd();
    }

    return {
      stop() {
        try {
          rec.stop();
        } catch {}
      },
      cancel() {
        cancelled = true;
        try {
          rec.abort();
        } catch {}
      },
    };
  }
}

class WebSpeechTts implements TextToSpeech {
  private preferredVoice: SpeechSynthesisVoice | null = null;

  isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  private pickVoice(): SpeechSynthesisVoice | null {
    if (this.preferredVoice) return this.preferredVoice;
    if (!this.isSupported()) return null;
    const voices = window.speechSynthesis.getVoices();
    const enVoices = voices.filter((v) => v.lang.startsWith("en"));
    // Prefer higher-quality local voices when present (Samantha/Karen on iOS/macOS).
    this.preferredVoice =
      enVoices.find((v) => /samantha|karen|daniel|moira/i.test(v.name)) ??
      enVoices.find((v) => v.localService) ??
      enVoices[0] ??
      null;
    return this.preferredVoice;
  }

  speak(text: string, _opts?: TtsUtteranceOptions): Promise<void> {
    return new Promise((resolve) => {
      if (!this.isSupported()) return resolve();
      const clean = text.replace(/\[.*?\]/g, "").trim();
      if (!clean) return resolve();
      const utterance = new SpeechSynthesisUtterance(clean);
      const voice = this.pickVoice();
      if (voice) utterance.voice = voice;
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.cancel(); // don't stack utterances
      window.speechSynthesis.speak(utterance);
    });
  }

  cancel(): void {
    if (this.isSupported()) window.speechSynthesis.cancel();
  }
}

let _engine: VoiceEngine | null = null;

/** The app-wide voice engine. Swap the implementation here, nowhere else. */
export function getVoiceEngine(): VoiceEngine {
  if (!_engine) _engine = { stt: new WebSpeechStt(), tts: new WebSpeechTts() };
  return _engine;
}

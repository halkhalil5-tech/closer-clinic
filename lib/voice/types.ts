/**
 * Voice is isolated behind these interfaces so the Web Speech API default can
 * be swapped for hosted STT (Whisper-style) and TTS (e.g. ElevenLabs) later
 * without touching the encounter UI. See web-speech.ts for the default impl.
 */

export interface SttHandlers {
  /** Live partial transcription while the user is talking. */
  onInterim(text: string): void;
  /** Committed transcription segment. */
  onFinal(text: string): void;
  onError(message: string): void;
  /** The engine stopped on its own (silence timeout, permission loss). */
  onEnd(): void;
}

export interface SttSession {
  /** Stop listening and flush any pending final result. */
  stop(): void;
  /** Abort without a final result. */
  cancel(): void;
}

export interface SpeechToText {
  isSupported(): boolean;
  start(handlers: SttHandlers): SttSession;
}

export interface TtsUtteranceOptions {
  /** Rough patient profile so an impl can pick an appropriate voice. */
  age?: number;
  name?: string;
}

export interface TextToSpeech {
  isSupported(): boolean;
  speak(text: string, opts?: TtsUtteranceOptions): Promise<void>;
  cancel(): void;
  /**
   * Optional: call from inside a user gesture (mic tap, send tap) so mobile
   * Safari lets later async playback start. No-op where not needed.
   */
  prime?(): void;
}

export interface VoiceEngine {
  stt: SpeechToText;
  tts: TextToSpeech;
}

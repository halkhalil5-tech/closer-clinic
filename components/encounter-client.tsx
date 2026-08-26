"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Mic, Send, Square, Volume2, VolumeX } from "lucide-react";
import type { Difficulty, PersonaSnapshot } from "@/lib/types";
import { buildVoiceEngine, type VoiceCaps } from "@/lib/voice/engine";
import { isAudioPrimed } from "@/lib/voice/elevenlabs-client";
import type { SttSession } from "@/lib/voice/types";
import { SessionVisualizer, type VisualizerMode } from "@/components/session-visualizer";
import { ReceptivityGauge } from "@/components/receptivity-gauge";

interface ChatMessage {
  role: "provider" | "patient";
  text: string;
}

interface Props {
  encounterId: string;
  /** ISO UTC creation time from the encounter record; missing → mount-time clock. */
  startedAt?: string;
  persona: PersonaSnapshot;
  scenario: {
    title: string;
    priceDisplay: string;
    patientCc: string;
    clinicalContext: string;
    closeGoal: string;
  };
  difficulty: Difficulty;
  initialMessages: ChatMessage[];
  initialTurnsUsed: number;
  initialReceptivity?: number | null;
  maxTurns: number;
  voiceCaps: VoiceCaps;
}

const VOICE_PREF_KEY = "closer-clinic:patient-voice";

const DIFF_COLOR: Record<Difficulty, string> = {
  easy: "text-dim",
  moderate: "text-amber",
  hard: "text-red",
};

type MicState = "idle" | "recording" | "transcribing";

export function EncounterClient({
  encounterId,
  startedAt,
  persona,
  scenario,
  difficulty,
  initialMessages,
  initialTurnsUsed,
  initialReceptivity = null,
  maxTurns,
  voiceCaps,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [turnsUsed, setTurnsUsed] = useState(initialTurnsUsed);
  const [draft, setDraft] = useState("");
  const [interim, setInterim] = useState("");
  const [micState, setMicState] = useState<MicState>("idle");
  const [sending, setSending] = useState(false);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nudged, setNudged] = useState(initialTurnsUsed >= 12);
  const [receptivity, setReceptivity] = useState<number | null>(initialReceptivity);
  const [chartOpen, setChartOpen] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [sttSupported, setSttSupported] = useState(true);
  // Visual-only: is the patient's voice currently playing?
  const [speaking, setSpeaking] = useState(false);
  // Visual-only: session clock, anchored to the encounter's real start time
  // so a refresh mid-session keeps true elapsed time. Encounters without a
  // parseable startedAt fall back to counting from mount.
  const [clockAnchor] = useState(() => {
    const t = startedAt ? Date.parse(startedAt) : NaN;
    return Number.isFinite(t) ? t : Date.now();
  });
  const [elapsed, setElapsed] = useState(() =>
    Math.max(0, Math.floor((Date.now() - clockAnchor) / 1000))
  );

  const engine = useMemo(
    () => buildVoiceEngine(encounterId, voiceCaps),
    [encounterId, voiceCaps]
  );

  const sttRef = useRef<SttSession | null>(null);
  const draftRef = useRef("");
  const autoSendRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  useEffect(() => {
    setSttSupported(engine.stt.isSupported());
    const saved = localStorage.getItem(VOICE_PREF_KEY);
    if (saved !== null) setVoiceOn(saved === "on");
  }, [engine]);

  useEffect(() => {
    const t = setInterval(
      () => setElapsed(Math.max(0, Math.floor((Date.now() - clockAnchor) / 1000))),
      1000
    );
    return () => clearInterval(t);
  }, [clockAnchor]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, interim, micState]);

  /** Speak a patient line while tracking the visual speaking state. */
  const speakLine = useCallback(
    (text: string) => {
      setSpeaking(true);
      engine.tts
        .speak(text, { age: persona.age, name: persona.name })
        .finally(() => setSpeaking(false));
    },
    [engine, persona.age, persona.name]
  );

  // Browsers block audio until the page sees a real user gesture, so the
  // opener is spoken on the first pointer/key input — which also unlocks
  // playback for every later patient line.
  const spokeOpener = useRef(false);
  const voiceOnRef = useRef(voiceOn);
  const messagesRef = useRef(messages);
  useEffect(() => {
    voiceOnRef.current = voiceOn;
    messagesRef.current = messages;
  }, [voiceOn, messages]);
  useEffect(() => {
    const speakOpener = () => {
      engine.tts.prime?.();
      if (spokeOpener.current || !voiceOnRef.current) return;
      const msgs = messagesRef.current;
      if (msgs.length === 1 && msgs[0].role === "patient") {
        spokeOpener.current = true;
        speakLine(msgs[0].text);
      }
    };
    // Audio already unlocked by the "begin rep" tap (same document) — speak now.
    if (isAudioPrimed()) {
      speakOpener();
      return;
    }
    const unlock = () => {
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
      speakOpener();
    };
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
    return () => {
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
    };
  }, [engine, speakLine]);

  useEffect(() => {
    return () => {
      sttRef.current?.cancel();
      engine.tts.cancel();
    };
  }, [engine]);

  function toggleVoice() {
    const next = !voiceOn;
    setVoiceOn(next);
    localStorage.setItem(VOICE_PREF_KEY, next ? "on" : "off");
    if (!next) {
      engine.tts.cancel();
      setSpeaking(false);
    }
  }

  const sendTurn = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || sending || grading) return;
      engine.tts.prime?.(); // still inside the send gesture — keep playback unlocked
      setError(null);
      setSending(true);
      setDraft("");
      setInterim("");
      setMessages((m) => [...m, { role: "provider", text: clean }]);
      try {
        const res = await fetch(`/api/encounters/${encounterId}/turn`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: clean }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (data.turnCapReached) {
            setTurnsUsed(maxTurns);
            setError(data.error);
          } else {
            setMessages((m) => m.slice(0, -1));
            setDraft(clean);
            setError(data.error || "Something went wrong. Try again.");
          }
          return;
        }
        setMessages((m) => [...m, { role: "patient", text: data.patient }]);
        if (typeof data.receptivity === "number") setReceptivity(data.receptivity);
        setTurnsUsed(data.providerTurns);
        if (data.nudged) setNudged(true);
        if (voiceOn) {
          speakLine(data.patient);
        }
      } catch {
        setMessages((m) => m.slice(0, -1));
        setDraft(clean);
        setError("Network hiccup — your line is saved below. Try sending again.");
      } finally {
        setSending(false);
      }
    },
    [encounterId, sending, grading, voiceOn, speakLine, maxTurns, engine]
  );

  function startListening() {
    if (micState !== "idle" || sending) return;
    engine.tts.cancel();
    setSpeaking(false);
    engine.tts.prime?.(); // unlock playback while we're in a user gesture
    setError(null);
    setMicState("recording");
    setInterim("");
    autoSendRef.current = false;
    sttRef.current = engine.stt.start({
      onInterim: (text) => setInterim(text),
      onFinal: (text) => {
        setDraft((d) => (d ? `${d} ${text}` : text));
        setInterim("");
      },
      onError: (message) => setError(message),
      onEnd: () => {
        sttRef.current = null;
        setInterim("");
        setMicState("idle");
        // Tap-to-send: fire once the engine has flushed its final transcript.
        if (autoSendRef.current) {
          autoSendRef.current = false;
          const text = draftRef.current.trim();
          if (text) {
            // sendTurn reads fresh state via refs/closures; defer a tick so
            // the draft state update from onFinal has committed.
            setTimeout(() => sendTurn(draftRef.current), 0);
          }
        }
      },
    });
  }

  function stopAndSend() {
    if (micState !== "recording") return;
    autoSendRef.current = true;
    setMicState("transcribing");
    sttRef.current?.stop();
  }

  async function endAndGrade() {
    if (grading) return;
    sttRef.current?.cancel();
    engine.tts.cancel();
    setSpeaking(false);
    setGrading(true);
    setError(null);
    try {
      const res = await fetch(`/api/encounters/${encounterId}/grade`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Grading failed. Try again.");
      router.push(`/scorecard/${encounterId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Grading failed. Try again.");
      setGrading(false);
    }
  }

  const turnsLeft = maxTurns - turnsUsed;
  const capReached = turnsLeft <= 0;
  const hasSpoken = messages.some((m) => m.role === "provider");
  const recording = micState === "recording";
  const transcribing = micState === "transcribing";
  const mode: VisualizerMode = recording ? "listening" : speaking ? "patient" : "idle";
  const clock = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;

  return (
    <div className="session-dark mx-auto flex h-dvh w-full max-w-md flex-col">
      {/* session header: scenario + clock in quiet muted text, one End action */}
      <header className="pt-[env(safe-area-inset-top)]">
        <div className="flex items-center justify-between gap-3 px-4 pt-3">
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-medium text-muted">{scenario.title}</div>
            <div className="font-mono text-[11px] tabular-nums text-faint" suppressHydrationWarning>
              {clock} · <span className={DIFF_COLOR[difficulty]}>{difficulty}</span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={toggleVoice}
              aria-label={voiceOn ? "Turn patient voice off" : "Turn patient voice on"}
              className={`rounded-lg border p-2 transition-colors duration-150 ${
                voiceOn ? "border-white/20 text-success" : "border-white/10 text-faint"
              }`}
            >
              {voiceOn ? (
                <Volume2 className="h-5 w-5" strokeWidth={1.5} />
              ) : (
                <VolumeX className="h-5 w-5" strokeWidth={1.5} />
              )}
            </button>
            <button
              onClick={endAndGrade}
              disabled={grading || !hasSpoken}
              className="rounded-lg border border-white/20 px-3.5 py-2 text-[13px] font-medium text-ink transition-colors duration-150 hover:bg-white/5 disabled:opacity-40"
            >
              {grading ? "Grading…" : "End session"}
            </button>
          </div>
        </div>

        {/* patient chart strip */}
        <button
          onClick={() => setChartOpen((v) => !v)}
          className="mt-2 flex w-full items-center justify-between gap-2 border-y border-white/10 px-4 py-2 text-left"
        >
          <span className="min-w-0 truncate">
            <span className="display-title text-[15px] text-bone">{persona.name}</span>
            <span className="text-[12.5px] text-muted">
              {" "}· {persona.age}
              {persona.gender ? persona.gender.toUpperCase() : ""} · {scenario.priceDisplay}
            </span>
          </span>
          <ChevronDown
            className={`h-5 w-5 shrink-0 text-muted transition-transform duration-150 ${chartOpen ? "rotate-180" : ""}`}
            strokeWidth={1.5}
          />
        </button>
        {chartOpen && (
          <div className="border-b border-white/10 px-4 py-3 text-[13px] leading-snug">
            <div className="grid grid-cols-[52px_1fr] gap-x-2 gap-y-1.5">
              <span className="microlabel pt-0.5">PT</span>
              <span className="text-dim">{persona.occupation} · {persona.insurance}</span>
              <span className="microlabel pt-0.5">CC</span>
              <span className="text-dim">&ldquo;{scenario.patientCc}&rdquo;</span>
              <span className="microlabel pt-0.5">HX</span>
              <span className="text-dim">{scenario.clinicalContext}</span>
              <span className="microlabel pt-0.5 text-bone">Goal</span>
              <span className="text-ink">{scenario.closeGoal}</span>
            </div>
          </div>
        )}

        {/* receptivity — Easy/Moderate only; Hard makes you read the room */}
        {difficulty !== "hard" && receptivity !== null && <ReceptivityGauge value={receptivity} />}
        {difficulty === "hard" && (
          <div className="px-4 py-1.5 text-right font-mono text-[9px] font-semibold uppercase tracking-[0.3em] text-faint">
            Read the room
          </div>
        )}
      </header>

      {/* the orb: live while either side is speaking, breathing when quiet */}
      <div className="relative h-24 shrink-0">
        <SessionVisualizer mode={mode} />
        {(recording || speaking) && (
          <span className="absolute bottom-1 left-1/2 -translate-x-1/2 font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-success">
            {recording ? "Listening" : "Patient speaking"}
          </span>
        )}
      </div>

      {/* Thread */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
        <div className="flex flex-col gap-2.5">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[88%] rounded-xl px-3.5 py-2.5 text-[14px] leading-snug ${
                m.role === "provider"
                  ? "self-end bg-[#12454f] text-ink"
                  : "self-start border border-white/10 text-ink"
              }`}
            >
              {m.text}
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 self-start rounded-xl border border-white/10 px-3.5 py-2.5">
              <span className="microlabel">Patient responding</span>
              <span className="flex gap-1">
                <span className="respond-dot h-1 w-1 rounded-full bg-dim" />
                <span className="respond-dot h-1 w-1 rounded-full bg-dim" />
                <span className="respond-dot h-1 w-1 rounded-full bg-dim" />
              </span>
            </div>
          )}
          {nudged && !capReached && (
            <div className="self-center rounded-full border border-amber/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber">
              Patient glances at the clock
            </div>
          )}
          {capReached && (
            <div className="self-center rounded-full border border-red/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-red">
              Visit over — end &amp; grade
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mx-4 mb-2 rounded-lg border border-red/50 bg-red/10 p-2.5 text-[13px] text-ink">
          {error}
        </div>
      )}

      {/* Composer — thumb-first: one large action on the right */}
      <div className="border-t border-white/10 px-4 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2.5">
        {(interim || recording || transcribing) && (
          <div className="mb-1.5 flex min-h-4 items-center gap-2">
            {recording && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />}
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              {transcribing ? "Transcribing" : interim || "Listening — tap again to send"}
            </span>
          </div>
        )}
        <div className="flex items-end gap-2.5">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendTurn(draft);
              }
            }}
            placeholder={capReached ? "The visit is over." : "Talk to your patient…"}
            rows={1}
            disabled={capReached || grading || transcribing}
            className="max-h-28 min-h-12 flex-1 resize-none rounded-xl border border-white/15 bg-white/5 px-3.5 py-3 text-[14px] text-ink placeholder:text-faint focus:border-success/60 focus:outline-none disabled:opacity-50"
          />
          {sttSupported && !capReached ? (
            recording ? (
              <button
                onClick={stopAndSend}
                aria-label="Stop and send"
                className="mic-live flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-success text-[#06282e]"
              >
                <Square className="h-5 w-5" strokeWidth={1.5} fill="currentColor" />
              </button>
            ) : draft.trim() ? (
              <button
                onClick={() => sendTurn(draft)}
                disabled={sending || grading}
                aria-label="Send"
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-white text-[#0a3540] disabled:opacity-50"
              >
                <Send className="h-5 w-5" strokeWidth={1.5} />
              </button>
            ) : (
              <button
                onClick={startListening}
                disabled={sending || grading || transcribing}
                aria-label="Tap to talk"
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-2 border-success text-success disabled:opacity-50"
              >
                <Mic className="h-6 w-6" strokeWidth={1.5} />
              </button>
            )
          ) : (
            !capReached && (
              <button
                onClick={() => sendTurn(draft)}
                disabled={sending || grading || !draft.trim()}
                aria-label="Send"
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-white text-[#0a3540] disabled:opacity-40"
              >
                <Send className="h-5 w-5" strokeWidth={1.5} />
              </button>
            )
          )}
          {capReached && (
            <button
              onClick={endAndGrade}
              disabled={grading}
              className="display h-12 shrink-0 rounded-xl bg-white px-4 text-[14px] tracking-tight text-[#0a3540] disabled:opacity-60"
            >
              {grading ? "Grading…" : "End & grade"}
            </button>
          )}
        </div>
        <div className="mt-1.5 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-faint">
          {capReached ? "Turn limit reached" : `${turnsLeft} turn${turnsLeft === 1 ? "" : "s"} left`}
        </div>
      </div>
    </div>
  );
}

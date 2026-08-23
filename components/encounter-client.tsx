"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty, PersonaSnapshot } from "@/lib/types";
import { buildVoiceEngine, type VoiceCaps } from "@/lib/voice/engine";
import type { SttSession } from "@/lib/voice/types";

interface ChatMessage {
  role: "provider" | "patient";
  text: string;
}

interface Props {
  encounterId: string;
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
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, interim, micState]);

  // Speak the opener once (mobile Safari may hold audio until first gesture).
  const spokeOpener = useRef(false);
  useEffect(() => {
    if (!spokeOpener.current && voiceOn && messages.length > 0) {
      spokeOpener.current = true;
      const last = messages[messages.length - 1];
      if (last.role === "patient") {
        engine.tts.speak(last.text, { age: persona.age, name: persona.name });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceOn]);

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
    if (!next) engine.tts.cancel();
  }

  const sendTurn = useCallback(
    async (text: string) => {
      const clean = text.trim();
      if (!clean || sending || grading) return;
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
          engine.tts.speak(data.patient, { age: persona.age, name: persona.name });
        }
      } catch {
        setMessages((m) => m.slice(0, -1));
        setDraft(clean);
        setError("Network hiccup — your line is saved below. Try sending again.");
      } finally {
        setSending(false);
      }
    },
    [encounterId, sending, grading, voiceOn, persona.age, persona.name, maxTurns, engine]
  );

  function startListening() {
    if (micState !== "idle" || sending) return;
    engine.tts.cancel();
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

  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col">
      {/* EMR header strip: dense, monospace, color-coded fields */}
      <header className="border-b border-line bg-panel pt-[env(safe-area-inset-top)]">
        <div className="flex items-stretch justify-between gap-2 px-3 py-2">
          <button onClick={() => setChartOpen((v) => !v)} className="min-w-0 text-left">
            <div className="flex items-center gap-1.5 font-mono text-[13px] font-semibold text-ink">
              <span className="truncate">
                {persona.name.toUpperCase()}
                <span className="text-muted"> · {persona.age}{persona.gender ? persona.gender.toUpperCase() : ""}</span>
              </span>
              <svg
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                className={`h-3.5 w-3.5 shrink-0 text-muted transition-transform ${chartOpen ? "rotate-180" : ""}`}
              >
                <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="mt-0.5 flex flex-wrap gap-x-2.5 gap-y-0.5 font-mono text-[10px] tracking-tight text-muted">
              <span>INS <span className="text-dim">{persona.insurance}</span></span>
              <span>FEE <span className="text-bone">{scenario.priceDisplay}</span></span>
              <span className={`font-semibold ${DIFF_COLOR[difficulty]}`}>{difficulty.toUpperCase()}</span>
            </div>
          </button>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={toggleVoice}
              aria-label={voiceOn ? "Turn patient voice off" : "Turn patient voice on"}
              className={`border p-2 transition-colors ${
                voiceOn ? "border-mint/60 text-mint" : "border-line text-faint"
              }`}
            >
              {voiceOn ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                  <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
                  <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4">
                  <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
                  <path d="m16 9 5 5m0-5-5 5" strokeLinecap="round" />
                </svg>
              )}
            </button>
            <button
              onClick={endAndGrade}
              disabled={grading || !hasSpoken}
              className="display border border-line-strong bg-panel-2 px-3 py-2 text-[11px] tracking-wide text-ink transition-colors disabled:opacity-40"
            >
              {grading ? "Grading" : "End & grade"}
            </button>
          </div>
        </div>
        {chartOpen && (
          <div className="border-t border-line px-3 py-2.5 font-mono text-[12px] leading-snug">
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
      </header>

      {/* Thread */}
      <div className="relative flex min-h-0 flex-1">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 pr-6">
        <div className="flex flex-col gap-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[88%] border px-3 py-2 text-[14px] leading-snug ${
                m.role === "provider"
                  ? "raised self-end border-line-strong text-ink"
                  : "self-start border-line bg-panel text-ink"
              }`}
            >
              {m.text}
            </div>
          ))}
          {sending && (
            <div className="flex items-center gap-2 self-start border border-line bg-panel px-3 py-2">
              <span className="microlabel">Patient responding</span>
              <span className="flex gap-1">
                <span className="respond-dot h-1 w-1 rounded-full bg-dim" />
                <span className="respond-dot h-1 w-1 rounded-full bg-dim" />
                <span className="respond-dot h-1 w-1 rounded-full bg-dim" />
              </span>
            </div>
          )}
          {nudged && !capReached && (
            <div className="self-center border border-amber/40 bg-amber/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-amber">
              Patient glances at the clock
            </div>
          )}
          {capReached && (
            <div className="self-center border border-red/40 bg-red/5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-red">
              Visit over — end &amp; grade
            </div>
          )}
        </div>
      </div>

      {/* receptivity gauge — Easy/Moderate only; Hard makes you read the room */}
      <div className="pointer-events-none absolute inset-y-0 right-1 flex items-center">
        {difficulty === "hard" ? (
          <span
            className="font-mono text-[8px] font-semibold uppercase tracking-[0.3em] text-faint"
            style={{ writingMode: "vertical-rl" }}
          >
            Read the room
          </span>
        ) : (
          receptivity !== null && (
            <div className="flex h-44 w-1 items-end overflow-hidden rounded-full bg-line/60">
              <div
                className={`w-full rounded-full transition-all duration-[400ms] ease-out ${
                  receptivity > 70 ? "bg-mint" : receptivity < 35 ? "bg-amber" : "bg-bone"
                }`}
                style={{ height: `${receptivity}%` }}
              />
            </div>
          )
        )}
      </div>
      </div>

      {error && (
        <div className="mx-3 mb-2 border border-red/50 bg-red/5 p-2.5 text-[13px] text-red">
          {error}
        </div>
      )}

      {/* Composer */}
      <div className="border-t border-line bg-panel px-3 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2.5">
        {(interim || recording || transcribing) && (
          <div className="mb-1.5 flex min-h-4 items-center gap-2">
            {recording && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red" />}
            <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
              {transcribing ? "Transcribing" : interim || "Listening — tap again to send"}
            </span>
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendTurn(draft);
              }
            }}
            placeholder={capReached ? "The visit is over." : "Talk to your patient..."}
            rows={1}
            disabled={capReached || grading || transcribing}
            className="max-h-28 min-h-11 flex-1 resize-none border border-line bg-bg px-3 py-2.5 text-[14px] text-ink placeholder:text-muted focus:border-mint focus:outline-none disabled:opacity-50"
          />
          {sttSupported && !capReached ? (
            recording ? (
              <button
                onClick={stopAndSend}
                aria-label="Stop and send"
                className="mic-live flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-mint text-mint-ink"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
              </button>
            ) : draft.trim() ? (
              <button
                onClick={() => sendTurn(draft)}
                disabled={sending || grading}
                aria-label="Send"
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-mint text-mint-ink disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                  <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            ) : (
              <button
                onClick={startListening}
                disabled={sending || grading || transcribing}
                aria-label="Tap to talk"
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-2 border-mint bg-panel text-mint disabled:opacity-50"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
                  <rect x="9" y="3" width="6" height="11" rx="3" />
                  <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
                </svg>
              </button>
            )
          ) : (
            !capReached && (
              <button
                onClick={() => sendTurn(draft)}
                disabled={sending || grading || !draft.trim()}
                aria-label="Send"
                className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full bg-mint text-mint-ink disabled:opacity-40"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
                  <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )
          )}
          {capReached && (
            <button
              onClick={endAndGrade}
              disabled={grading}
              className="display h-11 shrink-0 bg-mint px-4 text-[13px] tracking-wide text-mint-ink disabled:opacity-60"
            >
              {grading ? "Grading" : "End & grade"}
            </button>
          )}
        </div>
        <div className="mt-1.5 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
          {capReached ? "Turn limit reached" : `${turnsLeft} turn${turnsLeft === 1 ? "" : "s"} left`}
        </div>
      </div>
    </div>
  );
}

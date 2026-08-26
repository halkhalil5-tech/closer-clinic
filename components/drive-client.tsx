"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { buildVoiceEngine, type VoiceCaps } from "@/lib/voice/engine";
import { primeAudio } from "@/lib/voice/elevenlabs-client";
import type { SttSession } from "@/lib/voice/types";

interface ScenarioLite {
  slug: string;
  title: string;
  price: string;
}

type Phase = "pick" | "connecting" | "patient" | "listen" | "sending" | "grading" | "summary";

interface Summary {
  closed: boolean;
  total: number;
  drill: string;
}

/**
 * Hands-free voice rep. The loop: patient speaks → mic opens → your words
 * auto-send when you stop talking (or tap once to send) → repeat. Ends with
 * a spoken score summary.
 */
export function DriveClient({
  scenarios,
  voiceCaps,
}: {
  scenarios: ScenarioLite[];
  voiceCaps: VoiceCaps;
}) {
  const [phase, setPhase] = useState<Phase>("pick");
  const [scenario, setScenario] = useState(scenarios[0]?.slug ?? "");
  const [encounterId, setEncounterId] = useState<string | null>(null);
  const [lastPatientLine, setLastPatientLine] = useState("");
  const [interim, setInterim] = useState("");
  const [turns, setTurns] = useState(0);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const engineRef = useRef<ReturnType<typeof buildVoiceEngine> | null>(null);
  const sttRef = useRef<SttSession | null>(null);
  const draftRef = useRef("");
  const activeRef = useRef(true);
  const encounterRef = useRef<string | null>(null);

  useEffect(() => {
    activeRef.current = true;
    return () => {
      activeRef.current = false;
      sttRef.current?.cancel();
      engineRef.current?.tts.cancel();
    };
  }, []);

  async function speak(text: string) {
    setLastPatientLine(text);
    setPhase("patient");
    try {
      await engineRef.current?.tts.speak(text, {});
    } catch {
      /* silent TTS failure — keep the loop moving */
    }
  }

  function listen() {
    if (!activeRef.current) return;
    setPhase("listen");
    setInterim("");
    draftRef.current = "";
    const engine = engineRef.current;
    if (!engine || !engine.stt.isSupported()) {
      setError("Voice input isn't available on this device — drive mode needs a mic.");
      setPhase("pick");
      return;
    }
    sttRef.current = engine.stt.start({
      onInterim: (t) => setInterim(t),
      onFinal: (t) => {
        draftRef.current = draftRef.current ? `${draftRef.current} ${t}` : t;
        setInterim(draftRef.current);
      },
      onError: () => {},
      onEnd: () => {
        sttRef.current = null;
        const text = draftRef.current.trim();
        if (!activeRef.current) return;
        if (text) void sendTurn(text);
        else listen(); // silence — reopen the mic, stay hands-free
      },
    });
  }

  /** Big-surface tap while listening: flush the mic and send now. */
  function tapToSend() {
    if (phase === "listen") sttRef.current?.stop();
  }

  async function sendTurn(text: string) {
    const id = encounterRef.current;
    if (!id) return;
    setPhase("sending");
    try {
      const res = await fetch(`/api/encounters/${id}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.turnCapReached) return void endAndGrade();
        throw new Error(data.error || "Connection hiccup.");
      }
      setTurns(data.providerTurns);
      await speak(data.patient);
      listen();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection hiccup.");
      listen();
    }
  }

  async function start() {
    // Unlock audio synchronously, while we're still inside the tap gesture —
    // after the awaits below the browser no longer counts this as user input.
    primeAudio();
    setError(null);
    setPhase("connecting");
    try {
      const res = await fetch("/api/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioSlug: scenario, difficulty: "moderate" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't start.");
      setEncounterId(data.encounterId);
      encounterRef.current = data.encounterId;
      engineRef.current = buildVoiceEngine(data.encounterId, voiceCaps);
      engineRef.current.tts.prime?.();
      await speak(data.patient ?? "Hi doc.");
      listen();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start.");
      setPhase("pick");
    }
  }

  async function endAndGrade() {
    const id = encounterRef.current;
    if (!id) return;
    sttRef.current?.cancel();
    engineRef.current?.tts.cancel();
    setPhase("grading");
    try {
      const res = await fetch(`/api/encounters/${id}/grade`, { method: "POST" });
      if (!res.ok) throw new Error("Grading failed — your rep is saved.");
      const g = await fetch(`/api/encounters/${id}/grade`).then((r) => r.json());
      const s: Summary = { closed: g.closed, total: g.total, drill: g.drill };
      setSummary(s);
      setPhase("summary");
      await engineRef.current?.tts.speak(
        `${s.closed ? "Closed." : "No close."} You scored ${s.total} out of one hundred. Next rep drill: ${s.drill}`,
        {}
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Grading failed.");
      setPhase("listen");
      listen();
    }
  }

  /* ----------------------------------- UI ----------------------------------- */

  if (phase === "pick") {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <div className="flex items-center justify-between">
          <span className="microlabel">Drive mode</span>
          <Link href="/home" className="py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
            Exit ✕
          </Link>
        </div>
        <h1 className="display mt-4 text-[28px] leading-tight text-bone">
          Windshield
          <br />
          time is rep time
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-dim">
          Full-voice encounter, zero screen taps. The patient talks, you talk,
          your words send when you pause. Score read aloud at the end. Eyes on
          the road.
        </p>

        <div className="mt-5">
          <div className="microlabel">Station</div>
          <select
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            className="mt-1.5 w-full border border-line bg-panel px-3 py-2.5 text-[14px] text-ink focus:border-primary focus:outline-none"
          >
            {scenarios.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title} — {s.price}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="mt-3 text-sm text-red">{error}</p>}
        <div className="mt-auto pt-6">
          <button
            onClick={start}
            className="display w-full rounded-card bg-primary py-4 text-[16px] tracking-wide text-white"
          >
            Start voice rep
          </button>
          <p className="mt-2 text-center text-[11px] text-muted">
            Moderate difficulty · audio only · tap once anytime to send early
          </p>
        </div>
      </main>
    );
  }

  if (phase === "summary" && summary) {
    return (
      <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-4 pb-8 text-center">
        <div className="microlabel">Spoken summary</div>
        <div className="mt-4 font-mono text-[72px] font-semibold leading-none tabular-nums text-bone">
          {summary.total}
        </div>
        <div className={`display mt-2 text-[18px] ${summary.closed ? "text-success" : "text-red"}`}>
          {summary.closed ? "Closed ✓" : "No close"}
        </div>
        <p className="mt-3 max-w-[36ch] text-[13.5px] leading-relaxed text-dim">{summary.drill}</p>
        <div className="mt-8 flex w-full flex-col gap-2">
          <Link
            href={`/scorecard/${encounterId}`}
            className="display w-full rounded-card bg-primary py-3.5 text-center text-[15px] tracking-wide text-white"
          >
            View the full chart
          </Link>
          <button
            onClick={() => {
              setSummary(null);
              setTurns(0);
              void start();
            }}
            className="display w-full rounded-card border border-line-strong py-3 text-[13px] tracking-wide text-bone"
          >
            Another patient
          </button>
        </div>
      </main>
    );
  }

  const statusLabel =
    phase === "connecting"
      ? "Prepping the room"
      : phase === "patient"
        ? "Patient speaking"
        : phase === "listen"
          ? "Your turn — listening"
          : phase === "sending"
            ? "Patient thinking"
            : "Grading";

  return (
    <main
      onClick={tapToSend}
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-[calc(env(safe-area-inset-top)+1rem)]"
    >
      <div className="flex items-center justify-between">
        <span className="microlabel">Drive mode · turn {turns}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            void endAndGrade();
          }}
          className="display border border-line-strong bg-panel-2 px-3 py-2 text-[11px] tracking-wide text-ink"
        >
          End &amp; grade
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div
          className={`flex h-40 w-40 items-center justify-center rounded-full border-2 ${
            phase === "listen"
              ? "mic-live border-success text-success"
              : phase === "patient"
                ? "border-bone text-bone"
                : "border-line-strong text-muted"
          }`}
        >
          {phase === "listen" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-12 w-12">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
            </svg>
          ) : phase === "patient" ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-12 w-12">
              <path d="M11 5 6 9H3v6h3l5 4V5Z" strokeLinejoin="round" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12" strokeLinecap="round" />
            </svg>
          ) : (
            <span className="flex gap-1.5">
              <span className="respond-dot h-2 w-2 rounded-full bg-dim" />
              <span className="respond-dot h-2 w-2 rounded-full bg-dim" />
              <span className="respond-dot h-2 w-2 rounded-full bg-dim" />
            </span>
          )}
        </div>
        <div className="microlabel mt-6">{statusLabel}</div>
        <p className="mt-4 min-h-12 max-w-[38ch] text-center text-[14px] leading-relaxed text-dim">
          {phase === "listen" && interim ? interim : phase === "patient" ? `“${lastPatientLine}”` : ""}
        </p>
        {error && <p className="mt-2 text-center text-[13px] text-red">{error}</p>}
      </div>

      <p className="pb-1 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
        {phase === "listen" ? "Pause to send · tap anywhere to send now" : " "}
      </p>
    </main>
  );
}

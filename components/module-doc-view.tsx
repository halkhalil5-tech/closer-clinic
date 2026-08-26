"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ModuleDoc, TrainingLesson } from "@/lib/types";
import { PairPlayer } from "@/components/pair-player";
import { QUIZ_PASS_PCT } from "@/lib/types";
import { buildVoiceEngine, type VoiceCaps } from "@/lib/voice/engine";
import { primeAudio } from "@/lib/voice/elevenlabs-client";
import type { SttSession } from "@/lib/voice/types";

/** Same per-device preference the encounter room uses. */
const VOICE_PREF_KEY = "closer-clinic:patient-voice";

/* ------------------------------ tiny helpers ------------------------------ */

/** Content strings may carry their own curly quotes; normalize before the
 *  component adds its display quoting. */
function unquote(s: string): string {
  return s.replace(/^[“"]/, "").replace(/[”"]$/, "");
}

function Bold({ text }: { text: string }) {
  const parts = text.split(/\*\*(.+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-semibold text-bone">
            {p}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="microlabel">{children}</div>;
}

/** Expandable disclosure row in the house style. */
function Disclosure({
  id,
  title,
  meta,
  children,
  defaultOpen = false,
}: {
  id?: string;
  title: string;
  meta?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);

  // Deep links (#section-id) open and scroll to the target disclosure —
  // on mount AND on hash-only navigation (which doesn't remount the page).
  // Deferred so the reveal is an async update, not render-cascading.
  useEffect(() => {
    if (!id || typeof window === "undefined") return;
    let t: ReturnType<typeof setTimeout> | undefined;
    const maybeReveal = () => {
      if (window.location.hash !== `#${id}`) return;
      t = setTimeout(() => {
        setOpen(true);
        ref.current?.scrollIntoView({ block: "start", behavior: "smooth" });
      }, 150);
    };
    maybeReveal();
    window.addEventListener("hashchange", maybeReveal);
    return () => {
      window.removeEventListener("hashchange", maybeReveal);
      if (t) clearTimeout(t);
    };
  }, [id]);

  return (
    <div ref={ref} id={id} className="scroll-mt-4 border-b border-hairline">
      <button
        onClick={() => setOpen(!open)}
        className="flex min-h-[44px] w-full items-center gap-2.5 py-3 text-left"
      >
        <svg
          viewBox="0 0 16 16"
          className={`h-3 w-3 shrink-0 text-muted transition-transform ${open ? "rotate-90" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 3.5 4.5 4.5L6 12.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="min-w-0 flex-1 text-[14px] font-semibold text-ink">{title}</span>
        {meta && <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted">{meta}</span>}
      </button>
      {open && <div className="pb-4 pl-5">{children}</div>}
    </div>
  );
}

/* --------------------------------- view --------------------------------- */

interface Props {
  doc: ModuleDoc;
  lesson: TrainingLesson;
  moduleTitle: string;
  initial: { quizScore: number | null; drillPassed: boolean | null };
  next: { slug: string; title: string; order: number } | null;
  voiceCaps: VoiceCaps;
  /** Modules 2–5: the Listen pair demonstrating this module's framework. */
  listen?: { stationSlug: string; moduleFocus: string } | null;
}

export function ModuleDocView({ doc, lesson, moduleTitle, initial, next, voiceCaps, listen }: Props) {
  const router = useRouter();
  const checkPassed = (initial.quizScore ?? 0) >= QUIZ_PASS_PCT;
  const moduleComplete = checkPassed && (!lesson.drill || initial.drillPassed === true);

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* learning objectives */}
      <section>
        <SectionLabel>You&apos;ll be able to</SectionLabel>
        <ul className="mt-1.5 flex flex-col gap-1.5">
          {doc.objectives.map((o, i) => (
            <li key={i} className="flex gap-2.5 text-[13.5px] leading-snug text-dim">
              <span className="mt-0.5 font-mono text-[11px] font-semibold text-bone">{i + 1}</span>
              {o}
            </li>
          ))}
        </ul>
      </section>

      {/* core concept */}
      <section>
        <SectionLabel>Core concept</SectionLabel>
        <div className="mt-1 flex flex-col gap-5">
          {doc.concept.map((c) => (
            <div key={c.id} id={c.id} className="scroll-mt-4">
              <h2 className="display-title text-[16px] text-bone">{c.title}</h2>
              {c.body.split("\n\n").map((p, i) => (
                <p key={i} className="mt-2 text-[14px] leading-relaxed text-dim">
                  <Bold text={p} />
                </p>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* word-for-word */}
      <section>
        <SectionLabel>Word-for-word</SectionLabel>
        <div className="mt-1">
          {doc.scripts.map((g) => (
            <Disclosure key={g.id} id={g.id} title={g.title} meta={`${g.lines.length} lines`}>
              {g.context && <p className="mb-3 text-[12.5px] italic leading-snug text-ink/60">{g.context}</p>}
              <div className="flex flex-col gap-3.5">
                {g.lines.map((l, i) => (
                  <div key={i} className="border-l-2 border-l-bone pl-3">
                    <p className="text-[14px] leading-snug text-ink">{l.line}</p>
                    <p className="mt-1 text-[12px] leading-snug text-muted">{l.why}</p>
                  </div>
                ))}
              </div>
            </Disclosure>
          ))}
        </div>
      </section>

      {/* worked dialogues */}
      {doc.dialogues.length > 0 && (
        <section>
          <SectionLabel>Worked examples</SectionLabel>
          <div className="mt-1">
            {doc.dialogues.map((d) => (
              <Disclosure key={d.id} id={d.id} title={d.title}>
                <p className="border border-line bg-panel px-3 py-2 text-[13.5px] leading-snug text-ink">
                  &ldquo;{unquote(d.patient)}&rdquo;
                </p>
                <div className="mt-3">
                  <div className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-red">Weak</div>
                  <p className="mt-1 text-[13px] italic leading-snug text-ink/60">&ldquo;{unquote(d.weak)}&rdquo;</p>
                </div>
                <div className="mt-3">
                  <div className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-success">Strong</div>
                  <p className="mt-1 border-l-2 border-l-success pl-3 text-[13.5px] leading-snug text-ink">
                    &ldquo;{unquote(d.strong)}&rdquo;
                  </p>
                </div>
                <p className="mt-3 text-[12px] leading-snug text-muted">{d.annotation}</p>
              </Disclosure>
            ))}
          </div>
        </section>
      )}

      {/* listen: the same consult twice */}
      {listen && (
        <section id="listen" className="scroll-mt-4">
          <SectionLabel>Listen</SectionLabel>
          <p className="mt-1 text-[13px] leading-snug text-dim">
            The same consult, twice. Tap the pins on The fix to hear exactly what changed.
          </p>
          <PairPlayer fetchBody={{ stationSlug: listen.stationSlug, moduleFocus: listen.moduleFocus }} />
        </section>
      )}

      {/* common mistakes */}
      <section id="mistakes" className="scroll-mt-4">
        <SectionLabel>Common mistakes</SectionLabel>
        <div className="mt-1 flex flex-col divide-y divide-hairline">
          {doc.mistakes.map((m, i) => (
            <div key={i} className="py-3.5">
              <p className="border-l-2 border-l-red pl-3 text-[13px] italic leading-snug text-ink/60">
                &ldquo;{unquote(m.wrong)}&rdquo;
              </p>
              <p className="mt-2 border-l-2 border-l-success pl-3 text-[13.5px] leading-snug text-ink">
                &ldquo;{unquote(m.right)}&rdquo;
              </p>
              <p className="mt-1.5 text-[12px] leading-snug text-muted">{m.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* tracked knowledge check */}
      <section id="check" className="scroll-mt-4">
        <div className="flex items-baseline justify-between">
          <SectionLabel>Knowledge check</SectionLabel>
          {checkPassed && (
            <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-success">
              Passed · {initial.quizScore}
            </span>
          )}
        </div>
        <CheckBlock lesson={lesson} alreadyPassed={checkPassed} onRefresh={() => router.refresh()} />
      </section>

      {/* live micro-drill */}
      {lesson.drill && (
        <section id="drill" className="scroll-mt-4">
          <div className="flex items-baseline justify-between">
            <SectionLabel>Live micro-drill</SectionLabel>
            {initial.drillPassed && (
              <span className="font-mono text-[10px] font-semibold uppercase tracking-wide text-success">Passed</span>
            )}
          </div>
          <DrillBlock lesson={lesson} voiceCaps={voiceCaps} onRefresh={() => router.refresh()} />
        </section>
      )}

      {/* forward path — appears once check (and drill) are passed */}
      {moduleComplete && (
        <section>
          <SectionLabel>Module complete</SectionLabel>
          {next ? (
            <Link
              href={`/train/module/${next.slug}`}
              className="display mt-2 flex w-full items-center justify-between rounded-card border border-primary/60 px-4 py-3.5 text-[15px] tracking-wide text-primary"
            >
              <span>
                Next · Module {next.order} — {next.title}
              </span>
              <span aria-hidden>→</span>
            </Link>
          ) : (
            <Link
              href="/train"
              className="display mt-2 flex w-full items-center justify-between rounded-card border border-primary/60 px-4 py-3.5 text-[15px] tracking-wide text-primary"
            >
              <span>Curriculum complete — back to the ladder</span>
              <span aria-hidden>→</span>
            </Link>
          )}
        </section>
      )}

      {/* try it in a rep */}
      <section>
        <SectionLabel>Try it in a rep</SectionLabel>
        <Link
          href={`/home?launch=${doc.repCta.stationSlug}&difficulty=${doc.repCta.difficulty}`}
          className="display mt-2 block w-full rounded-card bg-primary py-3.5 text-center text-[15px] tracking-wide text-white"
        >
          {doc.repCta.label}
        </Link>
        <p className="mt-1.5 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          Opens the station · {doc.repCta.difficulty} difficulty
        </p>
      </section>

      <p className="text-center text-[11px] leading-relaxed text-muted">
        This module trains confident recommendation of clinically appropriate
        care — every technique assumes an indicated service and an informed
        patient. {moduleTitle} is graded on your reps automatically.
      </p>
    </div>
  );
}

/* ---------------------------- knowledge check ---------------------------- */

function CheckBlock({
  lesson,
  alreadyPassed,
  onRefresh,
}: {
  lesson: TrainingLesson;
  alreadyPassed: boolean;
  onRefresh: () => void;
}) {
  const [active, setActive] = useState(false);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const q = lesson.quiz[qi];
  const answered = picked !== null;

  async function submit(finalAnswers: number[]) {
    setBusy(true);
    try {
      const res = await fetch("/api/training/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonSlug: lesson.slug, answers: finalAnswers }),
      });
      const data = await res.json();
      if (res.ok) {
        setResult({ score: data.score, passed: data.passed });
        onRefresh();
      }
    } finally {
      setBusy(false);
    }
  }

  function next() {
    const a = [...answers, picked as number];
    setAnswers(a);
    setPicked(null);
    if (qi + 1 < lesson.quiz.length) setQi(qi + 1);
    else void submit(a);
  }

  if (!active) {
    return (
      <button
        onClick={() => {
          setActive(true);
          setQi(0);
          setPicked(null);
          setAnswers([]);
          setResult(null);
        }}
        className={`display mt-2 w-full rounded-card py-3 text-[13px] tracking-wide ${
          alreadyPassed ? "border border-line text-dim" : "border border-line-strong text-bone"
        }`}
      >
        {alreadyPassed ? "Retake the check" : `Start the check · ${lesson.quiz.length} questions`}
      </button>
    );
  }

  if (result) {
    return (
      <div className="mt-3 text-center">
        <div className="font-mono text-[40px] font-semibold leading-none tabular-nums text-bone">
          {result.score}
          <span className="text-lg font-normal text-dim">%</span>
        </div>
        <div className={`display mt-1.5 text-[15px] ${result.passed ? "text-success" : "text-red"}`}>
          {result.passed ? "Passed" : `${QUIZ_PASS_PCT} to pass`}
        </div>
        <button
          onClick={() => {
            setQi(0);
            setPicked(null);
            setAnswers([]);
            setResult(null);
          }}
          className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted underline"
        >
          {result.passed ? "Run it again" : "Retry — free, always"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] text-muted">
          {qi + 1}/{lesson.quiz.length}
        </span>
      </div>
      <p className="mt-1 text-[14px] font-semibold leading-snug text-ink">{q.prompt}</p>
      <div className="mt-2 divide-y divide-hairline">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.answer;
          const isPicked = i === picked;
          let cls = "text-dim";
          if (answered && isCorrect) cls = "text-success";
          else if (answered && isPicked && !isCorrect) cls = "text-red";
          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => setPicked(i)}
              className={`flex min-h-[44px] w-full items-start gap-2.5 py-2.5 text-left ${
                answered ? "" : "hover:bg-raised active:bg-raised"
              }`}
            >
              <span
                className={`mt-0.5 font-mono text-[11px] font-semibold ${
                  answered && isCorrect ? "text-success" : answered && isPicked ? "text-red" : "text-muted"
                }`}
              >
                {answered && isCorrect ? "✓" : answered && isPicked ? "✗" : String.fromCharCode(65 + i)}
              </span>
              <span className={`text-[13px] leading-snug ${cls}`}>{opt}</span>
            </button>
          );
        })}
      </div>
      {answered && (
        <p className="mt-1.5 border-l-2 border-l-bone pl-3 text-[12px] italic leading-snug text-ink/60">{q.why}</p>
      )}
      <button
        onClick={next}
        disabled={!answered || busy}
        className="display mt-3 w-full rounded-card bg-primary py-3 text-[13px] tracking-wide text-white disabled:opacity-40"
      >
        {qi + 1 < lesson.quiz.length ? "Next" : busy ? "Scoring" : "See my score"}
      </button>
    </div>
  );
}

/* ------------------------------ live drill ------------------------------ */

interface DrillMsg {
  role: "provider" | "patient";
  text: string;
}

function DrillBlock({
  lesson,
  voiceCaps,
  onRefresh,
}: {
  lesson: TrainingLesson;
  voiceCaps: VoiceCaps;
  onRefresh: () => void;
}) {
  const drill = lesson.drill!;
  const [drillId, setDrillId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DrillMsg[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [turnsLeft, setTurnsLeft] = useState(drill.maxTurns);
  const [verdict, setVerdict] = useState<{ passed: boolean; feedback: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Drills are real encounters, so they get the same patient voice + mic as
  // the room. The engine needs the drill's encounter id, so it's built on start.
  const engineRef = useRef<ReturnType<typeof buildVoiceEngine> | null>(null);
  const sttRef = useRef<SttSession | null>(null);
  const [micState, setMicState] = useState<"idle" | "recording">("idle");
  const [interim, setInterim] = useState("");
  const voiceOnRef = useRef(true);

  useEffect(() => {
    const saved = localStorage.getItem(VOICE_PREF_KEY);
    if (saved !== null) voiceOnRef.current = saved === "on";
    return () => {
      sttRef.current?.cancel();
      engineRef.current?.tts.cancel();
    };
  }, []);

  function speak(text: string) {
    if (!voiceOnRef.current) return;
    void engineRef.current?.tts.speak(text, {});
  }

  async function start() {
    primeAudio(); // unlock playback while we're inside the tap gesture
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/drills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonSlug: lesson.slug }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't start the drill.");
      setDrillId(data.drillId);
      setMessages([{ role: "patient", text: data.patient }]);
      setTurnsLeft(data.maxTurns);
      setVerdict(null);
      engineRef.current = buildVoiceEngine(data.drillId, voiceCaps);
      speak(data.patient);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the drill.");
    } finally {
      setBusy(false);
    }
  }

  function toggleMic() {
    if (micState === "recording") {
      sttRef.current?.stop();
      return;
    }
    if (busy || !drillId || !engineRef.current) return;
    engineRef.current.tts.cancel(); // patient yields the floor to the mic
    engineRef.current.tts.prime?.();
    setError(null);
    setMicState("recording");
    setInterim("");
    sttRef.current = engineRef.current.stt.start({
      onInterim: (t) => setInterim(t),
      onFinal: (t) => {
        setDraft((d) => (d ? `${d} ${t}` : t));
        setInterim("");
      },
      onError: (message) => setError(message),
      onEnd: () => {
        sttRef.current = null;
        setMicState("idle");
        setInterim("");
      },
    });
  }

  async function send() {
    const text = draft.trim();
    if (!text || busy || !drillId) return;
    engineRef.current?.tts.prime?.(); // still inside the send gesture
    if (micState === "recording") sttRef.current?.cancel();
    setBusy(true);
    setError(null);
    setDraft("");
    setMessages((m) => [...m, { role: "provider", text }]);
    try {
      const res = await fetch(`/api/drills/${drillId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Try again.");
      setMessages((m) => [...m, { role: "patient", text: data.patient }]);
      setTurnsLeft(data.turnsLeft);
      speak(data.patient);
      if (data.turnsLeft <= 0) {
        const g = await fetch(`/api/drills/${drillId}/grade`, { method: "POST" }).then((r) => r.json());
        if (g.passed !== undefined) {
          setVerdict({ passed: g.passed, feedback: g.feedback });
          onRefresh();
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (verdict) {
    return (
      <div className="mt-3 text-center">
        <div
          className={`stamp-in display inline-block border-[3px] px-3.5 py-1.5 text-[16px] tracking-wide ${
            verdict.passed ? "border-success text-success" : "border-red text-red"
          }`}
        >
          {verdict.passed ? "Pass" : "Not yet"}
        </div>
        <p className="mx-auto mt-3 max-w-[36ch] text-[13px] leading-relaxed text-dim">{verdict.feedback}</p>
        {!verdict.passed && (
          <button
            onClick={() => {
              setDrillId(null);
              setMessages([]);
              setVerdict(null);
              setTurnsLeft(drill.maxTurns);
            }}
            className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-bone underline"
          >
            Run it again
          </button>
        )}
      </div>
    );
  }

  if (!drillId) {
    return (
      <div className="mt-2">
        <p className="text-[13px] leading-relaxed text-dim">{drill.setup}</p>
        {error && <p className="mt-2 text-sm text-red">{error}</p>}
        <button
          onClick={start}
          disabled={busy}
          className="display mt-3 w-full rounded-card border border-line-strong py-3 text-[13px] tracking-wide text-bone disabled:opacity-60"
        >
          {busy ? "Prepping the moment" : `Start the drill · ${drill.maxTurns} turns · pass/fail`}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex max-h-64 flex-col gap-2 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[88%] border px-3 py-2 text-[13.5px] leading-snug ${
              m.role === "provider"
                ? "raised self-end border-line-strong text-ink"
                : "self-start border-line bg-panel text-ink"
            }`}
          >
            {m.text}
          </div>
        ))}
        {busy && (
          <div className="self-start border border-line bg-panel px-3 py-2">
            <span className="microlabel">Patient responding</span>
          </div>
        )}
      </div>
      {error && <p className="py-1 text-[13px] text-red">{error}</p>}
      {micState === "recording" && (
        <p className="py-1 text-[13px] italic text-muted">{interim || "Listening…"}</p>
      )}
      <div className="mt-2 flex items-end gap-2">
        <button
          onClick={toggleMic}
          disabled={busy}
          aria-label={micState === "recording" ? "Stop recording" : "Speak your line"}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border disabled:opacity-40 ${
            micState === "recording"
              ? "border-red bg-red/15 text-red"
              : "border-line-strong text-bone"
          }`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
            <rect x="9" y="3" width="6" height="11" rx="3" />
            <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
          </svg>
        </button>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          placeholder={micState === "recording" ? "Speak — tap mic to stop" : "Speak or type your line..."}
          className="max-h-24 min-h-11 flex-1 resize-none border border-line bg-bg px-3 py-2.5 text-[14px] text-ink placeholder:text-muted focus:border-primary focus:outline-none"
        />
        <button
          onClick={() => void send()}
          disabled={busy || !draft.trim()}
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5">
            <path d="M5 12h13M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="pt-1.5 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-muted">
        {turnsLeft} turn{turnsLeft === 1 ? "" : "s"} left · graded on {drill.rubricKey} only
      </div>
    </div>
  );
}

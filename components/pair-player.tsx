"use client";

import { useEffect, useRef, useState } from "react";
import type { PairLine } from "@/lib/types";

interface Take {
  take: "A" | "B";
  url: string;
  durationMs: number;
  lines: PairLine[];
}

type FetchState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "unavailable" }
  | { phase: "ready"; takes: Take[] };

const TAKE_LABELS: Record<"A" | "B", string> = { A: "Common close", B: "The fix" };

/**
 * The Listen player: one scrub bar, "Common close" and "The fix" as two
 * tracks, beat markers as tappable pins on The fix. Audio is generated
 * lazily on first play and cached server-side; a skeleton covers the wait.
 * Also renders single-track results (personal replays).
 */
export function PairPlayer({
  fetchBody,
  endpoint = "/api/audio/pair",
  autoStart = false,
  paper = false,
}: {
  fetchBody: Record<string, unknown>;
  endpoint?: string;
  autoStart?: boolean;
  /** Scorecard variant: printed-chart palette instead of the dark panel. */
  paper?: boolean;
}) {
  const [state, setState] = useState<FetchState>({ phase: "idle" });
  const [active, setActive] = useState<"A" | "B">("A");
  const [playing, setPlaying] = useState(false);
  const [posMs, setPosMs] = useState(0);
  const [pin, setPin] = useState<PairLine | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const bodyKey = JSON.stringify(fetchBody);

  async function load() {
    setState({ phase: "loading" });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: bodyKey,
      });
      const data = await res.json();
      if (res.ok && data.status === "ready") {
        const takes: Take[] = data.takes ?? [
          { take: "A", url: data.url, durationMs: data.durationMs, lines: data.lines ?? [] },
        ];
        setState({ phase: "ready", takes });
        setActive(takes.length > 1 ? "A" : takes[0].take);
      } else {
        setState({ phase: "unavailable" });
      }
    } catch {
      setState({ phase: "unavailable" });
    }
  }

  useEffect(() => {
    if (!autoStart) return;
    const t = setTimeout(() => void load(), 0); // deferred: no sync setState in effect
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodyKey]);

  useEffect(() => {
    return () => audioRef.current?.pause();
  }, []);

  if (state.phase === "idle") {
    return (
      <button
        onClick={() => void load()}
        className={`display mt-2 w-full rounded-card border py-3 text-[13px] tracking-wide ${
          paper ? "border-paper-ink/40 text-paper-ink" : "border-line-strong text-bone"
        }`}
      >
        {endpoint.includes("replay") ? "Hear it — your rep, fixed" : "Listen · Common close vs. The fix"}
      </button>
    );
  }

  if (state.phase === "loading") {
    return (
      <div className={`mt-2 animate-pulse border p-3 ${paper ? "border-paper-ink/25 bg-paper" : "border-line bg-panel"}`}>
        <div className={`h-3 w-40 rounded ${paper ? "bg-paper-ink/15" : "bg-line"}`} />
        <div className={`mt-3 h-2 w-full rounded ${paper ? "bg-paper-ink/15" : "bg-line"}`} />
        <div className={`mt-2 h-3 w-24 rounded ${paper ? "bg-paper-ink/15" : "bg-line"}`} />
        <div className={`mt-2 text-center font-mono text-[9px] uppercase tracking-[0.2em] ${paper ? "text-paper-ink/60" : "text-muted"}`}>
          {endpoint.includes("replay") ? "Recording your fixed rep" : "Recording both takes — first play only"}
        </div>
      </div>
    );
  }

  if (state.phase === "unavailable") {
    return (
      <div className={`mt-2 border p-3 text-center text-[13px] ${paper ? "border-paper-ink/25 bg-paper text-paper-ink/60" : "border-line bg-panel text-muted"}`}>
        Audio unavailable right now — the written scripts still apply.
      </div>
    );
  }

  const takes = state.takes;
  const current = takes.find((t) => t.take === active) ?? takes[0];
  const beats = current.take === "B" ? current.lines.filter((l) => l.beat) : [];
  const dur = Math.max(1, current.durationMs);

  function switchTake(take: "A" | "B") {
    audioRef.current?.pause();
    setPlaying(false);
    setPosMs(0);
    setPin(null);
    setActive(take);
  }

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      void el.play();
      setPlaying(true);
    }
  }

  function seek(ms: number) {
    const el = audioRef.current;
    if (!el) return;
    el.currentTime = ms / 1000;
    setPosMs(ms);
  }

  return (
    <div className={`mt-2 border p-3 ${paper ? "border-paper-ink/25 bg-paper text-paper-ink" : "border-line bg-panel"}`}>
      <audio
        ref={audioRef}
        src={current.url}
        preload="auto"
        onTimeUpdate={(e) => setPosMs(e.currentTarget.currentTime * 1000)}
        onEnded={() => setPlaying(false)}
      />
      {takes.length > 1 && (
        <div className={`flex border ${paper ? "border-paper-ink/30" : "border-line"}`}>
          {takes.map((t) => (
            <button
              key={t.take}
              onClick={() => switchTake(t.take)}
              className={`flex-1 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${
                active === t.take
                  ? paper
                    ? "bg-paper-ink text-paper"
                    : "bg-primary text-white"
                  : paper
                    ? "bg-paper text-paper-ink/55"
                    : "bg-bg text-muted"
              }`}
            >
              {TAKE_LABELS[t.take]}
            </button>
          ))}
        </div>
      )}

      <div className="mt-3 flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${paper ? "bg-paper-ink text-paper" : "bg-primary text-white"}`}
        >
          {playing ? (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="ml-0.5 h-5 w-5" fill="currentColor">
              <path d="M7 5.5v13a1 1 0 0 0 1.5.87l11-6.5a1 1 0 0 0 0-1.74l-11-6.5A1 1 0 0 0 7 5.5Z" />
            </svg>
          )}
        </button>

        <div className="relative min-w-0 flex-1 pt-2">
          <input
            type="range"
            min={0}
            max={dur}
            value={Math.min(posMs, dur)}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Scrub"
            className="w-full accent-[var(--color-primary)]"
          />
          {/* beat pins — tappable, The fix only */}
          {beats.map((b, i) => (
            <button
              key={i}
              onClick={() => {
                seek(b.startMs ?? 0);
                setPin(b);
              }}
              aria-label={`Beat: ${b.beat}`}
              className={`absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border ${paper ? "border-paper-mint bg-paper" : "border-primary bg-panel"}`}
              style={{ left: `${(((b.startMs ?? 0) / dur) * 100).toFixed(1)}%` }}
            >
              <span className={`absolute inset-1 rounded-full ${paper ? "bg-paper-mint" : "bg-primary"}`} />
            </button>
          ))}
        </div>

        <span className={`shrink-0 font-mono text-[10px] tabular-nums ${paper ? "text-paper-ink/60" : "text-muted"}`}>
          {fmt(posMs)}/{fmt(dur)}
        </span>
      </div>

      {pin && (
        <div className={`mt-2.5 border-l-2 px-2.5 py-2 ${paper ? "border-paper-mint bg-paper-ink/5" : "border-primary bg-bg"}`}>
          <div className={`microlabel ${paper ? "text-paper-mint" : "text-primary"}`}>Beat</div>
          <div className={`mt-0.5 text-[13px] ${paper ? "text-paper-ink" : "text-ink"}`}>{pin.beat}</div>
          <div className={`mt-1 text-[12px] italic ${paper ? "text-paper-ink/60" : "text-dim"}`}>&ldquo;{pin.text}&rdquo;</div>
        </div>
      )}
    </div>
  );
}

function fmt(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

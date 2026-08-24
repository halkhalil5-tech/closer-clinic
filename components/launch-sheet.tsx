"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { primeAudio } from "@/lib/voice/elevenlabs-client";
import { PairPlayer } from "@/components/pair-player";
import type { Difficulty, Scenario } from "@/lib/types";

const DIFFICULTIES: { id: Difficulty; label: string; blurb: string }[] = [
  { id: "easy", label: "Easy", blurb: "One soft objection. Warm up." },
  { id: "moderate", label: "Moderate", blurb: "2–3 real objections. Earn the yes." },
  { id: "hard", label: "Hard", blurb: "Interrupts, comparisons, “I'll think about it.”" },
];

/** Last-used difficulty persists per device (localStorage — no schema change). */
const LAST_DIFFICULTY_KEY = "closer-clinic:last-difficulty";

function isDifficulty(v: string | null): v is Difficulty {
  return v === "easy" || v === "moderate" || v === "hard";
}

/**
 * Pre-launch bottom sheet: station, price, teaser, difficulty, Start Rep.
 * Difficulty now lives here instead of as a global roster-wide selector.
 */
export function LaunchSheet({
  scenario,
  initialDifficulty,
  onClose,
}: {
  scenario: Scenario;
  /** Preset from a training deep link; overrides the last-used default. */
  initialDifficulty?: Difficulty;
  onClose: () => void;
}) {
  const router = useRouter();
  // The sheet only mounts client-side (after a station tap), so the lazy
  // initializer can read localStorage directly — no hydration concern.
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    if (initialDifficulty) return initialDifficulty;
    const saved = typeof window !== "undefined" ? localStorage.getItem(LAST_DIFFICULTY_KEY) : null;
    return isDifficulty(saved) ? saved : "moderate";
  });
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (starting) return;
    primeAudio(); // unlock patient audio while inside the tap gesture
    setStarting(true);
    setError(null);
    localStorage.setItem(LAST_DIFFICULTY_KEY, difficulty);
    try {
      const res = await fetch("/api/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioSlug: scenario.slug, difficulty }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't start the encounter.");
      router.push(`/encounter/${data.encounterId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the encounter.");
      setStarting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="raised w-full max-w-md rounded-t-xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto h-1 w-9 rounded-full bg-line" />

        <div className="mt-3 flex items-baseline justify-between gap-3">
          <span className="display-title min-w-0 flex-1 text-[19px] text-bone">
            {scenario.title}
            {scenario.isCustom && (
              <span className="ml-2 align-middle font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-muted">
                Custom
              </span>
            )}
          </span>
          <span className="shrink-0 font-mono text-[16px] font-semibold tabular-nums text-bone">
            {scenario.priceDisplay}
          </span>
        </div>
        <p className="mt-1.5 text-[13px] italic leading-snug text-ink/60">
          &ldquo;{scenario.patientCc}&rdquo;
        </p>

        <div className="mt-4 microlabel">Difficulty</div>
        <div className="mt-1 flex border-b border-hairline">
          {DIFFICULTIES.map((d) => {
            const on = difficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`display relative min-h-[44px] flex-1 pb-2.5 pt-2 text-[13px] transition-colors active:text-ink ${
                  on ? "text-mint" : "text-muted"
                }`}
              >
                {d.label}
                {on && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-mint" />}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 min-h-4 text-xs text-muted">
          {DIFFICULTIES.find((d) => d.id === difficulty)?.blurb}
        </p>

        <PairPlayer fetchBody={{ stationSlug: scenario.slug }} />

        {error && <p className="mt-2 text-sm text-red">{error}</p>}
        <button
          onClick={start}
          disabled={starting}
          className="display mt-4 w-full rounded-card bg-mint py-3.5 text-[15px] tracking-wide text-mint-ink transition-opacity disabled:opacity-70"
        >
          {starting ? "Prepping the room" : "Start rep"}
        </button>
      </div>
    </div>
  );
}

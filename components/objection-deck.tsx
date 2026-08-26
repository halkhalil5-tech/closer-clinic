"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ObjectionCard } from "@/lib/types";

const DIFF_COLOR: Record<string, string> = {
  easy: "text-dim",
  moderate: "text-amber",
  hard: "text-red",
};

/** Full-screen flashcard deck: objection on the front, the play on the back. */
export function ObjectionDeck({ cards, shuffled }: { cards: ObjectionCard[]; shuffled: boolean }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});

  const completedRef = useRef(false);
  useEffect(() => {
    if (shuffled && !completedRef.current && cards.length > 0 && idx === cards.length - 1) {
      completedRef.current = true;
      fetch("/api/cards-session", { method: "POST" }).catch(() => {});
    }
  }, [idx, shuffled, cards.length]);

  function onScroll() {
    const el = railRef.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idx) setIdx(i);
  }

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="flex items-center justify-between">
        <span className="microlabel">
          {shuffled ? "Objection cards · 60-sec shuffle" : "Objection cards"}
        </span>
        <Link
          href={shuffled ? "/home" : "/train"}
          className="py-1 pl-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted"
        >
          Done ✕
        </Link>
      </div>

      <div
        ref={railRef}
        onScroll={onScroll}
        className="-mx-4 flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {cards.map((c, i) => {
          const isFlipped = flipped[i];
          return (
            <button
              key={c.id}
              onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
              className="flex w-full shrink-0 snap-center px-4 py-2 text-left"
              style={{ perspective: "1200px" }}
            >
              <div
                className={`relative h-full w-full transition-transform duration-300 [transform-style:preserve-3d] ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
              >
                <div className="absolute inset-0 flex flex-col justify-center rounded-xl border border-line bg-bg p-6 shadow-sm [backface-visibility:hidden]">
                  <div className="flex items-center gap-2">
                    <span className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${DIFF_COLOR[c.difficulty]}`}>
                      {c.difficulty}
                    </span>
                    {c.custom && (
                      <span className="font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-muted">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="display-title mt-3 text-[26px] leading-[1.15] text-bone">
                    &ldquo;{c.front}&rdquo;
                  </div>
                  <div className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
                    Tap for the play
                  </div>
                </div>
                <div className="absolute inset-0 flex flex-col justify-center overflow-y-auto rounded-xl border border-line bg-card p-6 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                  <div className="text-[13px] italic leading-snug text-ink/60">&ldquo;{c.front}&rdquo;</div>
                  <div className="mt-5 flex flex-col gap-4">
                    <div>
                      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-bone">Isolate</div>
                      <p className="mt-1 text-[15px] leading-snug text-ink">{c.back.isolate}</p>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-bone">Reframe</div>
                      <p className="mt-1 text-[15px] leading-snug text-ink">{c.back.reframe}</p>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-mint">Close</div>
                      <p className="mt-1 text-[15px] leading-snug text-ink">{c.back.close}</p>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-3">
        <div className="flex max-w-[60%] flex-wrap gap-1.5">
          {cards.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-bone" : "w-1.5 bg-faint"}`}
            />
          ))}
        </div>
        <span className="font-mono text-[10px] tabular-nums text-muted">
          {idx + 1}/{cards.length} · swipe
        </span>
      </div>
    </main>
  );
}

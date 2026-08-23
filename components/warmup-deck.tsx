"use client";

import { useRef, useState } from "react";
import type { WarmupCard } from "@/lib/training/podiatry-pack";

/** Full-screen swipeable flashcards; tap advances, swipe works too. */
export function WarmupDeck({ cards }: { cards: WarmupCard[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  function onScroll() {
    const el = railRef.current;
    if (!el) return;
    setIdx(Math.round(el.scrollLeft / el.clientWidth));
  }

  function advance() {
    const el = railRef.current;
    if (!el) return;
    el.scrollTo({ left: ((idx + 1) % cards.length) * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={railRef}
        onScroll={onScroll}
        onClick={advance}
        className="-mx-4 flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {cards.map((c, i) => (
          <div key={i} className="flex w-full shrink-0 snap-center flex-col justify-center px-6">
            <div className="microlabel">{c.label}</div>
            <div className="display mt-2 text-[30px] leading-[1.02] text-bone">{c.title}</div>
            <p className="mt-4 text-[16px] leading-relaxed text-dim">{c.line}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3">
        <div className="flex gap-1.5">
          {cards.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-5 bg-bone" : "w-1.5 bg-faint"
              }`}
            />
          ))}
        </div>
        <span className="font-mono text-[10px] tabular-nums text-muted">
          {idx + 1}/{cards.length} · tap to flip
        </span>
      </div>
    </div>
  );
}

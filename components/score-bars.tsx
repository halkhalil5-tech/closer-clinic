"use client";

import { motion, useReducedMotion } from "motion/react";

export interface ScoreBar {
  key: string;
  label: string;
  score: number; // 0–20
}

/** Sub-scores as horizontal bars that animate to value on mount. */
export function ScoreBars({ bars }: { bars: ScoreBar[] }) {
  const reduced = useReducedMotion();
  return (
    <div className="flex flex-col gap-3">
      {bars.map((b, i) => {
        const pct = (b.score / 20) * 100;
        const color = b.score >= 14 ? "#2ec4a5" : b.score >= 8 ? "#c9a227" : "#b0483a";
        return (
          <div key={b.key}>
            <div className="flex items-baseline justify-between">
              <span className="microlabel">{b.label}</span>
              <span className="font-mono text-[14px] font-semibold tabular-nums text-ink">
                {b.score}
                <span className="text-muted">/20</span>
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-ink/8">
              <motion.div
                initial={reduced ? false : { width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full"
                style={{ backgroundColor: color, width: reduced ? `${pct}%` : undefined }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

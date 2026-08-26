"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import confetti from "canvas-confetti";
import { Check } from "lucide-react";
import { letterColorFor } from "@/lib/letter-grades";


/**
 * The grade moment: a 96px grade-colored letter that rises in while the
 * total counts up. A grades get one — and only one — quiet confetti burst.
 */
export function GradeHero({
  letter,
  total,
  closed,
  meta,
  encounterId,
}: {
  letter: string;
  total: number;
  closed: boolean;
  meta: string;
  encounterId: string;
}) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(reduced ? total : 0);
  const fired = useRef(false);

  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    const DURATION = 700;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / DURATION);
      setCount(Math.round(total * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [total, reduced]);

  useEffect(() => {
    if (!letter.startsWith("A") || fired.current || reduced) return;
    const key = `closer-clinic:confetti:${encounterId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* private mode: still fire, just unguarded */
    }
    fired.current = true;
    const t = setTimeout(() => {
      confetti({
        particleCount: 70,
        spread: 60,
        startVelocity: 28,
        origin: { y: 0.3 },
        // literals: canvas-confetti cannot resolve CSS variables (success/primary/ink)
        colors: ["#2ec4a5", "#10707f", "#0a3540"],
        disableForReducedMotion: true,
      });
    }, 450);
    return () => clearTimeout(t);
  }, [letter, encounterId, reduced]);

  const color = letterColorFor(letter);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-end gap-3">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="display text-[96px] leading-[0.82]"
            style={{ color }}
          >
            {letter}
          </motion.div>
          <div className="pb-1.5 font-mono text-[16px] font-semibold tabular-nums text-muted">
            {count}
            <span className="text-[11px] font-normal">/100</span>
          </div>
        </div>
        <motion.div
          initial={reduced ? false : { opacity: 0, scale: 1.25, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: -3 }}
          transition={{ duration: 0.25, delay: 0.15 }}
          className={`mt-3 flex shrink-0 items-center gap-1 rounded-lg border-2 px-3 py-1.5 text-[15px] font-semibold ${
            closed ? "border-success text-success" : "border-danger text-danger"
          }`}
        >
          {closed && <Check className="h-5 w-5" strokeWidth={2} />}
          {closed ? "Closed" : "No close"}
        </motion.div>
      </div>
      <div className="mt-2 truncate text-[12px] font-medium uppercase tracking-[0.1em] text-muted">
        {meta}
      </div>
    </div>
  );
}

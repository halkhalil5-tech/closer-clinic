"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "motion/react";

/**
 * Receptivity as a slim gauge that eases between values on spring physics.
 * Mint while the room is warming up, muted red while it cools.
 */
export function ReceptivityGauge({ value }: { value: number }) {
  const prev = useRef(value);
  const [falling, setFalling] = useState(false);

  const spring = useSpring(value, { stiffness: 120, damping: 22, mass: 0.6 });
  const width = useTransform(spring, (v) => `${Math.max(0, Math.min(100, v))}%`);

  useEffect(() => {
    spring.set(value);
    if (value === prev.current) return;
    const wasFalling = value < prev.current;
    prev.current = value;
    // deferred: no sync setState inside the effect body
    const t = setTimeout(() => setFalling(wasFalling), 0);
    return () => clearTimeout(t);
  }, [value, spring]);

  return (
    <div className="flex items-center gap-2 px-4 py-1.5" aria-label={`Receptivity ${value} of 100`}>
      <span className="microlabel shrink-0">Receptivity</span>
      <div className="h-[3px] min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{
            width,
            backgroundColor: falling ? "rgba(176, 72, 58, 0.75)" : "var(--color-success)",
            transition: "background-color 300ms ease",
          }}
        />
      </div>
      <span className="w-7 shrink-0 text-right font-mono text-[11px] tabular-nums text-muted">
        {value}
      </span>
    </div>
  );
}

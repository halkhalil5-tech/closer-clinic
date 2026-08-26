"use client";

import { useEffect, useRef } from "react";

export type VisualizerMode = "idle" | "patient" | "listening";

/**
 * The session orb: a minimal canvas waveform ring in mint. Breathes when the
 * room is quiet, swells and ripples while the patient speaks or while the
 * provider's mic is live. Custom-drawn — no widget look. 60fps via rAF;
 * prefers-reduced-motion collapses it to a static ring.
 */
export function SessionVisualizer({
  mode,
  getSignal,
}: {
  mode: VisualizerMode;
  /** Optional live 0–1 amplitude sampler; the orb tracks it when healthy and
   *  falls back to state-driven animation when it isn't. */
  getSignal?: () => { level: number; live: boolean };
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modeRef = useRef<VisualizerMode>(mode);
  const getSignalRef = useRef<typeof getSignal>(getSignal);
  useEffect(() => {
    modeRef.current = mode;
    getSignalRef.current = getSignal;
  }, [mode, getSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0;
    let running = true;
    // Energy eases toward the mode's target so transitions feel physical,
    // never switched.
    let energy = 0;
    // Decaying peak of the live signal: while a source is speaking and the
    // analysers are actually producing data, the orb tracks amplitude; if
    // levels stay at zero (no context, Safari suspended, WebSpeech fallback)
    // this never rises and the state-driven targets carry the animation.
    let signalPeak = 0;

    function size() {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }
    size();
    const onResize = () => size();
    window.addEventListener("resize", onResize);

    const MINT = "46, 196, 165";

    function draw(t: number) {
      if (!running || !canvas || !ctx) return;
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2;
      const base = Math.min(w, h) * 0.28;

      let target = modeRef.current === "idle" ? 0.12 : modeRef.current === "patient" ? 0.75 : 1;
      const sig = modeRef.current !== "idle" ? getSignalRef.current?.() : undefined;
      if (sig?.live) {
        signalPeak = Math.max(signalPeak * 0.99, sig.level);
        if (signalPeak > 0.04) {
          // amplitude-driven: breathe at the floor, surge with speech
          target = 0.18 + Math.min(1, sig.level * 1.7) * 1.02;
        }
      } else {
        signalPeak *= 0.95;
      }
      energy += (target - energy) * (sig?.live && signalPeak > 0.04 ? 0.25 : 0.06);

      ctx.clearRect(0, 0, w, h);

      const s = t / 1000;
      // soft core
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, base * 2.2);
      core.addColorStop(0, `rgba(${MINT}, ${0.16 + energy * 0.1})`);
      core.addColorStop(1, `rgba(${MINT}, 0)`);
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, w, h);

      // three concentric wobble rings — the "waveform"
      for (let ring = 0; ring < 3; ring++) {
        const speed = 0.9 + ring * 0.45;
        const detail = 7 + ring * 3;
        const amp = base * (0.035 + energy * 0.16) * (1 - ring * 0.22);
        const radius =
          base *
          (1 + ring * 0.16) *
          // idle breathing: a slow 4s swell
          (1 + Math.sin(s * (modeRef.current === "idle" ? 1.5 : 2.6) + ring) * (0.015 + energy * 0.035));

        ctx.beginPath();
        const STEPS = 90;
        for (let i = 0; i <= STEPS; i++) {
          const a = (i / STEPS) * Math.PI * 2;
          const wobble =
            Math.sin(a * detail + s * speed * 3.1) * amp +
            Math.sin(a * (detail - 3) - s * speed * 2.3) * amp * 0.6;
          const r = radius + wobble;
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(${MINT}, ${(0.5 - ring * 0.14) * (0.45 + energy * 0.55)})`;
        ctx.lineWidth = 1.5 * dpr;
        ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    }

    if (reduced) {
      // static ring, no animation
      size();
      const w = canvas.width;
      const h = canvas.height;
      const base = Math.min(w, h) * 0.28;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, base, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${MINT}, 0.6)`;
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none h-full w-full"
    />
  );
}

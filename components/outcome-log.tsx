"use client";

import { useState } from "react";

interface Props {
  services: string[];
  weekPresented: number;
  weekClosed: number;
  /** Section label; the widget's logic is identical wherever it lives. */
  title?: string;
}

/**
 * The proof engine's input: a 10-second daily log. "Presented shockwave
 * today? Closed?" — two taps, no EMR, no connector.
 */
export function OutcomeLog({ services, weekPresented, weekClosed, title = "Today in clinic" }: Props) {
  const [service, setService] = useState(services[0] ?? "");
  const [logged, setLogged] = useState<{ presented: number; closed: number } | null>(
    null
  );
  const [busy, setBusy] = useState(false);

  async function log(presented: boolean, closed: boolean) {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/outcomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, presented, closed }),
      });
      const data = await res.json();
      if (res.ok) setLogged({ presented: data.weekPresented, closed: data.weekClosed });
    } finally {
      setBusy(false);
    }
  }

  if (logged) {
    return (
      <section>
        <div className="microlabel">{title}</div>
        <p className="mt-1.5 text-[13px] text-dim">
          <span className="font-semibold text-mint">Logged.</span>{" "}
          <span className="font-mono tabular-nums text-bone">
            {logged.closed}/{logged.presented}
          </span>{" "}
          real-world closes this week.{" "}
          <button onClick={() => setLogged(null)} className="text-muted underline">
            Log another
          </button>
        </p>
      </section>
    );
  }

  return (
    <section>
      <div className="flex items-baseline justify-between">
        <div className="microlabel">{title}</div>
        <div className="text-xs text-muted">
          week{" "}
          <span className="font-mono tabular-nums text-dim">
            {weekClosed}/{weekPresented}
          </span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-2">
        <span className="shrink-0 text-[13px] text-dim">Presented</span>
        <select
          value={service}
          onChange={(e) => setService(e.target.value)}
          className="min-w-0 flex-1 border border-line bg-panel px-2 py-1.5 text-[13px] text-ink focus:border-mint focus:outline-none"
        >
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <span className="shrink-0 text-[13px] text-dim">?</span>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={() => log(true, true)}
          disabled={busy}
          className="flex-1 rounded-card border border-mint/60 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-mint disabled:opacity-50"
        >
          Closed
        </button>
        <button
          onClick={() => log(true, false)}
          disabled={busy}
          className="flex-1 rounded-card border border-line-strong py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-dim disabled:opacity-50"
        >
          No close
        </button>
        <button
          onClick={() => log(false, false)}
          disabled={busy}
          className="flex-1 rounded-card border border-line py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted disabled:opacity-50"
        >
          Didn&apos;t present
        </button>
      </div>
    </section>
  );
}

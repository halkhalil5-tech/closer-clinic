"use client";

import { useState } from "react";

export interface LogService {
  slug: string;
  title: string;
  /** Prefill for the Closed amount, whole cents (midpoint of the price range). */
  defaultCents: number;
}

interface Props {
  services: LogService[];
  weekPresented: number;
  weekClosed: number;
  /** Section label; the widget's logic is identical wherever it lives. */
  title?: string;
}

/**
 * The proof engine's input: a 10-second daily log. "Presented shockwave
 * today? Closed?" — two taps. A close asks for the amount (prefilled with the
 * station's price, editable) so the revenue card can be exact, not estimated.
 */
export function OutcomeLog({ services, weekPresented, weekClosed, title = "Today in clinic" }: Props) {
  const [slug, setSlug] = useState(services[0]?.slug ?? "");
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [amount, setAmount] = useState(""); // dollars, as typed
  const [amountDirty, setAmountDirty] = useState(false);
  const [logged, setLogged] = useState<{ presented: number; closed: number } | null>(null);
  const [busy, setBusy] = useState(false);

  const service = services.find((s) => s.slug === slug) ?? services[0];

  async function log(presented: boolean, closed: boolean, amountCents?: number) {
    if (busy || !service) return;
    setBusy(true);
    try {
      const res = await fetch("/api/outcomes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: service.title,
          stationSlug: service.slug,
          presented,
          closed,
          ...(amountCents !== undefined ? { amountCents } : {}),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setLogged({ presented: data.weekPresented, closed: data.weekClosed });
        setConfirmingClose(false);
      }
    } finally {
      setBusy(false);
    }
  }

  function startClose() {
    setAmount(String(Math.round((service?.defaultCents ?? 0) / 100)));
    setAmountDirty(false);
    setConfirmingClose(true);
  }

  function confirmClose() {
    const dollars = parseInt(amount.replace(/[^0-9]/g, ""), 10);
    // Only an amount the provider actually changed counts as "entered" — an
    // untouched prefill is still a default and keeps the revenue figure "est."
    if (amountDirty && Number.isFinite(dollars)) {
      void log(true, true, dollars * 100);
    } else {
      void log(true, true);
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
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setConfirmingClose(false);
          }}
          className="min-w-0 flex-1 border border-line bg-panel px-2 py-1.5 text-[13px] text-ink focus:border-mint focus:outline-none"
        >
          {services.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
        <span className="shrink-0 text-[13px] text-dim">?</span>
      </div>
      {confirmingClose ? (
        <div className="mt-2 flex items-center gap-2">
          <span className="shrink-0 font-mono text-[13px] text-mint">$</span>
          <input
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setAmountDirty(true);
            }}
            aria-label="Amount closed, dollars"
            className="min-w-0 flex-1 border border-mint/60 bg-panel px-2 py-1.5 font-mono text-[14px] tabular-nums text-ink focus:border-mint focus:outline-none"
          />
          <button
            onClick={confirmClose}
            disabled={busy}
            className="shrink-0 rounded-card bg-mint px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-mint-ink disabled:opacity-50"
          >
            Log close
          </button>
          <button
            onClick={() => setConfirmingClose(false)}
            aria-label="Cancel"
            className="shrink-0 px-1 font-mono text-[11px] uppercase text-muted"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          <button
            onClick={startClose}
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
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
          <span className="font-semibold text-success">Logged.</span>{" "}
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
        <Select
          value={slug}
          onValueChange={(v) => {
            setSlug(v);
            setConfirmingClose(false);
          }}
        >
          <SelectTrigger className="h-9 min-w-0 flex-1 text-[13px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {services.map((s) => (
              <SelectItem key={s.slug} value={s.slug}>
                {s.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="shrink-0 text-[13px] text-dim">?</span>
      </div>
      {confirmingClose ? (
        <div className="mt-2 flex items-center gap-2">
          <span className="shrink-0 font-mono text-[13px] text-success">$</span>
          <Input
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setAmountDirty(true);
            }}
            aria-label="Amount closed, dollars"
            className="h-9 min-w-0 flex-1 border-success/60 font-mono text-[14px] tabular-nums"
          />
          <Button
            size="sm"
            onClick={confirmClose}
            disabled={busy}
            className="shrink-0 bg-success font-mono text-[11px] font-semibold uppercase tracking-[0.1em] hover:bg-success/85 active:bg-success/85"
          >
            Log close
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingClose(false)}
            aria-label="Cancel"
            className="shrink-0 px-2 text-muted"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div className="mt-2 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={startClose}
            disabled={busy}
            className="flex-1 border-success/60 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-success hover:bg-success/10 active:bg-success/10"
          >
            Closed
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => log(true, false)}
            disabled={busy}
            className="flex-1 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-dim"
          >
            No close
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => log(false, false)}
            disabled={busy}
            className="flex-1 border-line font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-muted"
          >
            Didn&apos;t present
          </Button>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PriceConfig } from "@/lib/types";
import { derivePriceStrings } from "@/lib/pricing";
import {
  PriceFields,
  priceConfigFromForm,
  priceFormFromConfig,
} from "@/components/price-fields";

interface Props {
  slug: string;
  title: string;
  initial: PriceConfig;
  hasOverride: boolean;
  onClose: () => void;
}

/** Bottom sheet for editing a station's pricing. Base scenarios never mutate. */
export function PriceEditSheet({ slug, title, initial, hasOverride, onClose }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(priceFormFromConfig(initial));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = priceConfigFromForm(form);
  const preview = config.amount > 0 ? derivePriceStrings(config) : null;

  async function save() {
    if (!preview || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/overrides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioSlug: slug, config }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Couldn't save.");
      router.refresh();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setBusy(false);
    }
  }

  async function reset() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch("/api/overrides", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioSlug: slug }),
      });
      router.refresh();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60" onClick={onClose}>
      <div
        className="raised w-full max-w-md rounded-t-xl px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto h-1 w-9 rounded-full bg-line" />
        <div className="mt-3 flex items-baseline justify-between">
          <div className="microlabel">Edit pricing</div>
          {hasOverride && (
            <button onClick={reset} className="font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-amber">
              Reset to default
            </button>
          )}
        </div>
        <div className="display-title mt-1 text-[17px] text-ink">{title}</div>

        <div className="mt-3">
          <PriceFields value={form} onChange={setForm} />
        </div>

        {/* live preview: exactly what the patient and grader will use */}
        <div className="mt-4 border-l-2 border-l-bone pl-3">
          <div className="microlabel">Patients will hear</div>
          <p className="mt-0.5 text-[13px] leading-snug text-dim">
            {preview ? (
              <>
                <span className="font-mono font-semibold text-bone">{preview.priceDisplay}</span>
                <span className="text-muted"> — {preview.priceStructure}</span>
              </>
            ) : (
              "Enter a price to preview."
            )}
          </p>
        </div>

        {error && <p className="mt-2 text-sm text-red">{error}</p>}
        <button
          onClick={save}
          disabled={busy || !preview}
          className="display mt-4 w-full rounded-card bg-mint py-3.5 text-[15px] tracking-wide text-mint-ink disabled:opacity-40"
        >
          {busy ? "Saving" : "Save pricing"}
        </button>
      </div>
    </div>
  );
}

"use client";

import type { PriceConfig, PriceKind } from "@/lib/types";

/** String-typed form state for price editing (shared by the edit sheet and builder). */
export interface PriceFormState {
  kind: PriceKind;
  amount: string;
  sessions: string;
  interval: string;
  anchor: string;
}

export function priceFormFromConfig(c: PriceConfig): PriceFormState {
  return {
    kind: c.kind,
    amount: c.amount ? String(c.amount) : "",
    sessions: c.sessions ? String(c.sessions) : "",
    interval: c.interval ?? "",
    anchor: c.anchorAmount ? String(c.anchorAmount) : "",
  };
}

export function priceConfigFromForm(f: PriceFormState): PriceConfig {
  return {
    kind: f.kind,
    amount: parseInt(f.amount, 10) || 0,
    sessions: f.kind !== "single" ? parseInt(f.sessions, 10) || undefined : undefined,
    interval: f.kind === "program" && f.interval.trim() ? f.interval.trim() : undefined,
    anchorAmount: f.kind !== "single" ? parseInt(f.anchor, 10) || undefined : undefined,
  };
}

const KINDS: { id: PriceKind; label: string }[] = [
  { id: "single", label: "Single" },
  { id: "package", label: "Package" },
  { id: "program", label: "Program" },
];

const inputCls =
  "w-full border border-line bg-bg px-3 py-2.5 font-mono text-[15px] tabular-nums text-bone placeholder:text-muted focus:border-primary focus:outline-none";

export function PriceFields({
  value,
  onChange,
}: {
  value: PriceFormState;
  onChange: (v: PriceFormState) => void;
}) {
  const set = (patch: Partial<PriceFormState>) => onChange({ ...value, ...patch });
  return (
    <>
      <div className="flex border-b border-hairline">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => set({ kind: k.id })}
            className={`display relative flex-1 pb-2 pt-1.5 text-[12px] transition-colors ${
              value.kind === k.id ? "text-primary" : "text-muted"
            }`}
          >
            {k.label}
            {value.kind === k.id && <span className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <div className="mt-3 flex gap-3">
        <label className="flex-1">
          <span className="microlabel">Total price $</span>
          <input
            inputMode="numeric"
            value={value.amount}
            onChange={(e) => set({ amount: e.target.value.replace(/\D/g, "") })}
            placeholder="600"
            className={`mt-1 ${inputCls}`}
          />
        </label>
        {value.kind !== "single" && (
          <label className="w-24">
            <span className="microlabel">Sessions</span>
            <input
              inputMode="numeric"
              value={value.sessions}
              onChange={(e) => set({ sessions: e.target.value.replace(/\D/g, "") })}
              placeholder="3"
              className={`mt-1 ${inputCls}`}
            />
          </label>
        )}
      </div>

      {value.kind === "program" && (
        <label className="mt-3 block">
          <span className="microlabel">Interval</span>
          <input
            value={value.interval}
            onChange={(e) => set({ interval: e.target.value })}
            placeholder="every 2 months"
            className={`mt-1 ${inputCls} font-body`}
          />
        </label>
      )}

      {value.kind !== "single" && (
        <label className="mt-3 block">
          <span className="microlabel">Single-session anchor $ (optional)</span>
          <input
            inputMode="numeric"
            value={value.anchor}
            onChange={(e) => set({ anchor: e.target.value.replace(/\D/g, "") })}
            placeholder="150"
            className={`mt-1 ${inputCls}`}
          />
        </label>
      )}
    </>
  );
}

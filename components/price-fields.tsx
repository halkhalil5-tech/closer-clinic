"use client";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const inputCls = "font-mono text-[15px] tabular-nums text-bone";

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
      <Tabs value={value.kind} onValueChange={(v) => set({ kind: v as PriceFormState["kind"] })}>
        <TabsList className="h-9">
          {KINDS.map((k) => (
            <TabsTrigger key={k.id} value={k.id} className="display text-[12px] tracking-normal">
              {k.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-3 flex gap-3">
        <label className="flex-1">
          <span className="microlabel">Total price $</span>
          <Input
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
            <Input
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
          <Input
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
          <Input
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

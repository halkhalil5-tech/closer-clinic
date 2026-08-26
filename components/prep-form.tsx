"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Difficulty } from "@/lib/types";
import { scrubFreeText } from "@/lib/scrub";
import { AGE_BANDS, WORRY_MAX_CHARS } from "@/lib/prep";

interface ServiceOpt {
  slug: string;
  title: string;
  price: string;
  custom: boolean;
}

interface Props {
  services: ServiceOpt[];
  conditions: string[];
  archetypes: { id: string; archetype: string }[];
}

export function PrepForm({ services, conditions, archetypes }: Props) {
  const router = useRouter();
  const [ageBand, setAgeBand] = useState<string>("55–64");
  const [condition, setCondition] = useState(conditions[0] ?? "");
  const [otherCondition, setOtherCondition] = useState("");
  const [serviceSlug, setServiceSlug] = useState(services[0]?.slug ?? "");
  const [picked, setPicked] = useState<string[]>([]);
  const [worry, setWorry] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("hard");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = services.find((s) => s.slug === serviceSlug);
  const effectiveCondition = condition === "__other" ? otherCondition.trim() : condition;

  function toggleArchetype(id: string) {
    setPicked((p) =>
      p.includes(id) ? p.filter((x) => x !== id) : p.length >= 2 ? p : [...p, id]
    );
  }

  async function start() {
    if (busy) return;
    setError(null);
    if (!effectiveCondition || effectiveCondition.length < 3) {
      setError("Pick or name the condition.");
      return;
    }
    const scrub = scrubFreeText(worry);
    if (!scrub.ok) {
      setError(scrub.reason ?? "Please rephrase that.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ageBand,
          condition: effectiveCondition,
          serviceSlug,
          archetypes: picked,
          worry: worry.trim() || undefined,
          difficulty,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't build the sim.");
      router.push(`/encounter/${data.encounterId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't build the sim.");
      setBusy(false);
    }
  }

  const selectCls =
    "mt-1 bg-panel text-[14px]";

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="flex items-center justify-between">
        <span className="microlabel">Prep tomorrow&apos;s consult</span>
        <Link href="/home" className="py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Cancel ✕
        </Link>
      </div>
      <h1 className="display-title mt-3 text-[22px] text-bone">
        Rehearse the hard version tonight
      </h1>
      <p className="mt-1.5 text-[12.5px] leading-snug text-muted">
        Describe a <span className="text-dim">type</span> of patient, never a real one — that keeps
        this PHI-free by design.
      </p>

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex gap-3">
          <label className="w-28">
            <span className="microlabel">Age band</span>
            <select value={ageBand} onChange={(e) => setAgeBand(e.target.value)} className={selectCls}>
              {AGE_BANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label className="min-w-0 flex-1">
            <span className="microlabel">Condition</span>
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className={selectCls}>
              {conditions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__other">Other…</option>
            </select>
          </label>
        </div>
        {condition === "__other" && (
          <Input
            value={otherCondition}
            onChange={(e) => setOtherCondition(e.target.value)}
            maxLength={120}
            placeholder="Name the condition"
            className="text-[14px]"
          />
        )}

        <label>
          <span className="microlabel">Service to present</span>
          <select value={serviceSlug} onChange={(e) => setServiceSlug(e.target.value)} className={selectCls}>
            {services.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.title}{s.custom ? " (custom)" : ""} — {s.price}
              </option>
            ))}
          </select>
          {service && (
            <span className="mt-1 block text-[11px] text-muted">
              Price auto-filled from your pricing:{" "}
              <span className="font-mono text-bone">{service.price}</span>
            </span>
          )}
        </label>

        <div>
          <span className="microlabel">Patient personality · pick up to 2</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {archetypes.map((a) => {
              const on = picked.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleArchetype(a.id)}
                  className={`rounded-full border px-2.5 py-1 text-[11px] leading-tight transition-colors ${
                    on
                      ? "border-primary text-primary"
                      : "border-line text-dim active:border-line-strong"
                  }`}
                >
                  {a.archetype}
                </button>
              );
            })}
          </div>
        </div>

        <label>
          <div className="flex items-baseline justify-between">
            <span className="microlabel">What are you worried they&apos;ll say?</span>
            <span className="font-mono text-[10px] tabular-nums text-muted">
              {worry.length}/{WORRY_MAX_CHARS}
            </span>
          </div>
          <Input
            value={worry}
            onChange={(e) => setWorry(e.target.value.slice(0, WORRY_MAX_CHARS))}
            placeholder="e.g. they think insurance should cover it"
            className="mt-1 text-[14px]"
          />
          <span className="mt-1 block text-[11px] text-muted">
            No names, dates, or real patient details.
          </span>
        </label>

        <div>
          <span className="microlabel">Difficulty</span>
          <Tabs value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)} className="mt-1">
            <TabsList className="h-9">
              {(["easy", "moderate", "hard"] as Difficulty[]).map((d) => (
                <TabsTrigger key={d} value={d} className="display text-[12px] capitalize tracking-normal">
                  {d}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <p className="mt-1 text-[11px] text-muted">
            Defaults to Hard — prep should be harder than the real thing.
          </p>
        </div>
      </div>

      {error && <p className="mt-3 text-sm text-red">{error}</p>}
      <div className="mt-auto pt-6">
        <Button size="lg"
          onClick={start}
          disabled={busy}
          className="display w-full tracking-tight">
            {busy ? "Building the sim" : "Walk into the prep room"}
          </Button>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScenarioReviewForm, type ScenarioDraft } from "@/components/service-builder";

export function ServiceEdit({ slug, initial }: { slug: string; initial: ScenarioDraft }) {
  const router = useRouter();
  const [draft, setDraft] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/custom-scenarios/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Couldn't save.");
      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setBusy(false);
    }
  }

  async function retire() {
    if (busy) return;
    setBusy(true);
    try {
      await fetch(`/api/custom-scenarios/${slug}`, { method: "DELETE" });
      router.push("/home");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="flex items-center justify-between">
        <span className="microlabel">Edit custom service</span>
        <Link href="/home" className="py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Cancel ✕
        </Link>
      </div>
      <h1 className="display-title mt-3 text-[22px] text-bone">{initial.title}</h1>
      <div className="mt-4">
        <ScenarioReviewForm value={draft} onChange={setDraft} />
      </div>
      {error && <p className="mt-3 text-sm text-red">{error}</p>}
      <div className="mt-6 flex flex-col gap-2">
        <button
          onClick={save}
          disabled={busy}
          className="display w-full rounded-card bg-mint py-3.5 text-[15px] tracking-wide text-mint-ink disabled:opacity-60"
        >
          {busy ? "Saving" : "Save changes"}
        </button>
        <button
          onClick={retire}
          disabled={busy}
          className="display w-full rounded-card border border-red/50 py-3 text-[13px] tracking-wide text-red disabled:opacity-60"
        >
          Retire this service
        </button>
        <p className="text-center text-[11px] text-muted">
          Retiring removes it from the roster — past reps and stats stay intact.
        </p>
      </div>
    </main>
  );
}

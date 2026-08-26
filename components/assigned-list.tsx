"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, CircleDot } from "lucide-react";

export interface AssignedItem {
  id: string;
  kind: "station" | "cards";
  stationSlug: string | null;
  title: string;
  dueLabel: string;
  tone: "normal" | "soon" | "overdue";
  state: "not_started" | "in_progress" | "done";
  counted: number;
  target: number;
  bestLetter: string | null;
  minGrade: string | null;
}

const TONE_CLS = {
  normal: "border-line-strong text-dim",
  soon: "border-amber/60 text-amber",
  overdue: "border-red/60 text-red",
};

/** The seat's homework, pinned atop Home. */
export function AssignedList({ items }: { items: AssignedItem[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function run(item: AssignedItem) {
    if (busy) return;
    if (item.kind === "cards") {
      router.push("/train/cards?shuffle=5");
      return;
    }
    setBusy(item.id);
    try {
      const res = await fetch("/api/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioSlug: item.stationSlug, difficulty: "moderate" }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/encounter/${data.encounterId}`);
      else setBusy(null);
    } catch {
      setBusy(null);
    }
  }

  if (items.length === 0) return null;
  return (
    <section className="px-4">
      <div className="mt-4 flex items-baseline justify-between">
        <div className="microlabel">Assigned</div>
        <Link href="/admin/training" className="text-xs text-muted">
          from your clinic
        </Link>
      </div>
      <div className="mt-1 divide-y divide-hairline border-t border-hairline">
        {items.map((a) => (
          <button
            key={a.id}
            onClick={() => run(a)}
            disabled={busy === a.id || a.state === "done"}
            className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-raised active:bg-raised disabled:opacity-100"
          >
            {a.state === "done" ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-[#2ec4a5]" strokeWidth={1.5} />
            ) : a.state === "in_progress" ? (
              <CircleDot className="h-5 w-5 shrink-0 text-teal" strokeWidth={1.5} />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-faint" strokeWidth={1.5} />
            )}
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold text-ink">{a.title}</span>
              <span className="mt-0.5 block font-mono text-[10px] uppercase tracking-wide text-muted">
                {a.counted}/{a.target} {a.kind === "cards" ? "shuffles" : "reps"}
                {a.minGrade ? ` · min ${a.minGrade}` : ""}
                {a.bestLetter ? ` · best ${a.bestLetter}` : ""}
              </span>
            </span>
            <span
              className={`shrink-0 rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] ${
                a.state === "done" ? "border-[#2ec4a5]/50 text-[#1d8f77]" : TONE_CLS[a.tone]
              }`}
            >
              {a.state === "done" ? "done" : busy === a.id ? "…" : a.dueLabel}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

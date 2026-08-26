"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface StationOpt {
  slug: string;
  title: string;
  custom: boolean;
}

/** Admin: create an assignment for the whole team. */
export function AssignmentCreate({ stations }: { stations: StationOpt[] }) {
  const router = useRouter();
  const [target, setTarget] = useState(stations[0]?.slug ?? "cards");
  const [dueAt, setDueAt] = useState(() => {
    const d = new Date(Date.now() + 3 * 86_400_000);
    return d.toISOString().slice(0, 10);
  });
  const [reps, setReps] = useState("3");
  const [minGrade, setMinGrade] = useState<string>("B");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: target === "cards" ? "cards" : "station",
          stationSlug: target === "cards" ? undefined : target,
          dueAt: `${dueAt}T23:59:00`,
          targetReps: parseInt(reps, 10) || 1,
          minGrade: target === "cards" || minGrade === "any" ? null : minGrade,
          seats: "all",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't assign.");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't assign.");
    } finally {
      setBusy(false);
    }
  }

  const selectCls =
    "mt-1 h-9 bg-panel text-[13px]";

  return (
    <div className="raised mt-2 rounded-card px-3.5 pb-3.5 pt-3">
      <div className="microlabel">New assignment · all seats</div>
      <label className="mt-2 block">
        <span className="text-[11px] text-muted">Target</span>
        <select value={target} onChange={(e) => setTarget(e.target.value)} className={selectCls}>
          {stations.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
              {s.custom ? " (custom)" : ""}
            </option>
          ))}
          <option value="cards">Objection cards · 5-card shuffle</option>
        </select>
      </label>
      <div className="mt-2.5 flex gap-2.5">
        <label className="flex-1">
          <span className="text-[11px] text-muted">Due</span>
          <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} className={selectCls} />
        </label>
        <label className="w-16">
          <span className="text-[11px] text-muted">Reps</span>
          <Input
            inputMode="numeric"
            value={reps}
            onChange={(e) => setReps(e.target.value.replace(/\D/g, ""))}
            className={`${selectCls} text-center font-mono tabular-nums`}
          />
        </label>
        <label className="w-20">
          <span className="text-[11px] text-muted">Min grade</span>
          <select
            value={minGrade}
            onChange={(e) => setMinGrade(e.target.value)}
            disabled={target === "cards"}
            className={selectCls}
          >
            {["any", "A", "B", "C", "D"].map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="mt-2 text-sm text-red">{error}</p>}
      <Button size="lg"
        onClick={create}
        disabled={busy}
        className="display w-full tracking-tight">
          {busy ? "Assigning" : "Assign to team"}
        </Button>
    </div>
  );
}

export function AssignmentRetire({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={async () => {
        setBusy(true);
        await fetch("/api/assignments", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        router.refresh();
      }}
      disabled={busy}
      className="shrink-0 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-muted underline disabled:opacity-50"
    >
      retire
    </Button>
  );
}

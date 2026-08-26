"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export function RequireCurriculumToggle({ initial }: { initial: boolean }) {
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    if (busy) return;
    const next = !on;
    setBusy(true);
    setOn(next); // optimistic
    try {
      const res = await fetch("/api/admin/training", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requireCurriculum: next }),
      });
      if (!res.ok) setOn(!next);
    } catch {
      setOn(!next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="raised mt-4 flex w-full items-center justify-between gap-3 rounded-card px-4 py-3.5 text-left">
      <span className="min-w-0">
        <span className="block text-[14px] font-semibold text-ink">
          Require curriculum before reps
        </span>
        <span className="mt-0.5 block text-[12px] leading-snug text-muted">
          When on, seats must finish Modules 0–5 before running stations — the
          test-out shortcut is disabled for your team.
        </span>
      </span>
      <Switch
        checked={on}
        onCheckedChange={toggle}
        disabled={busy}
        aria-label="Require curriculum before reps"
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty } from "@/lib/types";

export function RerunButton({
  scenarioSlug,
  difficulty,
  secondary = false,
}: {
  scenarioSlug: string;
  difficulty: Difficulty;
  secondary?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rerun() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioSlug, difficulty }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't start a new encounter.");
      router.push(`/encounter/${data.encounterId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start a new encounter.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={rerun}
        disabled={busy}
        className={`display w-full py-3.5 text-[15px] tracking-wide transition-opacity disabled:opacity-60 ${
          secondary
            ? "rounded-card border border-line-strong text-bone"
            : "rounded-card bg-primary text-white"
        }`}
      >
        {busy ? "Prepping the room" : "Same station, new patient"}
      </button>
      {error && <div className="text-center text-sm text-red">{error}</div>}
    </div>
  );
}

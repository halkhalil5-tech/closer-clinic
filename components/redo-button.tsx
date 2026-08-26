"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function RedoButton({
  encounterId,
  primary = false,
  paper = false,
}: {
  encounterId: string;
  primary?: boolean;
  /** Ink-on-paper styling, for placement inside the scorecard document. */
  paper?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function redo() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/encounters/${encounterId}/redo`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't start the replay.");
      router.push(`/encounter/${data.encounterId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the replay.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={redo}
        disabled={busy}
        className={`display w-full transition-opacity disabled:opacity-60 ${
          paper
            ? "border-2 border-paper-ink py-2.5 text-[13px] tracking-wide text-paper-ink"
            : primary
              ? "rounded-card bg-primary py-3.5 text-[15px] tracking-wide text-white"
              : "rounded-card border border-line-strong py-3.5 text-[15px] tracking-wide text-bone"
        }`}
      >
        {busy ? "Rewinding the room" : "Redo the moment"}
      </button>
      {error && <div className="text-center text-sm text-red">{error}</div>}
    </div>
  );
}

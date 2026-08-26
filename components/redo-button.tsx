"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
      <Button
        variant={paper || !primary ? "outline" : "default"}
        size="lg"
        onClick={redo}
        disabled={busy}
        className={`display w-full tracking-tight ${
          paper ? "rounded-xl border-2 border-paper-ink text-paper-ink hover:bg-paper-ink/5 active:bg-paper-ink/5" : ""
        }`}
      >
        {busy ? "Rewinding the room" : "Redo the moment"}
      </Button>
      {error && <div className="text-center text-sm text-red">{error}</div>}
    </div>
  );
}

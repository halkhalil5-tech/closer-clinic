"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PrepRerunButton({ encounterId }: { encounterId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rerun() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rerunOf: encounterId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't restart.");
      router.push(`/encounter/${data.encounterId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't restart.");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={rerun}
        disabled={busy}
        className="display w-full rounded-card bg-mint py-3.5 text-[15px] tracking-wide text-mint-ink disabled:opacity-60"
      >
        {busy ? "Re-rolling the patient" : "Again, different personality"}
      </button>
      {error && <div className="text-center text-sm text-red">{error}</div>}
    </div>
  );
}

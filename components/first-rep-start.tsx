"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FirstRepStart({ scenarioSlug }: { scenarioSlug: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/encounters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioSlug, difficulty: "easy" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't open the room.");
      router.push(`/encounter/${data.encounterId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't open the room.");
      setBusy(false);
    }
  }

  return (
    <>
      {error && <p className="mb-2 text-sm text-red">{error}</p>}
      <button
        onClick={start}
        disabled={busy}
        className="display w-full rounded-card bg-mint py-4 text-[16px] tracking-wide text-mint-ink disabled:opacity-60"
      >
        {busy ? "Opening the door" : "Walk into the room"}
      </button>
    </>
  );
}

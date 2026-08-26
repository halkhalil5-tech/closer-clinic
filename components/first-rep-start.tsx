"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { primeAudio } from "@/lib/voice/elevenlabs-client";

export function FirstRepStart({ scenarioSlug, label }: { scenarioSlug: string; label?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (busy) return;
    primeAudio(); // unlock patient audio while inside the tap gesture
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
        className="display w-full rounded-card bg-primary py-4 text-[16px] tracking-wide text-white disabled:opacity-60"
      >
        {busy ? "Opening the door" : (label ?? "Walk into the room")}
      </button>
    </>
  );
}

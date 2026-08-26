"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function TestOutStart() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/test-out", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Couldn't start the challenge.");
      router.push(`/encounter/${data.encounterId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the challenge.");
      setBusy(false);
    }
  }

  return (
    <>
      {error && <p className="mb-2 text-sm text-red">{error}</p>}
      <button
        onClick={start}
        disabled={busy}
        className="display w-full rounded-card bg-primary py-3.5 text-[15px] tracking-wide text-white disabled:opacity-60"
      >
        {busy ? "Prepping the room" : "Start the challenge rep"}
      </button>
    </>
  );
}

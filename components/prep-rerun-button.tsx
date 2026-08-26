"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
      <Button size="lg" onClick={rerun} disabled={busy} className="display w-full tracking-tight">
        {busy ? "Re-rolling the patient" : "Again, different personality"}
      </Button>
      {error && <div className="text-center text-sm text-red">{error}</div>}
    </div>
  );
}

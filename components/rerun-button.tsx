"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Difficulty } from "@/lib/types";
import { Button } from "@/components/ui/button";

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
      <Button
        variant={secondary ? "outline" : "default"}
        size="lg"
        onClick={rerun}
        disabled={busy}
        className="display w-full tracking-tight"
      >
        {busy ? "Prepping the room" : "Same station, new patient"}
      </Button>
      {error && <div className="text-center text-sm text-red">{error}</div>}
    </div>
  );
}

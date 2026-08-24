"use client";

import { useState } from "react";
import type { StationRole } from "@/lib/types";

/** Clinic admin: flip a seat between provider and front-desk training. */
export function SeatRoleToggle({
  userId,
  initial,
  self,
}: {
  userId: string;
  initial: StationRole;
  self: boolean;
}) {
  const [role, setRole] = useState<StationRole>(initial);
  const [busy, setBusy] = useState(false);

  async function flip() {
    if (busy) return;
    const next: StationRole = role === "provider" ? "front_desk" : "provider";
    setBusy(true);
    try {
      const res = await fetch("/api/admin/seat-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: next }),
      });
      if (res.ok) setRole(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={flip}
      disabled={busy || self}
      title={self ? "Your own seat stays provider" : "Tap to switch this seat's role"}
      className={`shrink-0 rounded-card border px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.14em] disabled:opacity-60 ${
        role === "front_desk" ? "border-amber/60 text-amber" : "border-line-strong text-dim"
      }`}
    >
      {role === "front_desk" ? "Front desk" : "Provider"}
    </button>
  );
}

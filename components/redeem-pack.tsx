"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Settings: enter a vendor code, unlock a station pack. */
export function RedeemPack() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  async function redeem() {
    const clean = code.trim();
    if (!clean || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/packs/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ ok: true, text: `${data.packName} unlocked — it's on your Stations tab.` });
        setCode("");
        router.refresh();
      } else {
        setMessage({ ok: false, text: data.error ?? "That code didn't work." });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <span className="block text-[14px] font-semibold text-ink">Redeem a pack</span>
      <span className="mt-0.5 block text-[12px] text-muted">
        Vendor station packs unlock with a code.
      </span>
      <div className="mt-2 flex gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="PACK-CODE"
          autoCapitalize="characters"
          className="min-w-0 flex-1 font-mono text-[13px] uppercase tracking-wide"
        />
        <Button variant="outline" onClick={redeem} disabled={busy || !code.trim()} className="shrink-0">
          Unlock
        </Button>
      </div>
      {message && (
        <p className={`mt-1.5 text-[12px] ${message.ok ? "text-success" : "text-red"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

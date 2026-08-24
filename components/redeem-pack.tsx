"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="PACK-CODE"
          autoCapitalize="characters"
          className="min-w-0 flex-1 border border-line bg-panel px-2 py-2 font-mono text-[13px] uppercase tracking-wide text-ink placeholder:text-muted focus:border-mint focus:outline-none"
        />
        <button
          onClick={redeem}
          disabled={busy || !code.trim()}
          className="shrink-0 rounded-card border border-line-strong px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-bone disabled:opacity-50"
        >
          Unlock
        </button>
      </div>
      {message && (
        <p className={`mt-1.5 text-[12px] ${message.ok ? "text-mint" : "text-red"}`}>
          {message.text}
        </p>
      )}
    </div>
  );
}

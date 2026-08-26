"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Plain admin forms: create packs, attach stations, mint codes. No design work. */

async function post(body: Record<string, unknown>) {
  const res = await fetch("/api/admin/packs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, data: await res.json().catch(() => ({})) };
}

const input =
  "w-full border border-line bg-panel px-2 py-1.5 text-[13px] text-ink placeholder:text-muted focus:border-primary focus:outline-none";
const btn =
  "rounded-card border border-line-strong px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-bone disabled:opacity-50";

export function PackCreateForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [vendor, setVendor] = useState("");
  const [accent, setAccent] = useState("#5B8DEF");
  const [distribution, setDistribution] = useState<"code" | "public">("code");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    setBusy(true);
    setMsg("");
    const { ok, data } = await post({
      action: "create",
      name,
      vendor,
      specialty: "podiatry",
      accent,
      distribution,
    });
    setBusy(false);
    setMsg(ok ? `Created (${data.packId}).` : data.error ?? "Failed.");
    if (ok) {
      setName("");
      setVendor("");
      router.refresh();
    }
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      <input className={input} placeholder="Pack name" value={name} onChange={(e) => setName(e.target.value)} />
      <input className={input} placeholder="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
      <div className="flex gap-2">
        <input className={input} placeholder="#accent" value={accent} onChange={(e) => setAccent(e.target.value)} />
        <select
          className={input}
          value={distribution}
          onChange={(e) => setDistribution(e.target.value as "code" | "public")}
        >
          <option value="code">code</option>
          <option value="public">public</option>
        </select>
      </div>
      <button className={btn} disabled={busy || !name || !vendor} onClick={submit}>
        Create pack
      </button>
      {msg && <p className="text-[12px] text-muted">{msg}</p>}
    </div>
  );
}

export function PackRow({
  pack,
}: {
  pack: { id: string; name: string; vendor: string; distribution: string; stationSlugs: string[]; codes: string[] };
}) {
  const router = useRouter();
  const [slugs, setSlugs] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function attach() {
    setBusy(true);
    const { ok, data } = await post({ action: "attach", packId: pack.id, slugs });
    setBusy(false);
    setMsg(ok ? `Attached ${data.attached}, detached ${data.detached}.` : data.error ?? "Failed.");
    if (ok) {
      setSlugs("");
      router.refresh();
    }
  }

  async function mint() {
    setBusy(true);
    const { ok, data } = await post({ action: "code", packId: pack.id });
    setBusy(false);
    setMsg(ok ? `New code: ${data.code}` : data.error ?? "Failed.");
    if (ok) router.refresh();
  }

  return (
    <div className="border-t border-hairline py-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[14px] font-semibold text-ink">{pack.name}</span>
        <span className="font-mono text-[10px] uppercase text-muted">{pack.distribution}</span>
      </div>
      <div className="mt-0.5 text-[12px] text-muted">{pack.vendor}</div>
      <div className="mt-1 font-mono text-[11px] text-dim">
        stations: {pack.stationSlugs.length ? pack.stationSlugs.join(", ") : "none"}
      </div>
      <div className="mt-0.5 font-mono text-[11px] text-dim">
        codes: {pack.codes.length ? pack.codes.join(", ") : "none"}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          className={input}
          placeholder="slugs to attach (-slug detaches)"
          value={slugs}
          onChange={(e) => setSlugs(e.target.value)}
        />
        <button className={btn} disabled={busy || !slugs} onClick={attach}>
          Attach
        </button>
        <button className={btn} disabled={busy} onClick={mint}>
          + Code
        </button>
      </div>
      {msg && <p className="mt-1 text-[12px] text-muted">{msg}</p>}
    </div>
  );
}

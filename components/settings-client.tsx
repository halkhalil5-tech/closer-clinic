"use client";

import { RedeemPack } from "@/components/redeem-pack";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

const VOICE_PREF_KEY = "closer-clinic:patient-voice";

const SPECIALTIES = [
  { id: "podiatry", label: "Podiatry", available: true },
  { id: "regen", label: "Regenerative medicine", available: true },
  { id: "dental", label: "Dental", available: false },
  { id: "medspa", label: "Med spa / plastics", available: false },
] as const;

export function SettingsClient({
  specialty: initialSpecialty,
  hasRealAuth,
}: {
  specialty: string;
  hasRealAuth: boolean;
}) {
  const router = useRouter();
  const [voiceOn, setVoiceOn] = useState(true);
  const [specialty, setSpecialty] = useState(initialSpecialty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(VOICE_PREF_KEY);
    if (saved !== null) setVoiceOn(saved === "on");
  }, []);

  function toggleVoice() {
    const next = !voiceOn;
    setVoiceOn(next);
    localStorage.setItem(VOICE_PREF_KEY, next ? "on" : "off");
  }

  async function changeSpecialty(id: string) {
    if (id === specialty || saving) return;
    setSaving(true);
    setError(null);
    const prev = specialty;
    setSpecialty(id);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty: id }),
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setSpecialty(prev);
      setError("Couldn't save your specialty. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    if (hasRealAuth) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <main className="mt-4 flex flex-col gap-3 px-4">
      <section className="rounded-xl border border-line bg-panel">
        <div className="flex items-center justify-between p-3">
          <div>
            <div className="text-[14px] font-semibold">Patient voice</div>
            <div className="mt-0.5 text-[12px] text-muted">Speak replies out loud by default</div>
          </div>
          <Switch checked={voiceOn} onCheckedChange={toggleVoice} aria-label="Patient voice" />
        </div>
      </section>

      <section className="rounded-xl border border-line bg-panel p-3">
        <div className="microlabel">Specialty</div>
        <div className="mt-2 overflow-hidden rounded-lg border border-line">
          {SPECIALTIES.map((s, i) => (
            <button
              key={s.id}
              disabled={!s.available || saving}
              onClick={() => changeSpecialty(s.id)}
              className={`flex w-full items-center justify-between border-l-2 px-3 py-2.5 text-left text-[13px] ${
                i > 0 ? "border-t border-t-line" : ""
              } ${
                specialty === s.id
                  ? "border-l-primary bg-panel-2 font-semibold text-ink"
                  : "border-l-transparent bg-panel text-dim"
              } ${!s.available ? "opacity-45" : ""}`}
            >
              <span>{s.label}</span>
              <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-muted">
                {!s.available ? "Soon" : specialty === s.id ? <span className="text-primary">Active</span> : ""}
              </span>
            </button>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-red">{error}</p>}
      </section>

      <a
        href="/import"
        className="card-lift flex items-center justify-between rounded-xl border border-line bg-panel p-3"
      >
        <span>
          <span className="block text-[14px] font-semibold">Import from my website</span>
          <span className="mt-0.5 block text-[12px] text-muted">
            Read your services and pricing pages into training stations.
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.5} />
      </a>

      <a
        href="/admin/training"
        className="card-lift flex items-center justify-between rounded-xl border border-line bg-panel p-3"
      >
        <span>
          <span className="block text-[14px] font-semibold">Team training</span>
          <span className="mt-0.5 block text-[12px] text-muted">
            Seat progress, quiz scores, and the curriculum-before-reps policy.
          </span>
        </span>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.5} />
      </a>

      <section className="rounded-xl border border-line bg-panel p-3">
        <RedeemPack />
      </section>

      <section className="rounded-xl border border-line bg-panel p-3">
        <div className="text-[14px] font-semibold">Subscription</div>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          Billing arrives with clinic accounts in Phase 2. Right now every account has full access.
        </p>
      </section>

      <section className="rounded-xl border border-line bg-panel p-3">
        <div className="text-[14px] font-semibold">Privacy</div>
        <p className="mt-1 text-[12px] leading-relaxed text-muted">
          Every patient in Closer Clinic is fictional — an AI character. Transcripts contain no
          PHI and are only used to grade your reps and show your trends. Never enter real patient
          information into an encounter.
        </p>
      </section>

      <Button variant="outline" onClick={signOut} className="text-danger">
        Sign out
      </Button>
    </main>
  );
}

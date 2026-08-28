"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const SPECIALTIES = [
  { id: "podiatry", label: "Podiatry", note: "8 stations live", available: true },
  { id: "regen", label: "Regenerative medicine", note: "10 stations live", available: true },
  { id: "dental", label: "Dental", note: "Coming soon", available: false },
  { id: "medspa", label: "Med spa / plastics", note: "Coming soon", available: false },
] as const;

const STEPS = [
  {
    title: "Pick a station",
    body: "Choose a scenario from your specialty — a real service, a real price, a patient who needs it. You know the chart before you walk in.",
  },
  {
    title: "Run the encounter by voice",
    body: "Tap the mic and talk like you're in the room. The AI patient has a personality, real objections, and no patience for a weak pitch. Ask for the close.",
  },
  {
    title: "Get graded like an OSCE",
    body: "Five rubric categories, the moment it was won or lost, and one drill for your next rep. Watch your close rate climb week over week.",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [specialty, setSpecialty] = useState<string>("podiatry");
  const [step, setStep] = useState(0); // 0 = specialty pick, 1..3 = how-it-works
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function finish(next: string = "/train") {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty, onboarded: true }),
      });
      if (!res.ok) throw new Error("Couldn't save your specialty.");
      // New users land in TRAIN — the curriculum is the front door.
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-8">
      <div className="microlabel text-primary">Closer Clinic</div>

      {step === 0 ? (
        <div className="flex flex-1 flex-col">
          <h1 className="display mt-5 text-[32px] text-ink">
            What do
            <br />
            you practice?
          </h1>
          <p className="mt-2 text-[14px] text-dim">Your scenario library matches your specialty.</p>
          <div className="mt-6 border border-line">
            {SPECIALTIES.map((s, i) => (
              <button
                key={s.id}
                disabled={!s.available}
                onClick={() => setSpecialty(s.id)}
                className={`flex w-full items-center justify-between border-l-2 p-4 text-left ${
                  i > 0 ? "border-t border-t-line" : ""
                } ${
                  specialty === s.id
                    ? "border-l-primary bg-panel-2"
                    : "border-l-transparent bg-panel"
                } ${!s.available ? "opacity-45" : ""}`}
              >
                <span className="display text-[15px] text-ink">{s.label}</span>
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.12em] ${
                    specialty === s.id ? "text-primary" : "text-muted"
                  }`}
                >
                  {s.note}
                </span>
              </button>
            ))}
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setStep(1)}
            className="display mt-8 bg-primary py-3.5 text-[15px] tracking-wide text-white"
          >
            Continue
          </button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="mt-5 flex gap-1">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-0.5 flex-1 ${i < step ? "bg-primary" : "bg-line"}`} />
            ))}
          </div>
          <div className="mt-8 font-mono text-[11px] font-semibold tracking-[0.2em] text-primary">
            {String(step).padStart(2, "0")} / 03
          </div>
          <h1 className="display mt-2 text-[32px] text-ink">{STEPS[step - 1].title}</h1>
          <p className="mt-4 text-[16px] leading-relaxed text-dim">{STEPS[step - 1].body}</p>
          <div className="flex-1" />
          {error && (
            <div className="mb-3 border border-red/50 bg-red/10 p-3 text-sm text-red">{error}</div>
          )}
          <button
            onClick={() => (step < 3 ? setStep(step + 1) : finish())}
            disabled={busy}
            className="display mt-8 bg-primary py-3.5 text-[15px] tracking-wide text-white disabled:opacity-50"
          >
            {step < 3 ? "Next" : busy ? "Setting up" : "Walk into your first room"}
          </button>
          {step === 3 && (
            <button
              onClick={() => finish("/import")}
              disabled={busy}
              className="mt-2 w-full py-2.5 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-bone"
            >
              Import my services from my website first →
            </button>
          )}
        </div>
      )}
    </main>
  );
}

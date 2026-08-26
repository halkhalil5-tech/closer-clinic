"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { scrubFreeText } from "@/lib/scrub";
import { derivePriceStrings } from "@/lib/pricing";
import {
  PriceFields,
  priceConfigFromForm,
  type PriceFormState,
} from "@/components/price-fields";

export interface ScenarioDraft {
  title: string;
  priceDisplay: string;
  priceStructure: string;
  serviceDesc: string;
  patientCc: string;
  clinicalContext: string;
  closeGoal: string;
  objectionSeeds: string[];
  /** Flashcards drafted from the user's stated objections (review-before-save). */
  cards?: { front: string; isolate: string; reframe: string; close: string }[];
}

/* ------------------------------ review form ------------------------------ */

const areaCls =
  "mt-1 w-full resize-none border border-line bg-bg px-3 py-2.5 text-[13.5px] leading-snug text-ink placeholder:text-muted focus:border-primary focus:outline-none";

export function ScenarioReviewForm({
  value,
  onChange,
}: {
  value: ScenarioDraft;
  onChange: (v: ScenarioDraft) => void;
}) {
  const set = (patch: Partial<ScenarioDraft>) => onChange({ ...value, ...patch });
  return (
    <div className="flex flex-col gap-3.5">
      <label>
        <span className="microlabel">Service name</span>
        <input value={value.title} onChange={(e) => set({ title: e.target.value })} className={areaCls} />
      </label>
      <div className="flex gap-3">
        <label className="w-32">
          <span className="microlabel">Price shown</span>
          <input
            value={value.priceDisplay}
            onChange={(e) => set({ priceDisplay: e.target.value })}
            className={`${areaCls} font-mono tabular-nums text-bone`}
          />
        </label>
        <label className="flex-1">
          <span className="microlabel">Price structure</span>
          <input
            value={value.priceStructure}
            onChange={(e) => set({ priceStructure: e.target.value })}
            className={areaCls}
          />
        </label>
      </div>
      <label>
        <span className="microlabel">Service description</span>
        <textarea rows={2} value={value.serviceDesc} onChange={(e) => set({ serviceDesc: e.target.value })} className={areaCls} />
      </label>
      <label>
        <span className="microlabel">Patient&apos;s chief complaint (their words)</span>
        <textarea rows={2} value={value.patientCc} onChange={(e) => set({ patientCc: e.target.value })} className={areaCls} />
      </label>
      <label>
        <span className="microlabel">Chart you know walking in</span>
        <textarea
          rows={4}
          value={value.clinicalContext}
          onChange={(e) => set({ clinicalContext: e.target.value })}
          className={areaCls}
        />
      </label>
      <label>
        <span className="microlabel">Close goal</span>
        <textarea rows={2} value={value.closeGoal} onChange={(e) => set({ closeGoal: e.target.value })} className={areaCls} />
      </label>
      {value.cards && value.cards.length > 0 && (
        <div>
          <span className="microlabel">New objection cards (from your objections)</span>
          {value.cards.map((c, i) => (
            <div key={i} className="mt-2 border-l-2 border-l-bone pl-3">
              <input
                value={c.front}
                onChange={(e) => {
                  const cards = [...value.cards!];
                  cards[i] = { ...cards[i], front: e.target.value };
                  set({ cards });
                }}
                className={areaCls}
              />
              {(["isolate", "reframe", "close"] as const).map((k) => (
                <input
                  key={k}
                  value={c[k]}
                  placeholder={k}
                  onChange={(e) => {
                    const cards = [...value.cards!];
                    cards[i] = { ...cards[i], [k]: e.target.value };
                    set({ cards });
                  }}
                  className={areaCls}
                />
              ))}
            </div>
          ))}
        </div>
      )}

      <div>
        <span className="microlabel">Objection seeds (yours first)</span>
        {value.objectionSeeds.map((o, i) => (
          <input
            key={i}
            value={o}
            onChange={(e) => {
              const next = [...value.objectionSeeds];
              next[i] = e.target.value;
              set({ objectionSeeds: next });
            }}
            className={areaCls}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------- the guided builder ---------------------------- */

type Step = 0 | 1 | 2 | 3 | 4 | 5; // 5 = review

export function ServiceBuilder() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState<PriceFormState>({
    kind: "single",
    amount: "",
    sessions: "",
    interval: "",
    anchor: "",
  });
  const [condition, setCondition] = useState("");
  const [typicalPatient, setTypicalPatient] = useState("");
  const [obj1, setObj1] = useState("");
  const [obj2, setObj2] = useState("");
  const [draft, setDraft] = useState<ScenarioDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = priceConfigFromForm(price);
  const preview = config.amount > 0 ? derivePriceStrings(config) : null;

  const canNext =
    step === 0
      ? title.trim().length >= 2
      : step === 1
        ? Boolean(preview)
        : step === 2
          ? condition.trim().length >= 3
          : true;

  function localScrub(text: string): boolean {
    const r = scrubFreeText(text);
    if (!r.ok) {
      setError(r.reason ?? "Please rephrase that.");
      return false;
    }
    return true;
  }

  async function generate() {
    setError(null);
    if (!localScrub(condition) || !localScrub(typicalPatient) || !localScrub(obj1) || !localScrub(obj2)) return;
    setBusy(true);
    try {
      const res = await fetch("/api/custom-scenarios/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          config,
          condition: condition.trim(),
          typicalPatient: typicalPatient.trim() || undefined,
          objections: [obj1, obj2].map((o) => o.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setDraft(data);
      setStep(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function save() {
    if (!draft || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/custom-scenarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't save.");
      router.push("/home");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setBusy(false);
    }
  }

  const STEP_TITLES = [
    "What's the service?",
    "What does it cost?",
    "What does it treat?",
    "Who's the typical patient?",
    "What do they push back with?",
    "Review your station",
  ];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="flex items-center justify-between">
        <span className="microlabel">Add your service</span>
        <Link href="/home" className="py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Cancel ✕
        </Link>
      </div>

      {/* step rail */}
      <div className="mt-3 flex gap-1">
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <div key={s} className={`h-0.5 flex-1 ${s < step ? "bg-primary" : s === step ? "bg-bone" : "bg-line"}`} />
        ))}
      </div>

      <h1 className="display-title mt-4 text-[22px] text-bone">{STEP_TITLES[step]}</h1>

      <div className="mt-4 flex flex-1 flex-col">
        {step === 0 && (
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. PRP injection series"
            className="w-full border border-line bg-bg px-3 py-3 text-[16px] text-ink placeholder:text-muted focus:border-primary focus:outline-none"
          />
        )}

        {step === 1 && (
          <div>
            <PriceFields value={price} onChange={setPrice} />
            <div className="mt-4 border-l-2 border-l-bone pl-3">
              <div className="microlabel">Patients will hear</div>
              <p className="mt-0.5 text-[13px] leading-snug text-dim">
                {preview ? (
                  <>
                    <span className="font-mono font-semibold text-bone">{preview.priceDisplay}</span>
                    <span className="text-muted"> — {preview.priceStructure}</span>
                  </>
                ) : (
                  "Enter a price to preview."
                )}
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <textarea
            autoFocus
            rows={3}
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g. chronic Achilles tendinopathy that hasn't responded to rest and PT"
            className="w-full resize-none border border-line bg-bg px-3 py-3 text-[15px] leading-snug text-ink placeholder:text-muted focus:border-primary focus:outline-none"
          />
        )}

        {step === 3 && (
          <div>
            <textarea
              autoFocus
              rows={3}
              value={typicalPatient}
              onChange={(e) => setTypicalPatient(e.target.value)}
              placeholder="e.g. an active adult in their 50s who runs or works on their feet (optional)"
              className="w-full resize-none border border-line bg-bg px-3 py-3 text-[15px] leading-snug text-ink placeholder:text-muted focus:border-primary focus:outline-none"
            />
            <p className="mt-2 text-[12px] leading-snug text-muted">
              Describe a <span className="text-dim">type</span> of patient, never a real one — no
              names, dates, or details from an actual chart.
            </p>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-3">
            {[
              [obj1, setObj1, "e.g. “My insurance should cover this”"],
              [obj2, setObj2, "e.g. “My buddy said it didn't work for him”"],
            ].map(([val, set, ph], i) => (
              <input
                key={i}
                autoFocus={i === 0}
                value={val as string}
                onChange={(e) => (set as (v: string) => void)(e.target.value)}
                placeholder={ph as string}
                className="w-full border border-line bg-bg px-3 py-3 text-[15px] text-ink placeholder:text-muted focus:border-primary focus:outline-none"
              />
            ))}
            <p className="text-[12px] leading-snug text-muted">
              The two you actually hear most (optional) — the AI patient will lead with them.
            </p>
          </div>
        )}

        {step === 5 && draft && (
          <div>
            <p className="mb-3 text-[12.5px] leading-snug text-muted">
              The AI expanded your answers into a full station. Everything is editable — this is
              what the patient, and the grader, will work from.
            </p>
            <ScenarioReviewForm value={draft} onChange={setDraft} />
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red">{error}</p>}

        <div className="mt-auto flex flex-col gap-2 pt-6">
          {step < 4 && (
            <button
              onClick={() => {
                setError(null);
                if (step === 2 && !localScrub(condition)) return;
                if (step === 3 && !localScrub(typicalPatient)) return;
                setStep((step + 1) as Step);
              }}
              disabled={!canNext}
              className="display w-full rounded-card bg-primary py-3.5 text-[15px] tracking-wide text-white disabled:opacity-40"
            >
              Next
            </button>
          )}
          {step === 4 && (
            <button
              onClick={generate}
              disabled={busy}
              className="display w-full rounded-card bg-primary py-3.5 text-[15px] tracking-wide text-white disabled:opacity-60"
            >
              {busy ? "Writing your station" : "Build the station"}
            </button>
          )}
          {step === 5 && (
            <>
              <button
                onClick={save}
                disabled={busy}
                className="display w-full rounded-card bg-primary py-3.5 text-[15px] tracking-wide text-white disabled:opacity-60"
              >
                {busy ? "Saving" : "Save to your services"}
              </button>
              <button
                onClick={generate}
                disabled={busy}
                className="display w-full rounded-card border border-line-strong py-3 text-[13px] tracking-wide text-bone disabled:opacity-60"
              >
                Regenerate
              </button>
            </>
          )}
          {step > 0 && step < 5 && (
            <button
              onClick={() => setStep((step - 1) as Step)}
              className="w-full py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
            >
              Back
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

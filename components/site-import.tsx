"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ScenarioReviewForm, type ScenarioDraft } from "@/components/service-builder";

interface FoundService {
  name: string;
  description: string;
  price: string | null;
  include: boolean;
}

type Phase = "url" | "checklist" | "review" | "done";

/**
 * "Import from my website": paste the practice URL → pick the services we
 * found (each row editable) → each becomes a custom station through the
 * normal generation pipeline, review step preserved.
 */
export function SiteImport() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("url");
  const [url, setUrl] = useState("");
  const [found, setFound] = useState<FoundService[]>([]);
  const [queue, setQueue] = useState<FoundService[]>([]);
  const [draft, setDraft] = useState<ScenarioDraft | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallback, setFallback] = useState(false);

  async function scan() {
    if (busy || url.trim().length < 4) return;
    setBusy(true);
    setError(null);
    setFallback(false);
    try {
      const res = await fetch("/api/import-site", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFallback(Boolean(data.fallback));
        throw new Error(data.error || "Couldn't read the site.");
      }
      setFound(
        data.services.map((s: Omit<FoundService, "include">) => ({ ...s, include: true }))
      );
      setPhase("checklist");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read the site.");
    } finally {
      setBusy(false);
    }
  }

  function parseAmount(price: string | null): number {
    const n = price?.match(/\d[\d,]*/)?.[0];
    return n ? parseInt(n.replace(/,/g, ""), 10) : 0;
  }

  async function generateNext(q: FoundService[]) {
    if (q.length === 0) {
      setPhase("done");
      return;
    }
    const svc = q[0];
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/custom-scenarios/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: svc.name,
          config: { kind: "single", amount: parseAmount(svc.price) },
          condition: svc.description || `patients who need ${svc.name}`,
          source: "site",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");
      setDraft(data);
      setQueue(q);
      setPhase("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setBusy(false);
    }
  }

  async function confirmChecklist() {
    const selected = found.filter((s) => s.include);
    if (selected.length === 0) return;
    const missing = selected.find((s) => parseAmount(s.price) === 0);
    if (missing) {
      setError(`No price found for “${missing.name}” — enter one before importing.`);
      return;
    }
    await generateNext(selected);
  }

  async function saveCurrent() {
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
      setSavedCount((n) => n + 1);
      setBusy(false);
      await generateNext(queue.slice(1));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 pb-8 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="flex items-center justify-between">
        <span className="microlabel">Import from my website</span>
        <Link href="/home" className="py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Cancel ✕
        </Link>
      </div>

      {phase === "url" && (
        <>
          <h1 className="display-title mt-4 text-[22px] text-bone">
            Your website already knows your services
          </h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-dim">
            Paste your practice URL. We read your services and pricing pages —
            services and prices only, never testimonials or anything
            patient-shaped — and turn them into training stations.
          </p>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="yourpractice.com"
            inputMode="url"
            autoCapitalize="none"
            className="mt-5 w-full border border-line bg-bg px-3 py-3 font-mono text-[15px] text-ink placeholder:text-muted focus:border-primary focus:outline-none"
          />
          {error && (
            <p className="mt-3 text-sm text-red">
              {error}{" "}
              {fallback && (
                <Link href="/stations/new" className="font-semibold text-bone underline">
                  Use the manual builder →
                </Link>
              )}
            </p>
          )}
          <div className="mt-auto pt-6">
            <button
              onClick={scan}
              disabled={busy || url.trim().length < 4}
              className="display w-full rounded-card bg-primary py-3.5 text-[15px] tracking-wide text-white disabled:opacity-40"
            >
              {busy ? "Reading your site" : "Scan my website"}
            </button>
            <p className="mt-2 text-center text-[11px] text-muted">Up to 10 pages · 3 imports per day</p>
          </div>
        </>
      )}

      {phase === "checklist" && (
        <>
          <h1 className="display-title mt-4 text-[22px] text-bone">
            We found these services
          </h1>
          <p className="mt-1.5 text-[13px] text-dim">
            Pick the ones you want to train on. Fix any name or price before importing.
          </p>
          <div className="mt-3 divide-y divide-hairline">
            {found.map((s, i) => (
              <div key={i} className="flex items-start gap-3 py-3">
                <button
                  onClick={() =>
                    setFound((f) => f.map((x, j) => (j === i ? { ...x, include: !x.include } : x)))
                  }
                  aria-label={s.include ? "Exclude" : "Include"}
                  className={`mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center border ${
                    s.include ? "border-primary text-primary" : "border-line text-transparent"
                  }`}
                >
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="m3.5 8.5 3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className={`min-w-0 flex-1 ${s.include ? "" : "opacity-40"}`}>
                  <input
                    value={s.name}
                    onChange={(e) =>
                      setFound((f) => f.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                    }
                    className="w-full border-b border-transparent bg-transparent text-[14px] font-semibold text-ink focus:border-primary focus:outline-none"
                  />
                  {s.description && (
                    <p className="mt-0.5 truncate text-[11.5px] text-muted">{s.description}</p>
                  )}
                </div>
                <input
                  value={s.price ?? ""}
                  placeholder="$—"
                  onChange={(e) =>
                    setFound((f) => f.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)))
                  }
                  className={`w-20 shrink-0 border border-line bg-bg px-2 py-1.5 text-right font-mono text-[13px] tabular-nums focus:border-primary focus:outline-none ${
                    parseAmount(s.price) > 0 ? "text-bone" : "text-amber"
                  }`}
                />
              </div>
            ))}
          </div>
          {error && <p className="mt-3 text-sm text-red">{error}</p>}
          <div className="mt-auto pt-5">
            <button
              onClick={confirmChecklist}
              disabled={busy || found.every((s) => !s.include)}
              className="display w-full rounded-card bg-primary py-3.5 text-[15px] tracking-wide text-white disabled:opacity-40"
            >
              {busy
                ? "Writing your stations"
                : `Build ${found.filter((s) => s.include).length} station${found.filter((s) => s.include).length === 1 ? "" : "s"}`}
            </button>
          </div>
        </>
      )}

      {phase === "review" && draft && (
        <>
          <div className="mt-4 flex items-baseline justify-between">
            <h1 className="display-title text-[20px] text-bone">Review: {draft.title}</h1>
            <span className="font-mono text-[11px] tabular-nums text-muted">
              {savedCount + 1}/{savedCount + queue.length}
            </span>
          </div>
          <div className="mt-3">
            <ScenarioReviewForm value={draft} onChange={setDraft} />
          </div>
          {error && <p className="mt-3 text-sm text-red">{error}</p>}
          <div className="mt-6 flex flex-col gap-2">
            <button
              onClick={saveCurrent}
              disabled={busy}
              className="display w-full rounded-card bg-primary py-3.5 text-[15px] tracking-wide text-white disabled:opacity-60"
            >
              {busy ? "Saving" : "Save & continue"}
            </button>
            <button
              onClick={() => generateNext(queue.slice(1))}
              disabled={busy}
              className="w-full py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
            >
              Skip this one
            </button>
          </div>
        </>
      )}

      {phase === "done" && (
        <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
          <svg viewBox="0 0 48 48" className="h-14 w-14 text-success" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="24" cy="24" r="20" />
            <path d="m15 25 6 6 12-13" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="display mt-4 text-[24px] text-bone">
            {savedCount} station{savedCount === 1 ? "" : "s"} imported
          </div>
          <p className="mt-2 text-[13px] text-muted">
            They&apos;re live under &ldquo;Your services&rdquo; — with your real prices.
          </p>
          <button
            onClick={() => {
              router.push("/home");
              router.refresh();
            }}
            className="display mt-6 w-full rounded-card bg-primary py-3.5 text-[15px] tracking-wide text-white"
          >
            See the roster
          </button>
        </div>
      )}
    </main>
  );
}

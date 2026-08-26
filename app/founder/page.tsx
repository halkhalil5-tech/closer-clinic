import { notFound } from "next/navigation";
import { getAuthedUser } from "@/lib/auth";
import { getStore } from "@/lib/store";
import { estimateCost } from "@/lib/costs";
import { EMPTY_USAGE } from "@/lib/types";
import { isSupabaseConfigured } from "@/lib/config";

export const dynamic = "force-dynamic";

/**
 * Founder cost dashboard: per-encounter model + voice spend (spec §9 — the
 * risk is runaway loops, not margin). Gated to FOUNDER_EMAIL in production;
 * open in dev mode.
 */
export default async function FounderPage() {
  const user = await getAuthedUser();
  const founderEmail = process.env.FOUNDER_EMAIL;
  const allowed =
    !isSupabaseConfigured() || (founderEmail && user?.email === founderEmail);
  if (!user || !allowed) notFound();

  const store = await getStore();
  const rows = await store.listEncountersWithGrades(user.id, { sinceDays: 90, limit: 200 });

  const totals = rows.reduce(
    (acc, r) => {
      const u = r.encounter.usage ?? EMPTY_USAGE;
      const c = estimateCost(u);
      return {
        modelUsd: acc.modelUsd + c.modelUsd,
        ttsUsd: acc.ttsUsd + c.ttsUsd,
        sttUsd: acc.sttUsd + c.sttUsd,
        totalUsd: acc.totalUsd + c.totalUsd,
      };
    },
    { modelUsd: 0, ttsUsd: 0, sttUsd: 0, totalUsd: 0 }
  );

  const money = (v: number) => `$${v.toFixed(v >= 1 ? 2 : 3)}`;

  return (
    <main className="mx-auto w-full max-w-md px-4 pb-10 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="microlabel text-primary">Founder</div>
      <h1 className="display mt-2 text-[28px] text-ink">Unit costs</h1>
      <p className="mt-1 text-[12px] text-muted">
        Last 90 days · {rows.length} encounters · estimates from lib/costs.ts
      </p>

      <div className="mt-4 grid grid-cols-4 divide-x divide-line border border-line bg-panel">
        {(
          [
            ["Model", totals.modelUsd],
            ["Voice", totals.ttsUsd],
            ["STT", totals.sttUsd],
            ["Total", totals.totalUsd],
          ] as const
        ).map(([label, v]) => (
          <div key={label} className="px-2 py-2.5">
            <div className="microlabel">{label}</div>
            <div className={`mt-0.5 font-mono text-[15px] font-semibold tabular-nums ${label === "Total" ? "text-primary" : "text-ink"}`}>
              {money(v)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 border border-line">
        <div className="grid grid-cols-[1fr_60px_60px_60px] gap-2 border-b border-line bg-panel-2 px-3 py-2">
          <span className="microlabel">Encounter</span>
          <span className="microlabel text-right">Tokens</span>
          <span className="microlabel text-right">TTS ch</span>
          <span className="microlabel text-right">Est $</span>
        </div>
        {rows.length === 0 ? (
          <div className="bg-panel p-5 text-center text-sm text-dim">No encounters yet.</div>
        ) : (
          rows.slice(0, 50).map(({ encounter }, i) => {
            const u = encounter.usage ?? EMPTY_USAGE;
            const c = estimateCost(u);
            return (
              <div
                key={encounter.id}
                className={`grid grid-cols-[1fr_60px_60px_60px] gap-2 bg-panel px-3 py-2 font-mono text-[11px] tabular-nums ${
                  i > 0 ? "border-t border-line" : ""
                }`}
              >
                <span className="truncate text-dim">
                  {new Date(encounter.startedAt).toLocaleDateString()} ·{" "}
                  {encounter.scenarioSlug}
                </span>
                <span className="text-right text-dim">
                  {u.modelInputTokens + u.modelOutputTokens}
                </span>
                <span className="text-right text-dim">{u.ttsCharacters}</span>
                <span className="text-right text-ink">{c.totalUsd.toFixed(3)}</span>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
}

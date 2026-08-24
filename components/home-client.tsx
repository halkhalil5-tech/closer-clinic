"use client";

import { useState } from "react";
import Link from "next/link";
import type { Difficulty, PriceConfig, Scenario } from "@/lib/types";
import type { UnlockedPack } from "@/lib/packs";
import { guessConfigFromScenario } from "@/lib/pricing";
import { PriceEditSheet } from "@/components/price-edit-sheet";
import { LaunchSheet } from "@/components/launch-sheet";

/** Accent tier by ticket size: neutral <$500, amber $500–899, red $900+.
 *  (Mint is reserved for wins/active/CTA, so the low tier is quiet.) */
function priceTier(priceDisplay: string): "bg-faint" | "bg-amber" | "bg-red" {
  const nums = priceDisplay.match(/\d[\d,]*/g)?.map((n) => parseInt(n.replace(/,/g, ""), 10)) ?? [];
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  if (max >= 900) return "bg-red";
  if (max >= 500) return "bg-amber";
  return "bg-faint";
}

/** Split "$900 program" / "$800–$1,200" into a lead figure and a small qualifier. */
function splitPrice(priceDisplay: string): { lead: string; rest: string | null } {
  const m = priceDisplay.match(/^(\$[\d,]+)\s*(.*)$/);
  if (!m) return { lead: priceDisplay, rest: null };
  return { lead: m[1], rest: m[2] ? m[2] : null };
}

interface Props {
  scenarios: Scenario[];
  customScenarios?: Scenario[];
  packs?: UnlockedPack[];
  editedSlugs?: string[];
  overrideConfigs?: Record<string, PriceConfig>;
  locked?: boolean;
  /** Deep link (e.g. a module's "try it in a rep" CTA): auto-open the launch sheet. */
  initialLaunchSlug?: string;
  initialDifficulty?: Difficulty;
}

export function HomeClient({
  scenarios,
  customScenarios = [],
  packs = [],
  editedSlugs = [],
  overrideConfigs = {},
  locked = false,
  initialLaunchSlug,
  initialDifficulty,
}: Props) {
  const [editing, setEditing] = useState<Scenario | null>(null);
  const [roleTab, setRoleTab] = useState<"provider" | "front_desk">("provider");
  const [launching, setLaunching] = useState<Scenario | null>(() =>
    initialLaunchSlug
      ? [...customScenarios, ...scenarios, ...packs.flatMap((p) => p.stations)].find(
          (s) => s.slug === initialLaunchSlug
        ) ?? null
      : null
  );
  const edited = new Set(editedSlugs);
  const visibleScenarios = scenarios.filter((s) => (s.role ?? "provider") === roleTab);

  function StationRow({ s }: { s: Scenario }) {
    const price = splitPrice(s.priceDisplay);
    const isEdited = edited.has(s.slug);
    return (
      <div className="relative">
        <button
          onClick={() => setLaunching(s)}
          className="group relative block min-h-[44px] w-full py-3.5 pl-3.5 pr-9 text-left transition-colors hover:bg-raised active:bg-raised"
        >
          <span
            className={`absolute inset-y-0 left-0 w-[3px] transition-all group-hover:w-[5px] group-active:w-[5px] ${
              s.role === "front_desk" ? "bg-amber" : priceTier(s.priceDisplay)
            }`}
          />
          <div className="flex items-baseline justify-between gap-3">
            <span className="display-title min-w-0 flex-1 truncate text-[15px] text-ink">
              {s.title}
              {s.isCustom && (
                <span className="ml-2 align-middle font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-muted">
                  Custom
                </span>
              )}
              {s.role === "front_desk" && (
                <span className="ml-2 align-middle font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-amber">
                  Front desk
                </span>
              )}
            </span>
            <span className="shrink-0 text-right">
              <span className="font-mono text-[14px] font-semibold tabular-nums text-bone">
                {price.lead}
              </span>
              {price.rest && (
                <span className="block font-mono text-[10px] leading-tight text-muted">
                  {price.rest}
                </span>
              )}
              {isEdited && (
                <span className="block font-mono text-[8px] uppercase tracking-[0.14em] text-mint">
                  edited
                </span>
              )}
            </span>
          </div>
          <p className="mt-1 truncate text-[13px] italic leading-snug text-ink/60">
            &ldquo;{s.patientCc}&rdquo;
          </p>
        </button>
        {s.isCustom ? (
          <Link
            aria-label={`Edit ${s.title}`}
            href={`/stations/edit/${s.slug}`}
            className="absolute right-0 top-2 flex h-11 w-11 items-center justify-center text-muted transition-colors active:text-bone"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="m13.6 3.2 3.2 3.2L7 16.2l-4 .8.8-4L13.6 3.2Z" strokeLinejoin="round" />
            </svg>
          </Link>
        ) : (
          <button
            aria-label={`Edit pricing for ${s.title}`}
            onClick={() => setEditing(s)}
            className="absolute right-0 top-2 flex h-11 w-11 items-center justify-center text-muted transition-colors active:text-bone"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="m13.6 3.2 3.2 3.2L7 16.2l-4 .8.8-4L13.6 3.2Z" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  if (locked) {
    return (
      <div className="px-4">
        <section className="mt-5">
          <div className="flex items-baseline justify-between">
            <div className="microlabel">Station roster</div>
            <div className="text-xs text-muted">{scenarios.length} locked</div>
          </div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-dim">
            Stations open when you finish the core curriculum — or right now, if
            you can pass one challenge rep at 75+.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <a
              href="/train"
              className="display block w-full rounded-card bg-mint py-3.5 text-center text-[15px] tracking-wide text-mint-ink"
            >
              Start training
            </a>
            <a
              href="/test-out"
              className="display block w-full rounded-card border border-line-strong py-3 text-center text-[13px] tracking-wide text-bone"
            >
              Test out — one challenge rep
            </a>
          </div>
        </section>

        <section className="mt-6 opacity-40">
          <div className="divide-y divide-hairline border-t border-hairline">
            {scenarios.map((s) => {
              const price = splitPrice(s.priceDisplay);
              return (
                <div key={s.slug} className="relative py-3.5 pl-3.5 pr-1">
                  <span className={`absolute inset-y-0 left-0 w-[3px] ${priceTier(s.priceDisplay)}`} />
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="display-title min-w-0 flex-1 truncate text-[15px] text-ink">
                      {s.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="font-mono text-[14px] font-semibold tabular-nums text-bone">
                        {price.lead}
                      </span>
                      <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="4.5" y="9" width="11" height="7.5" rx="1" />
                        <path d="M7 9V6.8a3 3 0 0 1 6 0V9" />
                      </svg>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="px-4">
      {/* your services (customs) */}
      {customScenarios.length > 0 && (
        <section className="mt-5">
          <div className="flex items-baseline justify-between">
            <div className="microlabel">Your services</div>
            <div className="text-xs text-muted">{customScenarios.length}</div>
          </div>
          <div className="mt-1 divide-y divide-hairline">
            {customScenarios.map((s) => (
              <StationRow key={s.slug} s={s} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-5">
        <div className="flex items-baseline justify-between">
          <div className="microlabel">Station roster</div>
          <div className="text-xs text-muted">{visibleScenarios.length} active</div>
        </div>

        {/* who's training: the provider in the room, or the desk at checkout */}
        <div className="mt-2 flex border border-line">
          {(["provider", "front_desk"] as const).map((r, i) => (
            <button
              key={r}
              onClick={() => setRoleTab(r)}
              className={`flex-1 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] ${
                i > 0 ? "border-l border-line" : ""
              } ${
                roleTab === r
                  ? r === "front_desk"
                    ? "bg-amber text-bg"
                    : "bg-mint text-mint-ink"
                  : "bg-panel text-muted"
              }`}
            >
              {r === "provider" ? "Provider" : "Front desk"}
            </button>
          ))}
        </div>

        {/* the builder entry */}
        {roleTab === "provider" && (
        <Link
          href="/stations/new"
          className="mt-1 flex min-h-[44px] items-center gap-2.5 border-b border-hairline py-3 pl-3.5 transition-colors hover:bg-raised active:bg-raised"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 text-bone" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10 4v12M4 10h12" strokeLinecap="round" />
          </svg>
          <span className="display-title text-[14px] text-bone">Add your service</span>
          <span className="ml-auto pr-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
            AI-built station
          </span>
        </Link>
        )}

        {visibleScenarios.length === 0 ? (
          <p className="mt-3 py-6 text-center text-sm text-dim">
            No scenarios for your specialty yet. More are on the way.
          </p>
        ) : (
          <div className="divide-y divide-hairline">
            {visibleScenarios.map((s) => (
              <StationRow key={s.slug} s={s} />
            ))}
          </div>
        )}
        {roleTab === "provider" && (
          <a
            href="/api/script-cards"
            target="_blank"
            rel="noreferrer"
            className="mt-3 block py-1 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted underline underline-offset-2"
          >
            Print all script cards
          </a>
        )}
      </section>

      {/* vendor packs: grouped under the vendor's accent */}
      {roleTab === "provider" &&
        packs.map(({ pack, stations }) => (
          <section key={pack.id} className="mt-5">
            <div className="flex items-baseline justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: pack.branding.accent ?? "var(--color-bone)" }}
                />
                <div className="microlabel">{pack.name}</div>
              </div>
              <div className="text-xs text-muted">{pack.vendor}</div>
            </div>
            <div className="mt-1 divide-y divide-hairline">
              {stations.map((s) => (
                <div key={s.slug} className="relative">
                  <button
                    onClick={() => setLaunching(s)}
                    className="group relative block min-h-[44px] w-full py-3.5 pl-3.5 pr-3 text-left transition-colors hover:bg-raised active:bg-raised"
                  >
                    <span
                      className="absolute inset-y-0 left-0 w-[3px] transition-all group-hover:w-[5px]"
                      style={{ backgroundColor: pack.branding.accent ?? "var(--color-bone)" }}
                    />
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="display-title min-w-0 flex-1 truncate text-[15px] text-ink">
                        {s.title}
                      </span>
                      <span className="shrink-0 font-mono text-[14px] font-semibold tabular-nums text-bone">
                        {splitPrice(s.priceDisplay).lead}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-[13px] italic leading-snug text-ink/60">
                      &ldquo;{s.patientCc}&rdquo;
                    </p>
                  </button>
                </div>
              ))}
            </div>
          </section>
        ))}

      {launching && (
        <LaunchSheet
          scenario={launching}
          initialDifficulty={launching.slug === initialLaunchSlug ? initialDifficulty : undefined}
          onClose={() => setLaunching(null)}
        />
      )}

      {editing && (
        <PriceEditSheet
          slug={editing.slug}
          title={editing.title}
          initial={overrideConfigs[editing.slug] ?? guessConfigFromScenario(editing)}
          hasOverride={edited.has(editing.slug)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

"use client";

import Link from "next/link";

export interface LadderModule {
  slug: string;
  order: number;
  title: string;
  subtitle: string;
  status: "completed" | "current" | "locked";
  checkDone: boolean;
  drill: "none" | "pending" | "passed";
  minutes: number;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 text-success" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8.25" />
      <path d="m6.5 10.5 2.3 2.3 4.7-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CurrentIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 text-bone" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="10" cy="10" r="8.25" />
      <circle cx="10" cy="10" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4.5" y="9" width="11" height="7.5" rx="1" />
      <path d="M7 9V6.8a3 3 0 0 1 6 0V9" />
    </svg>
  );
}

/** The module ladder: one document per module, opened directly. */
export function TrainLadder({ modules }: { modules: LadderModule[] }) {
  return (
    <section className="mt-5 px-4">
      <div className="microlabel">Module ladder</div>
      <div className="mt-1 divide-y divide-hairline">
        {modules.map((m) => {
          const locked = m.status === "locked";
          const row = (
            <div className="flex items-center gap-3 py-3.5 pl-3.5 pr-1">
              <span className="shrink-0">
                {m.status === "completed" ? <CheckIcon /> : m.status === "current" ? <CurrentIcon /> : <LockIcon />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="display-title truncate text-[15px] text-ink">
                    <span className="mr-1.5 font-mono text-[11px] font-semibold text-muted">{m.order}</span>
                    {m.title}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-muted">
                    {m.minutes}m
                  </span>
                </span>
                <span className="mt-0.5 flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[13px] italic leading-snug text-ink/60">
                    {m.subtitle}
                  </span>
                  <span className="shrink-0 font-mono text-[9px] uppercase tracking-wide">
                    <span className={m.checkDone ? "text-success" : "text-muted"}>check</span>
                    {m.drill !== "none" && (
                      <span className={m.drill === "passed" ? "text-success" : "text-muted"}> · drill</span>
                    )}
                  </span>
                </span>
              </span>
            </div>
          );
          if (locked) {
            return (
              <div key={m.slug} className="relative opacity-40">
                {row}
              </div>
            );
          }
          return (
            <Link
              key={m.slug}
              href={`/train/module/${m.slug}`}
              className="group relative block transition-colors hover:bg-raised active:bg-raised"
            >
              {m.status === "current" && <span className="absolute inset-y-0 left-0 w-[3px] bg-bone" />}
              {m.status === "completed" && <span className="absolute inset-y-0 left-0 w-[3px] bg-success" />}
              {row}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

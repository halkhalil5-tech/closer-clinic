"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * One-line reminder to log today's consults, shown on Stations only after
 * 3pm device-local time and only until something is logged today.
 * Dismissal sticks for the rest of the day (localStorage).
 */
export function LogReminderBanner({ loggedToday }: { loggedToday: boolean }) {
  const [visible, setVisible] = useState(false);
  const dayKey = `closer-clinic:log-banner-dismissed:${new Date().toLocaleDateString("en-CA")}`;

  useEffect(() => {
    if (loggedToday) return;
    if (new Date().getHours() < 15) return;
    if (localStorage.getItem(dayKey)) return;
    // Deferred so the reveal is an async update, not a render-cascading one.
    const t = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(t);
  }, [loggedToday, dayKey]);

  if (!visible) return null;
  return (
    <div className="mt-3 flex min-h-[44px] items-center border-l-2 border-l-bone">
      <Link
        href="/progress"
        className="min-w-0 flex-1 py-2.5 pl-3 text-[13.5px] text-dim active:opacity-70"
      >
        Log today&apos;s consults <span className="font-semibold text-bone">→</span>
      </Link>
      <button
        aria-label="Dismiss reminder"
        onClick={() => {
          localStorage.setItem(dayKey, "1");
          setVisible(false);
        }}
        className="flex h-11 w-11 shrink-0 items-center justify-center text-muted active:text-dim"
      >
        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Lucide-style icons, drawn inline (no icon-font, no emoji).
// Each tab has an outline (idle) and a filled (active) variant.
const TABS = [
  {
    href: "/train",
    label: "Train",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[22px] w-[22px]">
        <path d="M12 5.5C10.5 4 8.5 3.5 5.5 3.5c-.8 0-1.5.1-2 .2V18c.5-.1 1.2-.2 2-.2 3 0 5 .6 6.5 2 1.5-1.4 3.5-2 6.5-2 .8 0 1.5.1 2 .2V3.7c-.5-.1-1.2-.2-2-.2-3 0-5 .5-6.5 2Z" strokeLinejoin="round" />
        <path d="M12 5.5v14.3" />
      </svg>
    ),
    iconActive: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor">
        <path d="M11 5.1C9.6 3.9 7.7 3.5 5.5 3.5c-.8 0-1.5.1-2 .2V18c.5-.1 1.2-.2 2-.2 2.2 0 4.1.4 5.5 1.5V5.1Z" />
        <path d="M13 5.1c1.4-1.2 3.3-1.6 5.5-1.6.8 0 1.5.1 2 .2V18c-.5-.1-1.2-.2-2-.2-2.2 0-4.1.4-5.5 1.5V5.1Z" />
      </svg>
    ),
  },
  {
    href: "/home",
    label: "Stations",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[22px] w-[22px]">
        <path d="M3 9h18M3 15h18M7 4v16M17 4v16" strokeLinecap="round" />
        <rect x="3" y="4" width="18" height="16" rx="1.5" />
      </svg>
    ),
    iconActive: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]">
        <rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" />
        <path d="M3 9h18M3 15h18M7 4v16M17 4v16" stroke="var(--color-raised)" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    href: "/progress",
    label: "Progress",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[22px] w-[22px]">
        <path d="M4 20V11M10 20V4M16 20v-6M21 20H3" strokeLinecap="round" />
      </svg>
    ),
    iconActive: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[22px] w-[22px]">
        <rect x="2.5" y="10" width="4" height="8" rx="1" />
        <rect x="8.5" y="3" width="4" height="15" rx="1" />
        <rect x="14.5" y="13" width="4" height="5" rx="1" />
        <path d="M21 20H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[22px] w-[22px]">
        <path d="M4 8h10M18 8h2M4 16h2M10 16h10" strokeLinecap="round" />
        <circle cx="16" cy="8" r="2" />
        <circle cx="8" cy="16" r="2" />
      </svg>
    ),
    iconActive: (
      <svg viewBox="0 0 24 24" className="h-[22px] w-[22px]" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M4 8h10M18 8h2M4 16h2M10 16h10" />
        <circle cx="16" cy="8" r="3" strokeWidth="0" />
        <circle cx="8" cy="16" r="3" strokeWidth="0" />
      </svg>
    ),
  },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="raised fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 transition-colors ${
                active ? "text-mint" : "text-muted active:text-dim"
              }`}
            >
              {active && <span className="absolute inset-x-6 top-0 h-0.5 bg-mint" />}
              {active ? tab.iconActive : tab.icon}
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em]">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

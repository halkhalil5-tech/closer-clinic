"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, LayoutGrid, BarChart3, SlidersHorizontal } from "lucide-react";

const TABS = [
  { href: "/train", label: "Train", Icon: BookOpen },
  { href: "/home", label: "Stations", Icon: LayoutGrid },
  { href: "/progress", label: "Progress", Icon: BarChart3 },
  { href: "/settings", label: "Settings", Icon: SlidersHorizontal },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm">
      <div className="mx-auto flex max-w-md">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-1 flex-col items-center gap-1 pb-2 pt-2.5 transition-colors duration-150 ${
                active ? "text-primary" : "text-muted active:text-dim"
              }`}
            >
              {active && <span className="absolute inset-x-7 top-0 h-0.5 rounded-full bg-primary" />}
              <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] font-medium tracking-[0.08em]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

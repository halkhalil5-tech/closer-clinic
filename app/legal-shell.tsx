import Link from "next/link";
import type { ReactNode } from "react";

export const LEGAL_ENTITY = "Closer Clinic LLC";
export const LEGAL_CONTACT = "halkhalil5@gmail.com";
export const LEGAL_EFFECTIVE = "September 30, 2026";

/** Shared frame for the legal pages: quiet, readable, printable. */
export function LegalShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-5 pb-16 pt-[calc(env(safe-area-inset-top)+2rem)]">
      <div className="microlabel text-primary">
        <Link href="/">Closer Clinic</Link>
      </div>
      <h1 className="display mt-3 text-[34px] text-ink">{title}</h1>
      <p className="mt-1 text-[13px] text-muted">
        {LEGAL_ENTITY} · Effective {LEGAL_EFFECTIVE}
      </p>
      <div className="legal mt-8 flex flex-col gap-6 text-[15px] leading-relaxed text-dim [&_h2]:font-semibold [&_h2]:text-ink [&_h2]:text-[17px] [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-5 [&_strong]:text-ink">
        {children}
      </div>
      <div className="mt-12 flex gap-5 border-t border-line pt-5 text-[13px] text-muted">
        <Link href="/privacy" className="underline">Privacy</Link>
        <Link href="/terms" className="underline">Terms</Link>
        <a href={`mailto:${LEGAL_CONTACT}`} className="underline">Contact</a>
      </div>
    </main>
  );
}

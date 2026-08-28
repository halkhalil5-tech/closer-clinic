import { ShieldCheck, ShieldAlert } from "lucide-react";
import { dimensionLetterFor, letterColorFor } from "@/lib/letter-grades";

/**
 * Regen-only compliance sub-score, rendered beside the letter grade.
 * Clean reps get the quiet green shield; flagged reps list the exact lines.
 */
export function CompliancePanel({ compliance }: { compliance: { score: number; flags: string[] } }) {
  const letter = dimensionLetterFor(compliance.score);
  const clean = compliance.flags.length === 0;
  return (
    <section className="mt-3 rounded-xl border border-line bg-bg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {clean ? (
            <ShieldCheck className="h-4 w-4 text-success" strokeWidth={2} />
          ) : (
            <ShieldAlert className="h-4 w-4 text-danger" strokeWidth={2} />
          )}
          <span className="microlabel">Compliance</span>
        </div>
        <span className="flex items-baseline gap-2">
          <span
            className="display text-[22px] leading-none tracking-tight"
            style={{ color: letterColorFor(letter) }}
          >
            {letter}
          </span>
          <span className="font-mono text-[12px] tabular-nums text-muted">
            {compliance.score}<span className="text-muted">/20</span>
          </span>
        </span>
      </div>
      {clean ? (
        <p className="mt-2 text-[13px] leading-snug text-dim">
          No flagged claims. Honest framing, physician deferral, and closing anyway are what earn this.
        </p>
      ) : (
        <ul className="mt-2.5 flex flex-col gap-1.5">
          {compliance.flags.map((f, i) => (
            <li key={i} className="flex gap-2 text-[13.5px] leading-snug text-ink">
              <span className="mt-[3px] h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
              {f}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

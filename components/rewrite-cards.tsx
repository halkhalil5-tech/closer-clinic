"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

/**
 * "What you should've said" — the provider's line and the rewrite as
 * side-by-side cards; the rewrite is mint-accented and one tap to copy.
 */
export function RewriteCards({ youSaid, better }: { youSaid: string; better: string }) {
  async function copy() {
    try {
      await navigator.clipboard.writeText(better);
      toast("Copied — say it on the next rep.");
    } catch {
      toast("Couldn't copy on this device.");
    }
  }

  return (
    <div className="grid gap-2.5 min-[420px]:grid-cols-2">
      <div className="rounded-xl border border-line bg-card p-4">
        <div className="microlabel">You said</div>
        <p className="mt-1.5 text-[13.5px] italic leading-snug text-muted">
          &ldquo;{youSaid}&rdquo;
        </p>
      </div>
      <div className="relative rounded-xl border border-success/45 bg-success/8 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="microlabel text-success">The better line</div>
          <button
            onClick={copy}
            aria-label="Copy the better line"
            className="-mr-1 -mt-1 rounded-md p-1.5 text-success transition-colors duration-150 hover:bg-success/15"
          >
            <Copy className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
        <p className="mt-1 text-[14px] font-semibold leading-snug text-ink">
          &ldquo;{better}&rdquo;
        </p>
      </div>
    </div>
  );
}

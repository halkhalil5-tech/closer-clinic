import Link from "next/link";
import { WARMUP_CARDS } from "@/lib/training/podiatry-pack";
import { WarmupDeck } from "@/components/warmup-deck";

export const dynamic = "force-static";

/**
 * Pre-room warmup: a 60-second flashcard pass over the plays, built to be
 * glanced at in the hallway before a real exam-room conversation.
 */
export default function WarmupPage() {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)]">
      <div className="flex items-center justify-between">
        <span className="microlabel">Pre-room warmup · 60 sec</span>
        <Link
          href="/home"
          className="py-1 pl-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted"
        >
          Done ✕
        </Link>
      </div>
      <WarmupDeck cards={WARMUP_CARDS} />
    </main>
  );
}

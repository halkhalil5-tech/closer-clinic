import type { WarmupCard } from "./podiatry-pack";
import { WARMUP_CARDS } from "./podiatry-pack";
import { REGEN_WARMUP_CARDS } from "./regen-pack";

/** Specialty-keyed warmup deck (lifted from the podiatry-only import). */
export function warmupCardsFor(specialty: string): WarmupCard[] {
  return specialty === "regen" ? REGEN_WARMUP_CARDS : WARMUP_CARDS;
}

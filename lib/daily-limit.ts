import { NextResponse } from "next/server";
import { DAILY_ENCOUNTER_LIMIT } from "./types";
import type { Store } from "./store";

/**
 * Shared spend gate for every route that starts a model-backed session
 * (reps, test-out, drills, redos, prep sims). One counter, one message.
 */
export async function dailyLimitResponse(store: Store, userId: string): Promise<NextResponse | null> {
  if ((await store.countEncountersToday(userId)) >= DAILY_ENCOUNTER_LIMIT) {
    return NextResponse.json(
      { error: `Daily limit reached (${DAILY_ENCOUNTER_LIMIT} encounters). Come back tomorrow.` },
      { status: 429 }
    );
  }
  return null;
}

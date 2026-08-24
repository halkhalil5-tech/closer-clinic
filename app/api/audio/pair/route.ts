import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthedUser } from "@/lib/auth";
import { getStore, resolveScenarioForUser } from "@/lib/store";
import { getScenario as baseScenario } from "@/lib/scenarios";
import { getOrCreatePair } from "@/lib/audio-pairs";

export const maxDuration = 60;

const Schema = z.object({
  stationSlug: z.string().min(1).max(120),
  /** Optional module framework Take B should demonstrate. */
  moduleFocus: z.string().max(300).optional(),
});

/** Lazy-generating cache for a station's "Common close / The fix" audio pair. */
export async function POST(req: Request) {
  // Pre-seed path (scripts/seed-audio.mjs): service key in place of a session,
  // base station content only — this is the shared global cache being warmed.
  const seedKey = req.headers.get("x-seed-key");
  const isSeed = Boolean(
    seedKey && process.env.SUPABASE_SERVICE_ROLE_KEY && seedKey === process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  const user = isSeed ? null : await getAuthedUser();
  if (!user && !isSeed) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = Schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Resolve through the user's overrides so customized stations hash (and
  // cache) on their own content, while default stations share one global entry.
  const scenario = user
    ? await resolveScenarioForUser(await getStore(), user.id, body.data.stationSlug)
    : (baseScenario(body.data.stationSlug) ?? null);
  if (!scenario) return NextResponse.json({ error: "Station not found" }, { status: 404 });

  try {
    const result = await getOrCreatePair(scenario, body.data.moduleFocus);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Pair generation failed", err);
    return NextResponse.json({ status: "unavailable" });
  }
}

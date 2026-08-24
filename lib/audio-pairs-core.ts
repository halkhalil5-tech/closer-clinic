import { createHash } from "crypto";
import type { PairLine, Scenario } from "./types";

/**
 * Pure pieces of the audio-pair cache, importable by tests and scripts:
 * content hashing (the cache scope) and stitched-timeline math.
 */

/** Bump to invalidate every cached pair after a script-prompt change. */
export const PAIR_SCRIPT_VERSION = 2; // v2: segments sanitized before stitching

/** ElevenLabs mp3_44100_64 is 64 kbps CBR: duration ≈ bytes × 8 / 64000. */
export const MP3_BYTES_PER_MS = 8;

/**
 * Stable hash of everything that shapes a station's pair script. Default
 * stations hash identically for every user (one global cache entry); a
 * customized station hashes on its resolved content, so an edit regenerates
 * and an unchanged station never does.
 */
export function pairContentHash(scenario: Scenario, moduleFocus?: string): string {
  const basis = JSON.stringify([
    PAIR_SCRIPT_VERSION,
    scenario.serviceDesc,
    scenario.priceDisplay,
    scenario.priceStructure,
    scenario.clinicalContext,
    scenario.patientCc,
    scenario.closeGoal,
    scenario.objectionSeeds,
    moduleFocus ?? null,
  ]);
  return createHash("sha256").update(basis).digest("hex").slice(0, 16);
}

/** Estimated start offset of each line once segments are stitched. */
export function withStartTimes(lines: PairLine[], segmentBytes: number[]): PairLine[] {
  let at = 0;
  return lines.map((line, i) => {
    const out = { ...line, startMs: Math.round(at) };
    at += (segmentBytes[i] ?? 0) / MP3_BYTES_PER_MS;
    return out;
  });
}

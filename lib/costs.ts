import type { EncounterUsage } from "./types";

/**
 * Rough per-unit prices for the founder cost dashboard. These are estimates —
 * adjust to your actual plans. The point is spotting runaway loops (spec §9),
 * not accounting-grade precision.
 */
export const PRICING = {
  /** Claude Sonnet-class, USD per million tokens. */
  modelInputPerMTok: 3.0,
  modelOutputPerMTok: 15.0,
  /** ElevenLabs Flash ≈ 0.5 credits/char; Creator-tier blended rate. */
  ttsPer1kChars: 0.11,
  /** Deepgram Nova prerecorded, USD per minute. */
  sttPerMinute: 0.0043,
};

export interface CostBreakdown {
  modelUsd: number;
  ttsUsd: number;
  sttUsd: number;
  totalUsd: number;
}

export function estimateCost(u: EncounterUsage): CostBreakdown {
  const modelUsd =
    (u.modelInputTokens / 1_000_000) * PRICING.modelInputPerMTok +
    (u.modelOutputTokens / 1_000_000) * PRICING.modelOutputPerMTok;
  const ttsUsd = (u.ttsCharacters / 1000) * PRICING.ttsPer1kChars;
  const sttUsd = (u.sttSeconds / 60) * PRICING.sttPerMinute;
  return { modelUsd, ttsUsd, sttUsd, totalUsd: modelUsd + ttsUsd + sttUsd };
}

export function addUsage(a: EncounterUsage, b: Partial<EncounterUsage>): EncounterUsage {
  return {
    modelInputTokens: a.modelInputTokens + (b.modelInputTokens ?? 0),
    modelOutputTokens: a.modelOutputTokens + (b.modelOutputTokens ?? 0),
    ttsCharacters: a.ttsCharacters + (b.ttsCharacters ?? 0),
    sttSeconds: a.sttSeconds + (b.sttSeconds ?? 0),
  };
}

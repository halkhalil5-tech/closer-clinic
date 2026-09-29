/**
 * Custom vocabulary boosted in server-side STT — terms browser transcription
 * butchers. Scoped per specialty: boosting another specialty's vocabulary
 * actively hurts ("shockwave series" once transcribed as "Shockwave veneers"
 * while dental terms were boosted for a podiatry user).
 * Keep single words or short phrases; Deepgram boosts each independently.
 */

/** Billing vocab that comes up mid-pitch, every specialty. */
const SHARED: string[] = ["deductible", "copay", "cash-pay"];

const PODIATRY: string[] = [
  // conditions
  "plantar fasciitis", "fasciosis", "onychomycosis", "neuropathy",
  "paronychia", "pes planus", "overpronation", "metatarsalgia", "hallux",
  "bunion", "hammertoe", "tinea pedis", "tendinopathy", "calcaneal",
  // treatments
  "matrixectomy", "avulsion", "debridement", "orthotics", "shockwave",
  "ESWT", "cortisone", "amniotic", "gabapentin", "terbinafine",
  "tolnaftate", "monofilament", "ultrasound",
];

const REGEN: string[] = [
  "regenerative", "biologic", "allograft", "perinatal", "umbilical",
  "Wharton's jelly", "mesenchymal", "exosomes", "cryopreserved",
  "viability", "tendinosis", "platelet-rich plasma", "PRP",
  "bone on bone", "debridement", "ultrasound", "cortisone",
];

const DENTAL: string[] = [
  "occlusal", "periodontal", "prophylaxis", "veneers", "aligners", "bruxism",
];

export function keywordsFor(specialty: string | null | undefined): string[] {
  const pack =
    specialty === "dental" ? DENTAL : specialty === "regen" ? REGEN : PODIATRY;
  return [...pack, ...SHARED];
}

/** @deprecated superseded by keywordsFor; kept for older imports. */
export const MEDICAL_KEYWORDS: string[] = [...PODIATRY, ...SHARED];

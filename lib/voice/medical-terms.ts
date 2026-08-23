/**
 * Custom vocabulary boosted in server-side STT — terms browser transcription
 * butchers. Podiatry first (launch specialty), dental staged for phase 3.
 * Keep single words or short phrases; Deepgram boosts each independently.
 */
export const MEDICAL_KEYWORDS: string[] = [
  // podiatry — conditions
  "plantar fasciitis",
  "fasciosis",
  "onychomycosis",
  "neuropathy",
  "paronychia",
  "pes planus",
  "overpronation",
  "metatarsalgia",
  "hallux",
  "bunion",
  "hammertoe",
  "tinea pedis",
  "tendinopathy",
  "calcaneal",
  // podiatry — treatments
  "matrixectomy",
  "avulsion",
  "debridement",
  "orthotics",
  "shockwave",
  "ESWT",
  "cortisone",
  "amniotic",
  "gabapentin",
  "terbinafine",
  "tolnaftate",
  "monofilament",
  "ultrasound",
  // dental (phase 2 scenarios)
  "occlusal",
  "periodontal",
  "prophylaxis",
  "veneers",
  "aligners",
  "bruxism",
  // billing vocab that comes up mid-pitch
  "deductible",
  "copay",
  "cash-pay",
];

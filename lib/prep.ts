/**
 * Prep Tomorrow's Consult: structured-fields-only sim builder. No document
 * upload, no free-text clinical narratives — by design, so the product stays
 * PHI-free and outside HIPAA scope. The UI says it plainly: "Describe a type
 * of patient, never a real one."
 */

export const AGE_BANDS = ["18–24", "25–34", "35–44", "45–54", "55–64", "65–74", "75+"] as const;

export function agesFromBand(band: string): [number, number] {
  if (band === "75+") return [75, 88];
  const m = band.match(/^(\d+)–(\d+)$/);
  return m ? [parseInt(m[1], 10), parseInt(m[2], 10)] : [40, 60];
}

export const CONDITIONS: Record<string, string[]> = {
  podiatry: [
    "Plantar fasciitis / heel pain",
    "Toenail fungus",
    "Diabetic neuropathy",
    "Flat feet / arch pain",
    "Ingrown toenail",
    "Achilles tendinitis",
    "Bunion pain",
  ],
  dental: [
    "Cracked or worn teeth",
    "Missing tooth / gap",
    "Gum disease",
    "Discolored teeth",
    "Jaw pain / grinding",
  ],
  medspa: [
    "Facial volume loss",
    "Fine lines and wrinkles",
    "Sun damage / pigmentation",
    "Stubborn fat pockets",
    "Skin laxity",
  ],
};

export const WORRY_MAX_CHARS = 100;

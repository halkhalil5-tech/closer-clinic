/**
 * Patient receptivity contract: the patient engine appends a trailing JSON
 * line `{"receptivity": N}` after its spoken reply. The server strips it
 * before the text is stored, displayed, or spoken — it must NEVER reach TTS.
 */

const TRAILER = /\s*\{\s*"receptivity"\s*:\s*(\d{1,3})\s*\}\s*$/;

export function splitReceptivity(raw: string): { text: string; receptivity: number | null } {
  const m = raw.match(TRAILER);
  if (!m) return { text: raw.trim(), receptivity: null };
  return {
    text: raw.replace(TRAILER, "").trim(),
    receptivity: Math.max(0, Math.min(100, parseInt(m[1], 10))),
  };
}

/** Gauge color band: mint when warm, amber when cooling, bone in between. */
export function receptivityTone(v: number): "mint" | "amber" | "bone" {
  if (v > 70) return "mint";
  if (v < 35) return "amber";
  return "bone";
}

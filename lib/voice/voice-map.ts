import type { Gender } from "../types";

/**
 * Persona → ElevenLabs voice assignment. One fixed voice per persona+gender so
 * a patient sounds like the same person for the whole encounter, and no two
 * personas share a voice. Chosen for natural pacing over announcer polish;
 * age/energy roughly matches each archetype's age range and temperament.
 *
 * Voice IDs are ElevenLabs premade voices. If your workspace's roster differs,
 * swap IDs here — nothing else references them. The `name` field is only a
 * human-readable note.
 */

interface VoicePair {
  m: { id: string; name: string };
  f: { id: string; name: string };
}

const VOICES: Record<string, VoicePair> = {
  "price-anchored-retiree": {
    m: { id: "pqHfZKP75CvOlQylNhV4", name: "Bill — older American male, weathered" },
    f: { id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy — pleasant older female" },
  },
  "evidence-demanding-engineer": {
    m: { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel — precise, measured male" },
    f: { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice — confident, clipped female" },
  },
  "agreeable-noncommittal": {
    m: { id: "cjVigY5qzO86Huf0OWal", name: "Eric — friendly middle-aged male" },
    f: { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda — warm agreeable female" },
  },
  "tangent-prone-talker": {
    m: { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie — chatty casual male" },
    f: { id: "9BWtsMINqrJLrRacOk9x", name: "Aria — husky middle-aged female" },
  },
  "one-word-stoic": {
    m: { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum — gravelly terse male" },
    f: { id: "SAz9YHcvj6GT2YYXdXww", name: "River — flat, unhurried" },
  },
  "spouse-checker": {
    m: { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger — deliberate middle-aged male" },
    f: { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily — considerate female" },
  },
  "groupon-shopper": {
    m: { id: "iP95p4xoKVk53GoZ742B", name: "Chris — fast casual male" },
    f: { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica — quick expressive female" },
  },
  "anxious-over-researcher": {
    m: { id: "JBFqnCBsd6RMkjVDRZzb", name: "George — soft-spoken careful male" },
    f: { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah — soft, tentative female" },
  },
  "burned-skeptic": {
    m: { id: "pNInz6obpgDQGcFmaJgB", name: "Adam — blunt deep male" },
    f: { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel — dry, level female" },
  },
  "vip-discount-expecter": {
    m: { id: "nPczCjzI2devNBz1zQrb", name: "Brian — polished deep male" },
    f: { id: "XB0fDUnXU5powFXDhCwa", name: "Charlotte — assured, expects service" },
  },
  "no-time-parent": {
    m: { id: "bIHbv24MWmeRgasZH58o", name: "Will — quick friendly male" },
    f: { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura — brisk upbeat female" },
  },
  "natural-remedy-believer": {
    m: { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam — gentle earnest male" },
    f: { id: "LcfcDJNUP1GQjkzn1xUU", name: "Emily — calm, wellness-adjacent female" },
  },
};

const DEFAULT_VOICE = "21m00Tcm4TlvDq8ikWAM"; // Rachel — safe neutral fallback

export function voiceFor(personaId: string, gender: Gender | undefined): string {
  const pair = VOICES[personaId];
  if (!pair) return DEFAULT_VOICE;
  return (gender === "m" ? pair.m : pair.f).id;
}

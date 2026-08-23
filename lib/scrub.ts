/**
 * PHI/identifier scrub for free-text fields. The product stays PHI-free by
 * design: users describe a TYPE of patient, never a real one. These checks
 * are deliberately conservative heuristics — they catch the obvious slips
 * (names, DOB-like dates, phone/MRN numbers) with a friendly correction.
 */

export interface ScrubResult {
  ok: boolean;
  reason?: string;
}

const HONORIFIC_NAME = /\b(?:mr|mrs|ms|dr|miss)\.?\s+[A-Z][a-z]+/i;
const FULL_NAME = /\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b/;
const DOB_LIKE = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/;
const LONG_NUMBER = /\d[\d\s()-]{6,}\d/;
const PROFANITY = /\b(?:fuck|shit|bitch|asshole|cunt|dick)\b/i;

/** Words that commonly start sentences capitalized and pair with another
 *  capitalized word without being names (avoids false positives). */
const SAFE_CAPS = new Set([
  "They", "The", "She", "He", "My", "Our", "This", "That", "Every", "Most",
  "Some", "Insurance", "Medicare", "Medicaid", "Dr", "Plantar", "Achilles",
]);

export function scrubFreeText(
  text: string,
  opts: { allowNames?: boolean } = {}
): ScrubResult {
  const t = text.trim();
  if (!t) return { ok: true };

  if (PROFANITY.test(t)) {
    return { ok: false, reason: "Let's keep it clinical — please remove the profanity." };
  }
  if (!opts.allowNames && HONORIFIC_NAME.test(t)) {
    return {
      ok: false,
      reason:
        "That looks like a real person's name. Describe a typical patient — “a retired teacher in her 60s” — never an actual one.",
    };
  }
  const nameMatch = opts.allowNames ? null : t.match(FULL_NAME);
  if (nameMatch && !SAFE_CAPS.has(nameMatch[0].split(/\s+/)[0])) {
    return {
      ok: false,
      reason:
        "That looks like it might be a name. No names — describe the type of patient instead.",
    };
  }
  if (DOB_LIKE.test(t)) {
    return {
      ok: false,
      reason: "That looks like a date of birth or visit date. Leave real dates out — types, not people.",
    };
  }
  if (LONG_NUMBER.test(t)) {
    return {
      ok: false,
      reason:
        "That looks like a phone, chart, or record number. No identifiers — describe a typical patient only.",
    };
  }
  return { ok: true };
}

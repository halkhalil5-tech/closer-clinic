/**
 * Letter-grade mapping over the 100-point encounter total. Pure + unit-tested;
 * shared by the scorecard paper, progress trend, and assignment targets.
 */

const BANDS: [min: number, letter: string][] = [
  [97, "A+"],
  [93, "A"],
  [90, "A−"],
  [87, "B+"],
  [83, "B"],
  [80, "B−"],
  [77, "C+"],
  [73, "C"],
  [70, "C−"],
  [67, "D+"],
  [63, "D"],
  [60, "D−"],
];

export function letterFor(total: number): string {
  for (const [min, letter] of BANDS) {
    if (total >= min) return letter;
  }
  return "F";
}

/** Numeric floor of a letter, for "minimum grade B" targets. */
export function minTotalFor(letter: string): number {
  const found = BANDS.find(([, l]) => l === letter);
  return found ? found[0] : 0;
}

/** Average the last `window` totals into a letter; null when no reps. */
export function averageLetter(totals: number[], window = 10): string | null {
  const slice = totals.slice(0, window);
  if (slice.length === 0) return null;
  return letterFor(Math.round(slice.reduce((a, b) => a + b, 0) / slice.length));
}

/** ISO timestamp N days back (kept out of components for render purity). */
export function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

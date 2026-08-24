import type { Scenario } from "./types";

/**
 * Activation: which station gets the "Run your first rep" button. The
 * highest-priced provider station that the warmup deck actually rehearses
 * (its price appears in a warmup line); if the deck references none, the
 * highest-priced provider station outright.
 */
export function pickFirstRepStation(
  stations: Scenario[],
  warmups: { line: string }[]
): Scenario | null {
  const eligible = stations.filter(
    (s) => (s.role ?? "provider") === "provider" && s.active && !s.isCustom && !s.isPrep
  );
  if (eligible.length === 0) return null;

  const maxPrice = (s: Scenario) => {
    const nums = s.priceDisplay.match(/\d[\d,]*/g)?.map((n) => parseInt(n.replace(/,/g, ""), 10));
    return nums?.length ? Math.max(...nums) : 0;
  };
  const lead = (s: Scenario) => s.priceDisplay.match(/^\$[\d,]+/)?.[0] ?? "";

  const warmed = eligible.filter((s) => {
    const l = lead(s);
    return l !== "" && warmups.some((w) => w.line.includes(l));
  });
  const pool = warmed.length > 0 ? warmed : eligible;
  return pool.sort((a, b) => maxPrice(b) - maxPrice(a))[0] ?? null;
}

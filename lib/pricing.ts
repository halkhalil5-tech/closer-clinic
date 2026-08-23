import type { PriceConfig, Scenario, ScenarioOverrideRow } from "./types";

/**
 * Pure pricing helpers: turn a structured PriceConfig into the display and
 * structure strings the patient, grader, and UI all consume — and apply a
 * user's override to a base scenario without ever mutating the base.
 */

const fmt = (n: number) => `$${n.toLocaleString("en-US")}`;

export function derivePriceStrings(c: PriceConfig): { priceDisplay: string; priceStructure: string } {
  switch (c.kind) {
    case "single":
      return {
        priceDisplay: fmt(c.amount),
        priceStructure: `${fmt(c.amount)}, cash-pay, single service`,
      };
    case "package": {
      const s = c.sessions ?? 1;
      return {
        priceDisplay: fmt(c.amount),
        priceStructure: `${fmt(c.amount)} for the ${s}-session package, cash-pay${
          c.anchorAmount ? `; single sessions are ${fmt(c.anchorAmount)} (comparison anchor)` : ""
        }`,
      };
    }
    case "program": {
      const s = c.sessions ?? 1;
      const cadence = c.interval ? `, ${c.interval}` : "";
      return {
        priceDisplay: `${fmt(c.amount)} program`,
        priceStructure: `${fmt(c.amount)} for the full program of ${s} sessions${cadence}${
          c.anchorAmount
            ? `; a single session (${fmt(c.anchorAmount)}) can be offered as a comparison anchor, but singles rarely deliver the full result`
            : ""
        }`,
      };
    }
  }
}

/** Effective scenario for a user: base + override price fields. */
export function applyOverride(scenario: Scenario, override: ScenarioOverrideRow | null): Scenario {
  if (!override) return scenario;
  return {
    ...scenario,
    priceDisplay: override.priceDisplay,
    priceStructure: override.priceStructure,
  };
}

/** Apply an encounter's creation-time price snapshot to its scenario. */
export function withPriceSnapshot(
  scenario: Scenario,
  meta: { priceDisplay?: string; priceStructure?: string } | undefined
): Scenario {
  if (!meta?.priceDisplay) return scenario;
  return {
    ...scenario,
    priceDisplay: meta.priceDisplay,
    priceStructure: meta.priceStructure ?? scenario.priceStructure,
  };
}

/** Best-effort starting config when editing a scenario with no override yet. */
export function guessConfigFromScenario(s: Scenario): PriceConfig {
  const nums = s.priceDisplay.match(/\d[\d,]*/g)?.map((n) => parseInt(n.replace(/,/g, ""), 10)) ?? [];
  const amount = nums.length ? Math.max(...nums) : 0;
  const sessions = s.priceStructure.match(/(\d+)[- ]session/i)?.[1];
  const kind: PriceConfig["kind"] = /program/i.test(s.priceDisplay)
    ? "program"
    : sessions
      ? "package"
      : "single";
  return {
    kind,
    amount,
    sessions: sessions ? parseInt(sessions, 10) : undefined,
    interval: s.priceStructure.match(/every [^,;.]+/i)?.[0]?.toLowerCase(),
    anchorAmount: undefined,
  };
}

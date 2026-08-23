import { describe, expect, it } from "vitest";
import { derivePriceStrings, applyOverride, guessConfigFromScenario, withPriceSnapshot } from "@/lib/pricing";
import { scrubFreeText } from "@/lib/scrub";
import { splitReceptivity, receptivityTone } from "@/lib/receptivity";
import { letterFor, minTotalFor, averageLetter } from "@/lib/letter-grades";
import { assignmentStatus, dueTone } from "@/lib/assignments";
import { SCENARIOS } from "@/lib/scenarios";
import type { AssignmentRow } from "@/lib/types";
import type { EncounterWithGrade } from "@/lib/store";

describe("derivePriceStrings", () => {
  it("renders single / package / program with anchors", () => {
    expect(derivePriceStrings({ kind: "single", amount: 600 }).priceDisplay).toBe("$600");
    const pkg = derivePriceStrings({ kind: "package", amount: 750, sessions: 3, anchorAmount: 275 });
    expect(pkg.priceDisplay).toBe("$750");
    expect(pkg.priceStructure).toContain("3-session package");
    expect(pkg.priceStructure).toContain("$275");
    const prog = derivePriceStrings({ kind: "program", amount: 900, sessions: 6, interval: "every 2 months" });
    expect(prog.priceDisplay).toBe("$900 program");
    expect(prog.priceStructure).toContain("every 2 months");
  });
});

describe("applyOverride / snapshot", () => {
  const base = SCENARIOS[0];
  it("overrides price fields without mutating the base", () => {
    const effective = applyOverride(base, {
      userId: "u",
      scenarioSlug: base.slug,
      scope: "user",
      config: { kind: "single", amount: 750 },
      priceDisplay: "$750",
      priceStructure: "$750, cash-pay, single service",
      updatedAt: "now",
    });
    expect(effective.priceDisplay).toBe("$750");
    expect(base.priceDisplay).toBe("$600");
  });

  it("snapshot wins over current scenario price", () => {
    const s = withPriceSnapshot(base, { priceDisplay: "$999", priceStructure: "structure" });
    expect(s.priceDisplay).toBe("$999");
    expect(withPriceSnapshot(base, undefined).priceDisplay).toBe(base.priceDisplay);
  });

  it("guesses a sensible config from display strings", () => {
    expect(guessConfigFromScenario(base).amount).toBe(600);
    const program = SCENARIOS.find((s) => /program/.test(s.priceDisplay))!;
    expect(guessConfigFromScenario(program).kind).toBe("program");
  });
});

describe("scrubFreeText", () => {
  it("rejects names, DOBs, and long numbers", () => {
    expect(scrubFreeText("Mrs. Kowalski keeps refusing").ok).toBe(false);
    expect(scrubFreeText("Seen on 3/14/2024 for follow-up").ok).toBe(false);
    expect(scrubFreeText("call me at 5551234567").ok).toBe(false);
    expect(scrubFreeText("Margaret Wilson said no").ok).toBe(false);
  });
  it("passes typical-patient descriptions", () => {
    expect(scrubFreeText("a retired teacher in her 60s on Medicare").ok).toBe(true);
    expect(scrubFreeText("they think insurance should cover it").ok).toBe(true);
  });
  it("allowNames relaxes only the name checks", () => {
    expect(scrubFreeText("Shockwave Therapy is indicated", { allowNames: true }).ok).toBe(true);
    expect(scrubFreeText("seen 3/14/2024", { allowNames: true }).ok).toBe(false);
  });
});

describe("receptivity", () => {
  it("splits and clamps the trailing JSON line", () => {
    const r = splitReceptivity('Well... I don\'t know.\n{"receptivity": 42}');
    expect(r.text).toBe("Well... I don't know.");
    expect(r.receptivity).toBe(42);
    expect(splitReceptivity("no trailer here").receptivity).toBeNull();
    expect(splitReceptivity('ok\n{"receptivity": 250}').receptivity).toBe(100);
  });
  it("tones map to the gauge bands", () => {
    expect(receptivityTone(80)).toBe("mint");
    expect(receptivityTone(50)).toBe("bone");
    expect(receptivityTone(20)).toBe("amber");
  });
});

describe("letter grades", () => {
  it("maps bands and floors", () => {
    expect(letterFor(97)).toBe("A+");
    expect(letterFor(84)).toBe("B");
    expect(letterFor(60)).toBe("D−");
    expect(letterFor(59)).toBe("F");
    expect(minTotalFor("B")).toBe(83);
  });
  it("averages the last N totals", () => {
    expect(averageLetter([90, 90, 84])).toBe("B+");
    expect(averageLetter([])).toBeNull();
  });
});

describe("assignmentStatus", () => {
  const assignment: AssignmentRow = {
    id: "a1",
    adminUserId: "admin",
    kind: "station",
    stationSlug: "mls-laser-neuropathy",
    title: "MLS laser",
    seats: "all",
    dueAt: new Date(Date.now() + 86_400_000).toISOString(),
    targetReps: 2,
    minGrade: "B",
    createdAt: new Date(Date.now() - 86_400_000).toISOString(),
    active: true,
  };

  function rep(total: number, slug = "mls-laser-neuropathy", hoursAgo = 1): EncounterWithGrade {
    const at = new Date(Date.now() - hoursAgo * 3600_000).toISOString();
    return {
      encounter: {
        id: Math.random().toString(),
        userId: "u",
        scenarioSlug: slug,
        difficulty: "moderate",
        persona: { personaId: "p", archetype: "a", name: "n", age: 50, insurance: "i", occupation: "o" },
        transcript: [],
        status: "graded",
        startedAt: at,
        endedAt: at,
        usage: { modelInputTokens: 0, modelOutputTokens: 0, ttsCharacters: 0, sttSeconds: 0 },
        kind: "rep",
      },
      grade: {
        id: "g",
        encounterId: "e",
        closed: true,
        scores: { rapport: 0, framing: 0, price: 0, objections: 0, close: 0 },
        total,
        moment: "",
        momentIndex: null,
        rewrite: null,
        worked: [],
        fixes: [],
        drill: "",
        createdAt: at,
      },
    };
  }

  it("counts only reps at/above the min grade", () => {
    const st = assignmentStatus(assignment, [rep(60), rep(85)]);
    expect(st.state).toBe("in_progress");
    expect(st.countedReps).toBe(1);
    expect(st.bestLetter).toBe("B");
  });

  it("completes at the target and ignores other stations", () => {
    const st = assignmentStatus(assignment, [rep(85), rep(90), rep(95, "other-station")]);
    expect(st.state).toBe("done");
  });

  it("cards assignments count sessions", () => {
    const cards = { ...assignment, kind: "cards" as const, stationSlug: null, minGrade: null };
    expect(assignmentStatus(cards, [], 2).state).toBe("done");
    expect(assignmentStatus(cards, [], 1).state).toBe("in_progress");
  });

  it("due tones", () => {
    expect(dueTone(new Date(Date.now() - 1000).toISOString())).toBe("overdue");
    expect(dueTone(new Date(Date.now() + 3600_000).toISOString())).toBe("soon");
    expect(dueTone(new Date(Date.now() + 5 * 86_400_000).toISOString())).toBe("normal");
  });
});

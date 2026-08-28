import { describe, expect, it } from "vitest";
import { REGEN_MODULE_DOCS } from "@/lib/training/regen-module-docs";
import { REGEN_MODULES, REGEN_LESSONS } from "@/lib/training/regen-pack";
import { REGEN_OBJECTION_CARDS } from "@/lib/training/regen-objection-cards";
import { PODIATRY_MODULES, PODIATRY_LESSONS } from "@/lib/training/podiatry-pack";
import { SCENARIOS } from "@/lib/scenarios";
import { STEMATIC_STATIONS, STEMATIC_PACK } from "@/lib/packs";
import { readingMinutes, recommendSection } from "@/lib/training";
import { GradeResultSchema } from "@/lib/grading";

const regenStations = SCENARIOS.filter((s) => s.specialty === "regen");
const stationSlugs = new Set(SCENARIOS.map((s) => s.slug));

describe("regen station roster", () => {
  it("ships 10 stations: 8 provider-lane, 2 front-desk", () => {
    expect(regenStations).toHaveLength(10);
    expect(regenStations.filter((s) => s.role === "front_desk")).toHaveLength(2);
  });

  it("no station asserts state-dependent product availability", () => {
    for (const s of [...regenStations, ...STEMATIC_STATIONS]) {
      const patientFacing = `${s.patientCc} ${s.priceStructure} ${s.clinicalContext}`;
      // positive availability claims are banned; the guardrail sentence
      // ("never assert it's available everywhere") is what we WANT to see
      expect(patientFacing).not.toMatch(/\bis available (everywhere|in all states|nationwide)/i);
    }
    // every select-state Stematic station carries the guardrail in its context
    for (const s of STEMATIC_STATIONS) {
      if (/select states/i.test(s.marginNote ?? "")) {
        expect(s.clinicalContext.toLowerCase()).toContain("never assert");
      }
    }
  });
});

describe("regen training pack", () => {
  it("mirrors the podiatry ladder: same orders, same rubric keys", () => {
    const pod = [...PODIATRY_MODULES].sort((a, b) => a.order - b.order);
    const reg = [...REGEN_MODULES].sort((a, b) => a.order - b.order);
    expect(reg.map((m) => m.order)).toEqual(pod.map((m) => m.order));
    expect(reg.map((m) => m.rubricKey)).toEqual(pod.map((m) => m.rubricKey));
  });

  it("module and lesson slugs never collide with podiatry (global PK)", () => {
    const podSlugs = new Set([
      ...PODIATRY_MODULES.map((m) => m.slug),
      ...PODIATRY_LESSONS.map((l) => l.slug),
    ]);
    for (const m of REGEN_MODULES) expect(podSlugs.has(m.slug)).toBe(false);
    for (const l of REGEN_LESSONS) expect(podSlugs.has(l.slug)).toBe(false);
  });

  it.each(REGEN_MODULE_DOCS.map((d) => [d.moduleSlug, d] as const))(
    "%s follows the standardized schema",
    (_slug, doc) => {
      expect(doc.objectives.length).toBeGreaterThanOrEqual(3);
      expect(doc.objectives.length).toBeLessThanOrEqual(5);
      expect(doc.concept.length).toBeGreaterThanOrEqual(2);
      expect(doc.concept.length).toBeLessThanOrEqual(4);
      expect(doc.scripts.length).toBeGreaterThanOrEqual(1);
      expect(doc.mistakes.length).toBeGreaterThanOrEqual(3);
      expect(doc.mistakes.length).toBeLessThanOrEqual(5);
      expect(stationSlugs.has(doc.repCta.stationSlug)).toBe(true);
      const lesson = REGEN_LESSONS.find((l) => l.slug === `${doc.moduleSlug}-core`);
      expect(lesson).toBeDefined();
      expect(lesson!.quiz.length).toBeGreaterThanOrEqual(3);
      expect(lesson!.quiz.length).toBeLessThanOrEqual(5);
    }
  );

  it("reading time per module stays ≤ 8 minutes", () => {
    for (const doc of REGEN_MODULE_DOCS) {
      expect(readingMinutes(doc), doc.moduleSlug).toBeLessThanOrEqual(8);
    }
  });

  it("drill scenarios point at real regen stations", () => {
    for (const l of REGEN_LESSONS) {
      if (l.drill) expect(stationSlugs.has(l.drill.scenarioSlug)).toBe(true);
    }
  });

  it("recommendSection deep-links land on regen modules with shared section ids", () => {
    const rec = recommendSection("price", "kept justifying after the number, no silence", "regen");
    expect(rec.moduleSlug).toBe("regen-price");
    const doc = REGEN_MODULE_DOCS.find((d) => d.moduleSlug === "regen-price")!;
    const ids = [...doc.concept.map((c) => c.id), ...doc.scripts.map((g) => g.id)];
    expect(ids).toContain(rec.sectionId);
    // podiatry unchanged
    expect(recommendSection("price", "no silence").moduleSlug).toBe("price");
  });
});

describe("regen objection deck", () => {
  it("covers the required objections", () => {
    expect(REGEN_OBJECTION_CARDS.length).toBeGreaterThanOrEqual(11);
    const fronts = REGEN_OBJECTION_CARDS.map((c) => c.front.toLowerCase()).join(" | ");
    for (const needle of ["fda", "insurance", "scam", "guarantee", "embryo", "prp", "week", "wife", "think"]) {
      expect(fronts).toContain(needle);
    }
  });

  it("the FDA card's back never implies approval", () => {
    const card = REGEN_OBJECTION_CARDS.find((c) => c.id === "rg-fda")!;
    expect(card.back.reframe.toLowerCase()).toContain("not an fda-approved");
  });
});

describe("compliance grade parsing", () => {
  it("accepts a regen grade with compliance and a podiatry grade without", () => {
    const base = {
      closed: true,
      scores: { rapport: 15, framing: 14, price: 12, objections: 13, close: 14 },
      total: 68,
      moment: "m",
      momentIndex: 2,
      worked: ["w"],
      rewrite: { you_said: "a", better: "b" },
      fixes: ["f"],
      drill: "d",
    };
    expect(() => GradeResultSchema.parse(base)).not.toThrow();
    expect(() =>
      GradeResultSchema.parse({ ...base, compliance: { score: 6, flags: ["guaranteed outcome"] } })
    ).not.toThrow();
    expect(() =>
      GradeResultSchema.parse({ ...base, compliance: { score: 25, flags: [] } })
    ).toThrow();
  });
});

describe("stematic pack", () => {
  it("is a regen pack whose stations carry margin notes with wholesale + availability", () => {
    expect(STEMATIC_PACK.specialty).toBe("regen");
    expect(STEMATIC_STATIONS.length).toBeGreaterThanOrEqual(4);
    for (const s of STEMATIC_STATIONS) {
      expect(s.marginNote, s.slug).toBeTruthy();
      expect(s.patientCc.includes("$")).toBe(false); // wholesale never in patient lines
    }
  });
});

describe("prompt isolation — podiatry byte-identical", () => {
  it("regen blocks appear only for regen scenarios", async () => {
    const { buildPatientSystemPrompt, buildGraderPrompt } = await import("@/lib/prompts");
    const { SCENARIOS } = await import("@/lib/scenarios");
    const pod = SCENARIOS.find((s) => s.slug === "shockwave-plantar-fasciitis")!;
    const reg = SCENARIOS.find((s) => s.slug === "regen-knee-single")!;
    const snap = { personaId: "x", archetype: "a", name: "n", age: 50, insurance: "i", occupation: "o" };
    expect(buildPatientSystemPrompt(pod, snap, "hard")).not.toContain("REGENERATIVE-MEDICINE");
    expect(buildPatientSystemPrompt(reg, snap, "hard")).toContain("REGENERATIVE-MEDICINE");
    const podGrader = buildGraderPrompt(pod, snap, "hard", []);
    const regGrader = buildGraderPrompt(reg, snap, "hard", []);
    expect(podGrader).not.toContain("COMPLIANCE AXIS");
    expect(podGrader).not.toContain('"compliance"');
    expect(regGrader).toContain("COMPLIANCE AXIS");
    expect(regGrader).toContain('"compliance"');
  });

  it("the patient prompt never contains the vendor margin note", async () => {
    const { buildPatientSystemPrompt } = await import("@/lib/prompts");
    const { STEMATIC_STATIONS } = await import("@/lib/packs");
    const snap = { personaId: "x", archetype: "a", name: "n", age: 50, insurance: "i", occupation: "o" };
    for (const s of STEMATIC_STATIONS) {
      const prompt = buildPatientSystemPrompt(s, snap, "moderate");
      expect(prompt).not.toContain("clinic cost");
      expect(prompt.includes("$1,795") || prompt.includes("$5,250") || prompt.includes("$7,050")).toBe(false);
    }
  });
});

describe("script-card margin line", () => {
  it("prompt, stub, parse, and hash all carry the margin only for pack stations", async () => {
    const { buildScriptCardPrompt, stubScriptCardJson, parseScriptCardLines, scriptCardContentHash } =
      await import("@/lib/script-card");
    const { STEMATIC_STATIONS } = await import("@/lib/packs");
    const { SCENARIOS } = await import("@/lib/scenarios");
    const pack = STEMATIC_STATIONS.find((s) => s.slug === "st-cultivar-msc-knee")!;
    const base = SCENARIOS.find((s) => s.slug === "shockwave-plantar-fasciitis")!;

    expect(buildScriptCardPrompt(pack)).toContain("VENDOR MARGIN CONTEXT");
    expect(buildScriptCardPrompt(pack)).toContain("marginLine");
    expect(buildScriptCardPrompt(base)).not.toContain("VENDOR MARGIN CONTEXT");

    const stubbed = parseScriptCardLines(stubScriptCardJson(pack));
    expect(stubbed.marginLine).toBeTruthy();
    const baseStub = parseScriptCardLines(stubScriptCardJson(base));
    expect(baseStub.marginLine).toBeUndefined();

    // margin note participates in the cache hash (edit → regenerate)
    const h1 = scriptCardContentHash(pack);
    const h2 = scriptCardContentHash({ ...pack, marginNote: "changed" });
    expect(h1).not.toBe(h2);
  });
});

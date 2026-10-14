import { describe, expect, it } from "vitest";
import { DERM_MODULES } from "@/lib/derm/modules";
import { DERM_SCENARIOS, DERM_OBJECTION_CARDS } from "@/lib/derm/compile";
import { DERM_PERSONAS } from "@/lib/derm/personas";
import { rollPersona, PERSONAS } from "@/lib/personas";
import { SCENARIOS } from "@/lib/scenarios";
import { buildGraderPrompt } from "@/lib/prompts";
import { rubricLabelsFor } from "@/lib/types";

describe("derm module compiler", () => {
  it("every module compiles to a complete station", () => {
    for (const s of DERM_SCENARIOS) {
      expect(s.specialty).toBe("derm");
      expect(s.slug.startsWith("derm-")).toBe(true);
      expect(s.objectionSeeds.length).toBeGreaterThanOrEqual(6);
      expect(s.closeScript).toBeTruthy();
      expect(s.personaPool?.length).toBeGreaterThan(0);
      expect(s.clinicalContext).toContain("SCREENING THE PROVIDER MUST COMPLETE");
    }
  });
  it("modules carry screening + consent + packages", () => {
    for (const m of DERM_MODULES) {
      expect(m.screening.length).toBeGreaterThanOrEqual(3);
      expect(m.consentEssentials.length).toBeGreaterThanOrEqual(3);
      expect(m.packageOptions.length).toBeGreaterThan(0);
      expect(m.objections.length).toBeGreaterThanOrEqual(6);
      expect(m.objections.length).toBeLessThanOrEqual(10);
    }
  });
  it("flashcards compile with the three-part back", () => {
    for (const c of DERM_OBJECTION_CARDS) {
      expect(c.back.isolate).toBeTruthy();
      expect(c.back.reframe).toBeTruthy();
      expect(c.back.close).toBeTruthy();
    }
  });
  it("derm stations are registered in the canonical list", () => {
    expect(SCENARIOS.some((s) => s.slug === "derm-neuromodulators")).toBe(true);
  });
});

describe("derm personas stay in their lane", () => {
  it("default rolls never produce a derm archetype", () => {
    for (let i = 0; i < 300; i++) {
      const p = rollPersona();
      expect(p.personaId.startsWith("derm-")).toBe(false);
    }
  });
  it("station pools reach derm archetypes", () => {
    const pool = DERM_SCENARIOS[0].personaPool!;
    const p = rollPersona(Math.random, pool);
    expect(pool).toContain(p.personaId);
  });
  it("all pool ids exist", () => {
    const ids = new Set(PERSONAS.map((p) => p.id));
    for (const s of DERM_SCENARIOS) for (const id of s.personaPool ?? []) expect(ids.has(id)).toBe(true);
  });
  it("derm personas are tagged", () => {
    for (const p of DERM_PERSONAS) expect(p.specialty).toBe("derm");
  });
});

const SNAP = { personaId: "x", archetype: "Test", name: "Pat Doe", age: 40, insurance: "PPO", occupation: "teacher" };

describe("derm grading hooks", () => {
  it("grader prompt carries the derm lens and compliance axis", () => {
    const prompt = buildGraderPrompt(DERM_SCENARIOS[0], SNAP, "moderate", []);
    expect(prompt).toContain("DERM LENS");
    expect(prompt).toContain("COMPLIANCE AXIS (aesthetic dermatology");
    expect(prompt).toContain("vascular occlusion");
    expect(prompt).toContain('"compliance"');
  });
  it("podiatry and regen grader prompts are unchanged by derm", () => {
    const pod = SCENARIOS.find((s) => s.slug === "shockwave-plantar-fasciitis")!;
    const podPrompt = buildGraderPrompt(pod, SNAP, "moderate", []);
    expect(podPrompt).not.toContain("DERM LENS");
    expect(podPrompt).not.toContain("aesthetic dermatology");
    const regen = SCENARIOS.find((s) => s.slug === "regen-knee-single")!;
    const regenPrompt = buildGraderPrompt(regen, SNAP, "moderate", []);
    expect(regenPrompt).toContain("COMPLIANCE AXIS (regenerative medicine");
    expect(regenPrompt).not.toContain("DERM LENS");
  });
  it("derm rubric labels relabel without reshaping", () => {
    const labels = rubricLabelsFor("provider", "derm");
    expect(labels.rapport).toBe("Discovery");
    expect(labels.close).toBe("Close & rebooking");
    expect(Object.keys(labels)).toHaveLength(5);
  });
});

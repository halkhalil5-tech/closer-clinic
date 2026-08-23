import { describe, expect, it } from "vitest";
import { PODIATRY_MODULE_DOCS } from "@/lib/training/module-docs";
import { PODIATRY_MODULES, PODIATRY_LESSONS } from "@/lib/training/podiatry-pack";
import { SCENARIOS } from "@/lib/scenarios";
import { readingMinutes, recommendSection } from "@/lib/training";

const stationSlugs = new Set(SCENARIOS.map((s) => s.slug));

describe("module doc schema", () => {
  it("every module has a doc, and every doc has a module", () => {
    const moduleSlugs = PODIATRY_MODULES.map((m) => m.slug).sort();
    const docSlugs = PODIATRY_MODULE_DOCS.map((d) => d.moduleSlug).sort();
    expect(docSlugs).toEqual(moduleSlugs);
  });

  it.each(PODIATRY_MODULE_DOCS.map((d) => [d.moduleSlug, d] as const))(
    "%s follows the standardized schema",
    (_slug, doc) => {
      // 3–5 measurable objectives
      expect(doc.objectives.length).toBeGreaterThanOrEqual(3);
      expect(doc.objectives.length).toBeLessThanOrEqual(5);
      // core concept in 2–4 short sections with ids
      expect(doc.concept.length).toBeGreaterThanOrEqual(2);
      expect(doc.concept.length).toBeLessThanOrEqual(4);
      for (const c of doc.concept) expect(c.id).toMatch(/^[a-z0-9-]+$/);
      // word-for-word scripts, each line with a why
      expect(doc.scripts.length).toBeGreaterThanOrEqual(1);
      for (const g of doc.scripts) {
        expect(g.id).toMatch(/^[a-z0-9-]+$/);
        for (const l of g.lines) {
          expect(l.line.length).toBeGreaterThan(0);
          expect(l.why.length).toBeGreaterThan(0);
        }
      }
      // 3–5 common mistakes, corrected side by side
      expect(doc.mistakes.length).toBeGreaterThanOrEqual(3);
      expect(doc.mistakes.length).toBeLessThanOrEqual(5);
      // rep CTA points at a real station + difficulty
      expect(stationSlugs.has(doc.repCta.stationSlug)).toBe(true);
      expect(["easy", "moderate", "hard"]).toContain(doc.repCta.difficulty);
      // tracked check lives on the module's -core lesson (3–5 questions)
      const lesson = PODIATRY_LESSONS.find((l) => l.slug === `${doc.moduleSlug}-core`);
      expect(lesson).toBeDefined();
      expect(lesson!.quiz.length).toBeGreaterThanOrEqual(3);
      expect(lesson!.quiz.length).toBeLessThanOrEqual(5);
    }
  );

  it("reading time per module stays ≤ 8 minutes", () => {
    for (const doc of PODIATRY_MODULE_DOCS) {
      expect(readingMinutes(doc), doc.moduleSlug).toBeLessThanOrEqual(8);
    }
  });

  it("no fabricated outcome statistics: every % claim carries [NEEDS SOURCE] or is flagged", () => {
    for (const doc of PODIATRY_MODULE_DOCS) {
      const texts: string[] = [];
      doc.concept.forEach((c) => texts.push(c.body));
      doc.scripts.forEach((g) => g.lines.forEach((l) => texts.push(l.line, l.why)));
      doc.dialogues.forEach((d) => texts.push(d.weak, d.strong, d.annotation));
      doc.mistakes.forEach((m) => texts.push(m.wrong, m.right, m.note));
      for (const t of texts) {
        // Percent-style outcome claims must be placeholders with a source flag,
        // never invented numbers. ($ prices and "70/30 talk ratio" are fine.)
        const claims = t.match(/\b\d{2}(?:–\d{2})?%/g) ?? [];
        for (const c of claims) {
          if (c === "70%" || c === "30%") continue; // the talk ratio, not outcomes data
          expect(t.includes("[NEEDS SOURCE]"), `${doc.moduleSlug}: "${t.slice(0, 80)}"`).toBe(true);
        }
      }
    }
  });
});

describe("module 4 depth (objection handling)", () => {
  const doc = PODIATRY_MODULE_DOCS.find((d) => d.moduleSlug === "objections")!;

  it("covers the four objection types with distinct tool groups", () => {
    const ids = doc.scripts.map((g) => g.id);
    expect(ids).toEqual(
      expect.arrayContaining(["price-tools", "spouse-tools", "skepticism-tools", "think-tools", "door-open"])
    );
  });

  it("has two worked dialogues per objection type (patient / weak / strong / annotation)", () => {
    expect(doc.dialogues).toHaveLength(8);
    for (const prefix of ["price", "spouse", "skeptic", "think"]) {
      expect(doc.dialogues.filter((d) => d.id.startsWith(prefix))).toHaveLength(2);
    }
    for (const d of doc.dialogues) {
      expect(d.patient.length).toBeGreaterThan(0);
      expect(d.weak.length).toBeGreaterThan(0);
      expect(d.strong.length).toBeGreaterThan(0);
      expect(d.annotation.length).toBeGreaterThan(0);
    }
  });

  it("teaches the loop and when NOT to push", () => {
    const ids = doc.concept.map((c) => c.id);
    expect(ids).toContain("loop");
    expect(ids).toContain("when-not-to-push");
  });
});

describe("recommendSection", () => {
  it("routes objection moments to the specific section", () => {
    expect(recommendSection("objections", "she said she needs to talk to her husband").sectionId).toBe("spouse-tools");
    expect(recommendSection("objections", "asked for the success rate and a control group").sectionId).toBe("skepticism-tools");
    expect(recommendSection("objections", "patient said let me think about it").sectionId).toBe("think-tools");
    expect(recommendSection("objections", "objected that $600 is too expensive").sectionId).toBe("price-tools");
    expect(recommendSection("objections", "generic stumble").sectionId).toBe("loop");
  });

  it("routes other dimensions to sensible defaults", () => {
    expect(recommendSection("price", "babbled through the silence").sectionId).toBe("silence");
    expect(recommendSection("close", "kept selling after the yes").sectionId).toBe("after");
    expect(recommendSection("framing", "generic benefits, never cited the ultrasound").sectionId).toBe("this-patient");
  });
});

import { describe, expect, it } from "vitest";
import { parseGradeResult, sumScores } from "@/lib/grading";

const validGrade = {
  closed: true,
  scores: { rapport: 15, framing: 12, price: 18, objections: 10, close: 16 },
  total: 71,
  moment: "The provider asked 'mornings or afternoons?' and the patient picked one.",
  worked: ["Stated $600 plainly and held the silence."],
  fixes: ["Tie the recommendation to the 6mm ultrasound finding."],
  drill: "Practice the alternative close.",
};

describe("parseGradeResult", () => {
  it("parses a clean JSON object", () => {
    const result = parseGradeResult(JSON.stringify(validGrade));
    expect(result.closed).toBe(true);
    expect(result.scores.price).toBe(18);
    expect(result.total).toBe(71);
  });

  it("strips markdown fences and surrounding prose", () => {
    const raw = "Here is the grade:\n```json\n" + JSON.stringify(validGrade) + "\n```\nDone.";
    const result = parseGradeResult(raw);
    expect(result.total).toBe(71);
  });

  it("recomputes total server-side when the model's arithmetic is wrong", () => {
    const wrong = { ...validGrade, total: 99 };
    const result = parseGradeResult(JSON.stringify(wrong));
    expect(result.total).toBe(71); // 15+12+18+10+16
  });

  it("rejects out-of-range rubric scores", () => {
    const bad = { ...validGrade, scores: { ...validGrade.scores, price: 25 } };
    expect(() => parseGradeResult(JSON.stringify(bad))).toThrow();
  });

  it("rejects negative scores", () => {
    const bad = { ...validGrade, scores: { ...validGrade.scores, close: -1 } };
    expect(() => parseGradeResult(JSON.stringify(bad))).toThrow();
  });

  it("rejects missing rubric keys", () => {
    const { close: _close, ...partial } = validGrade.scores;
    const bad = { ...validGrade, scores: partial };
    expect(() => parseGradeResult(JSON.stringify(bad))).toThrow();
  });

  it("rejects missing coaching fields", () => {
    const { drill: _drill, ...bad } = validGrade;
    expect(() => parseGradeResult(JSON.stringify(bad))).toThrow();
  });

  it("rejects empty worked/fixes arrays", () => {
    const bad = { ...validGrade, worked: [] };
    expect(() => parseGradeResult(JSON.stringify(bad))).toThrow();
  });

  it("throws on output with no JSON at all", () => {
    expect(() => parseGradeResult("The provider did a great job overall!")).toThrow();
  });

  it("throws on malformed JSON", () => {
    expect(() => parseGradeResult('{"closed": true, "scores": {')).toThrow();
  });

  it("rejects non-integer scores", () => {
    const bad = { ...validGrade, scores: { ...validGrade.scores, rapport: 12.5 } };
    expect(() => parseGradeResult(JSON.stringify(bad))).toThrow();
  });
});

describe("sumScores", () => {
  it("sums all five categories", () => {
    expect(sumScores({ rapport: 20, framing: 20, price: 20, objections: 20, close: 20 })).toBe(100);
    expect(sumScores({ rapport: 0, framing: 0, price: 0, objections: 0, close: 0 })).toBe(0);
  });
});

describe("dimensionLetterFor — consistent with the session bands", () => {
  it("maps 0–20 scores onto the same scale as the overall letter", async () => {
    const { dimensionLetterFor, letterFor } = await import("@/lib/letter-grades");
    // five identical dimension scores must letter the same as their total
    for (const s of [4, 9, 12, 14, 16, 17, 18, 19, 20]) {
      expect(dimensionLetterFor(s)).toBe(letterFor(s * 5));
    }
    expect(dimensionLetterFor(18)).toBe("A−");
    expect(dimensionLetterFor(16)).toBe("B−");
    expect(dimensionLetterFor(14)).toBe("C−");
    expect(dimensionLetterFor(12)).toBe("D−");
    expect(dimensionLetterFor(11)).toBe("F");
    // fractional averages round like the total would
    expect(dimensionLetterFor(17.5)).toBe("B+");
  });

  it("letterColorFor buckets A/B/C/DF", async () => {
    const { letterColorFor } = await import("@/lib/letter-grades");
    expect(letterColorFor("A−")).toContain("grade-a");
    expect(letterColorFor("B+")).toContain("grade-b");
    expect(letterColorFor("C")).toContain("grade-c");
    expect(letterColorFor("D−")).toContain("grade-d");
    expect(letterColorFor("F")).toContain("grade-d");
  });
});

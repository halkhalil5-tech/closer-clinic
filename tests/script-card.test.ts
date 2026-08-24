import { describe, expect, it } from "vitest";
import {
  buildScriptCardPrompt,
  parseScriptCardLines,
  scriptCardContentHash,
  stubScriptCardJson,
} from "@/lib/script-card";
import { SCENARIOS } from "@/lib/scenarios";
import type { Scenario } from "@/lib/types";

const base = SCENARIOS[0];

describe("scriptCardContentHash", () => {
  it("is stable for unchanged content", () => {
    expect(scriptCardContentHash(base)).toBe(scriptCardContentHash({ ...base }));
  });
  it("changes when the price or objections change", () => {
    expect(scriptCardContentHash({ ...base, priceDisplay: "$750" })).not.toBe(
      scriptCardContentHash(base)
    );
    expect(scriptCardContentHash({ ...base, objectionSeeds: ["x"] })).not.toBe(
      scriptCardContentHash(base)
    );
  });
});

describe("parseScriptCardLines", () => {
  it("round-trips the stub and clamps to 3+3", () => {
    const lines = parseScriptCardLines(stubScriptCardJson(base));
    expect(lines.objections).toHaveLength(3);
    expect(lines.ifMaybe).toHaveLength(3);
    expect(lines.priceLine).toContain(base.priceDisplay);
  });
  it("rejects malformed shapes", () => {
    expect(() => parseScriptCardLines('{"priceLine": "x"}')).toThrow();
  });
  it("strips markdown fences", () => {
    const fenced = "```json\n" + stubScriptCardJson(base) + "\n```";
    expect(parseScriptCardLines(fenced).objections).toHaveLength(3);
  });
});

describe("buildScriptCardPrompt", () => {
  it("carries the station's real price and objections", () => {
    const p = buildScriptCardPrompt(base);
    expect(p).toContain(base.priceDisplay);
    expect(p).toContain(base.objectionSeeds[0]);
  });
  it("switches to scheduling language for front-desk stations", () => {
    const fd = SCENARIOS.find((s) => s.role === "front_desk") as Scenario;
    expect(buildScriptCardPrompt(fd)).toContain("front-desk");
  });
});

describe("PDF rendering", () => {
  it("renders a valid PDF with one page per card", async () => {
    const { renderScriptCards } = await import("@/lib/script-card-pdf");
    const lines = parseScriptCardLines(stubScriptCardJson(base));
    const two = await renderScriptCards(
      [
        { scenario: base, lines },
        { scenario: SCENARIOS[1], lines: parseScriptCardLines(stubScriptCardJson(SCENARIOS[1])) },
      ],
      "Foundry Foot & Ankle"
    );
    expect(two.subarray(0, 5).toString()).toBe("%PDF-");
    const pageCount = (two.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
    expect(pageCount).toBe(2);
    expect(two.byteLength).toBeGreaterThan(2000);
  });
});

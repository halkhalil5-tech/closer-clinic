import { describe, expect, it } from "vitest";
import { pickFirstRepStation } from "@/lib/first-rep";
import { SCENARIOS } from "@/lib/scenarios";
import { WARMUP_CARDS } from "@/lib/training/podiatry-pack";

describe("pickFirstRepStation", () => {
  it("picks the highest-priced provider station the warmup deck rehearses", () => {
    const pick = pickFirstRepStation(SCENARIOS, WARMUP_CARDS);
    // The deck's "Say it plainly" card rehearses the $600 series.
    expect(pick?.slug).toBe("shockwave-plantar-fasciitis");
  });

  it("never picks front-desk, custom, or prep stations", () => {
    const pick = pickFirstRepStation(SCENARIOS, [{ line: "$150 deposit" }]);
    expect(pick?.role ?? "provider").toBe("provider");
    expect(pick?.isCustom).toBe(false);
  });

  it("falls back to the highest-priced provider station with no warmup match", () => {
    const pick = pickFirstRepStation(SCENARIOS, [{ line: "nothing priced here" }]);
    expect(pick).not.toBeNull();
    const max = Math.max(
      ...SCENARIOS.filter((s) => (s.role ?? "provider") === "provider").map((s) =>
        Math.max(...(s.priceDisplay.match(/\d[\d,]*/g)?.map((n) => parseInt(n.replace(/,/g, ""), 10)) ?? [0]))
      )
    );
    const pickMax = Math.max(
      ...(pick!.priceDisplay.match(/\d[\d,]*/g)?.map((n) => parseInt(n.replace(/,/g, ""), 10)) ?? [0])
    );
    expect(pickMax).toBe(max);
  });

  it("null when no provider stations exist", () => {
    expect(pickFirstRepStation([], WARMUP_CARDS)).toBeNull();
  });
});

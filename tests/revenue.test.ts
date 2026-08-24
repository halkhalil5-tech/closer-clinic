import { describe, expect, it } from "vitest";
import {
  closedRevenue,
  defaultAmountCents,
  formatCents,
  paybackMultiple,
  revenueByDay,
  revenueDelta,
  stationLeaks,
} from "@/lib/revenue";
import type { OutcomeLogRow, Scenario } from "@/lib/types";

function log(over: Partial<OutcomeLogRow>): OutcomeLogRow {
  return {
    id: Math.random().toString(36).slice(2),
    userId: "u1",
    date: "2026-08-20",
    service: "Shockwave series",
    stationSlug: "shockwave",
    amountCents: null,
    amountEntered: false,
    presented: true,
    closed: false,
    createdAt: "2026-08-20T12:00:00Z",
    ...over,
  };
}

function scenario(priceDisplay: string): Scenario {
  return { priceDisplay } as Scenario;
}

const PRICES = new Map([
  ["shockwave", 60000],
  ["orthotics", 100000],
]);
const TITLES = new Map([
  ["shockwave", "Shockwave series"],
  ["orthotics", "Custom orthotics"],
]);

describe("defaultAmountCents", () => {
  it("uses the midpoint of a range, never the top", () => {
    expect(defaultAmountCents(scenario("$800–$1,200"))).toBe(100000);
  });
  it("single price is its own midpoint", () => {
    expect(defaultAmountCents(scenario("$600"))).toBe(60000);
  });
  it("no digits → zero", () => {
    expect(defaultAmountCents(scenario("varies"))).toBe(0);
  });
});

describe("closedRevenue", () => {
  it("sums only closed logs and marks defaults as estimated", () => {
    const r = closedRevenue(
      [
        log({ closed: true, amountCents: 55000, amountEntered: true }),
        log({ closed: true, amountCents: 60000, amountEntered: false }),
        log({ closed: false }),
      ],
      PRICES
    );
    expect(r.cents).toBe(115000);
    expect(r.closes).toBe(2);
    expect(r.estimated).toBe(true);
  });

  it("is exact when every close was hand-entered", () => {
    const r = closedRevenue([log({ closed: true, amountCents: 50000, amountEntered: true })], PRICES);
    expect(r.estimated).toBe(false);
  });

  it("values legacy closes at the current station price, as an estimate", () => {
    const r = closedRevenue([log({ closed: true, amountCents: null })], PRICES);
    expect(r.cents).toBe(60000);
    expect(r.estimated).toBe(true);
  });
});

describe("revenueDelta", () => {
  const entered = (date: string, cents: number) =>
    log({ date, closed: true, amountCents: cents, amountEntered: true });

  it("shows the logging start date within the first 30 days", () => {
    const d = revenueDelta([entered("2026-08-01", 60000)], PRICES, "2026-08-20");
    expect(d).toEqual({ kind: "since", date: "2026-08-01" });
  });

  it("day 30 exactly still shows 'since'", () => {
    const d = revenueDelta([entered("2026-07-21", 60000)], PRICES, "2026-08-20");
    expect(d?.kind).toBe("since");
  });

  it("after 30 days, compares recent 30 days to the first 30", () => {
    const d = revenueDelta(
      [
        entered("2026-05-01", 60000), // baseline window (first 30 days)
        entered("2026-05-10", 60000),
        entered("2026-08-10", 60000), // recent window
        entered("2026-08-15", 60000),
        entered("2026-08-18", 60000),
      ],
      PRICES,
      "2026-08-20"
    );
    expect(d).toEqual({ kind: "delta", cents: 60000, estimated: false });
  });

  it("null with no logs", () => {
    expect(revenueDelta([], PRICES, "2026-08-20")).toBeNull();
  });
});

describe("paybackMultiple", () => {
  it("rounds to one decimal", () => {
    expect(paybackMultiple(60000, 4900)).toBe(12.2);
  });
  it("zero plan price → 0", () => {
    expect(paybackMultiple(60000, 0)).toBe(0);
  });
});

describe("stationLeaks", () => {
  it("sorts by (presented − closed) × price, biggest leak first", () => {
    const leaks = stationLeaks(
      [
        // shockwave: 3 presented, 1 closed → leak 2 × $600 = $1,200
        log({ closed: true, amountCents: 60000 }),
        log({}),
        log({}),
        // orthotics: 2 presented, 0 closed → leak 2 × $1,000 = $2,000
        log({ stationSlug: "orthotics", service: "Custom orthotics" }),
        log({ stationSlug: "orthotics", service: "Custom orthotics" }),
      ],
      PRICES,
      TITLES
    );
    expect(leaks[0].slug).toBe("orthotics");
    expect(leaks[0].leakCents).toBe(200000);
    expect(leaks[1].slug).toBe("shockwave");
    expect(leaks[1].leakCents).toBe(120000);
  });

  it("counts didn't-present separately from presented", () => {
    const leaks = stationLeaks([log({ presented: false })], PRICES, TITLES);
    expect(leaks[0].presented).toBe(0);
    expect(leaks[0].didntPresent).toBe(1);
    expect(leaks[0].leakCents).toBe(0);
  });
});

describe("revenueByDay", () => {
  it("buckets closed cents per day", () => {
    const m = revenueByDay(
      [
        log({ date: "2026-08-19", closed: true, amountCents: 60000 }),
        log({ date: "2026-08-19", closed: true, amountCents: 40000 }),
        log({ date: "2026-08-20", closed: false }),
      ],
      PRICES
    );
    expect(m.get("2026-08-19")).toBe(100000);
    expect(m.has("2026-08-20")).toBe(false);
  });
});

describe("formatCents", () => {
  it("whole dollars with separators", () => {
    expect(formatCents(123456700)).toBe("$1,234,567");
    expect(formatCents(-50000)).toBe("−$500");
  });
});

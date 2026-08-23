import { describe, expect, it } from "vitest";
import {
  canStartEncounter,
  canViewHistory,
  resolveEntitlement,
} from "@/lib/entitlements";

const base = { currentPeriodEnd: null, isComp: false };

describe("resolveEntitlement", () => {
  it("comp accounts always have full access regardless of status", () => {
    expect(resolveEntitlement({ ...base, status: "none", isComp: true })).toBe("full");
    expect(resolveEntitlement({ ...base, status: "canceled", isComp: true })).toBe("full");
  });

  it("active and trialing subscriptions have full access", () => {
    expect(resolveEntitlement({ ...base, status: "active" })).toBe("full");
    expect(resolveEntitlement({ ...base, status: "trialing" })).toBe("full");
  });

  it("past_due within the 7-day grace window is read-only", () => {
    const periodEnd = new Date("2026-08-15T00:00:00Z");
    const during = resolveEntitlement({
      status: "past_due",
      currentPeriodEnd: periodEnd.toISOString(),
      isComp: false,
      now: new Date("2026-08-20T00:00:00Z"), // 5 days in
    });
    expect(during).toBe("read_only");
  });

  it("past_due beyond the grace window loses access entirely", () => {
    const after = resolveEntitlement({
      status: "past_due",
      currentPeriodEnd: new Date("2026-08-01T00:00:00Z").toISOString(),
      isComp: false,
      now: new Date("2026-08-20T00:00:00Z"), // 19 days later
    });
    expect(after).toBe("none");
  });

  it("canceled but paid-through keeps full access until the period ends", () => {
    expect(
      resolveEntitlement({
        status: "canceled",
        currentPeriodEnd: new Date("2026-09-01T00:00:00Z").toISOString(),
        isComp: false,
        now: new Date("2026-08-20T00:00:00Z"),
      })
    ).toBe("full");
    expect(
      resolveEntitlement({
        status: "canceled",
        currentPeriodEnd: new Date("2026-08-01T00:00:00Z").toISOString(),
        isComp: false,
        now: new Date("2026-08-20T00:00:00Z"),
      })
    ).toBe("none");
  });

  it("no subscription means no access", () => {
    expect(resolveEntitlement({ ...base, status: "none" })).toBe("none");
    expect(resolveEntitlement({ ...base, status: "incomplete" })).toBe("none");
  });
});

describe("gating helpers", () => {
  it("only full access can start encounters", () => {
    expect(canStartEncounter("full")).toBe(true);
    expect(canStartEncounter("read_only")).toBe(false);
    expect(canStartEncounter("none")).toBe(false);
  });

  it("read-only can still view history", () => {
    expect(canViewHistory("read_only")).toBe(true);
    expect(canViewHistory("none")).toBe(false);
  });
});

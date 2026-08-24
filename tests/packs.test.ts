import { describe, expect, it } from "vitest";
import { NORTHWIND_CODE, NORTHWIND_PACK, NORTHWIND_STATIONS } from "@/lib/packs";
import { getMemoryStore } from "@/lib/store/memory-store";
import { listRosterForUser } from "@/lib/store";

describe("pack unlock flow (memory store)", () => {
  it("hides pack stations until a valid code is redeemed, then groups them", async () => {
    const store = getMemoryStore();

    expect(await store.listUnlockedPacks("u1")).toHaveLength(0);
    expect(await store.getScenario("nw-shockwave-launch")).toBeNull();

    const bad = await store.redeemPackCode("u1", "WRONG-CODE");
    expect(bad.ok).toBe(false);
    expect(await store.listUnlockedPacks("u1")).toHaveLength(0);

    const good = await store.redeemPackCode("u1", NORTHWIND_CODE.toLowerCase());
    expect(good).toEqual({ ok: true, packName: NORTHWIND_PACK.name });

    const packs = await store.listUnlockedPacks("u1");
    expect(packs).toHaveLength(1);
    expect(packs[0].stations.map((s) => s.slug)).toEqual(NORTHWIND_STATIONS.map((s) => s.slug));

    // pack station now resolvable for encounters
    expect((await store.getScenario("nw-shockwave-launch"))?.title).toBe("Device launch week");

    // idempotent re-redeem
    const again = await store.redeemPackCode("u1", NORTHWIND_CODE);
    expect(again.ok).toBe(true);
    expect(await store.listUnlockedPacks("u1")).toHaveLength(1);
  });

  it("groups pack stations in the roster with overrides applied", async () => {
    const store = getMemoryStore();
    await store.redeemPackCode("u1", NORTHWIND_CODE);
    const roster = await listRosterForUser(store, "u1", "podiatry");
    expect(roster.packs).toHaveLength(1);
    expect(roster.packs[0].pack.branding.accent).toBe("#5B8DEF");
    expect(roster.packs[0].stations).toHaveLength(3);
    // pack stations are not mixed into the built-in roster
    expect(roster.builtIn.some((s) => s.slug.startsWith("nw-"))).toBe(false);
  });
});

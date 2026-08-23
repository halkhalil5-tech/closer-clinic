import { describe, expect, it } from "vitest";
import {
  addingMemberChangesBilling,
  clinicMonthlyPrice,
  extraSeats,
} from "@/lib/seats";

describe("extraSeats", () => {
  it("includes 5 seats in the base clinic plan", () => {
    expect(extraSeats(0)).toBe(0);
    expect(extraSeats(1)).toBe(0);
    expect(extraSeats(5)).toBe(0);
  });

  it("bills each seat beyond 5", () => {
    expect(extraSeats(6)).toBe(1);
    expect(extraSeats(10)).toBe(5);
  });

  it("rejects invalid member counts", () => {
    expect(() => extraSeats(-1)).toThrow();
    expect(() => extraSeats(2.5)).toThrow();
  });
});

describe("clinicMonthlyPrice", () => {
  it("is $99 up to 5 seats", () => {
    expect(clinicMonthlyPrice(2)).toBe(99);
    expect(clinicMonthlyPrice(5)).toBe(99);
  });

  it("adds $19 per extra seat", () => {
    expect(clinicMonthlyPrice(6)).toBe(118);
    expect(clinicMonthlyPrice(8)).toBe(156);
  });
});

describe("addingMemberChangesBilling", () => {
  it("is free within the included seats", () => {
    expect(addingMemberChangesBilling(3)).toBe(false); // 4th member: included
    expect(addingMemberChangesBilling(4)).toBe(false); // 5th member: included
  });

  it("triggers a quantity change at the 6th member and beyond", () => {
    expect(addingMemberChangesBilling(5)).toBe(true); // 6th member: first paid seat
    expect(addingMemberChangesBilling(7)).toBe(true);
  });
});

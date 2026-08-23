/**
 * Clinic seat math (Phase 2 billing wires this to Stripe quantities).
 * Clinic plan includes 5 seats; each seat beyond 5 is a $19/mo add-on.
 * Pure and unit-tested now so billing lands on solid ground.
 */

export const CLINIC_INCLUDED_SEATS = 5;
export const EXTRA_SEAT_PRICE = 19;
export const CLINIC_BASE_PRICE = 99;

/** Number of billable extra seats for a clinic with `members` active seats. */
export function extraSeats(members: number): number {
  if (!Number.isInteger(members) || members < 0) {
    throw new Error(`Invalid member count: ${members}`);
  }
  return Math.max(0, members - CLINIC_INCLUDED_SEATS);
}

/** Monthly price in dollars for a clinic with `members` active seats. */
export function clinicMonthlyPrice(members: number): number {
  return CLINIC_BASE_PRICE + extraSeats(members) * EXTRA_SEAT_PRICE;
}

/** Whether adding one member changes the Stripe extra-seat quantity. */
export function addingMemberChangesBilling(currentMembers: number): boolean {
  return extraSeats(currentMembers + 1) !== extraSeats(currentMembers);
}

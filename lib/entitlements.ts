/**
 * Entitlement gating. Phase 1 ships without Stripe, so everyone resolves to
 * `full` access via the `founder_comp` path; Phase 2 wires real subscription
 * rows into this same function. Pure and unit-tested.
 */

export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "none";

export interface EntitlementInput {
  status: SubscriptionStatus;
  /** ISO date the current period (or trial) ends; null when unknown. */
  currentPeriodEnd: string | null;
  /** Founder/demo comp flag — bypasses Stripe entirely. */
  isComp: boolean;
  now?: Date;
}

export type Entitlement = "full" | "read_only" | "none";

const GRACE_PERIOD_DAYS = 7;

export function resolveEntitlement(input: EntitlementInput): Entitlement {
  if (input.isComp) return "full";
  const now = input.now ?? new Date();

  switch (input.status) {
    case "active":
    case "trialing":
      return "full";
    case "past_due": {
      // 7-day read-only grace after a failed payment: can view history,
      // can't start encounters.
      if (!input.currentPeriodEnd) return "read_only";
      const graceEnd = new Date(input.currentPeriodEnd);
      graceEnd.setDate(graceEnd.getDate() + GRACE_PERIOD_DAYS);
      return now <= graceEnd ? "read_only" : "none";
    }
    case "canceled": {
      // Paid-through cancellations keep access until the period ends.
      if (input.currentPeriodEnd && now <= new Date(input.currentPeriodEnd)) return "full";
      return "none";
    }
    default:
      return "none";
  }
}

export function canStartEncounter(e: Entitlement): boolean {
  return e === "full";
}

export function canViewHistory(e: Entitlement): boolean {
  return e === "full" || e === "read_only";
}

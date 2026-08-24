import type { OutcomeLogRow, Scenario } from "./types";

/**
 * Pure revenue math for the Progress screen. All amounts are whole cents.
 *
 * Snapshot rule: a log's revenue value is fixed at log time (amount_cents).
 * Legacy logs without a snapshot are valued at the station's CURRENT default
 * so the card stays complete — but they always count as estimated.
 */

/**
 * Default log amount for a station: the MIDPOINT of the numbers in its price
 * display ("$800–$1,200" → $1,000), not the top of the range. A clinic has to
 * trust this figure enough to renew on it; the top of the range reads as
 * inflated. Single prices are their own midpoint.
 */
export function defaultAmountCents(scenario: Scenario): number {
  const nums =
    scenario.priceDisplay.match(/\d[\d,]*/g)?.map((n) => parseInt(n.replace(/,/g, ""), 10)) ?? [];
  if (nums.length === 0) return 0;
  const mid = (Math.min(...nums) + Math.max(...nums)) / 2;
  return Math.round(mid) * 100;
}

/** Cents a single log contributes, and whether that value is an estimate. */
function valueOf(
  log: OutcomeLogRow,
  priceBySlug: Map<string, number>
): { cents: number; estimated: boolean } {
  if (typeof log.amountCents === "number") {
    return { cents: log.amountCents, estimated: !log.amountEntered };
  }
  const fallback = log.stationSlug ? (priceBySlug.get(log.stationSlug) ?? 0) : 0;
  return { cents: fallback, estimated: true };
}

export interface RevenueSummary {
  cents: number;
  closes: number;
  /** True when any counted log used a default rather than an entered amount. */
  estimated: boolean;
}

/** Closed revenue over a set of logs (caller pre-filters to the window). */
export function closedRevenue(
  logs: OutcomeLogRow[],
  priceBySlug: Map<string, number>
): RevenueSummary {
  let cents = 0;
  let closes = 0;
  let estimated = false;
  for (const log of logs) {
    if (!log.closed) continue;
    const v = valueOf(log, priceBySlug);
    cents += v.cents;
    closes += 1;
    if (v.estimated) estimated = true;
  }
  return { cents, closes, estimated };
}

export type RevenueDelta =
  | { kind: "delta"; cents: number; estimated: boolean }
  | { kind: "since"; date: string };

/**
 * "vs. your first 30 days: +$X" — only once the account has more than 30 days
 * of logging history; before that, surface the logging start date instead.
 * Baseline is the first 30 days of logs; comparison is the most recent 30 days.
 */
export function revenueDelta(
  allLogs: OutcomeLogRow[],
  priceBySlug: Map<string, number>,
  today: string
): RevenueDelta | null {
  if (allLogs.length === 0) return null;
  const firstDate = allLogs.reduce((min, l) => (l.date < min ? l.date : min), allLogs[0].date);
  const daysLogged = Math.floor(
    (Date.parse(today) - Date.parse(firstDate)) / 86_400_000
  );
  if (daysLogged <= 30) return { kind: "since", date: firstDate };

  const baselineEnd = new Date(Date.parse(firstDate) + 30 * 86_400_000)
    .toISOString()
    .slice(0, 10);
  const recentStart = new Date(Date.parse(today) - 30 * 86_400_000).toISOString().slice(0, 10);

  const baseline = closedRevenue(
    allLogs.filter((l) => l.date < baselineEnd),
    priceBySlug
  );
  const recent = closedRevenue(
    allLogs.filter((l) => l.date >= recentStart),
    priceBySlug
  );
  return {
    kind: "delta",
    cents: recent.cents - baseline.cents,
    estimated: baseline.estimated || recent.estimated,
  };
}

/** "This month's closes = 12.4× your subscription." Rounded to one decimal. */
export function paybackMultiple(revenueCents: number, planPriceCents: number): number {
  if (planPriceCents <= 0) return 0;
  return Math.round((revenueCents / planPriceCents) * 10) / 10;
}

export interface StationLeak {
  slug: string;
  title: string;
  presented: number;
  closed: number;
  didntPresent: number;
  /** (presented − closed) × station price — the money left in the room. */
  leakCents: number;
}

/**
 * Per-station leak table, sorted by (presented − closed) × price descending.
 * The top row is the station costing the clinic the most missed revenue.
 */
export function stationLeaks(
  logs: OutcomeLogRow[],
  priceBySlug: Map<string, number>,
  titleBySlug: Map<string, string>
): StationLeak[] {
  const by = new Map<string, StationLeak>();
  for (const log of logs) {
    const slug = log.stationSlug ?? log.service;
    const row =
      by.get(slug) ??
      ({
        slug,
        title: titleBySlug.get(slug) ?? log.service,
        presented: 0,
        closed: 0,
        didntPresent: 0,
        leakCents: 0,
      } satisfies StationLeak);
    if (log.presented) {
      row.presented += 1;
      if (log.closed) row.closed += 1;
    } else {
      row.didntPresent += 1;
    }
    by.set(slug, row);
  }
  for (const row of by.values()) {
    const price = priceBySlug.get(row.slug) ?? 0;
    row.leakCents = (row.presented - row.closed) * price;
  }
  return [...by.values()].sort((a, b) => b.leakCents - a.leakCents || b.presented - a.presented);
}

/** Closed revenue bucketed by day, for the weekly bars on the proof chart. */
export function revenueByDay(
  logs: OutcomeLogRow[],
  priceBySlug: Map<string, number>
): Map<string, number> {
  const out = new Map<string, number>();
  for (const log of logs) {
    if (!log.closed) continue;
    const v = valueOf(log, priceBySlug);
    out.set(log.date, (out.get(log.date) ?? 0) + v.cents);
  }
  return out;
}

/** "$12,400" / "$980" — whole dollars, no cents on the card. */
export function formatCents(cents: number): string {
  const dollars = Math.round(cents / 100);
  const sign = dollars < 0 ? "−" : "";
  return `${sign}$${Math.abs(dollars).toLocaleString("en-US")}`;
}

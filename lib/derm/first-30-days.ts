/**
 * "First 30 days" starter assignments for a new derm clinic — the onboarding
 * drill set an admin seeds with one click. Days are offsets from seeding.
 */
export interface StarterAssignment {
  title: string;
  kind: "station" | "cards";
  stationSlug: string | null;
  dueInDays: number;
  targetReps: number;
  minGrade: string | null;
}

export const DERM_FIRST_30_DAYS: StarterAssignment[] = [
  { title: "Week 1 — Toxin consults until they're reflex", kind: "station", stationSlug: "derm-neuromodulators", dueInDays: 7, targetReps: 3, minGrade: "B" },
  { title: "Week 1 — Objection cards, daily", kind: "cards", stationSlug: null, dueInDays: 7, targetReps: 5, minGrade: null },
  { title: "Week 2 — The phone price call", kind: "station", stationSlug: "derm-fd-price-call", dueInDays: 14, targetReps: 3, minGrade: "B" },
  { title: "Week 2 — Fillers: safety talk + staged plans", kind: "station", stationSlug: "derm-ha-fillers", dueInDays: 14, targetReps: 2, minGrade: "B" },
  { title: "Week 3 — The Groupon gauntlet (hard)", kind: "station", stationSlug: "derm-laser-hair-removal", dueInDays: 21, targetReps: 2, minGrade: "C" },
  { title: "Week 3 — Checkout: regimen + rebook", kind: "station", stationSlug: "derm-fd-checkout", dueInDays: 21, targetReps: 3, minGrade: "B" },
  { title: "Week 4 — Follow-up conversion + the earned review", kind: "station", stationSlug: "derm-followup-convert", dueInDays: 28, targetReps: 2, minGrade: "B" },
  { title: "Week 4 — Financing without fine-print sins", kind: "station", stationSlug: "derm-financing", dueInDays: 28, targetReps: 2, minGrade: "B" },
];

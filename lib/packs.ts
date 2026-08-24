import type { Scenario, Specialty } from "./types";

/**
 * Vendor station packs. The demo pack below is canonical content: the seed
 * script upserts it to Supabase, and the dev memory store serves it directly.
 * "Northwind" is a fictional vendor for demoing to device companies.
 */

export interface PackInfo {
  id: string;
  name: string;
  vendor: string;
  specialty: Specialty;
  branding: { logoUrl?: string; accent?: string };
  distribution: "public" | "code";
}

export interface UnlockedPack {
  pack: PackInfo;
  stations: Scenario[];
}

export const NORTHWIND_PACK: PackInfo = {
  id: "aa000000-0000-4000-8000-000000000001",
  name: "Northwind Shockwave",
  vendor: "Northwind Medical (fictional)",
  specialty: "podiatry",
  branding: { accent: "#5B8DEF" },
  distribution: "code",
};

export const NORTHWIND_CODE = "NORTHWIND-DEMO";

export const NORTHWIND_STATIONS: Scenario[] = [
  {
    slug: "nw-shockwave-launch",
    specialty: "podiatry",
    title: "Device launch week",
    serviceDesc: "First-week shockwave conversations after the Northwind unit arrives",
    priceDisplay: "$650",
    priceStructure: "$650 for the 3-session series, cash-pay",
    clinicalContext:
      "The clinic just installed a Northwind shockwave unit. The patient is a long-time chronic heel-pain patient hearing about it for the first time. New-device conversations fail when they sound like an upsell of new equipment instead of a match to this patient's failed-treatment history.",
    patientCc:
      "So the front desk said you've got some new machine now? I've been coming here two years for this heel.",
    closeGoal: "Patient books session one of the series this week.",
    objectionSeeds: [
      "You just bought this thing — of course you're recommending it.",
      "Why didn't you offer me this before if it's so good?",
      "Is this FDA-approved or is it experimental?",
      "Let me see how the first person you use it on does.",
    ],
    difficultyNotes:
      "The 'you're selling your new toy' suspicion must be defused with the patient's own two-year history, not with device specs.",
    isCustom: false,
    active: true,
  },
  {
    slug: "nw-shockwave-vs-surgery",
    specialty: "podiatry",
    title: "Shockwave vs. surgery consult",
    serviceDesc: "Positioning the shockwave series against a surgical release the patient came in expecting",
    priceDisplay: "$650",
    priceStructure: "$650 for the 3-session series, cash-pay",
    clinicalContext:
      "Patient arrived asking about plantar fascia release surgery — a friend had it. Imaging and history make them a textbook shockwave candidate first: surgery remains available if the series fails. The skill is honest de-escalation that still closes: recommending the smaller thing without sounding like a downgrade.",
    patientCc:
      "My neighbor had the surgery and she's pain-free. I'm done with band-aids — I came in to talk about the operation.",
    closeGoal: "Patient agrees to run the shockwave series before any surgical planning, and books session one.",
    objectionSeeds: [
      "I don't want to pay cash for a maybe when insurance covers the surgery.",
      "If it doesn't work I've wasted six weeks AND $650.",
      "My neighbor says the surgery just fixes it, period.",
      "Are you saying I'm not bad enough for surgery?",
    ],
    difficultyNotes:
      "The insurance-covers-surgery math is the hard anchor. Watch for the provider bad-mouthing surgery — the win is sequencing, not fear.",
    isCustom: false,
    active: true,
  },
  {
    slug: "nw-shockwave-maintenance",
    specialty: "podiatry",
    title: "The relapse visit",
    serviceDesc: "Re-closing a lapsed shockwave patient whose symptoms returned after stopping at session two",
    priceDisplay: "$450",
    priceStructure: "$450 to complete the series: two catch-up sessions plus a recheck",
    clinicalContext:
      "Patient did two of three sessions eight months ago, felt 80% better, stopped, and has now relapsed. They feel burned ('it didn't hold'). Chart says the series was never completed. The close: finish the protocol at the completion price, framed around the incomplete course — without scolding.",
    patientCc:
      "I did your shockwave thing last year and my heel's bad again, so... that was $400 down the drain, right?",
    closeGoal: "Patient books both completion sessions this month.",
    objectionSeeds: [
      "It obviously didn't work — why would I pay again?",
      "Nobody told me stopping early would undo it.",
      "Can you just credit what I already paid?",
      "Maybe my heel just doesn't respond to it.",
    ],
    difficultyNotes:
      "Blaming the patient for stopping loses the room instantly. The chart fact — 80% improvement, course incomplete — has to carry the reframe.",
    isCustom: false,
    active: true,
  },
].map((s) => ({ ...s })) as Scenario[];

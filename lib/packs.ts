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


/* ------------------------------ Stematic ------------------------------ */

export const STEMATIC_PACK: PackInfo = {
  id: "aa000000-0000-4000-8000-000000000002",
  name: "Stematic Biologics",
  vendor: "Stematic Biologics",
  specialty: "regen",
  branding: { accent: "#2F9E77" },
  distribution: "code",
};

export const STEMATIC_CODE = "STEMATIC-CLINIC";

/**
 * Supplier catalog as stations — one per material category. All materials:
 * 4–6 week physician-directed lead time. Wholesale (clinic cost) lives ONLY
 * in `marginNote` for script-card margin framing; it is never rendered into
 * the patient prompt. Categories B–D are state-dependent: no station, card,
 * or patient line may assert availability anywhere — availability language
 * stays conditional throughout.
 */
export const STEMATIC_STATIONS: Scenario[] = [
  {
    slug: "st-stratum-wj-tendon",
    specialty: "regen",
    title: "Stratum WJ™ — chronic tendon",
    serviceDesc:
      "Ultrasound-guided Stratum WJ™ injection (whole-tissue flowable: amniotic fluid with Wharton's jelly, cryopreserved, 1 mL) for chronic tendinopathy",
    priceDisplay: "$2,900",
    priceStructure:
      "$2,900 for the tendon protocol: the guided injection, the loading plan, and two follow-ups. Cash-pay; editable clinic default. Material lead time 4–6 weeks, physician-directed order",
    clinicalContext:
      "Chronic mid-portion tendinopathy (Achilles or patellar pattern), 12+ months, full eccentric-loading course completed, steroid deliberately withheld near load-bearing tendon. Imaging shows thickening and disorganized fibers — degeneration, not inflammation. Stratum WJ™ is a whole-tissue flowable measured by weight, cryopreserved, lot-tested by the supplier. It is not an FDA-approved drug; evidence for tendinopathy is early. Availability of any Stematic material depends on the clinic's state — never assert otherwise. The physician directs every order before payment.",
    patientCc:
      "A year of those heel-drop exercises, twice a day, and I'm still limping into the office by Friday. You mentioned some kind of tissue injection — talk me through it.",
    closeGoal:
      "Patient agrees to the $2,900 tendon protocol with honest evidence framing and books it, understanding the 4–6 week material lead time.",
    objectionSeeds: [
      "Is this the stem cell thing the FDA keeps warning people about?",
      "Umbilical cord tissue? In my tendon? Walk me through where that comes from.",
      "Six weeks before you can even do it? What am I supposed to do until then?",
      "What does the evidence actually say for tendons — not knees, tendons?",
    ],
    difficultyNotes:
      "The evidence concession is the crux: tendon-specific data is early and the provider must say so plainly. The lead time converts into honest urgency at the close. Any implication of FDA approval loses the room.",
    isCustom: false,
    active: true,
    marginNote:
      "Stratum WJ™ 1 mL — clinic cost by request (qualification pricing). Availability nationwide per supplier; confirm your state before quoting dates. Patient default $2,900.",
  },
  {
    slug: "st-nimbus-ev-shoulder",
    specialty: "regen",
    title: "Nimbus EV™ — shoulder consult",
    serviceDesc:
      "Ultrasound-guided Nimbus EV™ injection (acellular vesicle suspension, particle-counted, 2 cc) for rotator cuff tendinosis",
    priceDisplay: "$3,200",
    priceStructure:
      "$3,200 for the shoulder protocol: guided injection, labs, two follow-ups. Cash-pay; editable clinic default. Material lead time 4–6 weeks",
    clinicalContext:
      "Partial-thickness rotator cuff pathology, cortisone ceiling reached (two injections, diminishing effect). Nimbus EV™ is an ACELLULAR vesicle suspension — no cells, particle-counted by NTA, available in graded concentrations (15B–700B), cryopreserved or lyophilized. The honest differentiator: because it's acellular, calling it a 'stem cell shot' is factually wrong — and correcting the patient's vocabulary honestly is a trust move. Not FDA-approved; select-state availability — never assert it's available everywhere. Physician directs every order.",
    patientCc:
      "My golf buddy got a stem cell shot in his shoulder and swears by it. That's what this is, right? What's it run?",
    closeGoal:
      "Patient understands what the material actually is (acellular — not a 'stem cell shot'), accepts the $3,200 protocol, and books.",
    objectionSeeds: [
      "Wait — no cells? Then what am I paying for?",
      "My buddy paid less for his. Why the difference?",
      "If you can't call it stem cells, is it weaker?",
      "How do I know there's anything actually in the vial?",
    ],
    difficultyNotes:
      "The station is won by the correction: 'it's not a stem cell shot, and here's what it actually is' — particle counts, lot testing, plain English. Riding the buddy's 'stem cell' framing to an easier close is the compliance failure being tested.",
    isCustom: false,
    active: true,
    marginNote:
      "Nimbus EV™ 2 cc — clinic cost from $400 (30B grade); higher grades by request. Select states only: confirm your state before offering. Patient default $3,200.",
  },
  {
    slug: "st-cultivar-msc-knee",
    specialty: "regen",
    title: "Cultivar MSC™ — knee protocol",
    serviceDesc:
      "Image-guided Cultivar MSC™ injection (culture-expanded UC-MSC, 25×10⁶ cells, DMSO-free cryopreservation, 1 mL) for knee osteoarthritis",
    priceDisplay: "$4,500",
    priceStructure:
      "$4,500 for the single-joint knee protocol: guided injection, labs, two follow-ups. Cash-pay; editable clinic default. Material lead time 4–6 weeks, physician-directed order",
    clinicalContext:
      "KL grade 2–3 knee OA, used-up conservative ladder (PT, NSAIDs, HA series). Cultivar MSC™ is culture-expanded umbilical-cord MSC, specified by cell count with post-thaw viability verified per lot (94–96% on trypan blue + flow per supplier lots). Cell counts describe what's in the vial — they are NOT outcome claims and must not be converted into one. Not an FDA-approved treatment; select-state availability — never assert it's available everywhere. Physician-directed ordering; the doctor can decline the case.",
    patientCc:
      "Okay, I've read your brochure. Twenty-five million cells, ninety-something percent viability. Sounds impressive — but what does any of that actually mean for MY knee?",
    closeGoal:
      "Patient hears the honest distinction between lab specs and outcomes, accepts the $4,500 protocol, and books.",
    objectionSeeds: [
      "So the cell count is marketing? What DOES predict whether it works?",
      "The clinic across town advertises fifty million cells. More is better, right?",
      "What happens to my $4,500 if the doctor declines the case after I've decided?",
      "Give me the honest odds for a knee like mine.",
    ],
    difficultyNotes:
      "The brochure-literate patient. The win: concede that specs describe the vial, not the knee — then frame honestly from the imaging and the ladder. The 'more cells is better' bait must be answered without junk science. Order of operations (physician review before payment) answers the decline question.",
    isCustom: false,
    active: true,
    marginNote:
      "Cultivar MSC™ 1 mL (25M UC-MSC) — clinic cost $1,795. Select states only: confirm your state before offering. Patient default $4,500 → margin $2,705 before procedure costs.",
  },
  {
    slug: "st-prima-premium",
    specialty: "regen",
    title: "Prima™ line — premium candidacy",
    serviceDesc:
      "Physician-directed candidacy consult for the Prima™ line (Prima Duo™: 5×10⁶ SSEA-3+ with 20×10⁶ UC-MSC; Prima S3™: 30×10⁶ SSEA-3+ enriched, 1 mL) — the practice's top-tier biologic protocol",
    priceDisplay: "$8,500",
    priceStructure:
      "$8,500 for the premium protocol (Prima Duo™ tier); the S3™ tier is quoted individually after physician review. Includes candidacy work-up, guided injection, labs, and the full follow-up arc. Cash-pay; editable clinic default. Material lead time 4–6 weeks",
    clinicalContext:
      "Existing patient with a strong response to a first biologic protocol, now asking about 'the best thing you carry' for a complex joint. The Prima™ line is SSEA-3+ enriched material — the supplier's top tier, specified by cell population, cryopreserved. At this price the compliance ceiling is lowest: the patient is pre-sold and affluent, which is precisely when overclaiming is most tempting and most damaging. Enthusiasm must not outrun the evidence, which at this tier is the thinnest in the catalog. Select-state availability — never assert it's available everywhere. The physician can and does decline premium-tier cases.",
    patientCc:
      "The knee protocol was the best money I've spent in years. So what's the top of your line? Money's not really the question here.",
    closeGoal:
      "Patient books the premium candidacy work-up with expectations set honestly — including that the physician may recommend AGAINST the premium tier.",
    objectionSeeds: [
      "If money's no object, why wouldn't I just get the strongest one?",
      "What does the enriched population actually buy me over what I already had?",
      "Eighty-five hundred and you're telling me the doctor might say no?",
      "Just tell me it's worth it and let's book it.",
    ],
    difficultyNotes:
      "The anti-upsell station: 'money's not the question' is the trap. The win is candidacy-first framing — stronger material is not automatically indicated, the evidence at this tier is thinnest, and 'the doctor might say no' is delivered as a feature. Selling S3™ because the patient can afford it is the failure being tested.",
    isCustom: false,
    active: true,
    marginNote:
      "Prima Duo™ 1 mL — clinic cost $5,250; Prima S3™ 1 mL — $7,050. Select states only: confirm your state before offering. Patient default $8,500 (Duo tier) → margin $3,250 before procedure costs; S3 quoted case-by-case.",
  },
].map((s) => ({ ...s })) as Scenario[];

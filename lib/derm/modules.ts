/**
 * Derm procedure modules — ALL vertical content lives here as data. Each
 * module compiles (lib/derm/compile.ts) into the existing primitives:
 * a consult station, objection flashcards, script-card close language, and
 * drill/audio-pair inputs. Editing copy or prices means editing this file
 * (or, per clinic, the normal price-override flow) — never components.
 *
 * Clinical lines marked // CLINICAL REVIEW need the founder's sign-off.
 */

export interface DermObjection {
  /** The objection, patient voice. */
  front: string;
  /** The isolate question. */
  isolate: string;
  /** The value reframe. */
  reframe: string;
  /** The re-ask. */
  close: string;
}

export interface DermModule {
  key: string;
  name: string;
  shortDesc: string;
  /** Patient-facing default price line (editable per clinic). */
  priceDisplay: string;
  /** Default structure incl. packages; the grader holds the rep to it. */
  priceStructure: string;
  packageOptions: string[];
  idealCandidate: string;
  /** Screening the provider MUST ask — the compliance axis checks these. */
  screening: string[];
  /** Consent essentials the compliance axis checks. */
  consentEssentials: string[];
  objections: DermObjection[];
  upsells: string[];
  rebooking: string;
  /** Mandated close for the printable script card. */
  closeScript: string;
  /** Derm archetype ids this module's consults roll from. */
  personaPool: string[];
  /** Chart block the patient engine receives. */
  clinicalContext: string;
  patientCc: string;
  closeGoal: string;
  difficultyNotes: string;
}

export const DERM_MODULES: DermModule[] = [
  {
    key: "neuromodulators",
    name: "Neuromodulators",
    shortDesc: "Botox, Dysport, Daxxify, Jeuveau — the volume entry service and retention engine",
    priceDisplay: "$14/unit",
    priceStructure:
      "$12–16 per unit (default $14); a typical glabella + forehead + crow's feet visit runs 30–44 units, about $400–600. Quote the per-unit rate and this visit's estimated range, then hold it. Membership: $89/month banks toward treatments and includes 10% off retail.",
    packageOptions: [
      "Per-visit: units × rate, estimated range given before injection",
      "Membership: $89/month credit bank + 10% retail discount + priority booking",
      "Standing rebook: next appointment placed on the books at checkout, every 3–4 months",
    ],
    idealCandidate:
      "Dynamic lines (glabella, forehead, crow's feet) bothering the patient at rest or in photos; realistic expectations; also masseter slimming/clenching and axillary hyperhidrosis consults.", // CLINICAL REVIEW: masseter + hyperhidrosis framed as consults, not promises
    screening: [
      "Pregnancy or breastfeeding",
      "Neuromuscular disorders (e.g. myasthenia gravis)", // CLINICAL REVIEW
      "Prior adverse reaction to any botulinum toxin",
      "Active infection or rash at the injection sites",
      "Upcoming major events (timing onset and any bruising window)",
    ],
    consentEssentials: [
      "Results begin around days 3–7, settle by about two weeks",
      "Duration is typically 3–4 months — this is a maintenance treatment, not permanent",
      "Possible bruising, headache, and the uncommon risk of temporary eyelid or brow droop", // CLINICAL REVIEW
      "Results vary; touch-up policy stated before treatment",
    ],
    objections: [
      {
        front: "The med spa down the street does it for $9 a unit.",
        isolate: "If the price per unit were identical everywhere, where would you want to be treated?",
        reframe:
          "A unit price only means something alongside who's injecting, which product it is, and how dosing is planned — underdosing to hit a price often costs more per month of correction than honest dosing does.",
        close: "Want to start with the plan we mapped and judge it at your two-week check?",
      },
      {
        front: "I'm scared I'll look frozen.",
        isolate: "Is it the frozen look itself, or ending up with a result you didn't choose?",
        reframe:
          "Frozen is a dosing decision, not a property of the product — we plan around your expressions, and we can always add at the two-week check; we can't subtract.",
        close: "Shall we start conservative and review together at two weeks?",
      },
      {
        front: "Is this safe to keep doing for years?",
        isolate: "Is there a specific long-term effect you've read about that worries you?",
        reframe:
          "These products have decades of clinical use at cosmetic doses; the honest long-term effect we see is that treated lines etch more slowly.", // CLINICAL REVIEW
        close: "Does that settle it enough to try a first conservative visit?",
      },
      {
        front: "My friend got a droopy eyelid from this.",
        isolate: "Would it help to talk through exactly how that happens and how we lower that risk?",
        reframe:
          "Lid droop is real, uncommon, technique-related, and temporary when it happens — placement and dosing are exactly why injector choice matters.", // CLINICAL REVIEW
        close: "Comfortable going ahead with the conservative map we drew?",
      },
      {
        front: "Three to four months? That's not worth it if it keeps costing money.",
        isolate: "If the maintenance schedule fit your budget, is this a result you'd want to keep?",
        reframe:
          "It's a subscription to the result, like color or a gym — the membership spreads it monthly so maintenance is a line item instead of a lump.",
        close: "Want me to price this visit as a member versus à la carte so you can compare?",
      },
      {
        front: "I hate needles.",
        isolate: "Is it the sting you dread, or a bad needle experience from before?",
        reframe:
          "These are tiny insulin-style needles and the whole treatment is about ten minutes; most people rate it far easier than they feared — and we can use ice or numbing.",
        close: "Want to try the two glabella points first and see how it feels before we do the rest?",
      },
      {
        front: "My partner says I don't need it.",
        isolate: "Set your partner aside for one second — when you look at photos of yourself, what do YOU want?",
        reframe:
          "This only ever has to answer to you — my job is a result your partner can't point to, just a version of you that photographs the way you feel.",
        close: "Would you like to book it, or take the plan home and come back after the conversation?",
      },
      {
        front: "Can we just do half the units to save money?",
        isolate: "Is the full-visit price the stretch, or are you unsure the result is worth it yet?",
        reframe:
          "Half-dosing a full area tends to buy a shorter, patchier result — honest options are treating fewer areas properly, or the membership spreading the same visit monthly.",
        close: "Which works better for you — one area done right today, or the membership route?",
      },
    ],
    upsells: [
      "Medical-grade skincare starter (retinoid + SPF) — protects and extends the result",
      "Skinvive or filler consult for midface volume when discovery surfaces it",
      "Membership enrollment at checkout (banks toward the next visit)",
    ],
    rebooking: "Standing appointment every 3–4 months, placed on the books at checkout before the patient leaves.",
    closeScript:
      "Based on what bothers you in photos, my plan is [AREAS] at [UNITS] units — about $[VISIT TOTAL]. You'll see it start by day five and we'll fine-tune at your two-week check. Let's put your two-week check and your January maintenance visit on the books now — do mornings or afternoons work better?",
    personaPool: ["derm-genz", "derm-male-first", "derm-shopper", "derm-spouse", "derm-downtime", "derm-reviews"],
    clinicalContext:
      "Cosmetic consult in a physician-led dermatology practice. Patient self-referred for upper-face lines (or masseter/hyperhidrosis per persona). No prior neuromodulator at this clinic. Provider must complete screening (pregnancy/breastfeeding, neuromuscular disease, prior reactions, active skin infection, event timing) BEFORE closing, state onset/duration honestly (start days 3–7, settle ~2 weeks, lasts 3–4 months), and name the uncommon temporary droop risk when discussing safety. Cash-pay: $14/unit default, typical visit 30–44 units ($400–600). Membership $89/month exists. The practice closes on value and never discounts to match competitors.",
    patientCc:
      "I've been thinking about Botox for the lines between my brows — they show up in every photo now. I've never done anything like this before, so I have questions.",
    closeGoal:
      "Patient books the treatment (or, for same-day-capable clinics, consents and treats) AND leaves with the two-week check and next maintenance visit scheduled.",
    difficultyNotes:
      "The patient should raise at least three concerns from their archetype before agreeing, and should notice and reward screening questions ('no one's ever asked me that'). They react badly to unit-price matching, guarantees, or being rushed; they respond to honest dosing talk and the two-week check safety net. SPEECH STYLE: natural consult pacing, one concern at a time, two to three sentences per reply.",
  },
];

export const DERM_MODULE_KEYS = DERM_MODULES.map((m) => m.key);

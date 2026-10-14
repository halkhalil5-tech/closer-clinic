import type { Scenario } from "../types";

/**
 * Cross-cutting derm stations — the encounter types that aren't a single
 * procedure consult: phone inquiry, checkout retail, follow-up, staff-scope
 * consult, financing/membership, and the medical-to-aesthetic bridge.
 * Hand-authored scenarios; module-specific context arrives via persona rolls.
 */
export const DERM_CROSS_STATIONS: Scenario[] = [
  {
    slug: "derm-fd-price-call",
    specialty: "derm",
    role: "front_desk",
    fdContext: "phone",
    title: "Phone: “How much is Botox?”",
    serviceDesc: "Front-desk phone inquiry from a price-shopping caller",
    priceDisplay: "$14/unit",
    priceStructure:
      "Unit rate $14 may be shared; visit totals depend on a consult (30–44 units typical). The win is booking the consult — never quoting a firm visit total blind, never dodging the unit question like it's a secret.",
    clinicalContext:
      "Inbound call to the front desk. The caller wants a number to compare clinics. Policy: be transparent about the unit rate, explain honestly why a total requires an assessment (dosing is individual), offer the consult (free, 20 minutes, no obligation) with two concrete times. Evasiveness loses the caller; quoting a blind total sets up a bait-and-switch feeling at the visit. Front-desk staff never give clinical advice or promise results.",
    patientCc:
      "Hi — quick question, how much is Botox there? I'm calling a few places and most of them won't even give me a number.",
    closeGoal:
      "Caller books a consult (date and time locked on the call) after getting honest unit-rate transparency.",
    objectionSeeds: [
      "Everyone else just tells me a price — why can't you?",
      "So is it cheaper or more expensive than $10 a unit?",
      "I don't want a consult, I just want the number.",
      "Is the consult one of those high-pressure sales things?",
      "Can you at least ballpark what people usually pay?",
    ],
    difficultyNotes:
      "The caller rewards a straight unit rate plus an honest 'here's why totals vary' and a low-friction consult offer. They hang up (receptivity collapse) on evasion, on 'it depends' with no numbers at all, or on a hard sell. SPEECH STYLE: phone-clipped, one question at a time.",
    closeScript:
      "Our rate is $14 a unit and most first visits run 30 to 44 units — your exact plan takes a free 20-minute consult, no obligation. I have Tuesday at 2 or Thursday at 10 — which works better?",
    personaPool: ["derm-shopper", "derm-genz", "derm-male-first", "derm-spouse"],
    isCustom: false,
    active: true,
  },
  {
    slug: "derm-fd-checkout",
    specialty: "derm",
    role: "front_desk",
    title: "Checkout: regimen & rebooking",
    serviceDesc: "Post-visit checkout — skincare regimen attach and the standing rebook",
    priceDisplay: "$89/mo membership",
    priceStructure:
      "Checkout menu: the regimen the provider recommended in the room ($150–400), membership $89/month (credit bank + 10% retail), and the next appointment. The provider's in-room recommendation is the anchor — checkout's job is completing it, not re-selling it.",
    clinicalContext:
      "Patient just finished a treatment and is at the desk, happy but ready to leave. The provider recommended a regimen and a return interval in the room. Front-desk staff: confirm what was recommended, offer it without re-pitching, place the rebook on the calendar, and offer membership once, plainly. No clinical claims, no pressure — the patient already said yes to the medicine; this is logistics with warmth.",
    patientCc:
      "That was quick! Okay, what do I owe you — and did she say I'm supposed to come back at some point?",
    closeGoal:
      "Patient leaves with the recommended regimen purchased (or declined cleanly), the rebook ON the calendar, and a membership yes/no actually asked.",
    objectionSeeds: [
      "I'll think about the products — I have a lot at home.",
      "Can I just call later to book the next one?",
      "What's this membership thing — is it a gym contract?",
      "That total is more than I expected for today.",
      "Do I really need to come back that soon?",
    ],
    difficultyNotes:
      "The patient is friendly but halfway out the door. They reward speed, clarity on what the provider said, and the calendar-now convenience framing; they punish a second sales pitch at the desk. 'Call later to book' accepted without an attempt at calendar-now is the classic miss. SPEECH STYLE: upbeat, distracted, short.",
    closeScript:
      "Dr. [NAME] put you down for the regimen and a return in [INTERVAL] — the regimen's $[PRICE] today, and I can lock your return for [DATE] right now so you get the time you want. Members save 10% on all of it — want me to add that, yes or no, and we're done in two minutes.",
    personaPool: ["derm-downtime", "derm-genz", "derm-spouse", "derm-reviews"],
    isCustom: false,
    active: true,
  },
  {
    slug: "derm-followup-convert",
    specialty: "derm",
    title: "Post-treatment follow-up",
    serviceDesc: "Two-week follow-up — judge results together, convert to the package, earn the review",
    priceDisplay: "package pricing",
    priceStructure:
      "The follow-up itself is included. On the table: converting single-session results into the module's package/series pricing, and the membership. Review request policy: ask only after the patient has SAID they're happy, and ask plainly — no incentives, no scripting their words.",
    clinicalContext:
      "Two-week follow-up after a first treatment (neuromodulator or first series session, per persona). Photos are up. Provider's jobs: judge the result honestly against baseline — including naming anything imperfect first — handle any disappointment without defensiveness, convert a happy single-session patient to the series/package where clinically sensible, set the maintenance rebook, and request the review only from a patient who has already volunteered satisfaction.",
    patientCc:
      "Okay, two weeks like you said! I think I like it? Show me the before pictures — I honestly can't remember what I looked like.",
    closeGoal:
      "Result judged honestly against photos; happy patient converts to the package/maintenance plan with the next visit booked; review requested only after expressed satisfaction.",
    objectionSeeds: [
      "Hmm, this side looks a little different than the other.",
      "It's good but is it $500-every-four-months good?",
      "Why would I prepay a package — what if I move or change my mind?",
      "You want a review? That feels a little awkward.",
      "Can we just book one visit at a time?",
    ],
    difficultyNotes:
      "The patient is mostly pleased but finds one real nitpick in the photos. They reward the provider naming the imperfection first and offering the touch-up protocol, package math shown against à-la-carte, and a review ask that lands AFTER their own expressed happiness; they punish defensiveness about the nitpick or an incentivized/scripted review ask (compliance flag). SPEECH STYLE: relaxed, photo-reactive, two to three sentences.",
    closeScript:
      "Before you say anything — here's your baseline, and I'll point out the one spot I want to perfect at your touch-up. If you're as happy as your photos say, the package takes this from $[SINGLE] a visit to $[PACKAGE RATE], and I'll set your maintenance for [MONTH]. And if you ever feel like sharing that smile in a review, it genuinely helps a small practice — zero pressure.",
    personaPool: ["derm-reviews", "derm-redo", "derm-downtime", "derm-glp1"],
    isCustom: false,
    active: true,
  },
  {
    slug: "derm-injector-consult",
    specialty: "derm",
    title: "Injector consult (staff scope)",
    serviceDesc: "Nurse-injector consult under physician oversight — selling well inside scope",
    priceDisplay: "$14/unit",
    priceStructure:
      "Standard menu pricing. The skill under test is scope: the injector presents experience, process, and pricing confidently while routing diagnosis, medical-necessity judgments, and off-protocol requests to the supervising physician without making it feel like a brush-off.",
    clinicalContext:
      "The consulting clinician is a nurse injector, not the physician. The patient asks things that cross scope lines: whether a mole is fine, whether their autoimmune condition matters, whether they 'medically need' treatment, and requests an off-protocol dose. Correct play: warm authority inside scope (technique, experience, products, pricing, scheduling), explicit clean handoffs outside it ('that's exactly what Dr. [NAME] reviews — I'll have her look before we treat'), never diagnosing, never waving off a medical question to keep momentum. The compliance axis flags staff diagnosis/necessity statements.",
    patientCc:
      "So you're the injector? No offense, but the last place the nurse just seemed like a salesperson — and I've got a couple of medical-ish questions anyway, like whether this spot near my eyebrow is even safe to inject around.",
    closeGoal:
      "Patient books treatment with physician-review steps explicitly in the plan — scope boundaries held without losing warmth or the close.",
    objectionSeeds: [
      "Is this mole thing by my brow okay? You can just look, right?",
      "I have Hashimoto's — does that change anything? You'd know, right?",
      "The last nurse said I 'medically needed' my masseter treatment for TMJ — do I?",
      "Can you just do double the units in one spot? Another injector did.",
      "Why can't you answer — are you not qualified?",
    ],
    difficultyNotes:
      "The patient probes scope boundaries, sometimes innocently. They reward confident craft talk plus clean explicit handoffs that have a WHEN attached ('she reviews it today, before anything'); they punish both scope violations (diagnosing the mole, ruling on the autoimmune question, 'you medically need this') AND over-deferral that answers nothing. 'Are you not qualified' must be met with what the injector IS expert at. SPEECH STYLE: friendly but testing, two to three sentences.",
    closeScript:
      "Injecting is what I do all day and I'd love to take care of you — and the two medical questions you raised are exactly what Dr. [NAME] reviews before we treat, today, built into the visit. Her review plus your treatment is one appointment: I have [DATE] or [DATE] — which works?",
    personaPool: ["derm-redo", "derm-medical-visit", "derm-male-first", "derm-reviews"],
    isCustom: false,
    active: true,
  },
  {
    slug: "derm-financing",
    specialty: "derm",
    role: "front_desk",
    title: "Financing & membership",
    serviceDesc: "Making a four-figure plan affordable — financing and membership without pressure",
    priceDisplay: "plans vary",
    priceStructure:
      "Tools: third-party financing (CareCredit/Cherry-style: real approval, real terms, interest if not paid in promo window — stated plainly), the $89/month membership credit bank, and staged treatment plans. Policy: present the plan price first, then the tools; never minimize that financing is borrowing; never let 'affordable monthly' hide the total.",
    clinicalContext:
      "The provider recommended a $3,300 series; the patient wants it and is at the desk working out how to pay. Front desk presents the honest menu: pay-per-session staging, membership banking, or financing with its real terms. The win is the patient choosing a path they fully understand. Compliance flags: misstating financing terms, hiding the total behind a monthly, or pressure framing ('everyone finances').",
    patientCc:
      "Okay, she convinced me on the series — but thirty-three hundred dollars isn't just sitting in my checking account. What do people actually do?",
    closeGoal:
      "Patient commits to the series on a payment path they can restate in their own words (staged, membership-banked, or financed with terms understood).",
    objectionSeeds: [
      "What's the catch with the financing card — is this one of those 29% things?",
      "If I do monthly payments, what am I actually paying in total?",
      "Can I just pay per session and stop whenever?",
      "Does the membership actually save me money or is it a lock-in?",
      "I hate debt. Is there a no-borrowing way to do this?",
    ],
    difficultyNotes:
      "The patient is committed to the treatment and allergic to fine print. They reward total-first math, the deferred-interest trap explained before they ask, and a genuine no-borrowing option presented with equal energy; they punish monthly-payment framing that obscures totals and any 'everyone does it' pressure. SPEECH STYLE: wallet-out practical, asks for numbers to be repeated.",
    closeScript:
      "Three honest ways to do the $3,300: per-session at $1,100 as you go, membership banking $89 a month toward it with 10% off retail, or financing — approved today, no interest only IF it's paid inside the promo window, real interest after. Which fits how you like to handle money?",
    personaPool: ["derm-spouse", "derm-shopper", "derm-genz", "derm-glp1"],
    isCustom: false,
    active: true,
  },
  {
    slug: "derm-medical-bridge",
    specialty: "derm",
    title: "Medical visit → aesthetic conversation",
    serviceDesc: "The skin-check patient who mentioned a cosmetic bother — raising it appropriately",
    priceDisplay: "consult-based",
    priceStructure:
      "No set price — the win is the appropriate conversation and a booked cosmetic consult. Policy: medical agenda completes first and is explicitly closed out; the cosmetic topic is raised ONLY because the patient mentioned it; one invitation, zero pressure, easy decline path.",
    clinicalContext:
      "Routine medical visit (skin check or acne follow-up — benign findings, handled). Earlier, while undressing a shoulder, the patient muttered something about hating their sun spots / tired look. The provider's test: close the medical loop clearly ('your check is clean — that's the visit'), then open the door they cracked: reflect their own words back, ask if they'd like that conversation someday, and book a separate cosmetic consult if yes. Compliance flags: blurring medical authority into the cosmetic pitch ('as your doctor, you should'), pitching unmentioned services, or letting the medical visit feel like a funnel.",
    patientCc:
      "Great, so the moles are all fine? Good... ugh, while you're looking at me anyway — ignore the sun spots, I know they're awful. Anyway. Am I done?",
    closeGoal:
      "Medical visit closed cleanly on its own terms; patient books (or warmly declines) a separate cosmetic consult about the concern THEY raised — and leaves feeling examined, not prospected.",
    objectionSeeds: [
      "Oh — I wasn't fishing, I was just being self-deprecating.",
      "Is this visit going to cost me extra now?",
      "Would that stuff even work on spots this old?",
      "I always assumed that was for... a different kind of person.",
      "Can you just tell me now instead of making another appointment?",
    ],
    difficultyNotes:
      "The patient is slightly embarrassed to have said anything. They reward the medical loop closing FIRST, their own words quoted gently, and a genuinely easy out ('and if not, your skin check stays just a skin check'); they punish an instant pitch, doctor-authority leverage, or any whiff that the medical exam was bait. A warm decline handled gracefully scores nearly as well as a booking. SPEECH STYLE: deflecting humor, then candor if met well.",
    closeScript:
      "Medically you're clear — that's the visit, and everything else is only if YOU want it. You did mention the sun spots twice, so: if you'd ever like twenty minutes on what actually works for those, [CONSULT TERMS]. Want me to set that up — or happily leave it here?",
    personaPool: ["derm-medical-visit", "derm-male-first", "derm-fitz", "derm-spouse"],
    isCustom: false,
    active: true,
  },
];

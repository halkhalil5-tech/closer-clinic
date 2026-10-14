import type { TrainingLesson, TrainingModule } from "../types";
import type { WarmupCard } from "./podiatry-pack";

/**
 * Cash-pay dermatology training pack — the shared six-module ladder with
 * derm-native examples. Slugs are prefixed `derm-` (module slug is a global
 * primary key); everything downstream derives from the slug.
 */

export const DERM_TRAINING_MODULES: TrainingModule[] = [
  { slug: "derm-mindset", specialty: "derm", order: 0, rubricKey: null, title: "The Mindset Shift", subtitle: "Aesthetics is medicine someone chose.", core: true },
  { slug: "derm-rapport", specialty: "derm", order: 1, rubricKey: "rapport", title: "Discovery", subtitle: "Find the event, the mirror moment, the why-now.", core: true },
  { slug: "derm-framing", specialty: "derm", order: 2, rubricKey: "framing", title: "Education", subtitle: "Mechanism and timeline, in plain language.", core: true },
  { slug: "derm-price", specialty: "derm", order: 3, rubricKey: "price", title: "Plan & Packages", subtitle: "Combination plans, clear totals, honest math.", core: true },
  { slug: "derm-objections", specialty: "derm", order: 4, rubricKey: "objections", title: "Objection Handling", subtitle: "Groupon math, frozen-face fear, and the spouse at home.", core: true },
  { slug: "derm-close", specialty: "derm", order: 5, rubricKey: "close", title: "Close & Rebooking", subtitle: "The booking, the next visit, and the regimen — one motion.", core: true },
];

export const DERM_LESSONS: TrainingLesson[] = [
  {
    slug: "derm-mindset-core",
    moduleSlug: "derm-mindset",
    specialty: "derm",
    order: 0,
    title: "The Mindset Shift — knowledge check",
    minutes: 5,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "A patient apologizes for 'being vain' about wanting their sun spots treated. The strongest response frame is:",
        options: [
          "Reassure them everyone does it these days",
          "Treat the apology as data: confidence is a legitimate clinical outcome, and say so plainly",
          "Redirect to a medical justification so it feels less cosmetic",
          "Move quickly to pricing so the moment passes",
        ],
        answer: 1,
        why: "Patients test whether YOU think the care is legitimate. If you dodge into medical cover stories, you confirm their embarrassment.",
      },
      {
        prompt: "What separates ethical aesthetic selling from pressure, per this program?",
        options: [
          "Never mentioning price until asked",
          "Only recommending what the exam and the patient's own stated goals support — and respecting a stable no the first time",
          "Offering a discount before objections arise",
          "Letting patients choose from the full menu unguided",
        ],
        answer: 1,
        why: "The exam plus THEIR goals is the whole mandate. Menu-dumping and no-bulldozing both fail it.",
      },
      {
        prompt: "The 'today only' price expires at 5pm. This tactic is:",
        options: [
          "A proven urgency builder worth testing",
          "Fine if the discount is real",
          "A compliance flag in this program — fake scarcity grades down, value-based closing is the standard",
          "Acceptable for retail products only",
        ],
        answer: 2,
        why: "Manufactured urgency is graded as a violation here. Honest urgency exists (series spacing, seasonal sun, event timelines) — use the real kind.",
      },
    ],
    drill: null,
  },
  {
    slug: "derm-rapport-core",
    moduleSlug: "derm-rapport",
    specialty: "derm",
    order: 0,
    title: "Discovery — knowledge check",
    minutes: 5,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "'I just want to look less tired.' Your best next move:",
        options: [
          "Recommend the under-eye menu",
          "Ask what's coming up — when did looking tired start costing them something?",
          "Agree that they look tired",
          "Offer a mirror consultation immediately",
        ],
        answer: 1,
        why: "'Less tired' is a surface phrase. The reunion, the promotion photos, the divorce — the why-now is what the plan gets built on.",
      },
      {
        prompt: "A patient mentions their weight-loss journey while discussing their face. You should:",
        options: [
          "Compliment the weight loss and move on",
          "Connect it explicitly: name the volume change as a known, fixable consequence — no judgment, no 'Ozempic face' label unless they use it",
          "Avoid the topic as too sensitive",
          "Suggest they stabilize weight first in all cases",
        ],
        answer: 1,
        why: "Naming the mechanism relieves the patient of thinking something is wrong with them. Using the meme label first can sting — mirror their language.",
      },
      {
        prompt: "The male first-timer says 'this probably sounds stupid.' Best discovery behavior:",
        options: [
          "Laugh it off and continue",
          "Normalize specifically (plenty of men treat exactly this), then ask the functional question behind the visit",
          "Hand him the full cosmetic menu to browse",
          "Tell him beauty has no gender",
        ],
        answer: 1,
        why: "He needs permission plus problem-solving framing. Slogans don't give permission; specificity does.",
      },
    ],
    drill: null,
  },
  {
    slug: "derm-framing-core",
    moduleSlug: "derm-framing",
    specialty: "derm",
    order: 0,
    title: "Education — knowledge check + drill",
    minutes: 8,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "The honest one-liner for how neuromodulators behave over time:",
        options: [
          "Results are instant and last about a year",
          "You'll see it start within a week, settled by two weeks, lasting three to four months",
          "It's permanent with occasional touch-ups",
          "Everyone responds identically",
        ],
        answer: 1,
        why: "Onset days 3–7, settled ~2 weeks, duration 3–4 months. Every overstatement here is a refund conversation later — and a compliance flag now.",
      },
      {
        prompt: "A biostimulator patient asks why nothing shows at week one. The correct frame was set when?",
        options: [
          "Now — explain it when they call upset",
          "At the consult: delayed collagen building IS the product; the series and month-three photos were the promised timeline",
          "Never — manage expectations downward quietly",
          "At checkout via the aftercare sheet",
        ],
        answer: 1,
        why: "If delayed results surprise your patient, the consult failed. The timeline is the consent.",
      },
      {
        prompt: "Fitzpatrick typing before IPL is:",
        options: [
          "A nice touch for thorough providers",
          "Mandatory, out loud, before any quote — and it can honestly rule the platform out",
          "Only needed for visibly tanned patients",
          "The laser tech's job after booking",
        ],
        answer: 1,
        why: "Typing-before-quoting is a hard rule in this vertical's grading. Skipping it is how burns — and lawsuits — happen.",
      },
    ],
    drill: {
      rubricKey: "framing",
      scenarioSlug: "derm-biostimulators",
      setup:
        "Micro-drill: the post-weight-loss patient just asked 'So when do I actually see something for my $2,700?' You have 3 turns.",
      patientInstruction:
        "You are skeptical about paying now for results months away. Push twice on the delay; reward a plain-language mechanism (your own collagen builds over weeks to months, series required, month-three photo review) and punish any same-day-result hedging.",
      passBar:
        "Provider states the delayed-collagen mechanism and the month-three photo checkpoint plainly, without inflating early results.",
      maxTurns: 3,
    },
  },
  {
    slug: "derm-price-core",
    moduleSlug: "derm-price",
    specialty: "derm",
    order: 0,
    title: "Plan & Packages — knowledge check + drill",
    minutes: 8,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "The consult surfaced volume loss, laxity, AND skin texture. Plan & packages scoring rewards:",
        options: [
          "Selling the one item the patient asked about first",
          "A staged combination plan with a clear total — even if phase one is all they book today",
          "The cheapest single option to build trust",
          "Presenting all ten modules as a menu",
        ],
        answer: 1,
        why: "Single-item selling when the consult surfaced multiple concerns caps the category. The plan is the product; staging makes it buyable.",
      },
      {
        prompt: "The honest way to present monthly financing for a $3,300 series:",
        options: [
          "'Just $120 a month!' — keep it simple",
          "Total first, then the monthly path, then the real terms including what happens after the promo window",
          "Let the financing company's brochure handle terms",
          "Mention it only if they can't pay",
        ],
        answer: 1,
        why: "Monthly-first framing that hides totals is a compliance flag. Total → paths → real terms is the order that survives the drive home.",
      },
      {
        prompt: "Membership math belongs in the conversation when:",
        options: [
          "Never — memberships sell themselves at checkout",
          "The patient's plan involves recurring treatment (toxin cadence, peels, maintenance) where the bank genuinely saves money",
          "Every consult, regardless of plan",
          "Only when the patient balks at price",
        ],
        answer: 1,
        why: "Membership is a fit question, not a rescue move. Offered where the cadence makes it genuinely cheaper, it closes itself.",
      },
    ],
    drill: {
      rubricKey: "price",
      scenarioSlug: "derm-rf-microneedling",
      setup:
        "Micro-drill: the four-figure number. The patient just asked 'What's this going to run me?' for a three-session RF microneedling series. You have 3 turns.",
      patientInstruction:
        "React to the number with a sharp inhale and silence. If the provider fills the silence with justification, apology, or an unprompted discount, say you want to think about it. If they hold steady and offer the package math calmly, engage with the plan.",
      passBar:
        "Provider states the series total plainly once, holds the silence, and presents package-vs-single math without apologizing or discounting.",
      maxTurns: 3,
    },
  },
  {
    slug: "derm-objections-core",
    moduleSlug: "derm-objections",
    specialty: "derm",
    order: 0,
    title: "Objection Handling — knowledge check + drill",
    minutes: 8,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "'There's a Groupon for a sixth of your price.' The winning shape of the answer:",
        options: [
          "Match it for first-time patients",
          "Explain what the discount price can't buy (settings that finish the job, clinician oversight) — then re-ask on value",
          "Warn them Groupon clinics are dangerous",
          "Ignore it and restate your price",
        ],
        answer: 1,
        why: "Never match, never trash-talk. Make the difference concrete and let them choose — the reframe-then-re-ask is the scored behavior.",
      },
      {
        prompt: "'I need to talk to my husband first' is best handled by:",
        options: [
          "Pushing for a decision now while motivation is high",
          "Validating it, arming the conversation (plan summary to take home), and booking a low-commitment next step with a date",
          "Offering a hold-the-price deadline",
          "Asking why their spouse controls their decisions",
        ],
        answer: 1,
        why: "The spouse conversation is real, not a brush-off — arm it and calendar it. Pressure here is both a losing move and a compliance flag.",
      },
      {
        prompt: "The patient cites a botched-filler horror story. First move:",
        options: [
          "Assure them that can't happen here",
          "Take it seriously: agree the risk is real, then walk through the specific protocol that manages it",
          "Explain statistics make it irrelevant",
          "Change the subject to results",
        ],
        answer: 1,
        why: "'Can't happen here' is minimization — a flag. Real risk + named protocol is what converts the safety-scarred patient.",
      },
    ],
    drill: {
      rubricKey: "objections",
      scenarioSlug: "derm-laser-hair-removal",
      setup:
        "Micro-drill: the Groupon gauntlet. The caller has a $99 six-session voucher on screen and wants to know why you cost ten times more. You have 3 turns.",
      patientInstruction:
        "Lead with the Groupon price and return to it once. Reward a concrete explanation of what the difference buys and a value re-ask; punish price matching, competitor trash-talk, or a defensive tone by ending the call.",
      passBar:
        "Provider isolates what matters to the caller, makes the difference concrete without disparaging anyone, and re-asks for the booking.",
      maxTurns: 3,
    },
  },
  {
    slug: "derm-close-core",
    moduleSlug: "derm-close",
    specialty: "derm",
    order: 0,
    title: "Close & Rebooking — knowledge check + drill",
    minutes: 8,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "A derm close is complete when:",
        options: [
          "The patient says yes to today's treatment",
          "Today's yes PLUS the next visit on the calendar and the regimen/maintenance named — retention is scored inside the close",
          "Payment is collected",
          "The patient takes a brochure",
        ],
        answer: 1,
        why: "This vertical's close dimension is Close & REBOOKING. A booking ask with no next-visit plan caps the category.",
      },
      {
        prompt: "The alternative close that fits aesthetic consults best:",
        options: [
          "'Do you want this or not?'",
          "'Shall we start with the full series, or phase one and judge at your two-week check?' — two real paths, both forward",
          "'Should I pencil you in for sometime?'",
          "'Take the weekend and call us'",
        ],
        answer: 1,
        why: "Two legitimate forward paths respect autonomy and keep momentum — the staged option IS a close, not a concession.",
      },
      {
        prompt: "The right moment to request a review:",
        options: [
          "At checkout on day one",
          "After the patient has spontaneously said they're happy — ask plainly, no incentive, no script",
          "In the follow-up email with a discount code",
          "Whenever the schedule is slow",
        ],
        answer: 1,
        why: "Incentivized or premature review asks are a compliance flag; the earned ask after expressed satisfaction is the pattern.",
      },
    ],
    drill: {
      rubricKey: "close",
      scenarioSlug: "derm-neuromodulators",
      setup:
        "Micro-drill: the two-part close. Consult's done, the patient likes the plan. You have 3 turns to land the booking AND the retention pieces.",
      patientInstruction:
        "Be agreeable but passive — say yes only to exactly what's asked. If the provider closes treatment but never places the two-week check, the maintenance rebook, or the regimen, let the visit end without them.",
      passBar:
        "Provider closes with two concrete times AND books the two-week check and maintenance cadence (regimen at least named) before ending.",
      maxTurns: 3,
    },
  },
];

/** Pre-rep warmup deck — derm plays, same card shape as podiatry's. */
export const DERM_WARMUP_CARDS: WarmupCard[] = [
  { label: "Discovery", title: "Find the why-now", line: "“What made today the day you booked this — is something coming up?”" },
  { label: "Education", title: "Timeline, plainly", line: "“You'll see it start within a week, settled at two — and it lasts three to four months.”" },
  { label: "Price", title: "Say it, then stop", line: "“The series is $3,300.” Then hold the silence — the next voice you hear decides the visit." },
  { label: "Screening", title: "Ask before you close", line: "“Before we plan anything — any chance of pregnancy, and what's your skin done with lasers before?”" },
  { label: "Objections", title: "Groupon math", line: "Never match, never mock: “Here's what that price can't include — and why mine does.”" },
  { label: "Close", title: "Book the NEXT one too", line: "“Let's lock today AND your two-week check — mornings or afternoons?”" },
];

import type { TrainingLesson, TrainingModule } from "../types";

/**
 * Podiatry training pack — module ladder + per-module tracking records.
 *
 * Since the module-doc refactor, each module's READING content lives in
 * lib/training/module-docs.ts (rendered at /train/module/[slug]); this file
 * keeps the module registry and ONE lesson record per module (`{slug}-core`)
 * that carries the tracked knowledge check and, for modules 2–5, the live
 * micro-drill. The existing quiz/drill/progress APIs operate on these
 * records unchanged.
 *
 * Canonical source, same pattern as lib/scenarios.ts: the Supabase seed
 * script upserts from here, and dev mode reads it directly.
 */

export const PODIATRY_MODULES: TrainingModule[] = [
  {
    slug: "mindset",
    specialty: "podiatry",
    order: 0,
    rubricKey: null,
    title: "The Mindset Shift",
    subtitle: "You're not selling. You're prescribing.",
    core: true,
  },
  {
    slug: "rapport",
    specialty: "podiatry",
    order: 1,
    rubricKey: "rapport",
    title: "Rapport & Listening",
    subtitle: "The close starts in the first 90 seconds.",
    core: true,
  },
  {
    slug: "framing",
    specialty: "podiatry",
    order: 2,
    rubricKey: "framing",
    title: "Clinical Framing",
    subtitle: "Diagnose → Consequence → Recommendation → Price.",
    core: true,
  },
  {
    slug: "price",
    specialty: "podiatry",
    order: 3,
    rubricKey: "price",
    title: "Price Delivery",
    subtitle: "Say the number. Then say nothing.",
    core: true,
  },
  {
    slug: "objections",
    specialty: "podiatry",
    order: 4,
    rubricKey: "objections",
    title: "Objection Handling",
    subtitle: "Acknowledge → isolate → reframe → re-ask.",
    core: true,
  },
  {
    slug: "close",
    specialty: "podiatry",
    order: 5,
    rubricKey: "close",
    title: "Asking for the Close",
    subtitle: "A recommendation, confidently delivered.",
    core: true,
  },
];

export const PODIATRY_LESSONS: TrainingLesson[] = [
  {
    slug: "mindset-core",
    moduleSlug: "mindset",
    specialty: "podiatry",
    order: 0,
    title: "The Mindset Shift — knowledge check",
    minutes: 5,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "You hesitate to present a $600 cash service you'd recommend without blinking if insurance covered it. Per the transplant test, what's actually changed?",
        options: [
          "The clinical indication is weaker for cash services",
          "Nothing about the medicine — only your framing of the money",
          "The patient's ability to consent",
          "The standard of care",
        ],
        answer: 1,
        why: "The service didn't change; your framing did. If you'd say it plainly in a covered context, say it plainly here.",
      },
      {
        prompt: "A patient gives a clear, informed, stable no. Which response is on the right side of the ethics line?",
        options: [
          "One more push — persistence is part of the skill",
          "A same-day discount to rescue the decision",
          "Chart the indication, care for them inside their constraint, set a concrete return trigger",
          "End the visit quickly and move on",
        ],
        answer: 2,
        why: "Past a genuine no, closing becomes pressure. The graceful exit keeps the patient — and pre-books the future yes.",
      },
      {
        prompt: "Why does an unprompted discount damage trust, in one sentence?",
        options: [
          "It reduces practice revenue",
          "It teaches the patient the first number was fake — and makes them wonder what else was",
          "Patients prefer round numbers",
          "It complicates billing",
        ],
        answer: 1,
        why: "A price that moves the moment someone hesitates implies the diagnosis might move too. Hold real numbers because they're real.",
      },
    ],
    drill: null,
  },
  {
    slug: "rapport-core",
    moduleSlug: "rapport",
    specialty: "podiatry",
    order: 0,
    title: "Rapport & Listening — knowledge check",
    minutes: 6,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "Ninety seconds in, you realize you've been explaining anatomy the whole time. The correction?",
        options: [
          "Finish the explanation — education builds trust",
          "Hand the room back: “Before I go on — what's this been stopping you from doing?”",
          "Skip ahead to the price",
          "Give them a brochure while you chart",
        ],
        answer: 1,
        why: "The 70/30 ratio is recoverable — one open question puts the patient back at 70% and restarts the flow of closing material.",
      },
      {
        prompt: "Which question most reliably surfaces why the patient is ready to act NOW?",
        options: [
          "“Does it hurt when you walk?”",
          "“Have you tried stretching?”",
          "“What made you come in now, after eight months?”",
          "“Do you have insurance?”",
        ],
        answer: 2,
        why: "“Why now” exposes the trigger — a trip, a job demand, a fear — and the close gets built on that trigger.",
      },
      {
        prompt: "Patient: “The inserts help for two weeks, then I'm right back where I started.” Best reflection?",
        options: [
          "“OTC devices lack corrective posting.”",
          "“Two weeks of relief, then right back — so you've been buying temporary fixes on repeat.”",
          "“Lots of my patients have tried those.”",
          "“You should stop wasting money on those.”",
        ],
        answer: 1,
        why: "Their words plus the pattern named — which quietly sets up why a corrective device is a different kind of purchase.",
      },
      {
        prompt: "You quote $900. The patient nods slowly and says nothing for five seconds. What's happening?",
        options: [
          "They're offended — apologize for the price",
          "They're processing — the close is working; protect the silence",
          "They didn't hear you — repeat it",
          "They're waiting for a discount",
        ],
        answer: 1,
        why: "Hesitation has no content to answer. Filling it negotiates against yourself; waiting lets it resolve into what's real.",
      },
    ],
    drill: null,
  },
  {
    slug: "framing-core",
    moduleSlug: "framing",
    specialty: "podiatry",
    order: 0,
    title: "Clinical Framing — knowledge check",
    minutes: 6,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "The correct order of the framing sequence:",
        options: [
          "Recommendation → Price → Diagnosis → Consequence",
          "Diagnosis → Consequence → Recommendation → Price",
          "Price → Diagnosis → Recommendation → Consequence",
          "Consequence → Price → Diagnosis → Recommendation",
        ],
        answer: 1,
        why: "Each beat earns the next; the price lands attached to a problem the patient owns instead of floating alone.",
      },
      {
        prompt: "Thirty seconds in, the patient asks “how much is it?” Best move?",
        options: [
          "Answer immediately — anything else looks shady",
          "“I'll give you the exact number in one minute — first let me show you what we're treating, so the number means something.”",
          "Give a vague range",
          "Say it depends on insurance",
        ],
        answer: 1,
        why: "That's sequencing, not hiding: a price with no diagnosis attached can only be judged as an expense.",
      },
      {
        prompt: "Which consequence line passes the weather-report test?",
        options: [
          "“If you wait, you're looking at surgery, maybe worse.”",
          "“At 6mm after 8 months of conservative care, this pattern rarely resolves on its own.”",
          "“I've seen people lose feet over less.”",
          "“You'll regret waiting, trust me.”",
        ],
        answer: 1,
        why: "Chartably true, delivered as information. The others are threats the chart doesn't support — scored as overselling.",
      },
      {
        prompt: "The patient says the cortisone shot “worked for a while.” Best framing use of that fact?",
        options: [
          "Avoid it — it argues for another shot",
          "“It gave you six good weeks, then wore off — we calmed the inflammation but never fixed the tissue. This is the first option that treats the tissue itself.”",
          "“Shots are old technology.”",
          "Offer a discounted repeat injection",
        ],
        answer: 1,
        why: "A failed treatment is a finding: it proves the next step is the logical one and reframes “worked for a while” as “didn't fix it.”",
      },
    ],
    drill: {
      rubricKey: "framing",
      scenarioSlug: "shockwave-plantar-fasciitis",
      setup: "Micro-drill: the shockwave patient just asked “Why do I need this fancy treatment? The stretching was free.” You have 3 turns. Practice ONLY clinical framing: tie your answer to her ultrasound (6mm fascia, normal ≤4), her 8 months of failed conservative care, and the honest cost of staying the course. Don't worry about closing — this drill grades framing alone.",
      patientInstruction:
        "You are skeptical about why a paid treatment beats the free stretching you've already been doing. Push back once on that point. If the provider ties the recommendation to YOUR specific exam findings (the 6mm ultrasound measurement, your 8 months of failed conservative care) and honestly describes what staying the course costs, become receptive. If they answer with generic benefits ('it's very effective', 'great results'), stay unconvinced and repeat that stretching is free.",
      passBar:
        "PASS only if the provider (1) cited at least one specific exam finding (the 6mm/thickened fascia ultrasound or the failed 8-month conservative course including the cortisone shot) AND (2) stated a truthful consequence of inaction without fear-mongering. FAIL if they relied on generic benefit claims, invented risks, or never referenced her specific findings.",
      maxTurns: 3,
    },
  },
  {
    slug: "price-core",
    moduleSlug: "price",
    specialty: "podiatry",
    order: 0,
    title: "Price Delivery — knowledge check",
    minutes: 6,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "Best delivery of the orthotics price?",
        options: [
          "“So they're — I know, don't freak out — like $525-ish, but we can work with you.”",
          "“The custom orthotics are $525.”",
          "“They're $525, which is honestly kind of a lot, I'm sorry.”",
          "“They're normally $525 but I can probably do better.”",
        ],
        answer: 1,
        why: "Five plain words at a normal pace with a hard stop. Everything else is an apology, a hedge, or a self-inflicted discount.",
      },
      {
        prompt: "After a price, the patient asks “Do you take CareCredit?” That is:",
        options: [
          "A price objection — defend the value",
          "A buying signal — answer it and move to scheduling",
          "A stall — ignore it",
          "A discount request",
        ],
        answer: 1,
        why: "Logistics questions mean the decision is made and they're arranging payment. Answer, then close.",
      },
      {
        prompt: "The right moment to mention financing:",
        options: [
          "Before the price, to soften the landing",
          "The instant the patient goes quiet",
          "After the clinical yes is forming — as payment mechanics, not rescue",
          "Never",
        ],
        answer: 2,
        why: "Financing offered during hesitation reads as doubt in your own number; offered after the decision it's just logistics.",
      },
      {
        prompt: "The honest use of the $150 single-session price when presenting the $900 program:",
        options: [
          "Sell the single as a cheaper way to start",
          "As an anchor: “Singles are $150 but rarely clear a nail — the program timed to nail growth is what works: $900.”",
          "Hide it so patients can't ask",
          "Offer three sessions at $450 as a compromise",
        ],
        answer: 1,
        why: "The anchor makes the program price legible; selling the single (or inventing a half-program) sells something that doesn't work.",
      },
    ],
    drill: {
      rubricKey: "price",
      scenarioSlug: "shockwave-plantar-fasciitis",
      setup: "Micro-drill: you've framed the shockwave recommendation; now deliver the price and survive what follows. You have 3 turns. State the $600 series price plainly — no apology, no wind-up — then hold through the patient's silence and her “that's a lot” without moving the number. Payment logistics are fine; discounts and apologies are a fail.",
      patientInstruction:
        "The provider is about to tell you the price. When they state it, respond with silence the first time — just '...' or a long 'hmm.' — to see if they crack and start justifying or discounting. On your next turn say 'That's... a lot of money.' If the provider stated the number plainly, tolerated your silence without babbling, and holds the number while acknowledging your concern, become accepting. If they apologize for the price, rush to justify during your silence, or offer any unprompted discount, become MORE hesitant.",
      passBar:
        "PASS only if the provider (1) stated the $600 price plainly without apology or hedging, (2) did not fill the patient's silence with justifications or concessions, and (3) held the number after 'that's a lot' (acknowledging the concern or reframing value is fine; moving the number is not). FAIL on any apology for the price, unprompted discount, or panic-babble during the silence.",
      maxTurns: 3,
    },
  },
  {
    slug: "objections-core",
    moduleSlug: "objections",
    specialty: "podiatry",
    order: 0,
    title: "Objection Handling — knowledge check",
    minutes: 8,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "The four objection types are:",
        options: [
          "Price, anger, confusion, fear",
          "Price, spouse/decision-delay, skepticism, “I'll think about it”",
          "Cost, time, distance, insurance",
          "Rational, emotional, financial, social",
        ],
        answer: 1,
        why: "Each type gets a distinct framework: Arithmetic, Ally, Evidence, and Real-Question.",
      },
      {
        prompt: "Patient: “That's a lot of money.” Your FIRST move in the loop is:",
        options: [
          "Explain the payment plans",
          "Acknowledge, then isolate: “Fair — if the cost weren't a factor at all, would you want to do this?”",
          "Repeat the clinical benefits",
          "Offer to check on a discount",
        ],
        answer: 1,
        why: "You don't yet know if this is a money objection or money-shaped cover for doubt. Acknowledge → isolate before any answer.",
      },
      {
        prompt: "Fill in the strong script — “I need to talk to my husband first.” → “As you should. ______”",
        options: [
          "“But it's your foot, and you're the one limping.”",
          "“What's he going to ask you? Let's make sure you walk in with real answers — and let's pencil Thursday; one text cancels it.”",
          "“Okay, call us whenever you two decide.”",
          "“What if I gave you a couple's discount?”",
        ],
        answer: 1,
        why: "The Ally framework: recruit the spouse, arm the patient, close on a cancellable process — never compete, never surrender.",
      },
      {
        prompt: "You've acknowledged, isolated, and given a strong reframe. The patient nods thoughtfully. The loop's final step is:",
        options: [
          "Give them space to volunteer a decision",
          "Summarize the clinical case once more",
          "Re-ask: “Then let's get session one booked — mornings or afternoons?”",
          "Hand them the brochure",
        ],
        answer: 2,
        why: "The most-skipped step. An answered objection without a fresh ask just resets the room to silence.",
      },
      {
        prompt: "Which of these is a red flag that the ethical move is to STOP closing?",
        options: [
          "The patient asks how soon results show up",
          "The reason is stable across two isolations and is about their life (tuition), not your treatment",
          "The patient goes quiet after the price",
          "The patient asks about financing",
        ],
        answer: 1,
        why: "Stable + informed + about their life = a real no. Past that point it's pressure: chart it, set the trigger, keep the patient.",
      },
    ],
    drill: {
      rubricKey: "objections",
      scenarioSlug: "custom-orthotics",
      setup: "Micro-drill: the orthotics patient ($525) just said 'I need to talk to my husband before I spend that.' You have 3 turns. Practice ONLY objection handling: run the loop — acknowledge, isolate/recruit with a question, arm her with the answers her husband will ask, and re-ask on process (a penciled appointment she can cancel). Don't discount, don't fight the spouse, don't just say 'call us back.'",
      patientInstruction:
        "Your objection this visit is spouse/authority: you won't commit to $525 without talking to your husband. If the provider asks what your husband will want to know, tell them: he'll ask why it's better than drugstore inserts and why it costs $525. If the provider treats your husband as an ally, gives you concrete answers to bring home, and proposes a low-commitment next step (like penciling an appointment you can cancel), warm up and accept the plan. If they pressure you to decide alone, dismiss your husband's role, or just give up with 'call us whenever,' stay noncommittal.",
      passBar:
        "PASS only if the provider (1) responded to the spouse objection with a question or ally-framing rather than pressure or surrender, (2) armed the patient with at least one concrete answer to take home (the clinical difference from drugstore inserts and/or the reason for the price), and (3) proposed a concrete low-pressure next step (penciled appointment, scheduled follow-up, or offer to answer the spouse's questions). FAIL if they pressured her to decide without her husband, offered a discount, or ended with a vague 'call us back.'",
      maxTurns: 3,
    },
  },
  {
    slug: "close-core",
    moduleSlug: "close",
    specialty: "podiatry",
    order: 0,
    title: "Asking for the Close — knowledge check",
    minutes: 6,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "Which line is an assumptive close?",
        options: [
          "“Do you maybe want to think about possibly scheduling?”",
          "“Let's get your first session on the books — Tuesday morning or Thursday afternoon?”",
          "“No pressure, whenever you're ready.”",
          "“Any questions?”",
        ],
        answer: 1,
        why: "It treats scheduling as the visit's natural next act — the top band of the Close rubric.",
      },
      {
        prompt: "The patient asked for exact numbers twice and wrote down the schedule. Best close for this Deliberator?",
        options: [
          "Assumptive — book them in",
          "Summary: recap findings, plan, price, then ask directly",
          "Alternative with two slots",
          "No close — analytical patients resent being asked",
        ],
        answer: 1,
        why: "Deliberators commit once the whole case is assembled. Recap, then a direct ask.",
      },
      {
        prompt: "The patient says yes. The ONLY correct category of thing to say next:",
        options: [
          "One more benefit to reinforce the decision",
          "Logistics: scheduling, payment mechanics, session one",
          "The backup plan if this fails",
          "A recap of risks",
        ],
        answer: 1,
        why: "After yes, new information can only create doubt. Calendar and card — the yes leaves wearing an appointment.",
      },
      {
        prompt: "Best charting after a declined recommendation?",
        options: [
          "Nothing — declined care needs no note",
          "“Recommended ESWT $600; declined — cost timing; splint dispensed; return trigger: morning pain requiring wall support; revisit 3 mo.”",
          "“Patient refused treatment.”",
          "“Will follow up eventually.”",
        ],
        answer: 1,
        why: "Recommendation, reason, interim care, trigger, timeline — the next visit resumes instead of restarting.",
      },
    ],
    drill: {
      rubricKey: "close",
      scenarioSlug: "laser-nail-fungus-program",
      setup: "Micro-drill: the laser-nail patient is warm — you've framed the program and she hasn't objected to the $900. She's waiting. You have 3 turns. Practice ONLY the close: ask for the decision with an assumptive or alternative close, and when she says yes, stop selling — go straight to logistics and lock the first session. Adding new benefits after her yes is a fail.",
      patientInstruction:
        "You are warm and ready to be closed — the provider has done the work and you have no objections left. Do NOT volunteer a yes: wait to be asked. If the provider uses a clear assumptive or alternative close (offering to book, giving you two slots), say yes and pick one. After you say yes, if the provider starts adding more selling points, statistics, or backup plans instead of confirming logistics, get visibly hesitant ('wait, backup plans? does it fail a lot?'). If they never actually ask for a decision, make small talk and eventually say you'll 'think it over.'",
      passBar:
        "PASS only if the provider (1) explicitly asked for the decision using an assumptive, alternative, or direct close, and (2) after the yes, moved immediately to logistics/scheduling without introducing any new selling points or failure scenarios. FAIL if they hinted without asking, or kept selling after the yes.",
      maxTurns: 3,
    },
  },
];

/* --------------------- Pre-room warmup flashcards --------------------- */

export interface WarmupCard {
  label: string;
  title: string;
  line: string;
}

/** 60-second glanceable review before walking into a real exam room. */
export const WARMUP_CARDS: WarmupCard[] = [
  {
    label: "Price objection",
    title: "The Arithmetic play",
    line: "“It is real money. Across the year it's $75 a month — and doing nothing isn't free either.” Hold the number; move the frame.",
  },
  {
    label: "Skepticism",
    title: "The Evidence play",
    line: "“Most chronic cases like yours improve — not everyone, and I won't pretend otherwise. Your scan shows exactly the pattern it treats.”",
  },
  {
    label: "Spouse / authority",
    title: "The Ally play",
    line: "“Of course — what's she going to ask you? Let's arm you with real answers. Pencil Thursday; cancel with one text if it's a no.”",
  },
  {
    label: "“Let me think about it”",
    title: "The Real-Question play",
    line: "“So I can be useful — is it the money, whether it works, or just not deciding today?”",
  },
  {
    label: "Price delivery",
    title: "Say it plainly",
    line: "“The series is $600.” Then SILENCE. Whoever speaks first loses. A logistics question is a buying signal.",
  },
  {
    label: "The close",
    title: "Assumptive / alternative",
    line: "“Let's get session one on the books — mornings or afternoons?” After yes: logistics only. Stop selling.",
  },
  {
    label: "The sequence",
    title: "D → C → R → P",
    line: "Diagnose → Consequence → Recommendation → Price. The number comes last, attached to the case — never floating alone.",
  },
  {
    label: "The line",
    title: "Ethics",
    line: "Recommend what the exam supports. Respect a genuine no the first time — chart it, set a trigger, keep the patient.",
  },
];


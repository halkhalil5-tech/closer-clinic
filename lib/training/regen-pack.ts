import type { TrainingLesson, TrainingModule } from "../types";
import type { WarmupCard } from "./podiatry-pack";

/**
 * Regenerative-medicine training pack — same six-module ladder as podiatry
 * (same orders, same rubric keys), new worked examples. Module slugs are
 * prefixed `regen-` because `training_modules.slug` is a global primary key;
 * everything downstream (`{slug}-core` lessons, module docs, deep links)
 * derives from the slug, so the shared machinery is unchanged.
 *
 * Canonical source: the Supabase seed script upserts from here, and dev mode
 * reads it directly.
 */

export const REGEN_MODULES: TrainingModule[] = [
  {
    slug: "regen-mindset",
    specialty: "regen",
    order: 0,
    rubricKey: null,
    title: "The Mindset Shift",
    subtitle: "You're not selling hope. You're prescribing honestly.",
    core: true,
  },
  {
    slug: "regen-rapport",
    specialty: "regen",
    order: 1,
    rubricKey: "rapport",
    title: "Rapport & Listening",
    subtitle: "They've been researched, pitched, and burned. Listen first.",
    core: true,
  },
  {
    slug: "regen-framing",
    specialty: "regen",
    order: 2,
    rubricKey: "framing",
    title: "Clinical Framing",
    subtitle: "Diagnose → Consequence → Recommendation → Price — honestly.",
    core: true,
  },
  {
    slug: "regen-price",
    specialty: "regen",
    order: 3,
    rubricKey: "price",
    title: "Price Delivery",
    subtitle: "Say the four-figure number. Then say nothing.",
    core: true,
  },
  {
    slug: "regen-objections",
    specialty: "regen",
    order: 4,
    rubricKey: "objections",
    title: "Objection Handling",
    subtitle: "FDA, evidence, and 'my ortho said' — answered straight.",
    core: true,
  },
  {
    slug: "regen-close",
    specialty: "regen",
    order: 5,
    rubricKey: "close",
    title: "Asking for the Close",
    subtitle: "An honest recommendation, confidently asked for.",
    core: true,
  },
];

export const REGEN_LESSONS: TrainingLesson[] = [
  {
    slug: "regen-mindset-core",
    moduleSlug: "regen-mindset",
    specialty: "regen",
    order: 0,
    title: "The Mindset Shift — knowledge check",
    minutes: 5,
    cards: [],
    example: null,
    quiz: [
      {
        prompt:
          "A knee-OA patient is a good candidate and you hesitate to present the $4,500 protocol. Per the transplant test, what actually changed versus recommending a covered arthroscopy?",
        options: [
          "The clinical indication is weaker for cash biologics",
          "Nothing about the medicine — only your framing of the money",
          "The patient's ability to consent",
          "The standard of care",
        ],
        answer: 1,
        why: "If the physician cleared the indication, the discomfort is about the invoice, not the medicine. Frame it like any other treatment plan.",
      },
      {
        prompt: "In this specialty, the line between case acceptance and exploitation is:",
        options: [
          "Whether the patient can afford it",
          "Whether you personally believe in the product",
          "Whether every claim you made would survive being read back to you in writing",
          "Whether the patient asked for the treatment first",
        ],
        answer: 2,
        why: "The written-read-back test: guarantees, FDA implications, and invented odds all die on paper. Honest framing survives it — and still closes.",
      },
      {
        prompt: "A distressed family member asks 'can this help my mom?' The ethical close here is:",
        options: [
          "A confident yes — hope itself is therapeutic",
          "Refusing to discuss anything until they calm down",
          "Booking the physician evaluation with zero promised outcomes, candidacy not guaranteed",
          "A discounted trial protocol",
        ],
        answer: 2,
        why: "The evaluation, truthfully framed, is the only honest thing on sale. A family closed on hope was closed dishonestly.",
      },
      {
        prompt: "Why does honesty OUTPERFORM hype in regen consults specifically?",
        options: [
          "It doesn't — hype closes more, honesty is just safer",
          "These patients have read the warning letters; candor is the differentiator every competitor won't offer",
          "Because compliance officers are usually present",
          "Because honest providers charge less",
        ],
        answer: 1,
        why: "Every burned patient arrived pre-inoculated against enthusiasm. 'The evidence is thin and I won't promise you a result' is the most credible sentence in the industry.",
      },
    ],
    drill: null,
  },
  {
    slug: "regen-rapport-core",
    moduleSlug: "regen-rapport",
    specialty: "regen",
    order: 0,
    title: "Rapport & Listening — knowledge check",
    minutes: 5,
    cards: [],
    example: null,
    quiz: [
      {
        prompt:
          "The back-pain patient opens with 'convince me this is different.' The strongest first move:",
        options: [
          "Launch your best differentiation pitch — they asked for it",
          "Reflect the history first: 'Two rounds of epidurals, a fusion consult you walked out of — you've done everything they asked and you're still here.'",
          "Promise you're nothing like the other clinics",
          "Show them the product's lab certificate",
        ],
        answer: 1,
        why: "'Convince me' is a trust question wearing an evidence costume. Proving you heard the six failures beats any pitch at minute one.",
      },
      {
        prompt: "A patient quotes their 2am Google research at you. You should:",
        options: [
          "Gently discredit internet research",
          "Take it seriously, ask what worried them most, and answer that specifically",
          "Redirect to your own materials",
          "Change the subject to their imaging",
        ],
        answer: 1,
        why: "In regen the research is often RIGHT — warning letters exist. Validating it earns the standing to add what the articles missed.",
      },
      {
        prompt: "The 70/30 rule in a regen consult means:",
        options: [
          "70% of the visit on product education",
          "The patient talks 70% — your 30% is questions, reflections, and the plan",
          "70% of patients close",
          "Talk 70% faster to fit everything in",
        ],
        answer: 1,
        why: "The consult is won by what you learn (their real fear, their spouse, their budget ceiling), not by what you recite.",
      },
    ],
    drill: null,
  },
  {
    slug: "regen-framing-core",
    moduleSlug: "regen-framing",
    specialty: "regen",
    order: 0,
    title: "Clinical Framing — knowledge check",
    minutes: 6,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "Which consequence line for KL-3 knee OA passes the weather-report test?",
        options: [
          "“Without this injection you WILL need a replacement within two years.”",
          "“Grade 3 changes don't reverse on their own. The realistic path is managing symptoms until replacement — the question is whether we try to widen that window first.”",
          "“Every month you wait, cartilage you'll never get back is dying.”",
          "“You're too young to be crippled.”",
        ],
        answer: 1,
        why: "Chartably true, no invented timeline, no fear. The heavy claim — 'replacement is the next stop' — must be delivered as trajectory, never as a threat with a date on it.",
      },
      {
        prompt: "The consequence step is HEAVIER in regen than in most specialties because:",
        options: [
          "The prices are higher",
          "“This joint keeps degrading and replacement is next” is easy to overstate into a threat the chart can't support — overstating it is both a compliance flag and a framing cap",
          "Patients don't understand joints",
          "Insurance auditors read the notes",
        ],
        answer: 1,
        why: "The true version is already motivating. The exaggerated version ('you'll be in a wheelchair') is the exact claim regulators quote back.",
      },
      {
        prompt: "Honest framing of what a biologic knee injection does:",
        options: [
          "“It regrows the cartilage you've lost.”",
          "“It reverses the arthritis at the source.”",
          "“It won't rebuild cartilage — the honest goal is pain and function: a joint that hurts less and does more, which is what patients actually live in.”",
          "“Nobody really knows what it does.”",
        ],
        answer: 2,
        why: "'Regrow/reverse' claims are the industry's signature violation. Pain-and-function framing is truthful AND what the patient actually wants.",
      },
      {
        prompt: "The failed-treatment history (two HA series, NSAIDs, PT) belongs in your framing as:",
        options: [
          "Something to skip — it's discouraging",
          "Proof the cheaper rungs are used up: each failure is a finding that makes the next step logical",
          "Evidence the patient doesn't comply",
          "A reason to repeat the HA series at a discount",
        ],
        answer: 1,
        why: "In regen the price only makes sense at the top of a used-up ladder. The history IS the frame.",
      },
    ],
    drill: {
      rubricKey: "framing",
      scenarioSlug: "regen-knee-single",
      setup:
        "Micro-drill: the knee patient just said “My ortho says it's bone on bone and I need a replacement — so what's a shot going to do?” You have 3 turns. Practice ONLY honest clinical framing: the KL grade 3 X-ray, the used-up conservative ladder, what the injection honestly targets (pain and function — not regrown cartilage), and the true consequence of doing nothing, stated as trajectory rather than threat. Don't worry about closing.",
      patientInstruction:
        "You believe the orthopedist: bone on bone means replacement, period. Push back once on that. If the provider frames honestly — agrees replacement stays on the table, ties the recommendation to YOUR X-ray grade and failed treatments, states what the injection realistically targets WITHOUT claiming it regrows cartilage or reverses arthritis, and describes the consequence of waiting truthfully — become receptive. If they trash the orthopedist, promise regrowth, or invent an urgency deadline, get MORE resistant and say why.",
      passBar:
        "PASS only if the provider (1) cited the specific findings (KL grade 3 / bone-on-bone X-ray AND the failed conservative history), (2) framed the goal honestly as pain/function without any regrow/reverse/cure claim, and (3) stated a truthful consequence of inaction without an invented timeline or fear language. FAIL on any overclaim, any disparagement of the orthopedist, or generic benefits talk.",
      maxTurns: 3,
    },
  },
  {
    slug: "regen-price-core",
    moduleSlug: "regen-price",
    specialty: "regen",
    order: 0,
    title: "Price Delivery — knowledge check",
    minutes: 6,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "The single hardest difference between quoting $600 and quoting $4,500:",
        options: [
          "The patient may walk out",
          "Holding the silence after it — a four-figure number makes YOU want to rescue the moment, and the rescue is what kills it",
          "You need financing paperwork",
          "It requires a manager's approval",
        ],
        answer: 1,
        why: "The number lands, the room goes quiet, and every word you add reads as doubt. At four figures the silence is longer and heavier — hold it anyway.",
      },
      {
        prompt: "Best delivery of the knee protocol price:",
        options: [
          "“So, with everything included, and this is honestly a really fair number for what you get... it's, uh, $4,500.”",
          "“The knee protocol — the guided injection, labs, and both follow-ups — is $4,500.” [silence]",
          "“It's $4,500 but we can probably work something out.”",
          "“Costs vary — let's see what you're comfortable with.”",
        ],
        answer: 1,
        why: "One breath: what it is, what it includes, the number, stop. Naming the contents isn't justifying — rambling after the number is.",
      },
      {
        prompt: "The patient goes silent for eight full seconds after '$4,500.' You should:",
        options: [
          "Mention the payment plan to ease the tension",
          "Repeat the number more confidently",
          "Wait. Silence is processing, not objection — whoever speaks first hands over the frame",
          "Offer the single-session anchor",
        ],
        answer: 2,
        why: "An unprompted rescue ('...but we have financing!') converts a thinking patient into a doubting one. Their next words tell you which conversation you're actually in.",
      },
      {
        prompt: "An honest anchor for the $2,400 annual IV protocol:",
        options: [
          "Inventing a higher 'regular price' it's discounted from",
          "“A single session runs $650 — the annual protocol is $2,400 with both biomarker panels included.”",
          "“Competitors charge $5,000 for worse.”",
          "There is no honest anchor; never compare",
        ],
        answer: 1,
        why: "A real single-session price is a truthful comparison that makes the program the smart math. Fake was-prices are a compliance flag AND a trust killer.",
      },
    ],
    drill: {
      rubricKey: "price",
      scenarioSlug: "regen-knee-single",
      setup:
        "Micro-drill: the four-figure silence. The knee patient just asked “Okay — what does all this cost?” You have 3 turns. Say the number the way the module teaches: plainly, once, with what it includes in the same breath — then STOP and hold whatever silence follows. No apology, no unprompted financing, no filling the pause. This drill grades price delivery alone.",
      patientInstruction:
        "Ask the price directly. When it lands, go quiet — reply with a short stunned beat ('...okay. wow.') and NOTHING else, then wait to see what the provider does with your silence. If they held it (no apology, no rambling justification, no unprompted discount or instant financing rescue), come back engaged with a logistics question. If they rescued the silence, filled it with justification, apologized, or discounted, read it as doubt and cool off — say the hesitation itself worries you.",
      passBar:
        "PASS only if the provider (1) stated $4,500 plainly with at most one sentence of included-contents in the same breath, and (2) after the patient's stunned beat, did NOT apologize, justify, discount, or volunteer financing — they held the silence or asked one calm question. FAIL on any rescue: apology, price talk-past, unprompted discount, or immediate financing pivot.",
      maxTurns: 3,
    },
  },
  {
    slug: "regen-objections-core",
    moduleSlug: "regen-objections",
    specialty: "regen",
    order: 0,
    title: "Objection Handling — knowledge check",
    minutes: 6,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "“Is this FDA approved?” The only acceptable first word of your answer:",
        options: [
          "“Technically...”",
          "“No.”",
          "“It's complicated.”",
          "“The FDA doesn't really regulate this space.”",
        ],
        answer: 1,
        why: "Anything softer than a plain no reads as the dodge they came expecting. The honest distinction (regulated tissue vs. approved drug) only lands AFTER the no.",
      },
      {
        prompt: "“My orthopedist said stem cells are a scam.” Best move:",
        options: [
          "“Orthopedists say that because we take their surgeries.”",
          "“With respect, he's behind the literature.”",
          "“For a lot of what's sold under that name, he's right — there are bad actors. Here's specifically what we do differently, and I'd be glad to send him the details.”",
          "Avoid engaging with another doctor's opinion",
        ],
        answer: 2,
        why: "Competing authority is never beaten by disparagement. Concede the true part, differentiate specifically, offer transparency to the other physician.",
      },
      {
        prompt: "“What's your success rate? Can you guarantee it?” The compliant answer that still closes:",
        options: [
          "“Eighty-five percent of our patients do great.”",
          "“No guarantee — and honestly, walk out of any clinic that offers one. What I can do is define with you exactly what success would look like at 12 weeks, and put those expectations in writing.”",
          "“Results vary” and change the subject",
          "“I personally guarantee you'll be happy.”",
        ],
        answer: 1,
        why: "The refusal to guarantee, delivered confidently and paired with concrete written expectations, converts the compliance rule into the trust play.",
      },
      {
        prompt: "“Is this from embryos?” You answer:",
        options: [
          "Vaguely, to avoid the topic",
          "Directly: birth tissue — cord or amniotic material donated after healthy scheduled C-sections with the mother's consent, tissue that would otherwise be discarded; never embryonic",
          "“Does it matter if it works?”",
          "By referring them to the supplier's website",
        ],
        answer: 1,
        why: "It's asked in every regen consult and deserves a straight, unembarrassed answer. Squirming reads as hiding something.",
      },
      {
        prompt: "Underneath most regen objections (FDA, evidence, 'my doctor said') the REAL objection is usually:",
        options: [
          "The science",
          "“Can I trust you not to be one of the clinics I read about?” — which is why isolation questions matter more here than anywhere",
          "The lead time",
          "Fear of needles",
        ],
        answer: 1,
        why: "Answer the surface objection alone and a new one appears. Isolate ('if the evidence question were settled for you, is this what you'd want to do?') and the real conversation starts.",
      },
    ],
    drill: {
      rubricKey: "objections",
      scenarioSlug: "regen-fda-anchor",
      setup:
        "Micro-drill: the FDA anchor. The patient opens with “Is this FDA approved? Because what I read says it isn't.” You have 3 turns. Practice ONLY the objection loop: answer the regulatory question truthfully and without flinching (it is NOT an FDA-approved treatment; it is a regulated, lot-tested tissue product — and the clinics claiming approval earned their warning letters), then isolate what's really underneath, and re-ask. No dodging, no 'technically.'",
      patientInstruction:
        "You've read the FDA warning letters and you're testing for the dodge. If the provider's answer starts with a plain honest 'no' and distinguishes regulated tissue from an approved drug WITHOUT minimizing, respect it, let them isolate your real concern (you're afraid of being scammed), and warm up. If they say or imply it IS approved, open with 'technically,' or get defensive about the warning letters, call it out and shut down hard.",
      passBar:
        "PASS only if the provider (1) plainly conceded the product is not FDA-approved before any nuance, (2) drew the honest tissue-vs-drug distinction without minimizing the patient's reading, and (3) asked at least one isolating question about the underlying concern. FAIL on any implied approval, 'technically', defensiveness about warning letters, or skipping the isolation.",
      maxTurns: 3,
    },
  },
  {
    slug: "regen-close-core",
    moduleSlug: "regen-close",
    specialty: "regen",
    order: 0,
    title: "Asking for the Close — knowledge check",
    minutes: 5,
    cards: [],
    example: null,
    quiz: [
      {
        prompt: "The honest assumptive close for the shoulder protocol:",
        options: [
          "“So should I, like, put you down for it maybe?”",
          "“I think you should do this — you'll thank me.”",
          "“Given where the cuff is and what the cortisone stopped doing, my recommendation is the protocol. Let's get you scheduled — the material takes four to six weeks, so mornings or afternoons for the procedure visit?”",
          "Wait for the patient to bring up scheduling",
        ],
        answer: 2,
        why: "Recommendation stated as a recommendation, then a concrete alternative ask. The lead time makes scheduling NOW the logical move — that's honest urgency.",
      },
      {
        prompt: "The 4–6 week material lead time is, for closing purposes:",
        options: [
          "A weakness to mention as late as possible",
          "Honest, structural urgency: deciding today books a date six weeks out — the opposite of pressure",
          "A reason to take full payment upfront",
          "Something the front desk handles",
        ],
        answer: 1,
        why: "Fake urgency is a compliance flag. The lead time is real urgency you never have to invent — use it plainly.",
      },
      {
        prompt: "The patient gives a genuine, informed no after honest answers. You:",
        options: [
          "Re-run the pitch with more enthusiasm",
          "Drop the price",
          "Respect it the first time: chart the indication, set a concrete return trigger (“if the knee's worse at your spring physical, that's our signal”), leave the door open",
          "Warn them they'll regret it",
        ],
        answer: 2,
        why: "Pushing past an informed no caps your score and, in this specialty, is exactly the behavior regulators describe. The respected no returns; the pressured no warns their friends.",
      },
      {
        prompt: "After the patient says yes to the knee protocol, the discipline is:",
        options: [
          "Reinforce with two more benefits so they don't waver",
          "Stop selling: confirm, hand off to scheduling and the deposit, done — every word after yes can only lose ground",
          "Suggest adding the second knee while they're saying yes",
          "Re-verify their budget",
        ],
        answer: 1,
        why: "Post-yes selling reopens the decision. The attach conversation is a separate honest visit (see the second-joint station), not a rider on this yes.",
      },
    ],
    drill: {
      rubricKey: "close",
      scenarioSlug: "regen-shoulder-cuff",
      setup:
        "Micro-drill: the ask. The shoulder patient has had every question answered and is warm — they just said “Okay, that all makes sense.” You have 3 turns. Practice ONLY the close: state your recommendation plainly, ask an assumptive or alternative closing question with the real lead time in it, and if they wobble once, isolate and re-ask once. Do not keep selling.",
      patientInstruction:
        "You're warm and basically convinced. If the provider states a clear recommendation and asks a direct assumptive/alternative closing question, wobble mildly once ('I mean — it's a lot of money'), and if they handle that calmly with one isolating question and re-ask, say yes and pick a time. If they keep pitching instead of asking, never actually ask, or push hard after your wobble, drift to 'let me think about it.'",
      passBar:
        "PASS only if the provider (1) stated the recommendation plainly, (2) asked an explicit assumptive or alternative closing question, and (3) after the wobble, isolated or calmly re-asked exactly once and secured the yes. FAIL if they never asked, kept selling after warmth, or pressured after the wobble.",
      maxTurns: 3,
    },
  },
];

/** Pre-rep warmup deck — regen plays, same card shape as podiatry's. */
export const REGEN_WARMUP_CARDS: WarmupCard[] = [
  {
    label: "Price objection",
    title: "The Ladder play",
    line: "“It's real money — and it sits at the top of a ladder you've already climbed: PT, injections, the consult. This is what's left between here and surgery.” Hold the number.",
  },
  {
    label: "“Is it FDA approved?”",
    title: "The Straight-No play",
    line: "“No — and any clinic that tells you otherwise, walk out. It's a regulated, lot-tested tissue product; that's a different thing, and I'll put the difference in writing.”",
  },
  {
    label: "Competing authority",
    title: "The Concede-First play",
    line: "“For a lot of what's sold under that name, your ortho's right. Here's what's different about this protocol — and I'm happy to send him everything we do.”",
  },
  {
    label: "Guarantee hunting",
    title: "The Written-Expectations play",
    line: "“No guarantee — run from anyone who offers one. What I'll do is define success with you: what 12 weeks looks like, on paper, before you pay a dollar.”",
  },
  {
    label: "Price delivery",
    title: "Say it plainly",
    line: "“The protocol — injection, labs, both follow-ups — is $4,500.” Then SILENCE. A four-figure number needs a longer silence. Hold it anyway.",
  },
  {
    label: "“Let me think about it”",
    title: "The Real-Question play",
    line: "“Absolutely — so I can be useful: is it the money, the evidence, or whether you can trust this industry at all? Because that last one deserves a real answer.”",
  },
];

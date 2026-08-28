import type { ModuleDoc } from "../types";

/**
 * Standardized module documents — the reading layer of each module.
 * Canonical source (dev reads directly; the seed script upserts to the
 * `training_module_docs` jsonb table). Tracked knowledge checks and live
 * micro-drills live on each module's lesson record (`{module}-core`), so the
 * existing quiz/drill/progress machinery is reused unchanged.
 *
 * Editorial rules baked in:
 * - Clinical peer-to-peer tone; every technique framed around patient benefit
 *   and informed consent.
 * - No invented outcomes data: efficacy claims carry [NEEDS SOURCE] and are
 *   listed in each doc's `flags` for founder review.
 * - Cross-specialty script examples (dental aligners, med-spa memberships)
 *   are flagged as extrapolated — this is a podiatry-first product.
 * - Reading time target ≤ 8 minutes/module (enforced by a unit test).
 */

export const PODIATRY_MODULE_DOCS: ModuleDoc[] = [
  /* ========================= Module 0 — Mindset ========================= */
  {
    moduleSlug: "mindset",
    specialty: "podiatry",
    objectives: [
      "State the two-part ethics line that separates case acceptance from selling.",
      "Apply the “transplant test” to any cash-pay recommendation you hesitate on.",
      "Name the three things a genuine close requires (indication, informed patient, direct ask).",
      "Explain why unprompted discounting damages patient trust in ONE sentence.",
    ],
    concept: [
      {
        id: "clinical-skill",
        title: "Case acceptance is a clinical skill",
        body: "A patient with 8 months of plantar fasciitis who leaves with a stretching handout and no plan is not a win. **The treatment you never present is the treatment they never get.** Presenting shockwave at $600 to the right patient isn't upselling — it's completing the exam.\n\nLike suturing or injections, this skill is trainable and measurable. Every rep you run here is scored on the same five dimensions, so your training and your scorecards speak one language.",
      },
      {
        id: "transplant-test",
        title: "The transplant test",
        body: "Would you hesitate to recommend a $600 course of physical therapy? An MRI? You already “sell” daily — you call it a treatment plan. The discomfort only appears when the patient pays cash.\n\n**The service didn't change. Your framing did.** When you catch yourself hedging, transplant the recommendation into an insurance-covered context. If you'd say it plainly there, say it plainly here.",
      },
      {
        id: "ethics-line",
        title: "The ethics line",
        body: "This app trains **confident recommendation of clinically appropriate care — never pressure.** Two rules, and the AI examiner enforces both:\n\n**Recommend only what the exam supports.** Overselling past the chart caps your Clinical Framing score.\n\n**Respect a genuine, informed no the first time.** Pushing past it caps Objection Handling, and a yes extracted by pressure is not credited as a close. Long-term, ethical case acceptance isn't the constraint on your close rate — it IS your close rate.",
      },
    ],
    scripts: [
      {
        id: "recommendation-voice",
        title: "The recommendation voice",
        context: "Hedging reads as clinical doubt. These are prescriptions, not pitches.",
        lines: [
          {
            line: "“Based on what your exam shows, I'm recommending the 3-session shockwave series.”",
            why: "“I'm recommending” carries clinical authority; “you could maybe consider” hands the decision to the parking lot.",
          },
          {
            line: "“If this were my heel, this is what I'd do next.”",
            why: "Personal-standard framing is the strongest honest signal a clinician can send — use only when true.",
          },
          {
            line: "“You've done everything I'd ask conservatively. It's time to change the plan, not repeat it.”",
            why: "Honors the patient's effort and makes the escalation feel logical rather than commercial.",
          },
        ],
      },
      {
        id: "ethics-language",
        title: "Holding the line without apology",
        lines: [
          {
            line: "“The price is the price for everyone — that's exactly why you can trust the rest of what I tell you.”",
            why: "Connects pricing integrity to clinical integrity; a soft number implies soft facts.",
          },
          {
            line: "“My job is to tell you what your foot needs and what it costs. The decision is completely yours.”",
            why: "States the informed-consent frame out loud — patients relax when the roles are explicit.",
          },
        ],
      },
    ],
    dialogues: [],
    mistakes: [
      {
        wrong: "“There are some cash options, but they're pricey. Honestly, stretching is fine for now.”",
        right: "“Stretching hasn't changed your ultrasound in 8 months. There's a cash option I'd recommend — let me show you what it treats and what it costs, and you decide.”",
        note: "Deciding from the patient's wallet is the most common ethics failure — it denies informed choice.",
      },
      {
        wrong: "“I know it's expensive, I'm sorry — we can probably work something out on the price.”",
        right: "“The series is $600. Most patients run it on an HSA card.”",
        note: "Apologizing plus unprompted discounting teaches the patient the number — and maybe the diagnosis — was soft.",
      },
      {
        wrong: "“Spots are filling fast — if you don't book today I can't promise availability.”",
        right: "“There's no urgency trick here: the tissue finding is the reason to act, and it'll still be the reason next week.”",
        note: "Invented urgency is the grader's overselling cap and the fastest way to lose a professional referral.",
      },
    ],
    repCta: {
      stationSlug: "shockwave-plantar-fasciitis",
      difficulty: "easy",
      label: "Make one plain recommendation and ask for the booking",
    },
    flags: [],
  },

  /* ========================= Module 1 — Rapport ========================= */
  {
    moduleSlug: "rapport",
    specialty: "podiatry",
    objectives: [
      "State the target talk ratio for the first half of the visit (patient ≈ 70%).",
      "Ask three open-ended openers verbatim, including the “why now?” question.",
      "Demonstrate the reflect-then-add pattern: their words, then your clinical meaning.",
      "Distinguish hesitation from objection and name the correct response to each.",
    ],
    concept: [
      {
        id: "seventy-thirty",
        title: "The 70/30 rule",
        body: "In the first half of the visit the patient should do about 70% of the talking. **Every sentence they say is closing material** — their words, stakes, deadlines. You'll spend it all later: framing the diagnosis, answering objections, closing.\n\nProviders who monologue early have nothing to work with late. If you've talked 60 seconds straight before the price, you're rehearsing a speech, not running a visit.",
      },
      {
        id: "reflect-then-add",
        title: "Reflect, then add",
        body: "Reflection is their meaning in **their vocabulary** — “killing you by hour six,” not “significant discomfort with prolonged ambulation.” Clinical paraphrase says you translated them; reflection says you heard them.\n\nThen add your meaning: “Brutal first steps every morning for a year — that pattern is textbook chronic plantar fasciitis, and it's exactly what your ultrasound confirmed.” Your findings become an explanation of their life, not a lecture about their foot.",
      },
      {
        id: "hesitation-vs-objection",
        title: "Hesitation is not an objection",
        body: "**An objection has content (“$600 is a lot”). Hesitation has none (“hmm…”).** They need opposite responses: objections want an answer; hesitation wants space.\n\nThe deadly mistake is panic-filling a thinking pause with justifications and discounts — you just answered an objection nobody made, and taught the patient your number was soft. A pause after a price is the close working. Let it work.",
      },
    ],
    scripts: [
      {
        id: "openers",
        title: "Open-ended openers",
        lines: [
          {
            line: "“Before we talk options — what's this actually been like for you?”",
            why: "Invites a story instead of a yes/no; stories contain the stakes you'll close on.",
          },
          {
            line: "“What made you come in now, after dealing with this for eight months?”",
            why: "“Why now” almost always surfaces the real trigger — a trip, a job demand, a fear.",
          },
          {
            line: "“What's this stopping you from doing?”",
            why: "Converts a symptom into a life cost — the thing your price will later be weighed against.",
          },
        ],
      },
      {
        id: "reflections",
        title: "Reflection stems",
        lines: [
          {
            line: "“So you're trading burning feet at night for a foggy head all day.”",
            why: "Their exact words sharpened into the actual problem — ten seconds of listening outsells any brochure.",
          },
          {
            line: "“Two summers hiding your feet — and June's coming.”",
            why: "Specific and unfakeable; generic empathy (“many patients feel this way”) reads as script.",
          },
        ],
      },
      {
        id: "pause-lines",
        title: "Protecting the pause",
        lines: [
          {
            line: "(Say nothing for four slow beats.)",
            why: "Most thinking pauses resolve into a buying signal if you don't interrupt the math.",
          },
          {
            line: "“Take your time — it's a real decision.”",
            why: "Names a stretching silence without touching the number; patience reads as confidence.",
          },
        ],
      },
    ],
    dialogues: [],
    mistakes: [
      {
        wrong: "“I understand how you feel — a lot of patients struggle with this.”",
        right: "“Ten-hour shifts and limping by hour six — that's what we're actually fixing here.”",
        note: "Empathy addressed to nobody registers as script; reflection of their words registers as being heard.",
      },
      {
        wrong: "“Does it hurt in the morning? Does it hurt at night? Any numbness?” (checklist barrage)",
        right: "“Walk me through what your mornings look like with this heel.”",
        note: "Closed questions get data; open questions get the story — and the story closes.",
      },
      {
        wrong: "(Patient goes quiet after the price) “…and we have payment plans! And honestly I could probably do something on the price…”",
        right: "(Wait. Then:) “Take your time — it's a real decision.”",
        note: "Filling hesitation negotiates against yourself before any objection exists.",
      },
    ],
    repCta: {
      stationSlug: "laser-nail-fungus-program",
      difficulty: "easy",
      label: "Open with questions and reflect before you present anything",
    },
    flags: [],
  },

  /* ========================= Module 2 — Framing ========================= */
  {
    moduleSlug: "framing",
    specialty: "podiatry",
    objectives: [
      "Recite the four-beat sequence in order: Diagnose → Consequence → Recommendation → Price.",
      "Deliver a complete sequence for one of your services in under 60 seconds.",
      "Cite at least one patient-specific exam finding in every recommendation.",
      "Deliver a consequence-of-inaction statement that passes the “weather report” test (chartably true, no fear).",
    ],
    concept: [
      {
        id: "sequence",
        title: "Diagnose → Consequence → Recommendation → Price",
        body: "Each beat earns the next: findings make the consequence credible, the consequence makes the plan necessary, and the price lands **attached to a problem the patient now owns** rather than floating alone.\n\nThe whole sequence fits in a minute: “Your ultrasound shows the fascia at 6mm — normal is 4 [diagnose]. Eight months of conservative care hasn't changed it, and this pattern doesn't tend to resolve from here [consequence]. I'm recommending shockwave — three sessions, one a week [recommendation]. The series is $600 [price].” Then stop talking.",
      },
      {
        id: "this-patient",
        title: "THIS patient's findings",
        body: "Specifics are unfakeable. “Your fascia is 6 millimeters — half again the normal thickness” cannot be said to the next patient in line — which is exactly why it works.\n\n**Failed treatments are findings too.** “The cortisone gave you six good weeks, then it came back — we calmed the inflammation but never fixed the tissue.” Their own history proves this recommendation is the logical next step, not a money grab.",
      },
      {
        id: "weather-report",
        title: "Consequence without fear",
        body: "Consequence language has one job: make the cost of the current path visible. The test: **everything you say must be chartably true and delivered like a weather report, not a threat.**\n\nEnd with a fork, not a shove: “Path one: keep managing symptoms. Path two: three weeks of treatment aimed at the tissue itself. I want you choosing with clear eyes.” Patients who own the choice defend it later — to the spouse, to themselves.",
      },
    ],
    scripts: [
      {
        id: "price-deferral",
        title: "When they ask the price too early",
        lines: [
          {
            line: "“I'll give you the exact number in one minute — first I want you to see what we're treating, so the number means something.”",
            why: "You're sequencing the price, not hiding it; a number with no diagnosis attached can only be judged as an expense.",
          },
        ],
      },
      {
        id: "sequence-templates",
        title: "Sequence templates by service",
        context: "Fill in your own findings; the skeleton stays constant.",
        lines: [
          {
            line: "“Four nails involved, debris under the plate — topicals can't reach it [D]. Untreated, this spreads and thickens [C]. The yearlong laser program clears it as the nail grows out [R]. It's $900 [P].”",
            why: "Podiatry laser example — the structure explains WHY the program format exists before the price arrives.",
          },
          {
            line: "“Your crowding is trapping plaque on these lower teeth [D]. That's where we're seeing the gum inflammation start [C]. Clear aligners correct it in about [X] months [R]. The full case is $[X] [P].”",
            why: "Dental aligner version — same four beats. Aligners are a hygiene case here, not a cosmetic pitch.",
          },
          {
            line: "“Your sun damage is concentrated here and here [D]. This kind of pigmentation deepens with each summer [C]. A series of [treatment] addresses it [R]. The series is $[X], or members pay $[X] [P].”",
            why: "Med-spa version — the membership price is stated as structure, not sprung as a surprise upsell.",
          },
        ],
      },
      {
        id: "fork-lines",
        title: "The fork",
        lines: [
          {
            line: "“Both paths are real choices. I just want you making this one with clear eyes.”",
            why: "Ownership language — a chosen yes survives the drive home; a pushed yes usually doesn't.",
          },
        ],
      },
    ],
    dialogues: [],
    mistakes: [
      {
        wrong: "“Shockwave is one of the most effective treatments we offer — patients love it.”",
        right: "“Your fascia measured 6 millimeters. Shockwave is the first thing we've discussed that treats that tissue directly.”",
        note: "Generic benefit claims are what selling sounds like; their measurement is what medicine sounds like.",
      },
      {
        wrong: "“If you wait on this, you're honestly looking at surgery, maybe worse.”",
        right: "“At this thickness after 8 months, this pattern rarely resolves on its own — a year from now most patients are where you are today.”",
        note: "The chart supports the second sentence, not the first. Fear-mongering caps your framing score.",
      },
      {
        wrong: "“So it's $600. Anyway, let me explain what shockwave actually is…”",
        right: "(Diagnosis and consequence FIRST.) “…and the series that treats it is $600.” (Stop.)",
        note: "Price-first ordering forces the patient to judge a naked number.",
      },
    ],
    repCta: {
      stationSlug: "shockwave-plantar-fasciitis",
      difficulty: "moderate",
      label: "Run the full 4-beat sequence off the ultrasound finding",
    },
    flags: [
      "Dental aligner script (crowding → gum inflammation rationale) is extrapolated — verify clinical accuracy.",
      "Med-spa pigmentation script is extrapolated — verify clinical accuracy and membership framing.",
    ],
  },

  /* ========================== Module 3 — Price ========================== */
  {
    moduleSlug: "price",
    specialty: "podiatry",
    objectives: [
      "Deliver a price in five words or fewer, with no wind-up or apology.",
      "Hold at least four seconds of silence after stating a number.",
      "Use an honest anchor (per-session vs program) without moving the total.",
      "Reframe “that's expensive” twice without changing the price.",
    ],
    concept: [
      {
        id: "plain-delivery",
        title: "Say it like a diagnosis",
        body: "You don't wince before saying “plantar fasciitis.” Don't wince before “$600.” **The delivery is five words: “The full series is $600.”**\n\nThe patient takes their cue about whether the number is reasonable from you. A flat, unhurried number sounds like a fact. A rushed, padded number sounds like a confession. Apologizing (“I know it's a lot…”) tells the patient that in your own judgment the price exceeds the value — so why would they disagree with their doctor?",
      },
      {
        id: "silence",
        title: "The silence rule",
        body: "After the number, stop completely. **The silence is the patient converting dollars into a decision** — three to eight seconds is normal. Every word you add interrupts the math and hands them a reason to defer.\n\nWhat breaks the silence tells you the next move: a logistics question (“do you take HSA?”) is a buying signal — answer and close. A soft objection wants acknowledgment, not retreat. More silence wants more silence.",
      },
      {
        id: "anchors",
        title: "Anchor honestly, break down — never bring down",
        body: "“Sessions are $150 — but singles rarely clear a nail. The program timed to nail growth is what works: $900.” The per-session anchor makes the program price legible. **Anchoring is honest when the comparison is real.**\n\nYou can shrink the FELT size of a number without touching it: $900 across a year is $75 a month. The moment you actually move the number, you've told the patient it was fake. Financing gets mentioned once, AFTER the decision energy is real — as logistics, never as a rescue.",
      },
    ],
    scripts: [
      {
        id: "price-statements",
        title: "Plain price statements",
        lines: [
          {
            line: "“The full series is $600.” (period, eye contact, silence)",
            why: "No wind-up, normal pace, hard stop — the punctuation is the technique.",
          },
          {
            line: "“The complete aligner case — records, trays, refinements, retainers — is $[X].”",
            why: "Dental version: naming what's included pre-answers the “what am I paying for” objection without defending.",
          },
          {
            line: "“That treatment series is $[X]. Members pay $[X] — I can have the desk walk you through membership if it's useful.”",
            why: "Med-spa version: the membership is offered as information, not pushed as a trap.",
          },
        ],
      },
      {
        id: "after-silence",
        title: "After the silence breaks",
        lines: [
          {
            line: "“Absolutely, HSA works. Let's get session one on the calendar — mornings or afternoons?”",
            why: "Logistics questions are buying signals; answer and move straight to scheduling.",
          },
          {
            line: "“It is a real investment. And it's priced for what it is — a year of treatment timed to how your nail actually grows.”",
            why: "Agrees with the observation, holds the number, restates the structure that justifies it.",
          },
        ],
      },
      {
        id: "financing-timing",
        title: "Financing — the one right moment",
        context: "After the clinical yes is forming, never before the number, never as a rescue during silence.",
        lines: [
          {
            line: "“Most patients put this on an HSA card; CareCredit works too if spreading it out helps. Which is easier for you?”",
            why: "Positioned as payment mechanics after the decision — mentioning it during hesitation reads as doubt.",
          },
        ],
      },
    ],
    dialogues: [],
    mistakes: [
      {
        wrong: "“So, um, cost-wise — don't freak out — it's $900, BUT we have payment plans, and honestly I might be able to talk to the office manager…”",
        right: "“The full program is $900.” (silence)",
        note: "Wind-up + apology + rushed financing + hinted discount: four price-killers in one breath.",
      },
      {
        wrong: "“Okay what if we just did three of the six sessions? That's $450 — basically half.”",
        right: "“Half the program is the one version I can't recommend — it costs money AND doesn't work. The real thing is $900, $75 a month across the year.”",
        note: "Inventing a clinically useless cheaper product rescues the moment and betrays the patient.",
      },
      {
        wrong: "“It's really not that expensive compared to other clinics.”",
        right: "“It is real money. So is another year of mornings like yours — let's compare the two honestly.”",
        note: "Arguing with the patient's perception loses; agreeing and moving the frame wins.",
      },
    ],
    repCta: {
      stationSlug: "laser-nail-fungus-program",
      difficulty: "moderate",
      label: "State $900 plainly, survive the silence, hold the number",
    },
    flags: [
      "Dental aligner price-statement script is extrapolated — verify inclusions language.",
      "Med-spa membership price script is extrapolated — verify membership mechanics.",
    ],
  },

  /* ================== Module 4 — Objection Handling (DEEP) ================== */
  {
    moduleSlug: "objections",
    specialty: "podiatry",
    objectives: [
      "Name the 4 objection types: price, spouse/decision-delay, skepticism, “I'll think about it.”",
      "Run the acknowledge → isolate → reframe → re-ask loop on any objection without skipping a step.",
      "Match each objection type to its distinct framework (Arithmetic, Ally, Evidence, Real-Question).",
      "Use two price tools verbatim: suffering/downstream-cost anchoring and per-visit vs package framing.",
      "List three red flags that mean the ethical move is to stop closing — and deliver door-open language.",
    ],
    concept: [
      {
        id: "information",
        title: "Objections are information, not attacks",
        body: "An objection is the patient showing you exactly where their decision is stuck. **The stated objection is often not the real one** — “$600 is a lot” can mean can't-afford, don't-believe, scared-it-hurts, or my-spouse-decides.\n\nAnswer the wrong one and you've spent your best material on a concern they don't have. That's why the first response to any objection is never an answer. It's a question.",
      },
      {
        id: "four-types",
        title: "The four types, four frameworks",
        body: "**Price → the Arithmetic framework.** Confirmed money objections get honest math and moved frames — never a moved number.\n\n**Spouse / decision-delay → the Ally framework.** Never compete with the spouse; recruit them. Arm your patient with answers and close on process (a penciled slot), not product.\n\n**Skepticism (“does this even work?”) → the Evidence framework.** Real numbers with their honest ceiling, tied to THIS patient's findings. Certainty you don't have is a lie; calibrated confidence is medicine.\n\n**“I'll think about it” → the Real-Question framework.** It isn't an objection — it's fog hiding one of the other three. Your job is one gentle question that names the options.",
      },
      {
        id: "loop",
        title: "The loop: acknowledge → isolate → reframe → re-ask",
        body: "**Acknowledge** — one sentence that makes the concern legitimate (“That's a fair question”). Skipping this reads as combat.\n\n**Isolate** — find the real objection: “If the cost weren't a factor at all, would you want to do this?”\n\n**Reframe** — answer the REAL concern with clinical material: their findings, their history, honest numbers.\n\n**Re-ask** — the loop isn't finished until you ask again: “Then let's get session one booked — mornings or afternoons?” Providers most often complete three steps and abandon the fourth.",
      },
      {
        id: "when-not-to-push",
        title: "When the answer is no",
        body: "Red flags that the ethical move is to STOP closing:\n\n**The reason is stable** — it survives two isolation attempts unchanged.\n\n**The reason is about their life, not your treatment** — tuition, a diagnosis in the family, a genuine budget.\n\n**Engagement has stopped** — no more questions; they're managing you, not deciding.\n\n**They've already said no clearly once.** Past that point it isn't persuasion, it's pressure — the grader caps your score, and the patient never comes back. Handled with grace, today's no becomes next year's yes: chart the indication, care for them inside their constraint, set a concrete return trigger.",
      },
    ],
    scripts: [
      {
        id: "price-tools",
        title: "Price tools",
        context: "Only after isolation confirms it's actually about money.",
        lines: [
          {
            line: "“Doing nothing isn't free either — it's another year of copays, pills, and mornings like the ones you described. Let's price both paths honestly.”",
            why: "Anchors against continued suffering and downstream costs; the treatment price stops being the only number in the room.",
          },
          {
            line: "“Sessions run $150, but singles rarely clear a nail — the $900 program exists because the nail takes a year to grow out. Across that year it's $75 a month.”",
            why: "Per-visit vs package framing plus per-month arithmetic: the felt size shrinks while the number stands still.",
          },
          {
            line: "“The number stays the number. What can move is timing and mechanics — HSA, CareCredit, or starting after payday. Which helps?”",
            why: "States the boundary and the flexibility in one breath; financing arrives as logistics, not rescue.",
          },
        ],
      },
      {
        id: "spouse-tools",
        title: "Spouse / decision-delay tools",
        lines: [
          {
            line: "“As you should — big decisions are joint decisions. What's she going to ask you?”",
            why: "Recruits the spouse as an ally and surfaces the kitchen-table objections while the expert is still in the room.",
          },
          {
            line: "“Let's pencil Thursday. Talk tonight — if it's a no, you cancel with one text. No pressure either way.”",
            why: "Closes on process, not product: a penciled default survives the kitchen-table conversation; “call us back” doesn't.",
          },
          {
            line: "“If he has questions I haven't answered, he's welcome to call me directly.”",
            why: "Signals you have nothing to hide — the offer itself is the persuasion; few spouses ever call.",
          },
        ],
      },
      {
        id: "skepticism-tools",
        title: "Skepticism tools",
        lines: [
          {
            line: "“Roughly [X]% of chronic cases like yours get meaningful improvement [NEEDS SOURCE — use your device literature or your own outcomes]. Not everyone — I won't promise you're not in the remainder. But your scan shows exactly the pattern it treats.”",
            why: "Numbers with an honest ceiling beat superlatives; the admission of the failure rate is what makes the rest credible.",
          },
          {
            line: "“Do you know if your neighbor's case looked like yours?”",
            why: "Unhooks the anecdote in one question, then the conversation returns to THIS patient's findings.",
          },
        ],
      },
      {
        id: "think-tools",
        title: "“I'll think about it” tools",
        lines: [
          {
            line: "“Of course. So I can be useful — is it the money, whether it'll work, or just not deciding on the spot?”",
            why: "Names the three real possibilities gently; whatever they pick routes you to the matching framework.",
          },
          {
            line: "“Totally fair. What's the one thing you'd want to know by Thursday that you don't know now?”",
            why: "Converts vague fog into a concrete information gap you can often close on the spot.",
          },
        ],
      },
      {
        id: "door-open",
        title: "Leaving the door open (after a real no)",
        lines: [
          {
            line: "“Then it's a no, and it's a good reason. I'm charting that the treatment is indicated — if the timing changes, we don't start over.”",
            why: "Respects the decision immediately and converts it into a standing, documented future yes.",
          },
          {
            line: "“One trigger to remember: the morning you can't cross the bedroom without holding the wall — that's the day you call, and we'll get you in that week.”",
            why: "A concrete if-then travels home with the patient; “come back if it gets worse” evaporates in the parking lot.",
          },
          {
            line: "“Meanwhile let's keep you moving — the night splint is $38, and I want to see you if this worsens, not when.”",
            why: "Caring inside their constraint proves the recommendation was about them, not the invoice.",
          },
        ],
      },
    ],
    dialogues: [
      {
        id: "price-1",
        title: "Price · “$600 is a lot”",
        patient: "“Six hundred dollars? That's… a lot of money for sound waves.”",
        weak: "“We do have payment plans! And we could split it across two cards, and if you book today I could check with the office manager about…”",
        strong: "“It is real money — fair reaction. Let me ask you this: if it were covered tomorrow, would you want it done? …Then the question is arithmetic, not medicine. It's $200 a session against a year of mornings you just described. Want to look at HSA or CareCredit and get session one booked?”",
        annotation: "Weak: heard “price,” skipped isolation, negotiated against himself. Strong: acknowledge → isolate (“if it were covered”) → reframe with their own stakes → re-ask. The number never moved.",
      },
      {
        id: "price-2",
        title: "Price · the silent flinch",
        patient: "(Winces at the number, exhales, says nothing.)",
        weak: "“…I know, I know. Look, honestly, a lot of people feel that way, and there might be some wiggle room if—”",
        strong: "(Four seconds of comfortable silence.) “Big-decision math happening? Take your time.” (Waits again.)",
        annotation: "A flinch is hesitation, not an objection — there's nothing to answer yet. The weak version invents a price objection and pre-concedes; the strong version lets the pause resolve into whatever's real.",
      },
      {
        id: "spouse-1",
        title: "Spouse · “I need to talk to my husband”",
        patient: "“I'd want to talk to my husband before spending five hundred dollars.”",
        weak: "“Sure, of course, no problem. Just give us a call whenever you two decide!”",
        strong: "“As you should — that's a real conversation. What's he going to ask you? …Good questions. Tell him: the drugstore inserts collapse at the arch, which is why relief dies in two weeks; these are cast to your foot and last years. Let's pencil Thursday for casting — talk tonight, and if it's a no, cancel with one text.”",
        annotation: "Weak: total surrender; “call us whenever” converts near zero. Strong: recruits the spouse, arms the patient with the exact answers, closes on a cancellable process — the penciled slot gives the conversation a deadline and a default.",
      },
      {
        id: "spouse-2",
        title: "Decision-delay · “we make money decisions together”",
        patient: "“We have a rule — anything over $300, we decide together. It's not about you.”",
        weak: "“I get it, but honestly this is YOUR foot, and you're the one limping. Don't you think you can make this one call?”",
        strong: "“That's a good rule — keep it. My job is to make sure the conversation you two have tonight has real information in it. Here's the one-page summary: the finding, the plan, the price, and what happens if we wait. Want me to pencil Friday so there's a slot to say yes or no to?”",
        annotation: "Weak: attacks the couple's process — instant relationship damage. Strong: honors the rule explicitly, equips the conversation, and closes on process. The framework is Ally, never adversary.",
      },
      {
        id: "skeptic-1",
        title: "Skepticism · “does this even work?”",
        patient: "“Sound waves fixing a heel? Honestly, what's the success rate — is there even real evidence?”",
        weak: "“Oh, it definitely works, we've had amazing results. Patients love it. You'll do great.”",
        strong: "“Right question to ask. For chronic cases like yours the literature shows meaningful improvement in a majority — roughly [X]% [NEEDS SOURCE] — and the honest part: not everyone responds. What makes you a good candidate isn't the average, it's your scan: 6 millimeters of exactly the tissue pattern it treats. Does that answer it, or do you want to see a specific study?”",
        annotation: "Weak: certainty without evidence — the skeptic hears a salesman. Strong: acknowledge → real number with its ceiling → reframe to THIS patient's findings → re-ask with an evidence offer. Calibrated confidence is what convinces engineers.",
      },
      {
        id: "skeptic-2",
        title: "Skepticism · the burned patient",
        patient: "“The cortisone shot was supposed to work too. That's $300 I spent to feel good for six weeks.”",
        weak: "“Well, shots are kind of old technology at this point. This is totally different, trust me.”",
        strong: "“You're right to bring that up — and the six weeks it gave you is actually the diagnosis. The shot calmed inflammation; it never touched the tissue, so the pain came back. Shockwave targets the tissue itself, which is why the results hold instead of wearing off. Given that difference, worth doing it right this time?”",
        annotation: "Weak: “trust me” to a patient whose trust was just burned. Strong: validates the burn, converts the failure into evidence FOR the mechanism, re-asks. Their history is your strongest material.",
      },
      {
        id: "think-1",
        title: "“I'll think about it” · the fog",
        patient: "“You've given me a lot. Let me think about it and I'll call the office next week.”",
        weak: "“Absolutely, take all the time you need! Here's a brochure.”",
        strong: "“Of course — it's your call to make. So I can be useful: is it the money, whether it'll actually work, or just not wanting to decide on the spot? …The money — okay, then let's talk about that part directly, because that one I can actually help with.”",
        annotation: "Weak: accepts the fog and prescribes the parking-lot decision. Strong: acknowledge → the Real-Question isolation → route to the named framework. “Think about it” almost always dissolves into one of the other three types.",
      },
      {
        id: "think-2",
        title: "“I'll think about it” · fog that holds",
        patient: "“No, really — nothing specific. I just don't decide same-day. Ever. About anything.”",
        weak: "“I hear you, but the schedule is really filling up, and honestly this price might not hold next quarter…”",
        strong: "“That's a legitimate way to make decisions, and I won't argue with it. Two things so the thinking is easy: this summary sheet has the finding, the plan, and the price. And I'll pencil Thursday — if the answer is no, one text cancels it, zero hard feelings. Deal?”",
        annotation: "Weak: manufactured urgency against a stated decision style — an ethics violation the grader will cap. Strong: respects the style, equips it, and installs a low-pressure default. When the fog is genuinely the person, process beats persuasion.",
      },
    ],
    mistakes: [
      {
        wrong: "“We have payment plans!” (the instant any concern is voiced)",
        right: "“Fair question — if the cost weren't a factor at all, would you want to do this?”",
        note: "Answering “price” before isolating treats every objection as money; half the time it isn't.",
      },
      {
        wrong: "“You don't really need to ask your husband, do you? It's your foot.”",
        right: "“What's he going to ask you? Let's make sure you walk in with real answers.”",
        note: "Competing with the spouse loses even when you win the argument — recruit, never rival.",
      },
      {
        wrong: "“It works, period. I've seen it a hundred times.”",
        right: "“Most chronic cases like yours improve [NEEDS SOURCE for your figure] — not all, and here's why you're a strong candidate: your scan.”",
        note: "Unfalsifiable certainty converts believers only; calibrated numbers convert skeptics.",
      },
      {
        wrong: "“Before you go — what if I could knock ten percent off, today only?”",
        right: "“Then it's a no for now, and it's a good reason. Here's the trigger that should bring you back, and it's in your chart.”",
        note: "A discount fired at a departing patient confirms the price was fake AND pressures past a no — double violation.",
      },
      {
        wrong: "(After answering the objection well) “…so yeah. Anyway, any other questions?”",
        right: "“…so given that, let's get session one booked — do mornings or afternoons work better?”",
        note: "The loop's most-skipped step is the re-ask. An answered objection without a new ask just resets to silence.",
      },
    ],
    repCta: {
      stationSlug: "insurance-objection-shockwave",
      difficulty: "hard",
      label: "Face the insurance objection — isolate before you answer",
    },
    flags: [
      "Skepticism scripts use “[X]% [NEEDS SOURCE]” placeholders — insert your ESWT outcomes citation before shipping.",
      "Dialogue skeptic-1 references “the literature shows meaningful improvement in a majority” — verify against the ESWT evidence base you cite in clinic.",
    ],
  },

  /* ========================== Module 5 — Close ========================== */
  {
    moduleSlug: "close",
    specialty: "podiatry",
    objectives: [
      "Deliver all three closes verbatim: assumptive, alternative, summary.",
      "Match the close type to the patient's decision style (Decider, Deliberator, Overwhelmed).",
      "After a yes: speak only logistics — zero new clinical or selling content.",
      "After a no: chart the indication and set a concrete return trigger in one breath.",
    ],
    concept: [
      {
        id: "three-closes",
        title: "The three closes",
        body: "**Assumptive:** “Let's get session one on the books — I have Tuesday morning or Thursday afternoon.” The yes is treated as the visit's natural conclusion, because after a good presentation it is.\n\n**Alternative:** “Mornings or afternoons?” The decision shifts from *whether* to *which* — decision mercy for patients who want help deciding.\n\n**Summary:** recap the case, then ask directly. “6-millimeter fascia, eight months, shot wore off. Shockwave, three sessions, $600. From where I sit it's the right next step — shall we go ahead?” Hinting without ever asking is the one unforgivable close: the decision happens in the parking lot, where Google wins.",
      },
      {
        id: "match-patient",
        title: "Match the close to the person",
        body: "By close time you've watched ten minutes of their decision style.\n\n**Deciders** (quick answers, checks watch) want the assumptive — state the plan.\n\n**Deliberators** (asked for numbers twice, took notes) want the summary — assemble the case, then ask.\n\n**Overwhelmed** (“whatever you think, doc…”) want the alternative — shrink the decision to A-or-B. Handing them an open “what would you like to do?” is kind in tone and cruel in structure.",
      },
      {
        id: "after",
        title: "After yes. After no.",
        body: "**After yes: stop selling.** No new benefit, no statistic, and never “and if it doesn't work we can always…” — every post-yes sentence can only create doubt. The entire script is logistics: schedule, payment mechanics, see you Thursday. **A yes without a calendar slot is a maybe in costume.**\n\n**After no: grace, then the hinge.** Chart the indication, care inside the constraint, set the concrete trigger. Your last 30 seconds after a no are the first 30 seconds of the next visit.",
      },
    ],
    scripts: [
      {
        id: "close-bank",
        title: "Close bank",
        lines: [
          {
            line: "“Let's get your first session scheduled — do mornings or afternoons fit your shifts better?”",
            why: "Assumptive + alternative in one breath; the open question is merely which slot.",
          },
          {
            line: "“You wanted the numbers, so here's the whole case: [findings], [plan], [price], [odds with honest ceiling]. My recommendation is we start. Shall we?”",
            why: "The summary close is a direct question wearing the case as armor — built for deliberators.",
          },
          {
            line: "“The lab needs about [X] weeks on your trays — if we scan today, you're starting the case this month. Want to do the scan while you're here?”",
            why: "Dental aligner version: closes on the concrete next physical step, not an abstract yes.",
          },
        ],
      },
      {
        id: "after-yes",
        title: "After the yes",
        lines: [
          {
            line: "“Great decision. Front desk will get your card and your first slot on the way out — see you Tuesday.”",
            why: "Logistics only; the yes leaves the building wearing an appointment.",
          },
        ],
      },
      {
        id: "after-no",
        title: "After the no",
        lines: [
          {
            line: "“Then it's a no and that's okay — it's your call. I'm charting that it's indicated, the splint keeps you moving meanwhile, and the day a morning stops you at the bedroom door is the day you call.”",
            why: "Grace + chart + interim care + trigger in one breath — the complete after-no protocol.",
          },
        ],
      },
    ],
    dialogues: [],
    mistakes: [
      {
        wrong: "“So… yeah, that's the treatment. It's a really good option for you to think over. Any questions?”",
        right: "“My recommendation is we start. Tuesday morning or Thursday afternoon?”",
        note: "Hinting without asking caps the Close score at 5/20 — a close is a question, not a vibe.",
      },
      {
        wrong: "(Patient: “Okay, let's do it.”) “Fantastic! And even if it doesn't take, there's always the injection as a backup, and worst case surgery is pretty routine…”",
        right: "(Patient: “Okay, let's do it.”) “Great decision. Let's book session one before you head out.”",
        note: "Post-yes selling introduced failure scenarios she hadn't imagined — watch the yes wobble.",
      },
      {
        wrong: "(To an overwhelmed patient) “It's completely up to you! Take the brochure, have a think, no pressure at all.”",
        right: "“Let me make it simple: the plan is six sessions over three weeks. The only question for today — Tuesdays or Fridays?”",
        note: "Open decision space is the exact thing the overwhelmed patient came to you to escape.",
      },
    ],
    repCta: {
      stationSlug: "cash-nail-surgery-conversion",
      difficulty: "moderate",
      label: "Ask for the decision — then stop talking",
    },
    flags: [
      "Dental aligner close script (lab turnaround framing) is extrapolated — verify workflow accuracy.",
    ],
  },
];

export function getModuleDocFromCode(moduleSlug: string): ModuleDoc | null {
  return PODIATRY_MODULE_DOCS.find((d) => d.moduleSlug === moduleSlug) ?? null;
}

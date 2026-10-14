import type { ModuleDoc } from "../types";

/**
 * Derm module documents — the reading layer for the derm ladder. Lean v1:
 * every section is real content, sized to the 8-minute reading ceiling.
 * Flags collect lines awaiting the founder's clinical review.
 */
export const DERM_MODULE_DOCS: ModuleDoc[] = [
  {
    moduleSlug: "derm-mindset",
    specialty: "derm",
    objectives: [
      "Say why confidence is a legitimate clinical outcome without hedging.",
      "Name the line between ethical aesthetic selling and pressure.",
      "Replace manufactured urgency with the three kinds of honest urgency.",
    ],
    concept: [
      {
        id: "chosen-medicine",
        title: "Aesthetics is medicine someone chose",
        body: "Nobody needs their frown lines softened — and that's precisely why the selling must be cleaner than anywhere else in medicine. The patient is spending discretionary money on how they feel in photographs. **If you're embarrassed by that, they will be too, and embarrassed patients don't book.**\n\nThe mindset: confidence is the outcome you're prescribing. You're allowed to believe in it.",
      },
      {
        id: "honest-urgency",
        title: "Real urgency exists — use only that kind",
        body: "Fake scarcity ('today-only pricing') is a compliance flag in every rep you run here. But three honest urgencies are always available: **biology** (a series needs spacing; collagen takes months), **season** (lasers want low-sun months), and **events** (results need lead time before the wedding). Selling with the calendar's truth beats selling with a fake one — and it grades higher.",
      },
    ],
    scripts: [
      {
        id: "permission-lines",
        title: "Lines that give permission",
        lines: [
          { line: "Wanting to look the way you feel isn't vanity — it's the whole reason this field exists.", why: "Dissolves the patient's self-judgment without debating it." },
          { line: "My job isn't to talk you into anything. It's to show you what's possible and let you choose.", why: "States the ethics out loud; paradoxically increases closes." },
          { line: "If the timing's wrong, I'd rather you come back in spring than regret rushing a recovery.", why: "Demonstrates honest urgency thinking — and earns the return visit." },
        ],
      },
    ],
    dialogues: [
      {
        id: "vanity-apology",
        title: "The apologizing patient",
        patient: "This is so vain of me, I'm sorry — it's just lines, it's not like I'm sick.",
        weak: "Oh don't worry, everyone's doing it now! It's totally normal.",
        strong: "You don't owe anyone an apology for wanting to recognize yourself in photos. That's a real outcome and it's worth doing well — so let's look at what's actually bothering you.",
        annotation: "The weak reply normalizes by crowd ('everyone does it') which cheapens the choice. The strong reply legitimizes by principle and moves straight into discovery.",
      },
    ],
    mistakes: [
      { wrong: "Book today and I can hold this month's pricing.", right: "The series needs six weeks between sessions — starting this month means you're done before your reunion.", note: "Same urgency energy; one is fabricated, one is the calendar telling the truth." },
      { wrong: "It's basically a medical necessity when it affects your self-esteem.", right: "It's elective — and elective doesn't mean unimportant. You get to choose it because you want it.", note: "Dressing cosmetics in medical-necessity language is a compliance flag and insults the patient's intelligence." },
    ],
    repCta: { stationSlug: "derm-neuromodulators", difficulty: "easy", label: "Run your first derm rep" },
    flags: [],
  },
  {
    moduleSlug: "derm-rapport",
    specialty: "derm",
    objectives: [
      "Uncover the why-now (event, mirror moment, life change) before any product talk.",
      "Handle the post-weight-loss conversation without the meme label.",
      "Give first-timers — especially men — explicit permission.",
    ],
    concept: [
      {
        id: "why-now",
        title: "Every consult has a why-now",
        body: "Nobody books a cosmetic consult on a random Tuesday for no reason. There's a reunion, a divorce, a promotion, a photo they saw of themselves at a barbecue. **The why-now is the plan's foundation**: it sets the timeline, the budget seriousness, and what 'success' means to this specific person.\n\nAsk it plainly: 'What made today the day?' Then build everything on the answer.",
      },
      {
        id: "mirror-language",
        title: "Use their words, not the industry's",
        body: "Patients say 'tired', 'angry-looking', 'my mother's neck'. The industry says 'glabellar complex' and 'submental fullness'. **Mirror the patient.** When they hear their own words in your plan — 'this is the part that reads as tired' — they know you examined THEM, not a template.\n\nSpecial case: the GLP-1 patient. Name the mechanism (fat loss shows in faces), never the meme, unless they say it first.",
      },
    ],
    scripts: [
      {
        id: "discovery-openers",
        title: "Discovery questions that earn the consult",
        lines: [
          { line: "What made today the day you finally booked this?", why: "Surfaces the event and the emotional budget in one question." },
          { line: "When you look at photos of yourself, what's the first thing your eye goes to?", why: "Gets the real target — often different from the stated one." },
          { line: "If we did this well, what would be different for you in three months?", why: "Defines success in their terms; the close will reuse this verbatim." },
        ],
      },
    ],
    dialogues: [
      {
        id: "male-first-timer",
        title: "The embarrassed first-timer",
        patient: "My wife made this appointment. This probably sounds stupid, but I sweat through two shirts a day at work.",
        weak: "Not stupid at all! So, we have a full menu of treatments for men now.",
        strong: "That's not stupid — that's one of the most treatable problems that walks in here, and half the people we treat for it are men who waited years too long. Tell me about a normal workday.",
        annotation: "The weak reply hands him a menu — exactly the retail feeling he dreaded. The strong reply normalizes with specifics and goes straight to his life, not the catalog.",
      },
    ],
    mistakes: [
      { wrong: "Ozempic face — we see it constantly, it's a whole thing now.", right: "Significant weight loss shows up in the face — the volume that left is real, and it's restorable. You did the hard part.", note: "The meme label lands as mockery of their achievement. The mechanism lands as medicine." },
      { wrong: "What products are you interested in today?", right: "Before we talk options — what's the moment that made you book?", note: "Product-first discovery turns the consult into a store. Why-now-first turns it into a plan." },
    ],
    repCta: { stationSlug: "derm-medical-bridge", difficulty: "moderate", label: "Practice the gentlest discovery there is" },
    flags: [],
  },
  {
    moduleSlug: "derm-framing",
    specialty: "derm",
    objectives: [
      "State mechanism + timeline for each module in two plain sentences.",
      "Set downtime expectations the patient can calendar.",
      "Run mandatory screening out loud, before any close.",
    ],
    concept: [
      {
        id: "timeline-is-consent",
        title: "The timeline IS the consent",
        body: "Most aesthetic disappointment is a timeline nobody stated: toxin judged at day two, biostimulators judged at week one, a 'no-downtime' resurfacing that meant three red days. **If the patient can't repeat back when they'll see what, the education failed** — and the one-star review is already drafting itself.\n\nEvery module in this vertical has a timeline sentence. Say it, then ask them to say it back.",
      },
      {
        id: "screening-out-loud",
        title: "Screen out loud — it sells",
        body: "Pregnancy, Fitzpatrick type, isotretinoin history, cold sores, keloids, blood thinners: the screening list isn't bureaucracy, it's the moment the patient realizes this is medicine. **'No one's ever asked me that' is the sound of trust forming.**\n\nThe grading here treats skipped screening as a compliance violation — because in the real chair, it is one.",
      },
    ],
    scripts: [
      {
        id: "timeline-sentences",
        title: "Timeline sentences, by module",
        lines: [
          { line: "Toxin: starts in about five days, settled at two weeks, lasts three to four months.", why: "Three numbers, zero ambiguity, kills the day-two panic call." },
          { line: "Biostimulators: nothing dramatic this month — your own collagen builds it over two to three months, and that's the point.", why: "Pre-frames the delay as the feature it is." },
          { line: "RF microneedling: red and dotted for a day or three, makeup from day two, the real result at month three.", why: "Downtime they can put in a calendar." },
        ],
      },
    ],
    dialogues: [
      {
        id: "screening-moment",
        title: "Screening as trust-builder",
        patient: "Can we just do it today? I'm ready, I don't need the whole speech.",
        weak: "Love the enthusiasm! Let's get you numbed up.",
        strong: "I love the enthusiasm — and you still get ninety seconds of questions, because you're my patient before you're my appointment. Any chance of pregnancy? Any reaction to these products before?",
        annotation: "The weak reply trades safety for momentum — a compliance flag and malpractice bait. The strong reply keeps the energy AND the standard; patients consistently rate it as care, not friction.",
      },
    ],
    mistakes: [
      { wrong: "There's really no downtime to speak of.", right: "You'll be red with pinpoint marks for a day or two — most people wear makeup from day two. Let's pick a quiet week.", note: "'No downtime' is the most-broken promise in aesthetics. Calendar-ready honesty prevents the angry Thursday call." },
      { wrong: "You're healthy, we can skip the questionnaire.", right: "Quick screening first — it's ninety seconds and it's for you, not the file.", note: "Skipped screening is scored as a violation, because that's what it is." },
    ],
    repCta: { stationSlug: "derm-ipl-bbl", difficulty: "moderate", label: "Run the station where screening IS the sale" },
    flags: ["Timeline sentences state onset/duration figures — confirm against product labeling you use in-clinic."],
  },
  {
    moduleSlug: "derm-price",
    specialty: "derm",
    objectives: [
      "Present a combination plan with one clear total.",
      "Hold the silence after a four-figure number.",
      "Present financing total-first with real terms.",
    ],
    concept: [
      {
        id: "plan-not-items",
        title: "Sell the plan, price the plan",
        body: "A consult that surfaced three concerns and closes on one syringe is a failed consult dressed as a modest one. **The combination plan — staged across months, priced as a whole — is both the better medicine and the better business.** Staging makes it buyable: phase one today, the map on paper, the total known.\n\nThe grader caps Plan & Packages when the consult surfaced more than was planned for.",
      },
      {
        id: "four-figure-silence",
        title: "The four-figure silence",
        body: "At $600 the silence after the number lasts a beat; at $3,300 it can last five full seconds, and every one of them will beg you to apologize, justify, or discount. **Don't.** State the total with what it includes, then let the silence belong to them.\n\nWhoever speaks first isn't 'losing' — but if it's you, it had better be the package math, not an apology.",
      },
    ],
    scripts: [
      {
        id: "plan-pricing",
        title: "Plan pricing lines",
        lines: [
          { line: "The whole plan — series, your two-week checks, and the regimen — is $3,300. Phase one today is $1,200.", why: "Total first, inclusions in the same breath, staged entry point ready." },
          { line: "As a member that same plan runs $2,970, and your products are 10% off for the year.", why: "Membership presented as math, not as a pitch." },
          { line: "Financing approves in minutes; it's interest-free only if cleared inside the window, real interest after — I'll show you both numbers.", why: "The deferred-interest trap named before they ask — the compliance-clean version." },
        ],
      },
    ],
    dialogues: [
      {
        id: "silence-test",
        title: "Holding the number",
        patient: "(long exhale) Thirty-three hundred. Wow. Okay. Wow.",
        weak: "I know it's a lot — honestly we could skip the third session if budget's tight, or I could ask about a discount...",
        strong: "(waits) It's a real investment. If it helps to see it differently: per month over the year it works, it's less than the gym you mentioned. Want the staged version or the series?",
        annotation: "The weak reply dismantles its own plan at the first exhale. The strong reply honors the silence, reframes once with THEIR detail, and offers two forward paths.",
      },
    ],
    mistakes: [
      { wrong: "It's $120 a month, barely anything!", right: "The plan is $3,300 total. Monthly paths exist — here's what each really costs.", note: "Monthly-first framing that hides the total is a compliance flag here and a refund fight later." },
      { wrong: "I know it's expensive, I'm sorry — we're not the cheapest.", right: "The plan is $3,300, and here's everything that includes.", note: "Apologizing for the price tells the patient YOU wouldn't pay it." },
    ],
    repCta: { stationSlug: "derm-financing", difficulty: "moderate", label: "Drill the money conversation itself" },
    flags: [],
  },
  {
    moduleSlug: "derm-objections",
    specialty: "derm",
    objectives: [
      "Answer the Groupon comparison without matching or mocking.",
      "Arm the talk-to-my-spouse conversation instead of fighting it.",
      "Convert safety-story fear with protocol, not reassurance.",
    ],
    concept: [
      {
        id: "acknowledge-clarify-reframe",
        title: "Acknowledge → clarify → reframe on value",
        body: "Every derm objection is one of three things wearing a costume: a price comparison missing context, a fear missing a protocol, or a decision missing a stakeholder. **Clarify which one you're actually holding before answering** — the isolate question ('is it the number, or whether it works?') does that in one line.\n\nThen reframe on value and re-ask. Caving, matching, and over-explaining all read as doubt.",
      },
      {
        id: "fear-wants-protocol",
        title: "Fear wants protocol, not reassurance",
        body: "'My friend got a droopy eyelid.' 'My cousin got burned.' The weak answer is 'that won't happen here' — unprovable and graded as risk-minimization. **The strong answer agrees the risk is real, then walks the named protocol that manages it**: typing, settings, prophylaxis, reversal agents, follow-up. Protocol converts the burned-before patient into your most loyal one.",
      },
    ],
    scripts: [
      {
        id: "objection-plays",
        title: "The three costume-removals",
        lines: [
          { line: "If the price were identical everywhere, where would you want this done?", why: "Strips the comparison costume off a trust question." },
          { line: "Is it the risk itself, or that nobody's ever explained how it's managed?", why: "Converts fear into a protocol conversation you can win." },
          { line: "What would your husband need to see to feel as good about this as you do?", why: "Makes you the spouse-conversation's ally and arms it concretely." },
        ],
      },
    ],
    dialogues: [
      {
        id: "groupon",
        title: "The voucher on the phone",
        patient: "Six sessions, ninety-nine dollars. It's on my screen right now. You're literally ten times more.",
        weak: "Those places are dangerous, honestly. You get what you pay for.",
        strong: "That voucher exists because underpowered settings can't hurt anyone — or finish anything. Six gentle passes that can't kill a follicle cost $99 and a year of your time. Mine cost more because they end the project. Which project do you want to buy?",
        annotation: "The weak reply trash-talks (graded down, and the patient has friends who used the voucher). The strong reply explains the mechanism of cheap and re-asks as a choice.",
      },
    ],
    mistakes: [
      { wrong: "Okay, okay — I can do $10 a unit for your first visit.", right: "Our rate stands — let me show you exactly what it buys that the $9 clinic can't.", note: "Matching converts you into a commodity and caps the price score. Value or nothing." },
      { wrong: "Your husband doesn't have to live in your face — it's your call.", right: "Totally fair to want him on board. Take the plan home, and let's pencil Thursday so you have a date to decide around.", note: "Fighting the stakeholder is both a compliance flag (pressure) and a guaranteed no." },
    ],
    repCta: { stationSlug: "derm-laser-hair-removal", difficulty: "hard", label: "Face the Groupon caller live" },
    flags: [],
  },
  {
    moduleSlug: "derm-close",
    specialty: "derm",
    objectives: [
      "Close with two forward paths (full plan vs staged entry).",
      "Book the next visit and name the regimen inside the close itself.",
      "Earn the review ask — after expressed satisfaction only.",
    ],
    concept: [
      {
        id: "two-part-close",
        title: "The derm close has two halves",
        body: "Half one is today's yes. Half two is the architecture of retention: **the two-week check, the maintenance cadence on the calendar, the regimen in the bag.** This vertical's economics live in half two — a practice of one-time toxin visits is a leaky bucket with good reviews.\n\nThe grader scores them together: a booking with no rebooking caps Close & Rebooking at 14/20.",
      },
      {
        id: "earned-review",
        title: "The earned review",
        body: "Reviews are the vertical's currency, and the clean way to earn them is sequence: result → patient says they're happy → plain ask, no incentive, no script. **An incentivized or premature ask is a compliance flag** — and reads as needy besides. The two-week check exists partly because it's where happiness gets said out loud.",
      },
    ],
    scripts: [
      {
        id: "closing-lines",
        title: "Closes that carry the second half",
        lines: [
          { line: "Full series, or phase one and judge at your two-week check — which way do you want to start?", why: "Two real paths, both forward; autonomy intact." },
          { line: "Before you're out the door: two-week check and your March maintenance — mornings or afternoons?", why: "Retention booked inside the goodbye, not left to a future phone call." },
          { line: "You just said you love it — if you ever felt like putting that in a review, it means everything to a practice our size. Zero pressure.", why: "Earned, plain, incentive-free: the compliant ask." },
        ],
      },
    ],
    dialogues: [
      {
        id: "passive-yes",
        title: "The agreeable patient who books nothing",
        patient: "This all sounds great, honestly. You've been so helpful. I'll definitely be back!",
        weak: "Wonderful! Here's my card — call us whenever you're ready.",
        strong: "Then let's make 'back' a date instead of a plan — I have Tuesday at 2 or Thursday at 10 for your first session, and we'll set the two-week check at the same time. Which one's yours?",
        annotation: "'I'll be back' plus a business card is where consults go to die. The strong close converts goodwill into calendar while it's warm.",
      },
    ],
    mistakes: [
      { wrong: "Leave us five stars and get 10% off your next visit!", right: "If you're as happy at your check as you are now, a review would genuinely help us — only if you feel like it.", note: "Incentivized reviews violate platform rules and this program's compliance axis in one move." },
      { wrong: "Call us when you're ready for the next one.", right: "Your toxin runs out in March — let's give March a date now; moving it later is one text.", note: "Rebooking deferred is rebooking lost; make the calendar the default and moving it the exception." },
    ],
    repCta: { stationSlug: "derm-followup-convert", difficulty: "moderate", label: "Run the follow-up where retention is won" },
    flags: [],
  },

];

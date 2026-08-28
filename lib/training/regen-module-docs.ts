import type { ModuleDoc } from "../types";

/**
 * Regenerative-medicine module documents — same standardized schema and the
 * same section ids as podiatry (recommendSection deep links share ids), new
 * teaching content. Two modules are rewritten rather than reskinned:
 * Clinical Framing (the consequence step carries a heavier, more easily
 * overstated claim) and Price Delivery (the four-figure silence).
 *
 * Editorial rules carried over: no invented outcomes data ([NEEDS SOURCE]
 * placeholders, listed in flags); every technique framed around honesty and
 * informed consent — in this specialty that framing IS the sales strategy.
 */

export const REGEN_MODULE_DOCS: ModuleDoc[] = [
  /* ========================= Module 0 — Mindset ========================= */
  {
    moduleSlug: "regen-mindset",
    specialty: "regen",
    objectives: [
      "State why honesty outperforms hype with patients who have already read the warning letters.",
      "Apply the written-read-back test to any claim before you say it out loud.",
      "Name the three things an ethical regen close requires (physician-cleared indication, informed patient, direct ask).",
      "Explain why the distressed-family conversation has a lower ceiling than every other consult.",
    ],
    concept: [
      {
        id: "honesty-advantage",
        title: "Honesty is the differentiator",
        body: "Your patient has already googled it. They know clinics have been fined, they know the products aren't FDA-approved drugs, and they arrived braced for a pitch. **In this specialty, candor is the scarcest thing on the market** — every competitor is selling certainty, so the provider who says \"I can't promise you a result, and here's exactly what I can tell you\" is instantly the most credible voice they've heard.\n\nThis isn't ethics at the expense of revenue. The burned back-pain patient, the FDA-question patient, the 2am family caller — none of them close on enthusiasm. They close on the first honest sentence.",
      },
      {
        id: "read-back-test",
        title: "The written-read-back test",
        body: "Before any claim leaves your mouth, ask: **would this sentence survive being read back to me in writing, by a regulator, with the patient's outcome unknown?**\n\n\"This will fix your knee\" dies on paper. \"It's basically FDA approved\" dies on paper. \"85% of our patients improve\" dies unless you can produce the study. What survives: the chart findings, the used-up treatment ladder, the honest goal (pain and function), the physician's oversight, and a direct ask. Everything this app grades as excellent survives the read-back — that is not a coincidence.",
      },
      {
        id: "ethics-line",
        title: "The line, and the family caller",
        body: "An ethical regen close requires three things: **a physician-cleared indication, an informed patient, and a direct ask.** Miss any one and it isn't case acceptance, it's extraction.\n\nOne conversation has a hard ceiling: the distressed family member asking about a serious neurological condition. There is no honest version of \"this may bring her arm back.\" The only thing truthfully on sale is the evaluation — candidacy not guaranteed, no outcome promised, rehab continues regardless. **A family closed on hope was closed dishonestly**, and the examiner in this app treats it as the worst possible failure.",
      },
    ],
    scripts: [
      {
        id: "recommendation-voice",
        title: "The honest recommendation voice",
        lines: [
          {
            line: "Based on your X-ray and everything you've already tried, my recommendation is the knee protocol. I want to be straight about what it targets: pain and function — not regrowing cartilage.",
            why: "Recommendation plus an unprompted honesty concession — the pairing that defines this specialty's best consults.",
          },
          {
            line: "I can't promise you a result, and I'd want you to walk out of any clinic that does.",
            why: "Turns the compliance rule into the trust play. Patients quote this line to their spouses.",
          },
          {
            line: "The doctor reviews every case before anything is ordered — and sometimes the answer is no. That's a feature of how this works, not a delay.",
            why: "Physician deferral, framed as protection. It also makes acceptance feel earned rather than sold.",
          },
        ],
      },
    ],
    dialogues: [
      {
        id: "hype-vs-honest",
        title: "The skeptic hears both versions",
        patient: "I'll be honest, I've watched a lot of videos about this stuff and half of it looks like a scam.",
        weak: "Oh, those places give the whole field a bad name — what WE do is completely different, it's the real deal, our patients get amazing results.",
        strong: "Half of it? Honestly, you might be being generous. There are bad actors in this industry, which is exactly why everything I tell you today will be specific to your chart, and nothing I say will come with a guarantee. Fair?",
        annotation: "The weak line is the same music every scam plays — 'we're the real ones.' The strong line agrees with the patient's research, then differentiates by behavior instead of assertion.",
      },
    ],
    mistakes: [
      {
        wrong: "\"Look, I've seen this change lives. I believe in it completely.\"",
        right: "\"Here's what your imaging shows, here's what the honest evidence looks like, and here's what I'd realistically expect — you decide.\"",
        note: "Personal testimony is the currency of the clinics that got warning letters. Findings and candor are yours.",
      },
      {
        wrong: "Hedging the indication because the service is cash-pay: \"I mean, it's an option, if you're interested...\"",
        right: "\"If insurance covered this tomorrow, I'd recommend it to you in exactly these words.\"",
        note: "The transplant test. If the physician cleared the indication, mumbling the recommendation serves nobody.",
      },
      {
        wrong: "Softening \"no promises\" into vagueness: \"results vary, everyone's different...\"",
        right: "\"No guarantee — and let's define together what success would look like at 12 weeks, in writing.\"",
        note: "'Results vary' is a shrug. Concrete written expectations are honesty with a spine.",
      },
    ],
    repCta: { stationSlug: "regen-knee-single", difficulty: "easy", label: "Run the knee consult with the honesty advantage" },
    flags: [],
  },

  /* ========================= Module 1 — Rapport ========================= */
  {
    moduleSlug: "regen-rapport",
    specialty: "regen",
    objectives: [
      "Open a consult with a patient who has been pitched before — and prove you heard their history before you frame anything.",
      "Run the 70/30 rule: their story, their research, their real fear before your recommendation.",
      "Distinguish hesitation from objection in a high-stakes cash decision.",
      "Take a patient's internet research seriously without surrendering the clinical frame.",
    ],
    concept: [
      {
        id: "seventy-thirty",
        title: "The 70/30 rule",
        body: "The patient talks 70%. Your 30% is questions, reflections, and — late — the plan. In regen this rule earns its keep twice over, because what you need to learn is invisible on the chart: **which clinic burned them before, what their 2am research told them, who at home has veto power, and what they're actually afraid of** (the money, the needle, or being made a fool of).\n\nThe consult that opens with a product pitch loses the burned patient in ninety seconds. The consult that opens with \"walk me through everything you've already tried\" finds out what the pitch would have crashed into.",
      },
      {
        id: "reflect-then-add",
        title: "Reflect, then add",
        body: "Reflection is proof of listening; generic empathy is proof of a script. \"I understand\" is worth nothing. **\"Two rounds of epidurals, a fusion consult you walked out of — you've done everything they asked and you're still in pain\"** is worth the whole first half of the visit.\n\nThe pattern: reflect their exact words, then add one thing they didn't say — the pattern you see in it. \"You said the cortisone worked twice and then stopped. That trajectory — relief that shortens each time — is actually the textbook story of the tendon itself getting worse while we treat the inflammation around it.\" Reflection buys trust; the addition buys authority.",
      },
      {
        id: "hesitation-vs-objection",
        title: "Hesitation vs. objection",
        body: "At four figures, silence is not resistance — it's arithmetic. A patient staring at the floor after the number is dividing it by paychecks. **Interrupting that math with reassurance converts a thinking patient into a doubting one.**\n\nAn objection has content (\"my ortho says it's a scam\"); hesitation has none (\"hm... okay... wow\"). Objections get the loop — acknowledge, isolate, reframe, re-ask. Hesitation gets space, then ONE gentle question: \"what's going through your head?\" Learn the difference and half your 'objections' disappear, because they were never objections at all.",
      },
    ],
    scripts: [
      {
        id: "openers",
        title: "Openers for the researched patient",
        lines: [
          {
            line: "Before I say anything about what we do here — walk me through everything you've already tried for this knee, from the beginning.",
            why: "Hands them the floor and surfaces the failed ladder you'll frame with later.",
          },
          {
            line: "You mentioned reading up on this. What did you find that worried you? Let's start there.",
            why: "Most providers dodge the research. Inviting it converts their homework from ambush into agenda.",
          },
          {
            line: "So the honest version of why you're here — is it the pain, or what the pain is taking from you? What did you stop doing?",
            why: "The functional loss (golf, sleep, the dog) is what four figures gets weighed against — let them name it.",
          },
        ],
      },
    ],
    dialogues: [
      {
        id: "burned-before",
        title: "The patient who's been pitched",
        patient: "No offense, but the last place I went started talking payment plans before they even looked at my MRI.",
        weak: "Well, we're not like that here — we're very patient-focused. So, as far as the protocol goes...",
        strong: "That's genuinely bad medicine, and you were right to walk. So let's do it in the opposite order: MRI first, everything you've tried, what your goals are — and price only once a recommendation actually makes sense. Deal?",
        annotation: "The weak line claims to be different and then does the same thing. The strong line commits to observable behavior — order of operations — and lets the patient hold them to it.",
      },
    ],
    mistakes: [
      {
        wrong: "Answering internet research with \"don't believe everything you read online.\"",
        right: "\"Some of what's out there is right — there ARE clinics to avoid. Tell me what you found and I'll tell you where we sit on each piece.\"",
        note: "Their research includes real warning letters. Dismissing it dismisses the truth, and they know it.",
      },
      {
        wrong: "Filling the post-price silence with reassurance.",
        right: "Hold it. Then: \"what's going through your head?\"",
        note: "Silence at four figures is math, not doubt — until you interrupt it, at which point it becomes doubt.",
      },
      {
        wrong: "Front-loading the science lecture — exosomes, MSC counts, viability percentages — in the first five minutes.",
        right: "Their story first. The science arrives later, attached to THEIR findings, in one plain-English sentence at a time.",
        note: "An early jargon wall reads as a sales script with footnotes. The 70/30 rule exists precisely for this specialty.",
      },
    ],
    repCta: { stationSlug: "regen-low-back", difficulty: "moderate", label: "Open the been-everywhere back consult" },
    flags: [],
  },

  /* ===================== Module 2 — Clinical Framing ===================== */
  {
    moduleSlug: "regen-framing",
    specialty: "regen",
    objectives: [
      "Run Diagnose → Consequence → Recommendation → Price on a degenerative joint without overstating a single link.",
      "Deliver the heavy consequence — 'this keeps degrading, replacement is the next stop' — as trajectory, never as a threat with a date on it.",
      "State what a biologic honestly targets (pain and function) and what it does not do (regrow, reverse, cure).",
      "Use the failed-treatment ladder as findings that make the recommendation logical.",
    ],
    concept: [
      {
        id: "sequence",
        title: "The 4-beat sequence",
        body: "Diagnose → Consequence → Recommendation → Price. Each beat earns the next; a price with no diagnosis attached can only be judged as an expense.\n\nIn regen the beats carry more weight than anywhere else. The diagnosis is a joint on a one-way trajectory. The consequence is surgery. The recommendation is a product the FDA hasn't approved for it. The price is four figures, cash. **Every one of those is true, and every one of them is one adjective away from being a violation.** This module is about walking the sequence at full strength without crossing that line — because the true version, delivered plainly, is already the most persuasive thing you can say.",
      },
      {
        id: "this-patient",
        title: "THIS patient's findings",
        body: "Generic framing (\"this works well for knees like yours\") is what every competitor says. Specific framing is unanswerable: **\"KL grade 3 on the standing film, medial compartment, after two hyaluronic acid series and a full PT course — that's a used-up conservative ladder.\"**\n\nThe failed history is not an embarrassment to skip past; it is the frame itself. Each failed rung is a finding: the cortisone that stopped working is evidence the problem outgrew inflammation management. In regen, where the price only makes sense at the top of a used-up ladder, the history IS the case. Recite it back before you recommend anything, and the recommendation arrives pre-justified.",
      },
      {
        id: "weather-report",
        title: "Consequence without fear — the heavy claim",
        body: "The consequence step in this specialty is usually some version of **\"this joint keeps degrading, and replacement is the next stop.\"** That is a heavier claim than a heel spur's, and far easier to overstate into malpractice-by-adjective.\n\nThe discipline is the weather report: forecast, no drama, no invented dates. Chartable: \"Grade 3 changes don't reverse. The realistic path from here is symptom management until replacement — the open question is how wide we can make that window.\" NOT chartable: \"you'll need a replacement within two years\" (you don't know that), \"cartilage is dying every month you wait\" (invented urgency), \"you're headed for a wheelchair\" (fear). **If the chart can't testify to it, don't say it.** The honest forecast is heavy enough to move anyone it should move — that's the point of only treating patients it's true for.",
      },
      {
        id: "honest-target",
        title: "What it does — said honestly",
        body: "The single most-flagged sentence in this industry is some version of \"it regrows the cartilage.\" The honest version is also the more clinically useful one: **\"the goal is pain and function — a knee that hurts less and does more. It won't rebuild what's gone.\"**\n\nPatients don't live in their imaging; they live in their function. Sold honestly, the offer is: an attempt to widen the window before surgery, measured by how the joint feels and performs at 12 weeks, with written expectations and a physician who can still say no. That survives the read-back test, matches what the patient actually wants, and — not incidentally — is the version the examiner scores 17–20.",
      },
    ],
    scripts: [
      {
        id: "framing-lines",
        title: "The sequence, line by line",
        lines: [
          {
            line: "Your standing X-ray shows grade 3 narrowing in the medial compartment — that's the inside half of the knee carrying bone-on-bone load. It matches exactly where you point when it hurts.",
            why: "Diagnosis tied to their own finger. Imaging plus lived symptom is the most credible pairing available.",
          },
          {
            line: "Here's the honest trajectory: grade 3 doesn't reverse. Managed conservatively from here, the realistic path is symptom control until a replacement makes sense. The question on the table is whether we try to widen that window first.",
            why: "The heavy consequence at full strength — trajectory, no date, no drama, and it sets up the recommendation as the answer to a question the patient now owns.",
          },
          {
            line: "The protocol won't regrow cartilage — I want that said plainly. What it targets is pain and function: a knee that hurts less and does more, and we'll define what that means for you in writing before you commit.",
            why: "The unprompted concession IS the differentiation. Written expectations turn honesty into structure.",
          },
          {
            line: "You've already done the cheaper rungs — PT, two HA series, the NSAIDs. Those weren't wasted; they're how we know this is the next honest step and not the first resort.",
            why: "Reframes the failed ladder from sunk cost into diagnostic evidence.",
          },
        ],
      },
    ],
    dialogues: [
      {
        id: "ortho-said-replacement",
        title: "\"My ortho said replacement\"",
        patient: "The orthopedist told me it's bone on bone and I should start planning for a replacement. So what's an injection going to do?",
        weak: "Orthopedists always jump to surgery — that's what they do. This can help you avoid all that.",
        strong: "He's reading the same X-ray I am, and replacement probably is where this ends eventually — he's not wrong. The question he wasn't offering an answer to is what you do with the years between now and then. That window is what this protocol is for, and if it doesn't widen it, replacement is right there where he said it was.",
        annotation: "The weak line picks a fight with the patient's other doctor and implies avoidance the chart can't promise. The strong line agrees with the surgeon, frames the protocol as sequencing, and keeps every claim inside the chart.",
      },
      {
        id: "consequence-overreach",
        title: "The consequence, overcooked vs. honest",
        patient: "What happens if I just... don't do anything? It only really hurts on stairs.",
        weak: "Honestly? Every month you wait, you're losing cartilage you will never get back. I've seen knees like yours become wheelchair knees in three years.",
        strong: "Truthfully — nothing dramatic happens this month or next. The pattern with grade 3 is a slow ratchet: more days like your bad days, activities quietly dropping off the list, until replacement stops feeling optional. If you want to wait and watch it, that's a legitimate choice — let's just decide what we're watching for.",
        annotation: "The weak line invents a timeline and a wheelchair. The strong line is a weather report that respects the patient's agency — and note that offering 'wait and watch' honestly makes the eventual yes cleaner, not rarer.",
      },
    ],
    mistakes: [
      {
        wrong: "\"This regenerates the joint at the cellular level.\"",
        right: "\"The honest goal is pain and function — it won't rebuild lost cartilage.\"",
        note: "Regrow/reverse/regenerate claims are the industry's signature violation and this app's hardest framing cap.",
      },
      {
        wrong: "\"If you don't do this soon, you'll need a replacement within two years.\"",
        right: "\"Grade 3 doesn't reverse — the realistic path is managing symptoms until replacement. How wide we can make that window is the open question.\"",
        note: "No chart supports a countdown. Trajectory without a date is just as motivating and entirely defensible.",
      },
      {
        wrong: "Skipping the failed-treatment history because it feels negative.",
        right: "Recite the ladder back — PT, injections, the consult — as the findings that make this the logical next step.",
        note: "Without the used-up ladder, a $4,500 injection is an impulse buy. With it, it's the obvious rung.",
      },
      {
        wrong: "Borrowing the supplier's lab numbers as clinical promises (\"25 million cells, 95% viability — that's why it works\").",
        right: "\"The product is lot-tested — sterility, cell counts, viability. That tells you what's in the vial, not what it will do for your knee. For that, here's the honest evidence picture...\"",
        note: "Quality-control specs describe the material, not outcomes. Conflating them is subtle overclaim and the examiner reads it as such.",
      },
    ],
    repCta: { stationSlug: "regen-knee-single", difficulty: "moderate", label: "Frame the bone-on-bone knee honestly" },
    flags: [],
  },

  /* ====================== Module 3 — Price Delivery ====================== */
  {
    moduleSlug: "regen-price",
    specialty: "regen",
    objectives: [
      "Deliver a four-figure number in one breath — what it is, what it includes, the number, stop.",
      "Hold the longer, heavier silence that follows $4,000 the way you'd hold it after $600.",
      "Anchor honestly: real single-session prices and real cost-of-alternative math only.",
      "Answer 'why doesn't insurance cover it' without apologizing for the model.",
    ],
    concept: [
      {
        id: "plain-delivery",
        title: "Say it like a diagnosis",
        body: "You don't flinch delivering an A1c. The number gets the same voice: **\"The knee protocol — the guided injection, labs, and both follow-up visits — is $4,500.\"** Flat, complete, done.\n\nNaming what the number covers in the same breath is delivery, not justification. The failure modes all live AFTER the number: the apology (\"I know it's a lot\"), the ramble (\"...and honestly when you think about what a replacement costs...\"), the pre-emptive rescue (\"...but we do have financing!\"). Every syllable past the number is heard as doubt. At this price point there is no such thing as a throwaway syllable.",
      },
      {
        id: "silence",
        title: "The four-figure silence",
        body: "After $600, patients pause. After $4,500, they go QUIET — five, eight, ten seconds of visible arithmetic. **This silence is the entire module.**\n\nEverything in you will want to rescue it. The rescue is the mistake: an unprompted payment plan says the number was negotiable; a repeated benefit says you're nervous; an apology says even you think it's too much. The patient wasn't objecting — they were dividing by paychecks — and your rescue hands them a doubt they didn't have.\n\nHold it. Breathe. Their next words tell you which conversation you're in: a logistics question (\"how soon could we do it?\") is a buying signal; a content objection gets the loop; more silence gets one calm question — \"what's going through your head?\" **Whoever speaks first buys the frame. Make sure it isn't you.**",
      },
      {
        id: "anchors",
        title: "Anchoring honestly",
        body: "Honest anchors exist; use only those. A real single-session price (\"one IV session is $650; the annual protocol is $2,400 with both biomarker panels\") is honest arithmetic. The genuine cost of the alternative — a replacement's deductible, the recovery weeks off work, another year of managing symptoms — is honest context, stated as context and not as a scare.\n\nOff-limits: invented was-prices (\"normally $6,000\"), a fake discount for deciding today, and competitor trash-talk. **In a specialty where the patient suspects a hustle, a fake anchor confirms the hustle.** And 'insurance doesn't cover it' has an honest one-liner too: payers class these products as investigational — that's the actual reason, say it plainly and move on. Apologizing for the model reads as agreeing with the objection.",
      },
    ],
    scripts: [
      {
        id: "price-lines",
        title: "The number, said right",
        lines: [
          {
            line: "The knee protocol — the guided injection, the labs, and both follow-up visits — is $4,500.",
            why: "One breath: contents then number then stop. The template for every price in the roster.",
          },
          {
            line: "[After the silence, if it stretches] What's going through your head?",
            why: "The only acceptable rescue: a question that hands them the floor instead of a doubt.",
          },
          {
            line: "Insurance classes these products as investigational, so it's cash — that's the straight answer. The number is the number: $4,500, and I'd rather tell you plainly than dress it up.",
            why: "The insurance answer without apology, resolving into a re-statement instead of a justification spiral.",
          },
          {
            line: "A single session is $650 if you want to try the water. The annual protocol is $2,400 — four sessions plus both biomarker panels, which is where you actually see whether anything moved.",
            why: "A real anchor doing honest work: the program priced against a true alternative, with the reason the program exists attached.",
          },
        ],
      },
    ],
    dialogues: [
      {
        id: "the-silence",
        title: "Eight seconds of silence",
        patient: "(after hearing $4,500) ... okay. Wow. Um.",
        weak: "I know, I know it's a big number — but we do have financing, most people do six months interest-free, and honestly compared to what a knee replacement runs...",
        strong: "(waits) ... (patient finally: 'That's just a lot of money.') It is. Real money for a real decision — so let's make sure it's the right one. If the cost weren't part of the picture, is this what you'd want to do?",
        annotation: "The weak response rescues a silence nobody asked it to rescue — three doubts delivered in one breath. The strong response holds, lets the patient name the concern, validates it in five words, and isolates. Financing exists — it arrives WHEN ASKED, never as a flinch.",
      },
      {
        id: "cheaper-elsewhere",
        title: "\"The place across town is $2,900\"",
        patient: "I called around. There's a clinic quoting $2,900 for the same shot. Why are you sixteen hundred more?",
        weak: "Well, you get what you pay for — I'd be careful with those discount places, honestly.",
        strong: "Fair question, and I won't guess at what they're offering. Here's what $4,500 is here: ultrasound guidance on the injection, pre-procedure labs, the physician's case review, and two follow-ups where we measure whether it worked. If what they quoted covers all of that, that's a real option to weigh. What I'd ask anywhere — including here — is: what exactly is in the number?",
        annotation: "The weak line trash-talks blind, which sounds like fear. The strong line itemizes without disparaging, then arms the patient with the one question that favors whoever has the most honest answer.",
      },
    ],
    mistakes: [
      {
        wrong: "\"It's, um, $4,500... but honestly for everything you're getting it's really quite reasonable...\"",
        right: "\"The protocol — injection, labs, both follow-ups — is $4,500.\"",
        note: "The justification tail converts a fact into a plea. Contents-then-number-then-stop.",
      },
      {
        wrong: "Breaking the silence with an unprompted payment plan.",
        right: "Hold it. Financing is an answer to a question, offered when asked.",
        note: "Volunteered financing says the sticker was fake. Requested financing says the clinic is flexible. Same fact, opposite meanings.",
      },
      {
        wrong: "\"Normally this runs $6,000, but we're at $4,500 right now.\"",
        right: "One true number, every day, for everyone — anchored only against real alternatives (the single session, the replacement's true costs).",
        note: "A fake was-price is a compliance flag and, to a suspicious patient, confirmation of the hustle.",
      },
      {
        wrong: "Apologizing for the cash-pay model: \"yeah, it's frustrating, insurance really should cover this...\"",
        right: "\"Payers class it as investigational — that's the honest reason it's cash. The number is $4,500.\"",
        note: "Agreeing that the model is unfair recruits you onto the objection's side of the table.",
      },
    ],
    repCta: { stationSlug: "regen-knee-single", difficulty: "hard", label: "Deliver $4,500 and hold the silence" },
    flags: [],
  },

  /* ==================== Module 4 — Objection Handling ==================== */
  {
    moduleSlug: "regen-objections",
    specialty: "regen",
    objectives: [
      "Run acknowledge → isolate → reframe → re-ask on the objections this specialty actually gets.",
      "Answer 'is it FDA approved?' starting with the word no — and make the honesty itself the close.",
      "Handle competing authority ('my ortho says it's a scam') without disparaging anyone.",
      "Refuse guarantees in a way that raises trust instead of ending the conversation.",
    ],
    concept: [
      {
        id: "loop",
        title: "The four-step loop",
        body: "Acknowledge → isolate → reframe → re-ask. The loop is the same as every specialty; what changes here is what's underneath. **Beneath most regen objections — FDA, evidence, price, 'my doctor said' — sits one real question: \"can I trust you not to be one of the clinics I read about?\"**\n\nThat's why isolation matters more here than anywhere: \"if the evidence question were settled for you, is this what you'd want to do?\" separates the patients who need one honest answer from the ones whose real objection is the money, or the spouse, or the fear of being fooled. Answer the surface objection without isolating and a fresh one appears every ninety seconds, forever.",
      },
      {
        id: "honest-concessions",
        title: "Concede first, then differentiate",
        body: "The regen objections are unusual: **most of them are partly TRUE.** The FDA hasn't approved these products. The Achilles-and-back evidence IS thin. Some clinics ARE scams. Your patient knows all of this, which makes the concede-first move mandatory: agree with the true part immediately, then differentiate with specifics.\n\n\"For a lot of what's sold under that name, your orthopedist is right\" costs you nothing — the patient already believed it — and buys you the only thing that closes here: the credibility to be believed when you explain what's different about this protocol, this supplier's lot testing, this physician's oversight. Defensiveness confirms their fear. Concession disarms it.",
      },
      {
        id: "skepticism-tools",
        title: "The FDA question and the evidence question",
        body: "**\"Is it FDA approved?\" — the first word is \"No.\"** Anything softer ('technically', 'it's complicated', 'the FDA doesn't really...') is the dodge they came expecting. After the no: the honest distinction — a regulated, lot-tested human tissue product is a different thing from an approved drug, the clinics that blurred that line earned their warning letters, and you'll put what you just said in writing.\n\n**\"Show me the studies\"** gets the same spine: name what exists at the tier it exists (early, small-N, mixed for backs; better for knees [NEEDS SOURCE]), invite them to read it, and define what success would look like for THEM at 12 weeks. The patient hunting for a guarantee gets the refusal as a gift: \"no guarantee — and walk out of any clinic that offers one.\"",
      },
    ],
    scripts: [
      {
        id: "price-tools",
        title: "Price objections",
        context: "Sticker shock at four figures — isolate before you answer.",
        lines: [
          {
            line: "If the cost weren't part of the picture — is this what you'd want to do?",
            why: "The isolation question. A yes means you're negotiating logistics; a no means price was never the objection.",
          },
          {
            line: "It's real money. Set against another year of managing this — the visits, the flare-ups, what it's already taken off your calendar — it's at least an honest comparison.",
            why: "Cost-of-alternative math with THEIR lived costs, not invented catastrophe.",
          },
          {
            line: "My cousin got PRP for $700 — fair point to raise. They're different materials for different jobs, and for what your imaging shows, this is the one the doctor recommended. If PRP were the right call for this knee, it'd be on the table.",
            why: "Answers the comparison without trashing PRP — and re-anchors on the physician's indication.",
          },
        ],
      },
      {
        id: "skepticism-scripts",
        title: "FDA, evidence, and 'is this from embryos?'",
        lines: [
          {
            line: "No — it's not FDA approved, and I want to be the one who tells you that plainly. It's a regulated, lot-tested tissue product, which is a different thing than an approved drug — and the clinics that blur that line are the ones in the warning letters you read.",
            why: "The straight no, the honest distinction, and an alliance with the patient's own research — in that order.",
          },
          {
            line: "The honest evidence picture for your condition: early and thin, better in some joints than others. I'll send you what exists tonight — and before you spend a dollar, we define in writing what success at 12 weeks means for you.",
            why: "Concession plus structure. 'I'll send it tonight' is a promise a scam never makes.",
          },
          {
            line: "Not embryos — birth tissue. Donated after healthy scheduled C-sections, with the mother's consent, from tissue that would otherwise be discarded. Mother and baby are unharmed. It's the most-asked question in this field and it deserves a straight answer.",
            why: "Direct, unembarrassed, complete. Squirming here poisons everything after it.",
          },
        ],
      },
      {
        id: "spouse-tools",
        title: "The spouse play",
        lines: [
          {
            line: "Of course — a $4,500 decision should survive the kitchen table. What's the first thing they're going to ask you?",
            why: "Validates the conversation and turns you into the patient's co-strategist for it.",
          },
          {
            line: "Let me give you the three answers they'll want: what it is, what it honestly does and doesn't do, and what happens if it doesn't work. On paper, tonight.",
            why: "The honest-expectations sheet doubles as the spouse packet. Nobody else in town sends one.",
          },
          {
            line: "Let's pencil the evaluation for Thursday — if the kitchen table says no, one text cancels it. You lose nothing by holding the slot.",
            why: "Zero-commitment calendar hold: keeps momentum without pressure.",
          },
        ],
      },
      {
        id: "think-tools",
        title: "\"I need to think about it\"",
        lines: [
          {
            line: "Absolutely — so I can be useful: is it the money, the evidence, or whether you can trust this industry at all? That last one's fair, and it deserves a real answer.",
            why: "Isolation with the trust option said OUT LOUD — naming it is what makes this specialty's version work.",
          },
          {
            line: "Take the time. Here's what thinking looks like with structure: the written expectations tonight, your questions by phone Friday, and a held slot you can cancel with a text.",
            why: "Converts an open-ended drift into a scheduled decision without an ounce of pressure.",
          },
        ],
      },
    ],
    dialogues: [
      {
        id: "ortho-scam",
        title: "\"My orthopedist said it's a scam\"",
        patient: "I ran this by my orthopedist and he flat-out said stem cell clinics are a scam.",
        weak: "Orthopedists say that because these protocols compete with their surgeries. He has a financial interest in you not doing this.",
        strong: "For a lot of what's sold under that name — he's right, and I'd rather practice in a world where doctors say that than one where they don't. Here's what I'd want him to know about this protocol specifically: the lot testing, the physician review, the written expectations, no guarantees. I'll send him all of it today if you'd like — and if he still objects after seeing the specifics, that's a conversation worth having.",
        annotation: "The weak line accuses a doctor the patient trusts of corruption — the visit is over. The strong line concedes, differentiates with observable specifics, and offers radical transparency. 'Send him everything' is the move a scam cannot make.",
      },
      {
        id: "guarantee-hunt",
        title: "The guarantee hunt",
        patient: "I just need to know it'll work before I spend this kind of money. Can you at least tell me your success rate?",
        weak: "Look, I can't technically guarantee anything, but between us? I've never had a knee patient who wasn't thrilled.",
        strong: "No guarantee — and I want to be straight that anyone who offers you one is lying to you. What I can give you is structure: we define success for YOUR knee — pain scores, stairs, the golf — written down at week zero, measured at week twelve. If the honest answer then is 'it didn't move,' you'll hear it from me first.",
        annotation: "The weak line launders a guarantee through a wink — the exact behavior in the warning letters. The strong line refuses at full volume and replaces certainty with accountability, which is what the patient actually needed to hear.",
      },
    ],
    mistakes: [
      {
        wrong: "Opening the FDA answer with \"technically...\"",
        right: "\"No.\" Then the honest distinction.",
        note: "'Technically' is the sound of the dodge they were braced for. The plain no is the pattern-break.",
      },
      {
        wrong: "Countering 'my doctor said' by impugning the doctor's motives.",
        right: "Concede the true part, differentiate with specifics, offer to send the other physician everything.",
        note: "You will never win a credibility contest against someone the patient chose. Don't enter one.",
      },
      {
        wrong: "Quoting a success percentage from memory to end an evidence objection.",
        right: "Name the evidence tier honestly, share the actual studies, define success in writing for this patient.",
        note: "An invented number is a compliance flag AND fragile — one Google search destroys it and you with it.",
      },
      {
        wrong: "Treating 'I need to think about it' as a rejection and re-pitching.",
        right: "Isolate — money, evidence, or trust — and give the thinking structure: written expectations, a call date, a cancellable hold.",
        note: "At this price point 'think about it' is often literal. The re-pitch converts a deliberator into an avoider.",
      },
    ],
    repCta: { stationSlug: "regen-fda-anchor", difficulty: "hard", label: "Take the FDA question head-on" },
    flags: [
      "Evidence-tier characterizations (knees vs. backs) are directional and marked [NEEDS SOURCE] — founder to attach citations before print collateral uses them.",
    ],
  },

  /* ====================== Module 5 — Asking for the Close ====================== */
  {
    moduleSlug: "regen-close",
    specialty: "regen",
    objectives: [
      "Ask for a four-figure decision with an assumptive or alternative close — plainly and once.",
      "Use the real 4–6 week material lead time as honest, structural urgency.",
      "Match the close to the patient: deliberators get a scheduled decision, deciders get the calendar.",
      "Stop selling after yes — and respect an informed no the first time.",
    ],
    concept: [
      {
        id: "three-closes",
        title: "The three closes",
        body: "The assumptive close (\"let's get the material ordered — the procedure lands about six weeks out; do mornings or afternoons work?\"), the alternative close (\"we can book the protocol today, or start with the evaluation and decide after — which fits?\"), and the direct ask (\"would you like to move forward?\").\n\nAll three work; hinting is the only failure. \"Something to think about\" after a forty-minute honest consult is not humility — it's abandoning the patient at the decision they came in to make. **In this specialty you've spent the whole visit earning the right to ask by being straight. Asking plainly is the consistent ending; mumbling is the plot hole.**",
      },
      {
        id: "match-patient",
        title: "Match the close — and use the real clock",
        body: "Deciders want the calendar; hand them the alternative close and stop talking. Deliberators — and at four figures there are many — get a **scheduled decision**: written expectations tonight, questions by phone Friday, a held procedure slot that one text cancels.\n\nAnd this specialty hands you the one thing most closers have to fake: a real clock. The material is ordered per-case under physician direction and takes 4–6 weeks to arrive. **\"Deciding today doesn't mean doing it today — it means six weeks from now is an option instead of twelve\"** is honest urgency, no invention required. Fake countdowns are a compliance flag; the lead time is just the truth, doing the same work better.",
      },
      {
        id: "after",
        title: "After yes. After no.",
        body: "After yes: stop selling. Confirm, hand off to the deposit and the calendar, done. Every additional benefit reopens the decision, and the second-joint conversation is a SEPARATE honest visit (its own station), not a rider bolted to this yes.\n\nAfter an informed no: respect it the first time. Chart the indication, set a concrete return trigger — \"if the knee's worse at your spring physical, that's our signal\" — and leave the door open. **In regen, pushing past a genuine no isn't just bad technique; it's the behavior in every regulatory complaint ever filed against this industry.** The respected no comes back. The pressured no writes the review.",
      },
    ],
    scripts: [
      {
        id: "closing-lines",
        title: "Closing lines that survive the read-back",
        lines: [
          {
            line: "Given the imaging and everything you've tried, my recommendation is the protocol. The material takes four to six weeks once the doctor signs off — so if we order this week, you're looking at mid-month after next. Mornings or afternoons for the procedure visit?",
            why: "Recommendation, real clock, alternative ask — one breath, nothing to walk back.",
          },
          {
            line: "Two honest paths from here: we book the protocol today, or you take the written expectations home, we talk Friday, and a held slot waits either way. Which one fits how you make decisions?",
            why: "The deliberator's close: both options are real, the calendar advances under either, and the patient keeps the wheel.",
          },
          {
            line: "Then let's call it a no for now — genuinely. If the spring physical shows it's worse, that's our signal to talk again. I'd rather you come back in March trusting how today ended.",
            why: "The respected no, with a concrete return trigger. This line closes more future cases than any pitch.",
          },
        ],
      },
    ],
    dialogues: [
      {
        id: "warm-but-unasked",
        title: "Warm patient, missing ask",
        patient: "Yeah... no, this all makes sense. You've been straight with me, I appreciate it.",
        weak: "Great! Well — take all the time you need, all the info's in the folder, and we're always here when you're ready.",
        strong: "Good — then let me ask you directly, because you've earned a direct question: do you want to do this? The material takes six weeks either way, so if it's yes, let's pick the date now and you keep the full window.",
        annotation: "The weak line takes a warm, ready patient and hands them homework — the most common lost close in the app. The strong line converts the warmth into a decision while the honest clock makes 'now' the logical moment.",
      },
      {
        id: "post-yes",
        title: "Sixty seconds after yes",
        patient: "Okay. Let's do it. Let's do the knee.",
        weak: "Fantastic! And you know, once you see how this goes, a lot of patients do the other knee too — and there's the IV protocol, which pairs really well with...",
        strong: "Done. Sarah up front will take the deposit and get your date and your pre-procedure call on the calendar before you leave. You made this decision with better information than almost anyone who walks in here — see you in six weeks.",
        annotation: "The weak line upsells inside the yes — the fastest way to make a patient re-examine it. The strong line closes the loop, moves to logistics, and ends on the patient's own good judgment.",
      },
    ],
    mistakes: [
      {
        wrong: "\"Anyway — something to think about! No pressure at all.\"",
        right: "\"Do you want to do this? If yes, the six-week clock starts when we order.\"",
        note: "The unasked question is the silent killer of honest consults. You earned the ask — make it.",
      },
      {
        wrong: "Inventing urgency: \"this pricing is only good today\" / \"the doctor's books are almost closed.\"",
        right: "The real lead time: \"deciding this week means six weeks out is an option instead of twelve.\"",
        note: "Fake countdowns are a compliance flag. The true clock does the same work and survives the read-back.",
      },
      {
        wrong: "Re-pitching after a genuine, informed no.",
        right: "Chart it, set a concrete return trigger, leave warmly.",
        note: "Pressure past a stable no caps your score here — and out there, it's the sentence every complaint quotes.",
      },
      {
        wrong: "Attaching the second joint or the IV protocol inside the first yes.",
        right: "Bank the yes, hand off to scheduling. The attach is its own honest conversation at the 12-week review.",
        note: "There's a whole station for the honest attach (Second-joint) — run it there, not in the afterglow.",
      },
    ],
    repCta: { stationSlug: "regen-second-joint", difficulty: "moderate", label: "Practice the honest attach — and the ask" },
    flags: [],
  },
];

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
  {
    key: "ha-fillers",
    name: "HA fillers & skin boosters",
    shortDesc: "Hyaluronic acid fillers plus Skinvive — midface volume and skin quality",
    priceDisplay: "$750/syringe",
    priceStructure:
      "$700–900 per syringe (default $750); midface plans commonly run 1–2 syringes per visit. Skinvive $300–400 per treatment. Quote the per-syringe price and the plan total, then hold it.",
    packageOptions: [
      "Single-area plan: syringes × rate, mapped before any injection",
      "Staged plan: midface first, reassess at 4 weeks before any second area",
      "Membership credit bank applies ($89/month)",
    ],
    idealCandidate:
      "Midface volume loss (the top consumer concern), nasolabial shadows driven by it, lip definition with realistic goals; Skinvive for skin-quality smoothness rather than volume.",
    screening: [
      "Pregnancy or breastfeeding",
      "Active skin infection, cold sore history near treatment area", // CLINICAL REVIEW
      "Autoimmune disease and current immunosuppression", // CLINICAL REVIEW
      "Prior filler: what, where, when, and any complications",
      "Blood thinners and bruising-heavy supplements", // CLINICAL REVIEW
    ],
    consentEssentials: [
      "Vascular occlusion is the serious, rare risk — we inject with technique and tools chosen around it, and we keep hyaluronidase on site", // CLINICAL REVIEW
      "Swelling and bruising are common for several days; judge results at two weeks",
      "HA fillers are gradually metabolized; maintenance is typically 9–18 months by product and area", // CLINICAL REVIEW
      "Results are adjustable — HA can be dissolved if needed",
    ],
    objections: [
      {
        front: "I don't want that pillow face look I see everywhere.",
        isolate: "If no one could tell you'd had anything done — they just thought you looked rested — would that be the result you want?",
        reframe: "Overfilled faces come from chasing lines instead of restoring structure, and from too much product too fast — our plan is staged, conservative, and judged at two weeks before anything more.",
        close: "Want to start with one syringe in the midface and reassess together at your two-week photo check?",
      },
      {
        front: "A syringe lasts a year? For $750 that feels steep.",
        isolate: "Is it the number itself, or wanting to be sure the result is worth owning for that year?",
        reframe: "Spread over the months it lasts, a syringe costs less per month than most people's skincare shelf — and it's the one thing on that shelf that visibly changes structure.",
        close: "Shall we price your full plan so you can see the per-month math before you decide?",
      },
      {
        front: "I read about fillers blocking blood vessels. That terrifies me.",
        isolate: "Would it help if I walked you through exactly how we prevent it and what we do if it ever happens?",
        reframe: "That risk is real and rare, and it's the reason injector training matters more than price — we map danger zones, use technique designed around them, and stock the reversal enzyme in this room.",
        close: "Does hearing the protocol make you comfortable moving ahead with the conservative plan?",
      },
      {
        front: "The med spa quote was $500 a syringe.",
        isolate: "If the syringes cost the same everywhere, who would you want injecting your face?",
        reframe: "You're not buying a syringe, you're buying the judgment about where it goes and what to do if something goes wrong — that's what the difference pays for.",
        close: "Want to book the first syringe here and judge us on the two-week result?",
      },
      {
        front: "Can't I just do the cheaper Skinvive everywhere instead?",
        isolate: "Is your goal skin texture, or lifting the hollowness we looked at in the mirror?",
        reframe: "They're different tools — Skinvive smooths skin quality, it doesn't restore volume; using the cheaper tool for the wrong job buys disappointment.",
        close: "Based on what you pointed at in the mirror, shall we start with the midface plan?",
      },
      {
        front: "What if I hate it?",
        isolate: "Is the worry looking different in a way you didn't choose?",
        reframe: "HA is the adjustable filler — we photograph, we judge at two weeks, and in the rare case you want it gone, it can be dissolved.",
        close: "With that safety net, are you comfortable booking the first session?",
      },
    ],
    upsells: [
      "Skinvive after structural work when skin texture is the residual complaint",
      "Neuromodulator plan for the dynamic lines filler doesn't address",
      "Skincare regimen (retinoid + SPF) to protect the investment",
    ],
    rebooking: "Two-week photo check after every filler visit; maintenance review at 9–12 months on the books before leaving.", // CLINICAL REVIEW
    closeScript:
      "Looking at your photos, my plan is [SYRINGES] of [PRODUCT] in the midface — $[PLAN TOTAL]. Swelling settles in days; we judge it together at your two-week photo check. Let's book your treatment and that check now — do mornings or afternoons work better?",
    personaPool: ["derm-glp1", "derm-redo", "derm-downtime", "derm-shopper", "derm-reviews", "derm-spouse"],
    clinicalContext:
      "Cosmetic consult, physician-led dermatology practice. Patient concerned about midface hollowing/nasolabial shadows (or lips per persona). Provider must screen (pregnancy/breastfeeding, infection or cold sore history, autoimmune/immunosuppression, prior filler history, blood thinners), name vascular occlusion honestly with the prevention/reversal protocol, set the two-week judgment window, and stage the plan. Cash-pay: $750/syringe default, Skinvive $300–400. Never promise a result, never match competitor pricing.",
    patientCc:
      "My cheeks have gotten hollow this past year and everyone keeps asking if I'm tired. I've thought about filler but honestly the ones I see around town scare me a little.",
    closeGoal:
      "Patient books a staged midface plan (first syringe) plus the two-week photo check before leaving.",
    difficultyNotes:
      "The patient fears looking overdone and raises safety reading they've done. They reward staged conservative planning, the dissolvable safety net, and an unprompted vascular-risk explanation; they punish minimizing ('totally safe'), pressure, or price matching. SPEECH STYLE: natural consult pacing, one concern at a time, two to three sentences per reply.",
  },
  {
    key: "biostimulators",
    name: "Biostimulators",
    shortDesc: "Sculptra and Radiesse — collagen-building volume, the post-GLP-1 lead product",
    priceDisplay: "$900/vial",
    priceStructure:
      "$850–950 per vial (default $900); plans are 2–3 vials across separate sessions spaced about 4–6 weeks apart. Sold as a series with the full plan priced up front.", // CLINICAL REVIEW: session spacing
    packageOptions: [
      "Series plan: 2–3 vials, priced as a plan with per-session payments",
      "GLP-1 restoration plan: biostimulator series + skincare + review photos at each visit",
      "Membership credit bank applies",
    ],
    idealCandidate:
      "Diffuse facial volume loss — classically after major GLP-1 weight loss — where the goal is gradual, structural restoration rather than single-area filling.",
    screening: [
      "Pregnancy or breastfeeding",
      "Autoimmune disease and immunosuppression", // CLINICAL REVIEW
      "Keloid or hypertrophic scarring history", // CLINICAL REVIEW
      "Active infection; recent dental work timing", // CLINICAL REVIEW
      "Expectation check: comfortable with results building over months?",
    ],
    consentEssentials: [
      "Results are delayed by design — your own collagen builds over weeks to months; this is not a same-day filler",
      "A series is the treatment: one vial is a down payment on a result, not the result",
      "Temporary swelling/bruising; small nodules are an uncommon risk", // CLINICAL REVIEW
      "Aftercare matters (massage protocol where applicable)", // CLINICAL REVIEW
    ],
    objections: [
      {
        front: "I paid all this money and I won't see anything for months?",
        isolate: "If the result at month three looked the way you want — natural and unmistakably you — is the wait acceptable?",
        reframe: "The delay IS the natural look — collagen your own face builds doesn't announce itself the way a syringe of volume can; nobody catches a 'before and after moment'.",
        close: "Want to schedule the series so month three lands before [their event/season]?",
      },
      {
        front: "Why is this better than regular filler for me?",
        isolate: "Is your goal to fix one spot, or the overall deflation you described?",
        reframe: "HA excels at specific structure; biostimulators rebuild diffuse volume across the face — for post-weight-loss changes, that's usually the honest match.",
        close: "Shall we map the series plan against your photos and get vial one scheduled?",
      },
      {
        front: "Three vials?! The other place said one syringe would do it.",
        isolate: "Did they examine the same overall volume loss we just mapped, or quote before seeing you?",
        reframe: "Under-planning is the most expensive plan — it buys a subtle result that disappoints and gets abandoned. The series is sized to the change you showed me, not to a price point.",
        close: "Would you rather start the properly sized plan, or stage it one vial at a time and judge as we go?",
      },
      {
        front: "Is this that stuff that gives people lumps?",
        isolate: "Want me to walk through why nodules happen and what our protocol does about them?",
        reframe: "Nodules are uncommon and mostly technique- and aftercare-related — dilution, placement, and the massage protocol exist precisely for that risk, and we'll walk you through all of it.", // CLINICAL REVIEW
        close: "With the protocol clear, are you comfortable booking vial one?",
      },
      {
        front: "My weight might still change. Should I wait?",
        isolate: "Is more major loss planned with your prescriber, or are you in maintenance now?",
        reframe: "In maintenance, restoring now is reasonable — collagen you build stays yours and adapts better than a one-spot filler would; if another big drop is planned, waiting is the honest answer and I'll tell you so.",
        close: "Given you're in maintenance, shall we start the series this month?",
      },
      {
        front: "That's a lot of money all at once.",
        isolate: "Is it the total, or how it's timed?",
        reframe: "The plan prices per session over the series months — you pay as your face rebuilds, not in one lump.",
        close: "Want me to lay out the per-session schedule so you can see it next to your calendar?",
      },
    ],
    upsells: [
      "Neuromodulators for dynamic lines once volume is restoring",
      "RF microneedling for laxity where volume alone won't finish the job",
      "Skincare regimen enrollment — collagen support and SPF", // CLINICAL REVIEW
    ],
    rebooking: "Series visits ~4–6 weeks apart, all booked at the first visit; photo review at each session; annual maintenance review.", // CLINICAL REVIEW
    closeScript:
      "For the volume change we mapped, the plan is [VIALS] vials over [SESSIONS] sessions — $[PLAN TOTAL], paid per session. You'll watch it build in your monthly photos. Let's get all [SESSIONS] dates on the calendar now so the spacing is right — do you prefer early or late in the week?",
    personaPool: ["derm-glp1", "derm-downtime", "derm-spouse", "derm-reviews", "derm-redo"],
    clinicalContext:
      "Cosmetic consult, physician-led practice. Patient has diffuse facial volume loss, most often after significant GLP-1 weight loss, and is weighing options. Provider must frame delayed collagen-building honestly (months, series required), screen (pregnancy/breastfeeding, autoimmune/immunosuppression, keloid history, infection/dental timing), name the nodule risk plainly, and size the plan to findings. Cash-pay: $900/vial default, 2–3 vial series. The series must be sold as a series — single-vial expectations are corrected, not indulged.",
    patientCc:
      "I've lost sixty pounds this year — which I'm thrilled about — but my face paid for it. A friend mentioned Sculptra. What I don't love is that apparently nothing shows up for months?",
    closeGoal:
      "Patient commits to the sized series (2–3 vials) with all session dates booked, or stages honestly with vial one scheduled.",
    difficultyNotes:
      "The patient is motivated but skeptical of the delayed result and the multi-vial price. They reward honest series sizing, per-session payment framing, and being told to wait if more weight loss is planned; they punish same-day-result promises or shrinking the plan to win the sale. SPEECH STYLE: direct, practical, two to three sentences.",
  },
  {
    key: "rf-microneedling",
    name: "RF microneedling",
    shortDesc: "Morpheus8-class radiofrequency microneedling — laxity, acne scars, texture, neck and jawline",
    priceDisplay: "$1,200/session",
    priceStructure:
      "$1,000–1,500 per session (default $1,200); the protocol is a 3-session series, 3-pack $2,500–4,000 (default $3,300) spaced 4–6 weeks apart. PRP add-on $350/session.", // CLINICAL REVIEW: spacing + PRP add-on price
    packageOptions: [
      "3-pack series (the protocol): default $3,300, sessions 4–6 weeks apart",
      "Single session for texture maintenance after a completed series",
      "PRP add-on per session",
    ],
    idealCandidate:
      "Mild-to-moderate skin laxity (lower face, jawline, neck), acne scarring, and texture — patients who want tightening without surgery and accept a short social-downtime window.",
    screening: [
      "Pregnancy or breastfeeding",
      "Isotretinoin within the last 6 months", // CLINICAL REVIEW: interval policy
      "Active acne flare, infection, or cold sore history in the treatment area", // CLINICAL REVIEW
      "Keloid or hypertrophic scarring history",
      "Implanted electrical devices (pacemaker/defibrillator)", // CLINICAL REVIEW
      "Recent fillers or toxin in the area — timing coordination", // CLINICAL REVIEW
    ],
    consentEssentials: [
      "Downtime is real: redness and pinpoint marks for 1–3 days, makeup typically after 24–48 hours", // CLINICAL REVIEW
      "Results build over the series and continue improving for ~3 months after as collagen remodels",
      "A series is the protocol — one session undersells the technology",
      "Temporary swelling; uncommon risks include post-inflammatory pigment change, treated conservatively in deeper skin tones", // CLINICAL REVIEW
    ],
    objections: [
      {
        front: "Four thousand dollars to poke my face with needles?",
        isolate: "Is it the total, or wanting certainty the tightening is real before committing to a series?",
        reframe: "You're pricing the only non-surgical category that remodels collagen at depth — spread across the series and the year of remodeling it drives, it's a fraction of the surgical alternative with none of the recovery.",
        close: "Want to map the 3-pack against your calendar so the downtime windows land on your quiet weeks?",
      },
      {
        front: "My esthetician does microneedling for $300.",
        isolate: "Do you know if that's needles alone, or needles delivering radiofrequency at depth?",
        reframe: "Cosmetic-depth needling polishes the surface; RF microneedling heats the deeper layer where laxity actually lives — different machine, different depth, different result, and physician-level oversight for it.",
        close: "Shall we book session one and let your jawline photos settle the comparison?",
      },
      {
        front: "How much downtime are we really talking?",
        isolate: "What does your week look like — is there a day red-and-dotted would be a problem?",
        reframe: "Honest answer: you'll look sunburned with pinpoint marks for a day or three and most people wear makeup from day two — we schedule around your calendar, not the other way round.",
        close: "Thursdays would give you the weekend to settle — want the series on Thursdays?",
      },
      {
        front: "Will this fix my acne scars completely?",
        isolate: "Would meaningful softening you can see in photos — not perfection — feel worth it to you?",
        reframe: "No honest clinic promises complete scar erasure — the series meaningfully softens rolling and boxcar scarring over months, and I'd rather under-promise and let your photos out-perform.",
        close: "Comfortable starting the series on that honest expectation?",
      },
      {
        front: "What about the PRP thing — is that just an upsell?",
        isolate: "Want the honest version of what it adds and when I'd skip it?",
        reframe: "It's optional: your own platelets applied when the channels are open, aimed at faster settling and recovery support. The evidence is supportive rather than definitive, and I'll tell you plainly it's the first thing to cut on a tight budget.", // CLINICAL REVIEW
        close: "Series with or without the add-on — which would you like to book?",
      },
      {
        front: "I'm darker-skinned — I've heard these devices can mark people like me.",
        isolate: "Can I walk you through exactly how we set this device for your skin before you decide?",
        reframe: "Right question — RF microneedling is actually one of the safer energy options for deeper skin tones because the heat is delivered below the surface, and we adjust settings and prep conservatively for you.", // CLINICAL REVIEW
        close: "With that protocol, would you like to start with a conservative first session?",
      },
    ],
    upsells: [
      "PRP add-on where budget allows",
      "Neuromodulators for the dynamic lines tightening won't address",
      "Skincare regimen (growth-factor serum + SPF) between sessions", // CLINICAL REVIEW
    ],
    rebooking: "Series sessions 4–6 weeks apart, booked together; results photo review 3 months after session three; maintenance single annually.",
    closeScript:
      "For your [AREA], the protocol is three sessions, 4 to 6 weeks apart — $[SERIES TOTAL] as the series. You'll be red for a day or two after each, so let's land them on [QUIET DAY]s. I have [DATE] to start — shall we lock all three in?",
    personaPool: ["derm-downtime", "derm-fitz", "derm-glp1", "derm-shopper", "derm-reviews"],
    clinicalContext:
      "Cosmetic consult, physician-led practice. Patient concerned with jawline/neck laxity, acne scarring, or texture. Provider must screen (pregnancy, isotretinoin within 6 months, active infection/cold sores, keloids, implanted electrical devices, recent injectables), state the real downtime window, frame the 3-session series honestly with ~3-month remodeling timeline, and position the PRP add-on without overclaiming. Cash-pay: $1,200/session, $3,300 series default. Deeper skin tones get an explicit settings-and-protocol conversation.",
    patientCc:
      "My jawline's gotten soft and I've still got acne scars from my twenties. I keep seeing Morpheus8 everywhere — is it actually worth what everyone charges for it?",
    closeGoal:
      "Patient books the 3-session series with dates placed around their downtime windows (PRP add-on decided explicitly either way).",
    difficultyNotes:
      "The patient is results-focused and wary of med-spa hype. They reward honest downtime talk, series math, and an unprompted deeper-skin-tone protocol when relevant; they punish scar-erasure promises and pressure. SPEECH STYLE: practical, calendar-aware, two to three sentences.",
  },
  {
    key: "ipl-bbl",
    name: "IPL / BBL photofacial",
    shortDesc: "Broadband light for sun damage, redness and rosacea — with mandatory skin-type screening",
    priceDisplay: "$400/session",
    priceStructure:
      "$300–500 per session (default $400); protocol is a 3-session series, 3-pack $900–1,400 (default $1,100), then 1–2 maintenance sessions a year.",
    packageOptions: [
      "3-pack series (default $1,100), sessions ~4 weeks apart", // CLINICAL REVIEW: spacing
      "Annual maintenance plan: 2 sessions/year at member pricing",
      "Membership credit bank applies",
    ],
    idealCandidate:
      "Sun damage (lentigines), diffuse redness and rosacea flushing, visible small vessels — lighter Fitzpatrick types; this platform is generally NOT offered to Fitzpatrick V–VI, where alternatives are discussed instead.", // CLINICAL REVIEW
    screening: [
      "Fitzpatrick type assessment — out loud, before any quote", // the compliance axis checks this
      "Recent tanning or planned sun exposure (treatment deferred around it)", // CLINICAL REVIEW
      "Photosensitizing medications", // CLINICAL REVIEW
      "Pregnancy (defer melasma-adjacent light treatment)", // CLINICAL REVIEW
      "History of melasma — light can worsen it; alternatives discussed", // CLINICAL REVIEW
    ],
    consentEssentials: [
      "Spots typically darken first ('coffee-ground' flecking) then flake over days — that's the treatment working, not a burn",
      "Redness patients: a series controls, it does not cure — rosacea is managed, flares can recur",
      "Pigment-change and burn risk exists and is why skin typing and settings matter; honest deferral if you're tanned",
      "Eye protection mandatory",
    ],
    objections: [
      {
        front: "Why three sessions? The spa by my gym does one for $99.",
        isolate: "Did the $99 include a physician setting the device to your skin, or anyone asking what medications you take?",
        reframe: "Bargain light treatments are where burns and mottled pigment come from — the series at honest settings clears progressively and safely; one aggressive pass is how damage happens.",
        close: "Want to book the series at settings chosen for your skin, starting after your beach trip?",
      },
      {
        front: "Will this cure my rosacea for good?",
        isolate: "If flushing became an occasional nuisance instead of a daily embarrassment, is that a win worth maintaining?",
        reframe: "No light device cures rosacea, and anyone who says so is selling — the honest offer is control: visibly less baseline redness, fewer flares, maintained a couple of times a year.",
        close: "Shall we start the control series and judge your baseline at session three?",
      },
      {
        front: "My skin's pretty dark — my cousin got burned by one of these.",
        isolate: "Thank you for telling me — can we do your skin typing right now, before we talk about anything else?",
        reframe: "Your cousin's experience is exactly why typing comes first: this platform isn't right for deeper skin tones, and if that's what typing shows, I'll say so and we'll talk about what IS safe for you instead.",
        close: "Let's type your skin now — and whichever side of the line you land on, you'll leave with a safe plan.",
      },
      {
        front: "The spots get DARKER first? That sounds like a scam.",
        isolate: "Would seeing before-and-during-and-after photos of that exact sequence help?",
        reframe: "Darkening is the pigment lifting to the surface before it flakes — it's the mechanism, visible for a few days, and we schedule so it doesn't collide with your events.",
        close: "Want to book session one for a quiet week so the flaking window is yours?",
      },
      {
        front: "Can't I just use vitamin C serum for this?",
        isolate: "Have the serums you've tried moved the spots you showed me?",
        reframe: "Topicals brighten and protect — they're the maintenance half; they don't break up established pigment or close vessels. The honest pairing is light to clear, skincare to keep.",
        close: "Series plus a protect-it regimen — want me to price the pairing?",
      },
      {
        front: "I'm in the sun constantly. Is this pointless for me?",
        isolate: "Are you able to be strict with SPF and a hat for the treatment window, even if not forever?",
        reframe: "Treating a tan is unsafe and treating while you re-expose is wasteful — I'd rather schedule your series for your low-sun months and have it actually hold.",
        close: "Shall we book the series for October through December and do this right?",
      },
    ],
    upsells: [
      "Medical-grade SPF + antioxidant regimen (protects the result — and the melasma conversation)",
      "Vascular laser session for discrete vessels IPL doesn't close", // CLINICAL REVIEW
      "Annual maintenance plan enrollment at series completion",
    ],
    rebooking: "Series ~4 weeks apart booked together; maintenance 1–2× yearly, first one booked at series completion.",
    closeScript:
      "Your skin type and the sun damage we mapped make you a good candidate: three sessions, about a month apart — $[SERIES TOTAL]. Spots darken and flake for a few days each round, so we'll use your quiet weeks. I can start you [DATE] — shall we put all three on the calendar?",
    personaPool: ["derm-fitz", "derm-male-first", "derm-medical-visit", "derm-shopper", "derm-downtime"],
    clinicalContext:
      "Cosmetic consult, physician-led practice. Patient has sun damage, redness/rosacea, or visible vessels. HARD RULE for the provider: Fitzpatrick typing happens out loud BEFORE any quote or close; deeper skin types are honestly redirected to safer alternatives rather than treated. Screening also covers tanning/sun plans, photosensitizing medications, pregnancy, melasma history. Expectations: darken-then-flake sequence, control-not-cure for rosacea, maintenance cadence. Cash-pay: $400/session, $1,100 series default.",
    patientCc:
      "I've got these sun spots all over my cheeks and I flush red at the worst times. My friend swears by BBL but another friend said these machines burn people — so which is it?",
    closeGoal:
      "Patient is skin-typed on the spot, then books the 3-session series (or, if typing rules the platform out, accepts the alternative plan) with maintenance framed.",
    difficultyNotes:
      "The patient has heard both hype and horror stories. They reward typing-before-quoting, honest control-not-cure framing, and scheduling around their sun exposure; they punish cure promises, skipped typing, or any brush-off of the burn question. If the provider quotes a price before typing their skin, receptivity drops hard. SPEECH STYLE: curious but wary, two to three sentences.",
  },
  {
    key: "laser-hair-removal",
    name: "Laser hair removal",
    shortDesc: "Package-based hair removal — the most price-shopped service on the menu",
    priceDisplay: "from $150/session",
    priceStructure:
      "Per session by area: small (lip/chin) $150, medium (underarms/bikini) $250, large (legs/back) $450–550. The protocol is a package of 6 sessions at a 20% package rate; an unlimited-touch-up plan for a treated area can be offered at checkout.", // CLINICAL REVIEW: session counts vary by area/hair
    packageOptions: [
      "6-session package per area at 20% off per-session pricing",
      "Multi-area bundle priced on the plan",
      "Unlimited touch-up plan for completed areas (12 months)",
    ],
    idealCandidate:
      "Dark hair on any skin tone with device-appropriate settings; expectations set for reduction over a series, not permanent zero-hair.", // CLINICAL REVIEW: device capability for darker skin tones depends on platform (e.g., Nd:YAG)
    screening: [
      "Fitzpatrick typing and device selection — out loud, before quoting",
      "Recent tanning or planned sun exposure on the area",
      "Photosensitizing medications",
      "Hormonal conditions that drive hair growth (e.g. PCOS) — affects expectations and maintenance", // CLINICAL REVIEW
      "Hair color: laser needs pigment — blonde/grey/red hair responds poorly; say so honestly",
    ],
    consentEssentials: [
      "This is long-term REDUCTION, not guaranteed permanent removal — maintenance sessions happen, especially with hormonal drivers",
      "A series of 6 is the protocol because hair cycles; single sessions buy little",
      "Shave before sessions; no waxing/plucking during the plan",
      "Pigment-change and burn risk is real and settings-dependent — it's why typing and device choice matter",
    ],
    objections: [
      {
        front: "There's a Groupon for $99 for six sessions. Why would I pay you ten times that?",
        isolate: "Have you looked at what device they use and who fires it?",
        reframe: "A $99 six-pack is priced to sell vouchers, not finish hair — underpowered settings that can't risk burning mean sessions that can't kill follicles. You'd spend the $99 and then still need the real series.",
        close: "Want the package priced for your areas, with settings that actually finish the job?",
      },
      {
        front: "Why six sessions? My hair grows back in two weeks.",
        isolate: "Want the 30-second version of why that two-week regrowth is exactly the problem?",
        reframe: "Only hair in its growth phase dies to the laser, and just a fraction of your follicles are in it at any moment — six passes over months is how you catch them all.",
        close: "Shall we map your six dates now so the spacing is right?",
      },
      {
        front: "Is it actually permanent?",
        isolate: "If you went from shaving daily to a touch-up once a year, is that the result you're after?",
        reframe: "The honest term is long-term reduction — most of the hair gone for good, with occasional maintenance, and hormones can wake new follicles. Anyone promising you'll never see a hair again is overselling.",
        close: "On that honest expectation, which areas are we starting with?",
      },
      {
        front: "I'm Black — every place I've called hems and haws about treating me.",
        isolate: "Can I tell you exactly which device we'd use for your skin and why, right now?",
        reframe: "Deeper skin tones are treated safely every day on the right platform at the right settings — the hemming you've heard is clinics with one machine for everyone. We type your skin first and set the plan to it.", // CLINICAL REVIEW: platform-specific claim
        close: "Let's do your typing and a test spot, and build your package from there — this week?",
      },
      {
        front: "I'll just keep waxing, it's cheaper.",
        isolate: "Have you ever added up a year of waxing — money and hours?",
        reframe: "Waxing is renting smooth skin monthly, forever; the package is buying most of it outright — the crossover point is usually inside two years, and the laser doesn't need you to grow it out first.",
        close: "Want me to run your waxing math next to the package price?",
      },
      {
        front: "Does it hurt as much as people say?",
        isolate: "Is discomfort the thing that's kept you from starting?",
        reframe: "It's a rubber-band snap with cooling on modern devices — quick areas take minutes, and nobody in our chair has quit a series over it.",
        close: "Underarms take about ten minutes — want to just experience session one and judge?",
      },
    ],
    upsells: [
      "Additional areas at bundle pricing once the first area shows results",
      "Unlimited touch-up plan at package completion",
      "Post-laser skincare (soothing + SPF) for treated facial areas",
    ],
    rebooking: "Sessions 4–8 weeks apart by area, all six booked up front; touch-up plan decision at completion.", // CLINICAL REVIEW: spacing by area
    closeScript:
      "For [AREAS], the package is six sessions at [SPACING] — $[PACKAGE TOTAL], which saves 20% on per-session pricing. Shave the day before, keep the area out of the sun, and we handle the rest. Let's lock in all six dates — do evenings or weekends work better?",
    personaPool: ["derm-shopper", "derm-fitz", "derm-male-first", "derm-genz", "derm-spouse"],
    clinicalContext:
      "Consult in a physician-led practice; may be run by provider or trained staff per station. Patient wants hair removal and has almost certainly price-shopped. Provider must type skin and name the device choice before quoting, set reduction-not-permanent expectations, explain the hair-cycle logic for six sessions, screen for tanning/photosensitizers/hormonal drivers, and answer the pigment question for darker skin tones concretely. Cash-pay: package of 6 at 20% off per-session rates.",
    patientCc:
      "I want my underarms and legs done. I'll be straight with you — there's a Groupon in my inbox for $99 and your website doesn't even list prices, so convince me.",
    closeGoal:
      "Patient books the 6-session package for at least one area with all dates scheduled (test spot first where typing calls for it).",
    difficultyNotes:
      "This patient leads with price and keeps returning to it. They reward cycle-logic education, honest permanence framing, and the waxing math; they punish dodging the Groupon question, overclaiming permanence, or quoting before typing. SPEECH STYLE: blunt, numbers-forward, quick.",
  },
  {
    key: "laser-resurfacing",
    name: "Laser resurfacing",
    shortDesc: "CO2, Halo, Moxi, erbium — the big-ticket texture and sun-damage reset",
    priceDisplay: "$600–2,500/session",
    priceStructure:
      "Depth-tiered: light refresh (Moxi-class) $600–900; hybrid (Halo-class) $1,200–1,800; fully ablative CO2 $2,000–2,500. Quote the tier the exam supports, with the downtime that tier honestly costs.",
    packageOptions: [
      "Light tier: series of 2–3 with minimal downtime",
      "Hybrid/ablative: single session priced with included follow-up visits",
      "Pair-with-quiet-season planning (treat in low-sun months)",
    ],
    idealCandidate:
      "Established sun damage, etched lines, texture and tone change where injectables and light devices have hit their ceiling; patient can actually take the downtime of the tier proposed.",
    screening: [
      "Isotretinoin history and timing", // CLINICAL REVIEW: interval policy
      "Cold sore history — antiviral prophylaxis is protocol before perioral resurfacing", // CLINICAL REVIEW
      "Fitzpatrick typing — deeper tones change tier and settings or redirect entirely", // CLINICAL REVIEW
      "Keloid history; recent procedures in the area",
      "Sun exposure now and planned; smoking (healing)", // CLINICAL REVIEW
      "Realistic downtime check against work/social calendar",
    ],
    consentEssentials: [
      "Downtime scales with depth: light = a weekend of sandpaper skin; ablative = 7–10 days you would not take a meeting on camera", // CLINICAL REVIEW
      "Redness can persist weeks on deeper tiers; strict SPF after is non-negotiable",
      "Pigment change (lightening or darkening) is a real risk, highest in deeper skin tones and with sun exposure",
      "Cold-sore reactivation without prophylaxis; infection care protocol provided",
      "One deep session ≈ years of gradual damage reversed — but it is a recovery, not a facial",
    ],
    objections: [
      {
        front: "Twenty-five hundred dollars for ONE treatment?",
        isolate: "Is it the number, or whether one session can really be worth what three years of lighter treatments cost?",
        reframe: "Deep resurfacing is the one category where a single session does what years of gentler passes can't — you're buying the decade of accumulated damage coming off at once, with a real recovery to match.",
        close: "Want me to price the lighter tier next to it so you can choose depth-versus-downtime on real numbers?",
      },
      {
        front: "I can't disappear for two weeks.",
        isolate: "Could you do three days — or is even that off the table this season?",
        reframe: "Then the honest answer is the lighter tier: a weekend of rough skin instead of a week-plus of healing, with a series doing gradually what one deep pass does at once.",
        close: "Shall we book the lighter series starting the Friday before a quiet weekend?",
      },
      {
        front: "My cousin got burned by a laser and has a scar.",
        isolate: "Do you know what device it was and who ran it? Either way — want our protocol, step by step?",
        reframe: "Resurfacing is surgery-adjacent and deserves surgical respect: physician settings, skin-type screening, test approach where indicated, antiviral prophylaxis, and a follow-up schedule — the injuries you hear about almost always skipped several of those.",
        close: "With the protocol in front of you, do you want the exam to see which tier your skin actually supports?",
      },
      {
        front: "I was on Accutane last year — the internet says that's a problem.",
        isolate: "Can we put your exact dates into the plan before we go further?",
        reframe: "Good catch — recent isotretinoin changes healing, and the protocol is to time resurfacing respectfully around it rather than pretend it doesn't matter. Depending on your dates we either schedule ahead safely or choose a gentler tier for now.", // CLINICAL REVIEW
        close: "Let's confirm your dates and lock the earliest safe slot on the calendar — fair?",
      },
      {
        front: "Why not just do more IPL instead?",
        isolate: "Is the texture bothering you, or just the brown and red tones?",
        reframe: "Light treats color; resurfacing rebuilds texture — etched lines and rough grain live deeper than IPL reaches. Right tool, right layer.",
        close: "Your exam says texture is the complaint — shall we tier you for resurfacing honestly?",
      },
      {
        front: "Will my skin look worse before it looks better?",
        isolate: "Would a day-by-day photo diary of a real recovery help you plan for it?",
        reframe: "Yes — and knowing exactly how much worse, for exactly how long, is the difference between a recovery you planned and one that panics you. I'll walk you through the days before you commit.",
        close: "If the recovery calendar fits your November, do you want the date held?",
      },
    ],
    upsells: [
      "Neuromodulator two weeks prior for etched-line areas", // CLINICAL REVIEW: sequencing
      "Recovery skincare kit (barrier repair + SPF) — included framing at deeper tiers",
      "Maintenance light-tier session annually after a deep result",
    ],
    rebooking: "Included follow-ups at deeper tiers (day 3–5 and week 2); annual maintenance session; strict-SPF review at each.",
    closeScript:
      "Your exam supports the [TIER] at $[PRICE] — that buys [RESULT SUMMARY] with [N] days of real downtime, and we schedule it so those days are yours. Prophylaxis starts [DAYS] before. I can hold [DATE], with your follow-ups built in — shall we lock it?",
    personaPool: ["derm-downtime", "derm-fitz", "derm-redo", "derm-reviews", "derm-glp1"],
    clinicalContext:
      "Cosmetic consult, physician-led practice, big-ticket decision. Provider must tier the recommendation to exam findings AND the patient's real downtime budget, screen hard (isotretinoin timing, cold-sore prophylaxis, Fitzpatrick typing, keloids, sun, smoking), present depth-versus-downtime honestly, and never minimize recovery to win the sale. Cash-pay, depth-tiered $600–2,500.",
    patientCc:
      "Thirty years of sun are sitting on my face and creams aren't touching it anymore. I've read about CO2 lasers and Halo and honestly the price range online is all over the place — what would this actually take?",
    closeGoal:
      "Patient books the exam-supported tier with downtime honestly scheduled (or the lighter series when the calendar rules the deep tier out), follow-ups included.",
    difficultyNotes:
      "The patient can afford it but is scared of downtime and burn stories. They reward tiering options against their calendar, protocol transparency, and downtime honesty day by day; they punish recovery minimization ('you'll be fine by Monday') and any dodge of the isotretinoin or skin-type questions. SPEECH STYLE: thoughtful, asks follow-ups, three sentences max.",
  },
  {
    key: "regen-addons",
    name: "Regenerative add-ons & PRP hair",
    shortDesc: "PRP/PRF, exosomes, polynucleotides — adjuncts and hair-restoration series, sold with strict honesty",
    priceDisplay: "$800/session",
    priceStructure:
      "$600–1,000 per session (default $800); hair restoration runs as a series of 3–4 sessions a month apart, then maintenance. Topical exosome/PDRN add-ons priced per procedure session.", // CLINICAL REVIEW: series cadence
    packageOptions: [
      "PRP hair series: 3–4 monthly sessions priced as a plan, photo-tracked",
      "Procedure add-on: topical regenerative application after microneedling/resurfacing",
      "Maintenance: single sessions quarterly-to-biannually after a response", // CLINICAL REVIEW
    ],
    idealCandidate:
      "Early-pattern hair thinning with intact follicles (PRP series); post-procedure recovery support as an adjunct. NOT a fit: advanced slick-bald areas — say so and save the patient money.",
    screening: [
      "Hair: pattern and duration of loss; rule-outs that need medical workup first (thyroid, iron, telogen effluvium triggers)", // CLINICAL REVIEW
      "Blood thinners and platelet-affecting medication", // CLINICAL REVIEW
      "Active scalp or skin infection",
      "Pregnancy or breastfeeding",
      "Expectations: response takes months and varies; some patients do not respond",
    ],
    consentEssentials: [
      "PRP uses your own platelets; response builds over months and is measured in photos — a meaningful minority see little change", // CLINICAL REVIEW
      "No injected exosome product is FDA-approved; anything we use is framed accurately for what it is",
      "This is not 'stem cell therapy' and we will never call it that",
      "Hair results are thickening and retention of existing follicles — not regrowth of long-dead ones",
    ],
    objections: [
      {
        front: "The med spa across town calls theirs stem cell hair regrowth.",
        isolate: "Would you rather have the marketing version or the version that survives a second opinion?",
        reframe: "Calling it stem cell therapy is exactly the claim regulators keep writing letters about — what we offer is your own platelets, honestly framed: good evidence for thickening early thinning, no miracle language.",
        close: "On that honest basis, want to start the photo-tracked series and let your own before/afters decide?",
      },
      {
        front: "Will my hair actually grow back?",
        isolate: "Is your goal recovering what's thinning now, or regrowing areas that have been bare for years?",
        reframe: "Honest split: thinning areas with live follicles respond best — thicker, denser, better retention over months. Long-bare areas don't come back with PRP, and I'd rather tell you that than take your money for it.",
        close: "Your pattern is early enough to be a good candidate — shall we baseline your photos and book the series?",
      },
      {
        front: "Eight hundred a session, three times, and it MIGHT work?",
        isolate: "If month four photos showed clear thickening, is the series worth it? And if they showed nothing?",
        reframe: "That's the honest bet, and we de-risk it the only legitimate way: baseline photos, fixed checkpoints, and a straight conversation at session three about whether YOUR scalp is responding before any maintenance money.",
        close: "Want the series with that checkpoint built in?",
      },
      {
        front: "What are exosomes, actually? My feed is full of them.",
        isolate: "Want the sixty-second honest version, including what's not proven?",
        reframe: "Lab-derived signaling particles with promising early science and no FDA-approved injectable product — which is why here they're only ever a topical adjunct after procedures, priced like an adjunct, never sold as the miracle in your feed.",
        close: "For today's plan, the evidence-backed core is the series — add the topical adjunct or skip it, your call. Which way?",
      },
      {
        front: "My dermatologist mentioned finasteride instead.",
        isolate: "Are you open to medication, or looking for a non-drug route?",
        reframe: "Medication is the evidence heavyweight and nothing we do replaces that conversation — PRP pairs with it or stands alone when drugs aren't your path. I'll put that in writing for your dermatologist.", // CLINICAL REVIEW
        close: "Want to run the series alongside that conversation rather than instead of it?",
      },
      {
        front: "How soon will I see something?",
        isolate: "Can you give it ninety days before you judge it?",
        reframe: "Shedding slows first, thickness shows in the photo comparisons around month three to four — day-thirty mirror-checking only buys discouragement.",
        close: "We'll put your month-three photo review on the books with the series — fair?",
      },
    ],
    upsells: [
      "Topical regenerative adjunct with RF microneedling or resurfacing sessions",
      "Hair-supportive regimen while the series runs", // CLINICAL REVIEW: which products
      "Maintenance plan after demonstrated response — never before",
    ],
    rebooking: "Series monthly with photos at each visit; month-3 response review is the decision gate for maintenance.",
    closeScript:
      "Your thinning is early enough that you're a genuine candidate: [N] monthly sessions at $[SESSION] — $[SERIES TOTAL] — with baseline photos today and an honest response review at month three before anyone talks maintenance. Shall we take the photos and book the series now?",
    personaPool: ["derm-male-first", "derm-reviews", "derm-genz", "derm-shopper", "derm-redo"],
    clinicalContext:
      "Consult in a physician-led practice. Patient asks about PRP for hair thinning or regenerative add-ons they saw online. HARD COMPLIANCE RULES: never 'stem cell therapy'; never state or imply FDA approval for exosome/PDRN products (none are approved as injectables); never promise regrowth — honest framing is thickening/retention of living follicles, response variable, measured in photos with a month-3 decision gate. Redirect advanced loss honestly. Screen for medical causes of hair loss that need workup first. Cash-pay: $800/session default, series of 3–4.",
    patientCc:
      "My hair's been thinning at the crown for a couple of years and my feed is wall-to-wall PRP and exosome ads. Half of them say 'stem cell hair regrowth' — what's real here?",
    closeGoal:
      "Patient books the photo-tracked PRP series with the month-3 response gate (medication conversation acknowledged, adjuncts decided honestly) — or is honestly redirected if not a candidate.",
    difficultyNotes:
      "The patient has absorbed miracle marketing and tests whether this clinic matches it. They reward being told what PRP won't do, the response-gate structure, and accurate exosome framing; they punish any echo of regrowth guarantees or stem-cell language — one overclaim and receptivity collapses. SPEECH STYLE: curious, slightly embarrassed about the topic, two to three sentences.",
  },
  {
    key: "peels-skincare",
    name: "Peels & skincare programs",
    shortDesc: "Chemical peels plus medical-grade regimens — the retail and membership engine",
    priceDisplay: "$225/peel",
    priceStructure:
      "Peels $150–350 by depth (default $225); medical-grade starter regimen $150–400 depending on concerns. Programs pair a peel series with a regimen and replenishment on the membership.",
    packageOptions: [
      "Corrective series: 3 peels a month apart + regimen (acne, melasma, dullness)", // CLINICAL REVIEW: melasma peel selection
      "Membership: monthly peel-or-facial credit + 10% retail + auto-replenishment",
      "Regimen-only start for patients not ready for procedures",
    ],
    idealCandidate:
      "Acne and post-acne marks, melasma (with strict sun behavior), dullness and early texture — and every procedure patient whose results need a regimen to hold.",
    screening: [
      "Isotretinoin timing; current retinoid use (hold windows around peels)", // CLINICAL REVIEW
      "Pregnancy/breastfeeding — changes which acids and actives are appropriate", // CLINICAL REVIEW
      "Cold sore history for perioral peels",
      "Melasma: current SPF honesty check — without it, peels waste money and can worsen it",
      "What they're using now, including the TikTok shelf — interactions and duplicates",
    ],
    consentEssentials: [
      "Peel depth determines flaking: light peels = a few days of visible flaking at most",
      "Melasma is managed, not cured; sun discipline decides whether results hold",
      "Actives cause an adjustment period (dryness, purging on acne regimens) — expected and coached", // CLINICAL REVIEW
      "Results come from the program, not a single peel",
    ],
    objections: [
      {
        front: "I can buy skincare at Sephora, why would I buy it from a doctor?",
        isolate: "Is your current shelf actually clearing the thing you came in about?",
        reframe: "The difference isn't the aisle, it's prescription-strength actives matched to a diagnosis and adjusted when your skin responds — a program with a clinician attached, not products with packaging attached.",
        close: "Want me to build your regimen from what you already own, replacing only what's not working?",
      },
      {
        front: "$400 for creams is insane.",
        isolate: "What does your current shelf add up to — including the things you stopped using?",
        reframe: "Most people walk in owning $400 of abandoned skincare; the regimen is fewer products that actually match your skin, lasting months, with the dead ends coached out.",
        close: "Shall we start with the core three and the membership discount?",
      },
      {
        front: "Will one peel fix my acne marks?",
        isolate: "Are we treating one event's marks, or a pattern that keeps making new ones?",
        reframe: "One peel brightens; the series plus a regimen is what stops the cycle that keeps printing new marks — treating the output without the input is how people conclude peels don't work.",
        close: "Series plus regimen is the honest plan — want it priced as the program?",
      },
      {
        front: "My melasma came back last time I treated it.",
        isolate: "What did your sun protection look like in the months after that treatment?",
        reframe: "Melasma always tries to come back — the program treats it AND builds the maintenance that keeps it down, and I'll be straight: without daily SPF, don't spend this money.",
        close: "If you're in for the SPF half, I'm in for the treatment half — deal?",
      },
      {
        front: "The purge thing scares me. My skin will get worse?",
        isolate: "Is there an event coming that a rough fortnight would collide with?",
        reframe: "On acne regimens, faster turnover can surface what was already brewing for a couple of weeks — we calendar around your events and coach you through it rather than pretending it won't happen.",
        close: "Want to start right after [event] so the adjustment lands in a quiet month?",
      },
      {
        front: "Just give me the peel, skip the subscription stuff.",
        isolate: "Happy to — can I show you what the peel alone typically holds versus the program, so it's your informed pick?",
        reframe: "A standalone peel is a nice glow for an event; the program is the compounding version — both are legitimate buys, they're just different products.",
        close: "Event glow or program — which are we booking?",
      },
    ],
    upsells: [
      "Membership enrollment at the first peel (the natural moment)",
      "Replenishment auto-ship on regimen staples",
      "Graduation path: program results → IPL or microneedling conversation for what topicals can't reach",
    ],
    rebooking: "Series peels monthly; regimen check at week 6 (adjust actives); membership makes the cadence automatic.",
    closeScript:
      "For your [CONCERN], the program is three peels a month apart with your regimen — $[PROGRAM TOTAL], or [MEMBER PRICE] on the membership with your products discounted. Your week-6 skin check is where we adjust. Shall I set up the program and your first peel for [DATE]?",
    personaPool: ["derm-genz", "derm-medical-visit", "derm-spouse", "derm-reviews", "derm-fitz"],
    clinicalContext:
      "Consult or checkout conversation in a physician-led practice; often staff-run. Patient has acne marks, melasma, or dullness — or is finishing a procedure whose results need a regimen. Provider/staff must screen (isotretinoin/retinoid timing, pregnancy, cold sores, sun honesty for melasma, current products), set program-not-product expectations, coach the adjustment period, and offer membership without pressure. Retail target is a healthy practice reality — the ethical version is replacing what doesn't work, not stacking what does. Cash-pay: peels $225 default; regimens $150–400.",
    patientCc:
      "My skin's dull and I've still got dark marks from breakouts last year. I have a drawer full of serums from TikTok and honestly none of it's doing anything.",
    closeGoal:
      "Patient starts the program (peel series + regimen, membership offered) or a regimen-only start — with the week-6 check booked.",
    difficultyNotes:
      "The patient is product-fatigued and suspicious of being sold more bottles. They reward a build-from-what-you-own audit, program framing, and melasma/SPF straight talk; they punish shelf-stacking, pressure, or dismissing their current products wholesale. SPEECH STYLE: chatty, brand-name-heavy, two to three sentences.",
  },
  {
    key: "lesion-removal",
    name: "Cosmetic lesion removal",
    shortDesc: "Skin tags, seborrheic keratoses, cherry angiomas, milia, DPNs — the medical-to-cash bridge",
    priceDisplay: "from $125/lesion",
    priceStructure:
      "Per lesion $100–300 by size/method, or tier pricing: 1–3 lesions $275, 4–10 lesions $600, full-session clearance $950. Quote the tier after counting together in the mirror.",
    packageOptions: [
      "Per-lesion for one or two bothersome spots",
      "Tier pricing for multiples (the common case)",
      "Annual 'spring cleaning' session for recurring crops (tags, DPNs)",
    ],
    idealCandidate:
      "Benign, clinician-confirmed lesions the patient finds irritating or unsightly — tags that catch on collars, SKs, cherry angiomas, milia, DPNs. Anything atypical goes down the MEDICAL pathway first, full stop.",
    screening: [
      "Clinical confirmation each lesion is benign — anything uncertain is biopsied medically, never cosmetically removed", // CLINICAL REVIEW
      "Keloid/hypertrophic history (healing expectations by site)",
      "Skin tone — method choice for pigment-safe removal of DPNs", // CLINICAL REVIEW
      "Blood thinners for shave/snip methods", // CLINICAL REVIEW
    ],
    consentEssentials: [
      "Why insurance doesn't pay: these are benign and removal is elective — coverage is about medical necessity, not about whether the thing is annoying",
      "Small scab or light mark for days-to-weeks by method and site; pigment-safe technique for deeper tones",
      "Some lesion types (tags, DPNs) tend to make new ones over time — removal clears what exists, it doesn't stop the tendency",
      "Anything that looks atypical gets a medical eye first — that's a feature of doing this at a dermatology practice",
    ],
    objections: [
      {
        front: "Why won't my insurance cover this? It's a skin thing and you're a doctor.",
        isolate: "Want the honest one-sentence version of how insurers draw that line?",
        reframe: "Insurance pays when something is medically necessary — suspicious, bleeding, obstructing. These are benign and bothering you, which makes removal your choice rather than their obligation; the upside of elective is we do it today, your way, no paperwork.",
        close: "We counted eleven — want the full-clearance tier while you're already here?",
      },
      {
        front: "The dermatologist I saw years ago froze one off and billed insurance.",
        isolate: "Did that one have a medical reason attached — changing, bleeding, suspicious?",
        reframe: "Exactly — when there's a medical indication we still bill medically, every time. What we counted today is cosmetic, and pretending otherwise on a claim is fraud nobody should want on their chart.",
        close: "For these eleven, tier pricing has you clear today for $[TIER] — shall we?",
      },
      {
        front: "A hundred bucks a spot adds up fast.",
        isolate: "Is it one or two that really bother you, or the whole collection?",
        reframe: "That's why the tiers exist — per-lesion pricing is for the one tag your collar hates; the session tier clears the lot for less than half the per-spot math.",
        close: "Which is it today — the collar tag, or the clean sweep?",
      },
      {
        front: "Will I scar?",
        isolate: "Where are the ones you care most about — face, neck, torso?",
        reframe: "Honest answer by site and method: most heal to nothing or near-nothing, a small mark is possible for weeks, and on deeper skin tones we choose the pigment-safe method on purpose.",
        close: "Comfortable starting with the two on your neck and judging the healing before the rest?",
      },
      {
        front: "Can't I just use one of those freeze kits from the pharmacy?",
        isolate: "Has the drugstore kit actually cleared any of them so far?",
        reframe: "Home kits under-treat and blister healthy skin around the target — and they've never met the one rule that matters: being sure of what you're freezing. Here a clinician confirms each one first.",
        close: "Since you're here and they're confirmed — clear them properly today?",
      },
      {
        front: "They'll just grow back anyway, right?",
        isolate: "Is your goal never seeing one again, or being clear of the fifty you have now?",
        reframe: "The removed ones don't return; your skin's tendency to make new tags is yours for life — which is why the annual clean-up exists, like a dental cleaning for your neck.",
        close: "Clear today and book next year's session as a standing visit?",
      },
    ],
    upsells: [
      "Annual clearance session as a standing booking",
      "Skincare regimen conversation when texture/sun damage is noted during the count",
      "IPL conversation for the sun damage usually sitting alongside SKs",
    ],
    rebooking: "Healing check only when sites warrant; annual clearance session for the tag/DPN-prone, booked before leaving.",
    closeScript:
      "We counted [N] together, all confirmed benign. Per spot that's $[PER], but the session tier clears everything today for $[TIER] and they heal over the next couple of weeks. Want the full clearance now, and shall I set your annual while we're at it?",
    personaPool: ["derm-medical-visit", "derm-male-first", "derm-spouse", "derm-fitz", "derm-shopper"],
    clinicalContext:
      "The classic medical-to-cosmetic bridge in a medical derm practice — often raised during a skin check. Provider must confirm benignity (anything atypical exits to the medical pathway), explain the insurance line honestly WITHOUT it feeling like an upsell, count and tier transparently in the mirror, set healing expectations by site and skin tone, and name the recurrence tendency. Cash-pay tiers; per-lesion $100–300.",
    patientCc:
      "While I'm here for the skin check — these skin tags on my neck drive me crazy, and my last doctor said insurance wouldn't touch them. Why is that, and what would it cost to just be done with them?",
    closeGoal:
      "Patient clears the counted lesions at the appropriate tier today (or books the session), with the insurance rationale landing as fair rather than salesy.",
    difficultyNotes:
      "The patient feels vaguely cheated by insurance and is testing whether the clinic is gouging. They reward the plain coverage explanation, counting together, and tier math; they punish defensiveness about insurance, pressure, or any suggestion of coding games. SPEECH STYLE: matter-of-fact, lightly grumbly about insurance, two sentences.",
  },
];

export const DERM_MODULE_KEYS = DERM_MODULES.map((m) => m.key);

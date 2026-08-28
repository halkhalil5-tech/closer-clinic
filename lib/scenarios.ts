import type { Scenario } from "./types";

/**
 * Launch scenario library. This is the canonical source: the Supabase seed
 * script upserts from here, and dev mode reads it directly. Scenarios are
 * data, not code — custom clinic scenarios (Phase 2) live only in the DB.
 */
export const SCENARIOS: Scenario[] = [
  {
    slug: "shockwave-plantar-fasciitis",
    specialty: "podiatry",
    title: "Shockwave series",
    serviceDesc: "Extracorporeal shockwave therapy (ESWT), series of 3 sessions",
    priceDisplay: "$600",
    priceStructure: "$600 for the 3-session series, cash-pay, one session per week",
    clinicalContext:
      "Chronic plantar fasciitis, 8 months. In-office ultrasound today measured the plantar fascia at 6mm (normal ≤4mm) with hypoechoic thickening at the calcaneal insertion. Patient has already done stretching, OTC orthotics, NSAIDs, and one cortisone injection with temporary relief. Literature supports ESWT for chronic recalcitrant plantar fasciitis with roughly 70–80% meaningful improvement.",
    patientCc:
      "Heel pain every morning for most of a year — first steps out of bed are brutal, and it aches after a day on my feet.",
    closeGoal:
      "Patient agrees to the $600 / 3-session shockwave series and books the first session before leaving.",
    objectionSeeds: [
      "Why doesn't insurance cover this if it actually works?",
      "The cortisone shot helped for a while — can't we just do another one?",
      "$600 is a lot for something that might not work.",
      "I read shockwave hurts.",
      "Can I just keep stretching and see how it goes?",
    ],
  },
  {
    slug: "laser-nail-fungus-program",
    specialty: "podiatry",
    title: "Laser nail fungus program",
    serviceDesc: "Laser therapy for onychomycosis — yearlong program, one session every 2 months",
    priceDisplay: "$900 program",
    priceStructure:
      "$150 per session; the full program is 6 sessions over 12 months ($900). A single session ($150) can be offered as a comparison anchor, but singles rarely clear the nail.",
    clinicalContext:
      "Distal subungual onychomycosis involving 4 nails, confirmed on clinical exam (thickened, yellow, subungual debris). Patient declined oral terbinafine after reading about liver monitoring. Topicals alone have low cure rates on moderate involvement. Laser works over months because the nail grows out slowly — one session is not a cure, which is exactly why the program structure exists.",
    patientCc:
      "My toenails are thick and yellow and I'm embarrassed to wear sandals. I've been hiding my feet for two summers.",
    closeGoal:
      "Patient enrolls in the $900 yearlong program (not just a single $150 session) and books session one.",
    objectionSeeds: [
      "Can I just do one session and see if it works?",
      "$900 for toenails seems insane.",
      "The pills are covered by insurance, why isn't this?",
      "My friend used Vicks VapoRub and swears by it.",
      "Will it come back anyway?",
    ],
  },
  {
    slug: "mls-laser-neuropathy",
    specialty: "podiatry",
    title: "MLS laser package (neuropathy)",
    serviceDesc: "MLS robotic laser therapy for diabetic peripheral neuropathy, 6-session package",
    priceDisplay: "$450",
    priceStructure: "$450 for 6 sessions, typically 2 sessions per week for 3 weeks",
    clinicalContext:
      "Type 2 diabetic, A1c 7.8, distal symmetric polyneuropathy — burning and numbness in both feet, worse at night. On gabapentin 300mg TID with partial relief and daytime grogginess they hate. Monofilament exam shows diminished protective sensation. MLS laser is an adjunct: improves microcirculation and can reduce symptom burden; it is not a cure and honest framing matters with this population.",
    patientCc:
      "My feet burn at night — the gabapentin takes the edge off but makes me foggy, and honestly I want to know if this laser thing is real or a gimmick.",
    closeGoal:
      "Patient commits to the $450 / 6-session MLS laser package and schedules the first two sessions.",
    objectionSeeds: [
      "Is this a gimmick? My endocrinologist never mentioned it.",
      "If it worked, wouldn't insurance cover it?",
      "I already pay for test strips, gabapentin, the endocrinologist...",
      "What are the odds it does anything for me specifically?",
      "Can't you just up my gabapentin instead?",
    ],
  },
  {
    slug: "custom-orthotics",
    specialty: "podiatry",
    title: "Custom orthotics",
    serviceDesc: "Custom functional orthotics from 3D scan, dispensed with follow-up adjustment",
    priceDisplay: "$525",
    priceStructure: "$525 per pair, cash (insurance denied coverage); includes casting/scan, dispense visit, and one adjustment",
    clinicalContext:
      "Patient is on their feet 10+ hours a day on hard flooring. Flexible pes planus with overpronation, posterior tibial tendon tenderness, and medial arch strain. Insurance denied custom orthotics as 'not medically necessary.' They've cycled through three $60 drugstore inserts that flatten within weeks. Custom devices control the pronation OTC inserts can't; expected lifespan 2–3 years.",
    patientCc:
      "By hour six on my feet my arches and inside ankles are killing me. The Dr. Scholl's inserts help for maybe two weeks and then they're pancakes.",
    closeGoal:
      "Patient pays for the $525 custom orthotics and gets scanned today.",
    objectionSeeds: [
      "Why did insurance deny it if I actually need them?",
      "$525 versus $60 inserts is a huge jump.",
      "My coworker bought custom orthotics and never wears hers.",
      "Can I get the scan and think about it?",
      "Do those Good Feet Store ones work? They advertise constantly.",
    ],
  },
  {
    slug: "otc-attach-checkout",
    specialty: "podiatry",
    title: "OTC attach at checkout",
    serviceDesc: "Clinic-dispensed topical antifungal after routine diabetic nail debridement",
    priceDisplay: "$38",
    priceStructure: "$38 one-time, bottle lasts ~3 months",
    clinicalContext:
      "Routine diabetic foot care visit, nails debrided. Early tinea pedis between the 4th/5th toes and mild fungal changes in two nails — worth treating now before it spreads to freshly trimmed nails. The clinic carries a clinical-strength topical (tolnaftate/urea formulation) that beats the drugstore versions on penetration. This is a small attach close: quick, confident, at checkout.",
    patientCc:
      "Just here for my regular nail care — feet feel fine, maybe a little itchy between the toes sometimes.",
    closeGoal:
      "Patient adds the $38 topical at checkout today.",
    objectionSeeds: [
      "Can't I just grab something at Walgreens for $12?",
      "It's just a little itch, is it really worth treating?",
      "I already spent my copay today.",
      "I have some old cream at home somewhere.",
    ],
    difficultyNotes:
      "This is a micro-close. Even on hard, the patient's resistance is casual, not hostile — the skill being trained is asking confidently for a small sale without over-explaining.",
  },
  {
    slug: "insurance-objection-shockwave",
    specialty: "podiatry",
    title: "Insurance objection (hard anchor)",
    serviceDesc: "Shockwave therapy series for chronic plantar fasciitis — patient anchored on insurance coverage",
    priceDisplay: "$600",
    priceStructure: "$600 for the 3-session series, cash-pay",
    clinicalContext:
      "Same clinical picture as the shockwave station: chronic plantar fasciitis, failed conservative care, ultrasound-confirmed 6mm fascia. The difference is the patient: they believe on principle that anything a doctor recommends should be covered, and 'why isn't this covered' is their fortress. The skill: reframe from what insurance values to what the patient's mornings are worth, without bashing insurance companies.",
    patientCc:
      "My heel's been wrecked for a year. But before you go any further — if this shockwave thing works so well, why won't my insurance pay for it?",
    closeGoal:
      "Patient accepts that coverage ≠ value, agrees to the $600 series, and books session one.",
    objectionSeeds: [
      "If it worked, insurance would cover it. That's how insurance works.",
      "So I pay premiums AND pay you cash? That's double-dipping.",
      "Can you write it up differently so insurance takes it?",
      "I'll wait until it's covered.",
      "My deductible is huge — everything's out of pocket anyway, so why this too?",
    ],
    difficultyNotes:
      "The insurance anchor should resurface at least twice even after a good answer. On hard, the patient asks the provider to 'code it creatively' — a good provider declines cleanly without lecturing.",
  },
  {
    slug: "amniotic-injection-fasciitis",
    specialty: "podiatry",
    title: "Amniotic / regenerative injection",
    serviceDesc: "Amniotic membrane-derived injection for chronic plantar fasciitis",
    priceDisplay: "$800–$1,200",
    priceStructure: "Single injection, $800–1,200 depending on product size; quote a specific number and hold it",
    clinicalContext:
      "Chronic plantar fasciitis, 14 months. Failed: stretching, orthotics, NSAIDs, two cortisone injections, night splint. Repeat cortisone risks fascia degeneration/rupture. Amniotic injection delivers growth factors and extracellular matrix to a degenerated (not inflamed) fascia — this is degenerative fasciosis at this point. Cash-pay because payers class amniotic products as investigational. This is the regenerative-medicine price talk track: highest sticker on the podiatry menu.",
    patientCc:
      "I've done everything for this heel — shots, inserts, the splint thing at night. I'm here because you said there was one more option before we talk surgery.",
    closeGoal:
      "Patient agrees to the amniotic injection at the quoted price and schedules it.",
    objectionSeeds: [
      "Over a thousand dollars for ONE shot?",
      "The cortisone shots were covered — why is this one different?",
      "Is this the stem cell thing? I heard that's a scam.",
      "What if it doesn't work — do I get my money back?",
      "Maybe I should just do the surgery, insurance covers that.",
    ],
    difficultyNotes:
      "Price is 2x anything else in the clinic. The patient should test whether the provider flinches on the number. 'Surgery is covered' is the trap answer — the provider should compare downtime, risk, and success rates honestly.",
  },
  {
    slug: "cash-nail-surgery-conversion",
    specialty: "podiatry",
    title: "Cash nail surgery conversion",
    serviceDesc: "Partial nail avulsion with matrixectomy (permanent ingrown toenail correction), done today",
    priceDisplay: "$350",
    priceStructure: "$350 cash, done in this visit; patient has a $6,000 unmet deductible so 'covered' still means full price billed through insurance — likely more than $350 after facility markups",
    clinicalContext:
      "Recurrent ingrown right hallux nail, third flare this year, currently inflamed with early paronychia. Patient has a high-deductible plan with $6,000 unmet — nothing is 'free' for them this year. Definitive fix is a partial matrixectomy: 20 minutes, local anesthetic, permanent on that border in ~95% of cases. The alternative they keep choosing: soak it, take antibiotics, come back when it's worse.",
    insuranceOverride: "Bronze plan, $6,000 deductible (unmet)",
    patientCc:
      "This stupid toenail is infected again. Can you just clip it out like last time and give me the antibiotics?",
    closeGoal:
      "Patient agrees to the definitive $350 matrixectomy today instead of another temporary trim.",
    objectionSeeds: [
      "Just trim it like last time, that worked for a few months.",
      "I can't do a procedure today, I wasn't planning on it.",
      "$350 right now? I have insurance!",
      "Won't it grow back anyway?",
      "I can't be off my feet, I work standing up.",
    ],
    difficultyNotes:
      "The high-deductible math is the unlock: through insurance they'd pay MORE. A provider who does that math out loud, then offers 'we can do it right now, you're already numb-able,' should win. Watch for the provider forgetting to actually ask for the decision.",
  },
  {
    slug: "stratum-wj-achilles",
    specialty: "podiatry",
    title: "Wharton's jelly injection (Achilles)",
    serviceDesc:
      "Ultrasound-guided Stratum WJ (Wharton's jelly whole-tissue flowable, 1 mL cryopreserved allograft) injection for chronic mid-portion Achilles tendinopathy",
    priceDisplay: "$2,400",
    priceStructure:
      "$2,400 for the single 1 mL injection under ultrasound guidance, cash-pay, includes the 6-week loading protocol and two follow-ups; clinic-set price, quote the number and hold it",
    clinicalContext:
      "Mid-portion Achilles tendinopathy, 14 months, non-insertional (4–5 cm above the calcaneus). Failed a full 12-week eccentric loading protocol, physical therapy, heel lifts, activity modification, and NSAIDs. Corticosteroid was deliberately NOT offered — peritendinous steroid around the Achilles carries real rupture risk, and you told them that. Ultrasound today: tendon thickened to 9.4 mm (contralateral 5.1), hypoechoic disorganized fibers with neovascularity on Doppler. This is degeneration, not inflammation — there is nothing left to calm down. The realistic menu now is: keep loading and wait, shockwave, a biologic injection, or surgical debridement with 3–6 months of recovery. Stratum WJ is a physician-directed perinatal tissue allograft, lot-tested for sterility, endotoxin and mycoplasma, 94–96% post-thaw viability. It is NOT an FDA-approved drug, it is not a cure, and the published evidence specific to Achilles tendinopathy is thin — high-quality trials are mostly in knee OA and other tendons. Cash-pay because payers class perinatal biologics as investigational.",
    patientCc:
      "Fourteen months. I did every single one of those heel-drop exercises you gave me, twice a day, for three months. I can't run, I can't take my dog out properly, and now you want to inject something into my Achilles that I'm pretty sure I read the FDA sent warning letters about.",
    closeGoal:
      "Patient accepts the $2,400 Stratum WJ injection with an honest, non-overstated framing of the evidence, and books the procedure.",
    objectionSeeds: [
      "Is this the stem cell thing? I googled it — the FDA has sent warning letters to clinics selling stem cell injections.",
      "Twenty-four hundred dollars out of my pocket. If this actually worked, wouldn't insurance cover it?",
      "Show me the studies on Achilles specifically. Not knees. Not shoulders. Achilles.",
      "My cousin got PRP in his elbow for seven hundred bucks. Why is yours three times that?",
      "It comes from an umbilical cord? From an actual baby? Did the mother agree to that?",
      "What happens if I pay you twenty-four hundred dollars and my heel still hurts in three months?",
      "What if I just wait it out — these things get better on their own eventually, don't they?",
    ],
    difficultyNotes:
      "HARD, and specifically a compliance test. This patient has read FDA warning letters about unapproved stem-cell products and will not be soothed by enthusiasm. The provider WINS by being scrupulously honest: name what the material actually is (a lot-tested perinatal tissue allograft, physician-directed, not an approved drug), concede plainly that Achilles-specific evidence is thin, refuse to promise a result or a refund, and reframe the decision as a choice between the four real options given 14 months of failed loading. The provider LOSES by overclaiming — any 'it regenerates the tendon', 'stem cells rebuild it', 'this will fix you', or a money-back promise should be treated as a red flag by the patient and must not be rewarded. Push back at least twice on evidence even after a good answer. The donation-consent question deserves a straight, unembarrassed answer. Agree only if the provider stays honest AND asks for the decision.",
  },

  /* ===================== regenerative medicine ===================== */
  {
    slug: "regen-knee-single",
    specialty: "regen",
    title: "Knee injection — single joint",
    serviceDesc: "Image-guided regenerative biologic injection, single knee",
    priceDisplay: "$4,500",
    priceStructure:
      "$4,500 for the single-joint knee protocol: the injection under ultrasound guidance, pre-procedure labs, and two follow-up visits. Cash-pay; quote the number and hold it",
    clinicalContext:
      "62-year-old with medial compartment knee osteoarthritis, KL grade 3 on standing X-ray — the outside ortho said 'bone on bone, start thinking about replacement.' Failed NSAIDs, two hyaluronic acid series, and a home exercise program. Not a surgical emergency: replacement is elective and can be deferred. A biologic injection is a reasonable joint-preservation attempt in this window — it does NOT regrow cartilage, and honest framing is expectation management (pain and function, not structural reversal). The supervising physician has reviewed imaging and cleared the recommendation. Cash-pay because payers class these products as investigational.",
    patientCc:
      "My ortho looked at the X-ray and said bone on bone, start thinking about a replacement. I'm 62. I'm not ready for that.",
    closeGoal:
      "Patient agrees to the $4,500 single-knee protocol with honest expectations set, and books the procedure.",
    objectionSeeds: [
      "My ortho says I need a replacement — are you saying he's wrong?",
      "If this works, why did nobody at the hospital offer it?",
      "$4,500 out of pocket, and insurance would pay for the whole replacement?",
      "How do I know this isn't just an expensive placebo?",
      "What are the odds it works for a knee like mine?",
    ],
    difficultyNotes:
      "The competing-authority trap: disparaging the orthopedist loses the room. The win is sequencing — replacement stays on the table; this is the attempt you make while you still have the window. Any 'it regrows cartilage' claim is an overpromise the patient should punish.",
  },
  {
    slug: "regen-shoulder-cuff",
    specialty: "regen",
    title: "Shoulder / rotator cuff",
    serviceDesc: "Ultrasound-guided regenerative biologic injection for partial-thickness rotator cuff pathology",
    priceDisplay: "$3,800",
    priceStructure: "$3,800 for the shoulder protocol: guided injection, labs, and two follow-ups. Cash-pay",
    clinicalContext:
      "54-year-old recreational lifter. MRI: partial-thickness supraspinatus tear (<50%), tendinosis, no full-thickness retraction — not currently a surgical tear. Two subacromial cortisone injections helped, then stopped helping; repeat steroid risks further tendon degradation, which is exactly the wrong direction for tissue you're trying to preserve. Sleep disruption from night pain is the patient's biggest daily cost. Goals: sleep on that side, keep lifting.",
    patientCc:
      "The cortisone worked twice and then it just stopped. I still want to lift, I still want to sleep on that side.",
    closeGoal:
      "Patient agrees to the $3,800 shoulder protocol and books it, with a loading plan that protects their lifting goal.",
    objectionSeeds: [
      "Why not just do a third cortisone shot? Those were covered.",
      "My gym buddy said just rehab it harder.",
      "Is there any actual evidence for shoulders, or just knees?",
      "$3,800 — that's a vacation.",
    ],
    difficultyNotes:
      "Easy lane: one or two objections, persuadable. The cortisone-ceiling story is the frame — the last two shots bought time and cost tissue. Reward tying the plan to their stated goals (sleep, lifting) rather than the MRI alone.",
  },
  {
    slug: "regen-low-back",
    specialty: "regen",
    title: "Chronic low back — been everywhere",
    serviceDesc: "Regenerative biologic protocol for chronic discogenic low back pain (multilevel, non-surgical)",
    priceDisplay: "$5,200",
    priceStructure:
      "$5,200 for the lumbar protocol: image-guided injections at the involved levels, labs, and a structured 12-week follow-up arc. Cash-pay",
    clinicalContext:
      "48-year-old with 6 years of axial low back pain, degenerative disc disease L4-5/L5-S1 without radiculopathy. Completed two full PT courses, two rounds of epidural steroid injections (transient relief), walked out of a fusion consult. This is the most evidence-thin station on the roster: for discogenic pain the biologic literature is early, small-N, and mixed — the honest pitch is 'a reasonable attempt before fusion, not a proven fix.' Fusion for axial pain has its own famously mixed outcomes, which is a fair, honest comparator. The patient is testing whether this clinic is different from the six providers who overpromised before.",
    patientCc:
      "I've done PT, two rounds of epidurals, and a fusion consult I walked out of. So — convince me this is different.",
    closeGoal:
      "Patient agrees to the $5,200 lumbar protocol with explicitly honest odds, and schedules it.",
    objectionSeeds: [
      "Every one of you people has said 'this is different.' Why should I believe you?",
      "Five grand, cash, for something you can't even show me a big study on?",
      "The pain clinic said injections like this are snake oil for backs.",
      "What's your actual success rate for backs — not knees, backs?",
      "If it fails I'm right back where I started, minus $5,200.",
    ],
    difficultyNotes:
      "HARD. This patient has been burned six times; enthusiasm reads as another sales pitch. The win is radical honesty about the thin evidence plus a concrete definition of what success would look like at 12 weeks — and still asking for the decision. Any invented success percentage should destroy trust in character.",
  },
  {
    slug: "regen-fda-anchor",
    specialty: "regen",
    title: "\"Is it FDA approved?\" (hard anchor)",
    serviceDesc: "Image-guided regenerative biologic injection, single knee — regulatory-question anchor station",
    priceDisplay: "$4,500",
    priceStructure: "$4,500 for the single-joint knee protocol, cash-pay",
    clinicalContext:
      "58-year-old with KL grade 2-3 knee OA, good candidate on exam and imaging. Opens the visit with the FDA question and has done real reading — knows warning letters exist, knows the products aren't FDA-approved drugs. The truthful frame: the product is a regulated human tissue allograft distributed under FDA registration (361 HCT/P pathway where applicable), lot-tested by the supplier — but it is NOT an FDA-APPROVED treatment for arthritis, no biologic injection is, and clinics that claim otherwise have earned warning letters. The clinical call sits with the supervising physician. The station is won or lost on this answer alone.",
    patientCc:
      "Before you tell me anything else about the knee — is this FDA approved? Because what I read online says it isn't.",
    closeGoal:
      "Patient hears a truthful, non-defensive regulatory answer, and agrees to the $4,500 protocol.",
    objectionSeeds: [
      "So it's NOT approved. Why would I put an unapproved product in my knee?",
      "The FDA sent warning letters to clinics like this one. Why not yours?",
      "If the science were solid it'd be approved by now, wouldn't it?",
      "My pharmacist said don't touch anything that isn't FDA approved.",
      "Show me something in writing that says what you just told me.",
    ],
    difficultyNotes:
      "HARD anchor. Any claim or implication of FDA approval is an instant, unrecoverable loss of trust — the patient has the articles open on their phone. The win: agree the products are not FDA-approved, distinguish regulated tissue from approved drug WITHOUT minimizing, offer it in writing, and let the honesty itself become the close.",
  },
  {
    slug: "regen-iv-longevity",
    specialty: "regen",
    title: "IV / longevity protocol",
    serviceDesc: "Quarterly IV wellness and longevity protocol with baseline and follow-up biomarker panels",
    priceDisplay: "$2,400 program",
    priceStructure:
      "$2,400 for the annual protocol: four quarterly IV sessions plus baseline and 12-month biomarker panels. $650 for a single session as a comparison anchor",
    clinicalContext:
      "44-year-old, healthy, proactive — no diagnosis, no complaint. This is a wellness sale, and the compliance line moves accordingly: no disease-prevention claims, no 'this extends your life' — the honest frame is measured biomarkers, protocol consistency, and how they feel across the year. The patient is pre-sold on the category (a friend does it in Scottsdale) but shopping on trust and structure, not need.",
    patientCc:
      "Nothing's wrong with me. I'm 44 and I want to stay ahead of it. My buddy does this somewhere in Scottsdale.",
    closeGoal:
      "Patient enrolls in the $2,400 annual protocol (not a one-off session) and books the baseline panel.",
    objectionSeeds: [
      "What am I actually getting that a multivitamin doesn't do?",
      "My buddy pays per session — why are you pushing a year upfront?",
      "Can you prove any of this does anything?",
      "I travel constantly — what if I miss a quarter?",
    ],
    difficultyNotes:
      "Moderate. The trap is borrowing medical legitimacy the service doesn't claim — any disease-prevention promise is an overreach the patient should notice ('wait, my doctor said nothing prevents that'). The honest close sells measurement and consistency.",
  },
  {
    slug: "regen-hair-program",
    specialty: "regen",
    title: "Hair restoration program",
    serviceDesc: "Regenerative hair restoration program: scalp injection series with photographic tracking",
    priceDisplay: "$2,900 program",
    priceStructure:
      "$2,900 for the program: three injection sessions six weeks apart, standardized photos at each visit, and a 6-month review. Cash-pay",
    clinicalContext:
      "38-year-old with androgenetic alopecia, Norwood III vertex — 'mostly the crown.' A year of 5% topical minoxidil with poor adherence and no perceived change. Realistic outcome band: stabilization and modest regrowth in responders over 6-12 months; non-response is real and the photos will show it either way. This is a confidence-and-cadence sale: the series and the photographic tracking ARE the product.",
    patientCc:
      "It's mostly the crown. I've been doing the foam for a year and I don't think it's doing anything.",
    closeGoal:
      "Patient enrolls in the $2,900 program and books session one.",
    objectionSeeds: [
      "The foam was forty bucks a month and did nothing — why would this work?",
      "My cousin got a transplant in Turkey for less than this.",
      "How long before I actually see anything?",
      "What if I'm one of the people it doesn't work for?",
    ],
    difficultyNotes:
      "Easy lane. Reward honest response-rate framing and the photo-tracking promise ('the photos will tell us the truth either way'). Guaranteeing regrowth is the overpromise to avoid.",
  },
  {
    slug: "regen-family-neuro",
    specialty: "regen",
    title: "Family caller — neuro",
    serviceDesc: "Comprehensive regenerative protocol inquiry for post-stroke recovery (family member calling)",
    priceDisplay: "$9,500",
    priceStructure:
      "$9,500 for the comprehensive protocol: physician evaluation, candidacy review of records and imaging, and — only if the supervising physician accepts the case — the treatment series and follow-up arc",
    clinicalContext:
      "The caller is the adult child of a 71-year-old woman five months post ischemic stroke, plateaued in rehab, left-sided weakness and word-finding trouble. THE COMPLIANCE CEILING OF THE ENTIRE APP: there is no established evidence that any biologic injection reverses stroke deficits — anyone promising recovery to this family is lying to a desperate person. The honest path: enormous empathy for the 2am research spiral; zero promises; what the evaluation can and cannot determine; the supervising physician decides candidacy and may decline the case; continued conventional rehab is non-negotiable either way. An honest close here is booking the EVALUATION with truthful expectations — a family that hears 'this may help your mother' has been closed dishonestly.",
    patientCc:
      "My mom had a stroke in March. She's plateaued in therapy. I've been up until 2am reading about stem cells and I need to know if this can help her.",
    closeGoal:
      "The caller books the physician evaluation with explicitly honest expectations — no recovery promised, candidacy not guaranteed, rehab continues regardless.",
    objectionSeeds: [
      "Just tell me straight — can this bring her arm back or not?",
      "I watched a clinic's video where a stroke patient walked again. Is that real?",
      "$9,500 is her savings. I can't gamble her money on a maybe.",
      "Her neurologist said absolutely not, it's exploitation. Why is he wrong?",
      "If your own mother had this stroke — would YOU pay for it?",
      "I feel like every place I call is trying to sell me hope.",
    ],
    difficultyNotes:
      "THE HARDEST STATION IN THE APP, and deliberately so. The caller is grieving and vulnerable; every overpromise should be punished doubly, and pressure on a distressed family member is an automatic loss. The neurologist's warning is fair and must be met with respect, not defense. The winnable close is small and honest: the evaluation, truthfully framed, with the physician free to say no. Watch for the provider promising outcomes to end the caller's pain — that is the exact failure this station exists to catch.",
  },
  {
    slug: "regen-second-joint",
    specialty: "regen",
    title: "Second-joint attach",
    serviceDesc: "Second-joint regenerative injection for an existing patient whose first knee responded",
    priceDisplay: "$2,800",
    priceStructure:
      "$2,800 for the second joint — reduced from $4,500 because evaluation, labs, and candidacy work are already done. Same-visit scheduling available",
    clinicalContext:
      "Existing patient, 12 weeks after a right-knee protocol with a genuinely good response (documented: pain 7→3, back to golf). Left knee shows KL grade 2 changes and early symptoms — quieter, but the same trajectory the right knee was on three years ago. This is the honest-attach conversation: real indication, established trust, and a price that reflects genuinely lower cost to deliver. The failure mode is selling a joint that doesn't need treating yet — if the exam supports 'monitor,' monitoring must be an offered option.",
    patientCc:
      "The knee feels good, I'll admit it. The other one's been quiet — should I just leave it alone?",
    closeGoal:
      "Patient books the $2,800 second-joint protocol — or a defined monitoring plan if they prefer — with the attach honestly framed around the left knee's own findings.",
    objectionSeeds: [
      "It barely bothers me — aren't you just selling me the other knee now?",
      "Why is it cheaper this time? Was I overcharged before?",
      "Can't we just wait until it hurts like the first one did?",
      "My spouse will say you saw me coming.",
    ],
    difficultyNotes:
      "Moderate. The 'saw me coming' suspicion is the crux — the win anchors on the left knee's OWN imaging and the documented arc of the right. The price-difference question deserves a straight cost-based answer. Pushing past a reasonable 'let's watch it' is the overreach to avoid.",
  },
  {
    slug: "regen-fd-price-shopper",
    specialty: "regen",
    role: "front_desk",
    title: "Phone price shopper",
    serviceDesc: "Inbound phone inquiry: caller comparison-shopping regenerative knee injections by price",
    priceDisplay: "$4,500",
    priceStructure:
      "$4,500 for the single-joint knee protocol — the number is quotable by phone, always attached to what it includes (guided injection, labs, two follow-ups) and to the physician-evaluation first step",
    clinicalContext:
      "Front-desk station, inbound call. The caller is ringing three clinics for a knee 'stem cell shot' price. Policy: quote plainly (hiding the number loses shoppers), attach what it includes in the same breath, and convert the call to a booked evaluation — the desk cannot and must not assess candidacy or promise outcomes; the evaluation is where medicine happens. A caller who books the eval at a fair quote beats one lured by a lowball.",
    patientCc:
      "Hi — quick question, how much are your stem cell injections for a knee? I'm calling a few places.",
    closeGoal:
      "The caller books the physician evaluation before hanging up, with the $4,500 protocol price quoted plainly.",
    objectionSeeds: [
      "The place across town said $2,900. Why are you $1,600 more?",
      "Can you just email me the price list?",
      "I don't want an evaluation, I already know I need the shot.",
      "Is the evaluation fee waived if I book the injection?",
    ],
    difficultyNotes:
      "Moderate. Dodging the number loses the caller instantly. The $2,900 competitor is the anchor — the win itemizes what $4,500 includes without trashing the competitor, then closes on the evaluation with two concrete time options. The desk must never assess or promise clinically.",
  },
  {
    slug: "regen-fd-deposit-leadtime",
    specialty: "regen",
    role: "front_desk",
    title: "Deposit & scheduling the lead time",
    serviceDesc: "Checkout after an accepted knee protocol: scheduling around the 4-6 week material lead time, with deposit",
    priceDisplay: "$4,500",
    priceStructure:
      "$4,500 protocol accepted in the room; a $500 deposit orders the material (4-6 week lead time, physician-directed ordering) and holds the procedure slot; balance due at the visit",
    clinicalContext:
      "Front-desk checkout station. The physician accepted the case and the patient said yes in the room; the biologic is ordered per-case under physician direction and arrives in 4-6 weeks — it cannot be 'done this month.' The desk's job: make the lead time make sense (each order is physician-directed and prepared per case, not shelf stock), take the $500 deposit, and book BOTH the procedure date and the pre-procedure call before they leave. An enthusiastic yes decays fast; the deposit and the calendar are what preserve it.",
    patientCc:
      "So you said four to six weeks before it even gets here? What if I want it done this month?",
    closeGoal:
      "Patient pays the $500 deposit and leaves with the procedure date and pre-procedure call on the calendar.",
    objectionSeeds: [
      "Six weeks? The other clinic said they could do it next week.",
      "Why do you need a deposit if I already said yes?",
      "Can I call back next week to schedule once I check my calendar?",
      "What happens to my $500 if I change my mind?",
    ],
    difficultyNotes:
      "Easy lane. The lead-time reframe is the whole station: per-case physician-directed ordering is a quality story, not an apology ('next week' elsewhere should raise a quiet eyebrow, voiced honestly, without trashing anyone). The refund terms on the deposit must be stated plainly when asked.",
  },

  {
    slug: "fd-schedule-the-series",
    specialty: "podiatry",
    role: "front_desk",
    title: "Schedule the series",
    serviceDesc: "Booking all three shockwave visits at checkout after the doctor closed in the room",
    priceDisplay: "$600",
    priceStructure: "$600 for the 3-session series, cash-pay — already accepted in the room",
    clinicalContext:
      "The patient just said yes to the shockwave series in the exam room and the doctor walked them up to checkout. The money decision is MADE. The risk now is the calendar: if they leave with 'we'll call you to schedule,' a third of these evaporate. The front desk's job is to get all three visits on the books before the patient touches the door.",
    patientCc:
      "Okay, the doctor said I'm doing the shockwave thing... I really do have to run though — can someone just call me to set up the appointments?",
    closeGoal:
      "All three shockwave sessions booked before the patient leaves, first one within two weeks.",
    objectionSeeds: [
      "Can someone just call me later? I'm double-parked.",
      "I don't have my work schedule in front of me.",
      "Let's just book the first one and see how it goes.",
      "Do I really have to lock in all three now?",
    ],
    difficultyNotes:
      "The patient already said yes to the money — never reopen the price. Resistance is purely logistical and time-pressured. Offering two concrete slots beats asking 'when works for you?'. On hard, the patient is genuinely rushed and needs the desk to make it fast AND complete.",
  },
  {
    slug: "fd-deposit-ask",
    specialty: "podiatry",
    role: "front_desk",
    title: "Deposit ask",
    serviceDesc: "Collecting the $150 booking deposit for the laser nail program at checkout",
    priceDisplay: "$150",
    priceStructure: "$150 deposit today, applied to the $900 program",
    clinicalContext:
      "The patient accepted the $900 laser nail program in the room. Clinic policy: a $150 deposit books the series (it holds six laser slots and is fully applied to the program). Patients who skip the deposit no-show the first visit at triple the rate. The desk needs to collect it today, plainly, without apologizing for policy.",
    patientCc:
      "The doctor said to set up the laser package. Can I just pay when I come in for the first one?",
    closeGoal:
      "The $150 deposit is collected today and the first laser visit is booked.",
    objectionSeeds: [
      "Can't I just pay at the first visit?",
      "You don't trust me? I've been coming here for years.",
      "I don't have my card on me... I think.",
      "What if I need to cancel — do I lose the deposit?",
    ],
    difficultyNotes:
      "The skill is stating policy as a benefit ('this holds all six of your laser slots and comes straight off the program') without flinching. Waiving the deposit unprompted is the failure mode. The cancel question deserves a clean, honest answer — deposits transfer to a rescheduled date.",
  },
  {
    slug: "fd-spouse-callback",
    specialty: "podiatry",
    role: "front_desk",
    title: "\u201cI need to talk to my husband\u201d",
    serviceDesc: "Turning a checkout spousal stall into a scheduled decision call with a held slot",
    priceDisplay: "$600",
    priceStructure: "$600 shockwave series — decision pending a spouse conversation",
    clinicalContext:
      "The doctor recommended the shockwave series; the patient warmed up but landed on 'I need to talk to my husband first.' At the desk, that either becomes a concrete plan or it becomes never. The play: validate the conversation, hold a tentative slot, and book a specific callback day/time so the decision has a deadline the patient chose.",
    patientCc:
      "It sounds good, honestly, but $600 is a talk-to-my-husband number. I'll call you guys after we discuss it.",
    closeGoal:
      "A callback scheduled for a specific day and time, plus a tentative first-session slot held in the patient's name.",
    objectionSeeds: [
      "I'll just call you after we talk, I promise.",
      "I don't know when we'll get a chance to discuss it.",
      "Why hold a slot if I might say no?",
      "Can you just email me the info instead?",
    ],
    difficultyNotes:
      "'I'll call you' is a soft no unless the desk converts it: the win is the patient picking the callback time themselves. Pressuring past the spouse conversation is a fail — the conversation is legitimate; the vagueness is the enemy. Holding the slot must be framed as zero-commitment convenience.",
  },
].map((s) => ({ ...s, isCustom: false, active: true })) as Scenario[];

export function getScenario(slug: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.slug === slug && s.active);
}

export function listScenarios(specialty?: string): Scenario[] {
  return SCENARIOS.filter((s) => s.active && (!specialty || s.specialty === specialty));
}

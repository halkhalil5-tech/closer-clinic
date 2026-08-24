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

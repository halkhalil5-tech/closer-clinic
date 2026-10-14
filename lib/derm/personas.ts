import type { Persona } from "../types";

/**
 * Derm archetypes from the vertical brief, kept deliberately brief: each sets
 * a consult topic, a starting receptivity, and the themes the patient raises.
 * Tagged specialty "derm", so they are only rolled via a station's personaPool.
 */
const D = (p: Omit<Persona, "specialty">): Persona => ({ ...p, specialty: "derm" });

export const DERM_PERSONAS: Persona[] = [
  D({
    id: "derm-glp1",
    archetype: "Post-GLP-1 facial volume loss",
    namePool: [
      { name: "Dana Whitfield", gender: "f" },
      { name: "Robert Ellison", gender: "m" },
    ],
    ageRange: [44, 58],
    insuranceTypes: ["PPO (cosmetic not covered)"],
    occupations: ["realtor", "HR director"],
    personality:
      "Happy about major weight loss, unhappy about the facial changes that came with it. Ready to act once the cause is explained plainly. Starts moderately receptive.",
    speechStyle: "Open and direct, mid-length answers.",
    objectionFlavor: "Asks about natural-looking results and whether results hold if weight changes further.",
  }),
  D({
    id: "derm-genz",
    archetype: "Gen Z prejuvenation",
    namePool: [
      { name: "Maya Tran", gender: "f" },
      { name: "Jordan Pike", gender: "m" },
    ],
    ageRange: [22, 28],
    insuranceTypes: ["Parent's plan"],
    occupations: ["social media coordinator", "grad student"],
    personality:
      "Arrives well-researched from social media, asks for products by name and unit count. Appreciates having internet claims corrected respectfully. Starts receptive; budget questions come early.",
    speechStyle: "Fast, brand-fluent, short bursts.",
    objectionFlavor: "Per-unit price comparisons and whether treatment is needed at all at this age.",
  }),
  D({
    id: "derm-male-first",
    archetype: "Male first-timer",
    namePool: [
      { name: "Craig Donahue", gender: "m" },
      { name: "Marcus Bell", gender: "m" },
    ],
    ageRange: [33, 52],
    insuranceTypes: ["Employer HMO"],
    occupations: ["sales director", "firefighter"],
    personality:
      "First visit to an aesthetic practice, came for a functional concern (sweating, jaw tension, redness). Prefers plain mechanical explanations over beauty-industry language. Starts guarded.",
    speechStyle: "Clipped and practical, asks how things actually work.",
    objectionFlavor: "Will anyone notice, and what does this cost per year.",
  }),
  D({
    id: "derm-shopper",
    archetype: "Price shopper",
    namePool: [
      { name: "Tina Alvarez", gender: "f" },
      { name: "Gary Plummer", gender: "m" },
    ],
    ageRange: [29, 49],
    insuranceTypes: ["High-deductible plan"],
    occupations: ["dental hygienist", "retail manager"],
    personality:
      "Has competitor quotes on their phone and opens with the cheapest. Value-driven rather than unable to pay; responds to concrete explanations of what the price difference buys. Starts skeptical.",
    speechStyle: "Numbers-first, quotes competitor prices, interrupts vague answers.",
    objectionFlavor: "Price matching, discount offers elsewhere, and first-visit deals.",
  }),
  D({
    id: "derm-fitz",
    archetype: "Fitzpatrick IV–VI safety questions",
    namePool: [
      { name: "Aisha Robinson", gender: "f" },
      { name: "Dominic Charles", gender: "m" },
    ],
    ageRange: [30, 54],
    insuranceTypes: ["PPO (cosmetic not covered)"],
    occupations: ["school principal", "pharmacist"],
    personality:
      "Has a deeper skin tone and informed concerns about laser and light device safety. Tests the provider's device knowledge before trusting; expects the screening questions to be asked out loud. Starts low receptivity, converts on demonstrated competence.",
    speechStyle: "Measured and specific.",
    objectionFlavor: "Device safety for darker skin tones and what screening will be done.",
  }),
  D({
    id: "derm-redo",
    archetype: "Unhappy with a previous result",
    namePool: [
      { name: "Lauren Kowalski", gender: "f" },
      { name: "Phil Garber", gender: "m" },
    ],
    ageRange: [36, 60],
    insuranceTypes: ["PPO (cosmetic not covered)"],
    occupations: ["accountant", "restaurant owner"],
    personality:
      "Had a disappointing cosmetic result at another practice and wants reassurance this one works differently. Asks process and credential questions. Starts low receptivity; honesty about what went wrong elsewhere, without badmouthing, builds trust.",
    speechStyle: "Cautious, detailed, references the prior experience.",
    objectionFlavor: "Why this time would be different, and what happens if they dislike the result.",
  }),
  D({
    id: "derm-downtime",
    archetype: "Busy professional, downtime-averse",
    namePool: [
      { name: "Vanessa Cole", gender: "f" },
      { name: "Andrew Tsai", gender: "m" },
    ],
    ageRange: [35, 55],
    insuranceTypes: ["Employer PPO"],
    occupations: ["trial attorney", "surgeon's spouse who runs the office"],
    personality:
      "Interested and able to pay, but the calendar rules everything. Wants exact downtime, visible-recovery windows, and scheduling logistics before anything else. Starts receptive but time-boxed.",
    speechStyle: "Efficient, calendar-oriented, asks for specifics.",
    objectionFlavor: "Downtime, visible marks before events, and appointment length.",
  }),
  D({
    id: "derm-medical-visit",
    archetype: "Medical visit, cosmetic mention",
    namePool: [
      { name: "Helen Prescott", gender: "f" },
      { name: "Walter Nguyen", gender: "m" },
    ],
    ageRange: [40, 66],
    insuranceTypes: ["Medicare Advantage", "Employer PPO"],
    occupations: ["librarian", "retired teacher"],
    personality:
      "Came in for a medical skin concern and mentioned a cosmetic bother in passing. Open to hearing options only if the medical issue is clearly handled first; reacts poorly if the visit turns into a pitch. Starts neutral.",
    speechStyle: "Conversational, deferential to the clinician.",
    objectionFlavor: "Whether insurance covers any of it and whether it is worth doing at all.",
  }),
  D({
    id: "derm-spouse",
    archetype: "Needs to consult a partner",
    namePool: [
      { name: "Megan Forsythe", gender: "f" },
      { name: "Luis Herrera", gender: "m" },
    ],
    ageRange: [32, 56],
    insuranceTypes: ["High-deductible plan"],
    occupations: ["stay-at-home parent", "teacher"],
    personality:
      "Genuinely interested but shares finances and decisions with a partner, and says so. Responds well to take-home materials and a concrete plan to bring back; pressure to decide alone ends the visit. Starts receptive.",
    speechStyle: "Warm, agreeable, defers big decisions.",
    objectionFlavor: "Needs to talk it over at home before committing.",
  }),
  D({
    id: "derm-reviews",
    archetype: "Review-driven researcher",
    namePool: [
      { name: "Stephanie Okafor", gender: "f" },
      { name: "Brian Lutz", gender: "m" },
    ],
    ageRange: [28, 50],
    insuranceTypes: ["Employer PPO"],
    occupations: ["project manager", "marketing analyst"],
    personality:
      "Chose the clinic from reviews and before/after photos and cites them. Wants this consult to match what the reviews promised; asks to see relevant examples. Starts receptive and detail-hungry.",
    speechStyle: "References specific reviews and photos, asks comparison questions.",
    objectionFlavor: "Whether their case matches the befores in the photos, and realistic expectations.",
  }),
];

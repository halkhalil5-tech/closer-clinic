import type { ObjectionCard, Scenario } from "../types";
import { DERM_MODULES, type DermModule } from "./modules";

/**
 * Compile the derm module registry into the engine's existing primitives.
 * No component ever reads DermModule directly — modules become ordinary
 * stations and cards, so every downstream feature (grading, script cards,
 * flashcards, packs, seeding) works unchanged.
 */

export function dermStation(m: DermModule): Scenario {
  return {
    slug: `derm-${m.key}`,
    specialty: "derm",
    title: m.name,
    serviceDesc: m.shortDesc,
    priceDisplay: m.priceDisplay,
    priceStructure: m.priceStructure,
    clinicalContext:
      `${m.clinicalContext}\n\nSCREENING THE PROVIDER MUST COMPLETE: ${m.screening.join("; ")}.` +
      `\nCONSENT ESSENTIALS: ${m.consentEssentials.join("; ")}.` +
      `\nUPSELL PATHS (only when discovery supports them): ${m.upsells.join("; ")}.` +
      `\nREBOOKING: ${m.rebooking}`,
    patientCc: m.patientCc,
    closeGoal: m.closeGoal,
    objectionSeeds: m.objections.map((o) => o.front),
    difficultyNotes: m.difficultyNotes,
    closeScript: m.closeScript,
    personaPool: m.personaPool,
    isCustom: false,
    active: true,
  };
}

export function dermCards(m: DermModule): ObjectionCard[] {
  return m.objections.map((o, i) => ({
    id: `derm-${m.key}-${i}`,
    specialty: "derm",
    difficulty: i < 3 ? "easy" : i < 6 ? "moderate" : "hard",
    front: o.front,
    back: { isolate: o.isolate, reframe: o.reframe, close: o.close },
  }));
}

export const DERM_SCENARIOS: Scenario[] = DERM_MODULES.map(dermStation);
export const DERM_OBJECTION_CARDS: ObjectionCard[] = DERM_MODULES.flatMap(dermCards);

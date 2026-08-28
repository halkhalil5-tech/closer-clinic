import { createHash } from "crypto";
import type { Scenario } from "./types";

/**
 * Script cards: the laminated one-pager that lives in the exam-room drawer.
 * Lines come from the station's customized content, tightened by Claude to
 * card length, and cached per (user, station) on a content hash so a price
 * or objection edit regenerates and an unchanged station never does.
 */

export const SCRIPT_CARD_VERSION = 1;

export interface ScriptCardLines {
  /** The price-delivery line, verbatim, ready to say. */
  priceLine: string;
  /** The clinic's top three objections with the recommended response. */
  objections: { objection: string; response: string }[];
  /** The close line. */
  closeLine: string;
  /** The 3-step "if they say maybe" box. */
  ifMaybe: string[];
  /** Vendor-pack stations only: the margin line (patient price vs clinic cost). */
  marginLine?: string;
}

export function scriptCardContentHash(scenario: Scenario): string {
  const basis = JSON.stringify([
    SCRIPT_CARD_VERSION,
    scenario.title,
    scenario.serviceDesc,
    scenario.priceDisplay,
    scenario.priceStructure,
    scenario.closeGoal,
    scenario.objectionSeeds,
    scenario.role ?? "provider",
    scenario.marginNote ?? null,
  ]);
  return createHash("sha256").update(basis).digest("hex").slice(0, 16);
}

export function buildScriptCardPrompt(scenario: Scenario): string {
  const frontDesk = scenario.role === "front_desk";
  return `Write the content for a laminated one-page script card a ${
    frontDesk ? "clinic front-desk staff member" : "healthcare provider"
  } keeps in a drawer. Every line must be short enough to glance at mid-conversation and natural enough to say out loud verbatim. 1–2 sentences per line, no filler, no numbered preamble.

STATION
- Service: ${scenario.serviceDesc}
- Price: ${scenario.priceDisplay} (${scenario.priceStructure})
- Close goal: ${scenario.closeGoal}
- The clinic's real objections for this service:
${scenario.objectionSeeds.map((o) => `  - ${o}`).join("\n")}

${scenario.marginNote ? `VENDOR MARGIN CONTEXT (for the card's margin line ONLY — never patient-facing language):
${scenario.marginNote}
` : ""}Rules:
- priceLine: state the number plainly and stop — no apology, no justification tail.
- objections: pick the THREE most consequential from the list above (quote them tightly), each with a response that isolates or reframes and re-asks. Never a discount.
- closeLine: an assumptive or alternative ${frontDesk ? "scheduling" : ""} close.
- ifMaybe: exactly 3 short steps for "let me think about it" — validate, isolate with a question, set a concrete next step with a date.${scenario.marginNote ? `
- marginLine: ONE compact line for the clinic's eyes only, from the vendor margin context: patient price vs clinic cost and any availability caveat. Plain numbers, no hype.` : ""}

Respond with ONLY a JSON object, no markdown fences:
{"priceLine": "...", "objections": [{"objection": "...", "response": "..."}, {..}, {..}], "closeLine": "...", "ifMaybe": ["...", "...", "..."]${scenario.marginNote ? `, "marginLine": "..."` : ""}}`;
}

export function stubScriptCardJson(scenario: Scenario): string {
  return JSON.stringify({
    priceLine: `[DEV STUB] The full plan is ${scenario.priceDisplay}.`,
    objections: scenario.objectionSeeds.slice(0, 3).map((o) => ({
      objection: o,
      response: "[DEV STUB] Isolate, reframe, re-ask.",
    })),
    closeLine: "[DEV STUB] Mornings or afternoons work better for you?",
    ifMaybe: [
      "[DEV STUB] Validate the pause.",
      "[DEV STUB] Isolate the real objection with a question.",
      "[DEV STUB] Book the follow-up with a date before they leave.",
    ],
    ...(scenario.marginNote ? { marginLine: `[DEV STUB] ${scenario.marginNote}` } : {}),
  } satisfies ScriptCardLines);
}

export function parseScriptCardLines(raw: string): ScriptCardLines {
  const parsed = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
  if (
    typeof parsed.priceLine !== "string" ||
    !Array.isArray(parsed.objections) ||
    parsed.objections.length < 3 ||
    typeof parsed.closeLine !== "string" ||
    !Array.isArray(parsed.ifMaybe) ||
    parsed.ifMaybe.length < 3
  ) {
    throw new Error("Bad script card shape");
  }
  return {
    priceLine: parsed.priceLine,
    objections: parsed.objections.slice(0, 3),
    closeLine: parsed.closeLine,
    ifMaybe: parsed.ifMaybe.slice(0, 3),
    ...(typeof parsed.marginLine === "string" && parsed.marginLine.length > 0
      ? { marginLine: parsed.marginLine }
      : {}),
  };
}

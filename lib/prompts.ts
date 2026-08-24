import type { DrillConfig, PersonaSnapshot, Scenario, TranscriptMessage } from "./types";
import type { Difficulty } from "./types";
import { RUBRIC_LABELS } from "./types";
import { getPersona } from "./personas";

const DIFFICULTY_CONTRACTS: Record<Difficulty, string> = {
  easy: `DIFFICULTY: EASY
- Raise exactly ONE soft objection (pick the most natural one for your character), voiced mildly.
- You are persuadable: any decent clinical rationale tied to your situation, delivered with reasonable confidence, wins you over.
- Once the provider gives a decent rationale and asks you to move forward, agree naturally and let them schedule you.
- Do not stack objections. Do not test the provider twice.`,
  moderate: `DIFFICULTY: MODERATE
- Raise 2–3 genuine objections over the conversation (price, skepticism, "let me think about it" — flavored by your character). Space them out; don't dump them at once.
- Agree ONLY if the provider does all three: (1) ties the treatment to YOUR specific exam findings and situation, (2) states the price plainly without apologizing or unprompted discounting, and (3) asks you a direct closing question.
- If they meet the bar, agree clearly and naturally — ask what times they have, or say you'll do it.
- If they are vague, apologize for the price, or never actually ask, drift into "let me think about it" and stay there.`,
  hard: `DIFFICULTY: HARD
- Be genuinely difficult in your character's style: interrupt mid-pitch at least once, cite a cheaper alternative or a friend's/relative's advice, deflect to insurance, and try to leave with "I'll think about it" at least once.
- If the provider offers an unprompted discount, treat it as a red flag — the price was fake — and get MORE resistant, not less.
- Agree ONLY if the provider does ALL of: (1) stays confident and unrattled through your pushback, (2) isolates your REAL objection by asking you a question (rather than retreating, over-explaining, or capitulating), and (3) uses an assumptive or alternative close ("Let's get your first session on the books — mornings or afternoons?") without any unprompted discounting.
- If they meet that bar, let them win: concede your real concern was addressed and agree to move forward, in character.
- If they give up, pressure you with repetition instead of questions, or discount, end lukewarm and noncommittal.`,
};

export function buildPatientSystemPrompt(
  scenario: Scenario,
  snapshot: PersonaSnapshot,
  difficulty: Difficulty
): string {
  const persona = getPersona(snapshot.personaId);
  const personaBlock = persona
    ? `WHO YOU ARE
${persona.personality}

HOW YOU TALK
${persona.speechStyle}

HOW YOUR OBJECTIONS COME OUT
${persona.objectionFlavor}`
    : `WHO YOU ARE\nA realistic patient matching the profile below.`;

  return `You are roleplaying a PATIENT in a medical office visit. This is a training simulation for the provider, but you must never acknowledge that. You are a real person in an exam room.

PATIENT PROFILE
- Name: ${snapshot.name}
- Age: ${snapshot.age}
- Occupation: ${snapshot.occupation}
- Insurance: ${snapshot.insurance}
- Personality archetype: ${snapshot.archetype}

${personaBlock}

YOUR SITUATION
Chief complaint (why you're here, in your words): ${scenario.patientCc}
The provider will likely recommend: ${scenario.serviceDesc} at ${scenario.priceDisplay} (${scenario.priceStructure}).
Objections that would naturally occur to someone like you (use the ones that fit your character; rephrase in your own voice, never verbatim):
${scenario.objectionSeeds.map((o) => `- ${o}`).join("\n")}
${scenario.difficultyNotes ? `\nScenario-specific behavior note: ${scenario.difficultyNotes}` : ""}

If any clinical or insurance detail above conflicts with your persona's usual profile, the scenario's facts win — weave them into your life story naturally.

${DIFFICULTY_CONTRACTS[difficulty]}

HARD RULES
1. Stay fully in character at all times. Never coach the provider, never break the fourth wall, never mention AI, simulations, roleplay, or grading.
2. Keep every reply to 1–4 sentences of natural spoken language. No stage directions, no asterisks, no narration — only words you'd actually say out loud (a spoken "hm," "huh," or a drawn-out "well..." is fine; "*sighs*" is not).
3. Your lines are performed by a voice, so WRITE THE WAY PEOPLE ACTUALLY TALK and let punctuation carry the rhythm: contractions always ("can't," "it's"), false starts ("I just— look, here's my thing"), hesitations ("Well... I don't know"), trailing sentences that run out of steam ("It's just, six hundred dollars is..."), mid-sentence commas where a real person would pause. Don't write tidy essay sentences.
4. Let your personality leak into everything: tangents, verbal tics, references to your job and life.
5. Reward good technique progressively: when the provider listens, ties things to your specific findings, and speaks plainly about money, warm up. When they are vague, pushy without substance, apologize for the price, or offer unprompted discounts, cool off and drift toward non-commitment.
6. If you are genuinely persuaded per your difficulty contract, agree clearly and naturally — ask to schedule, ask how to pay, or just say yes. Don't drag it out once you're convinced.
7. If the provider gives up or ends the visit without closing, end lukewarm ("I'll give it some thought") — in character.
8. Never volunteer a yes the provider hasn't earned, and never say yes to a close that was never actually asked for.
9. Lines in the conversation marked [EVENT] are stage directions from the simulation (e.g. time pressure). Follow them silently in character; never mention them.
10. OUTPUT CONTRACT: after your spoken reply, on a new FINAL line, output exactly {"receptivity": N} where N is 0-100 — how close you currently feel to saying yes (0 = walking out, 50 = undecided, 100 = ready to book). This line is telemetry: never mention it, never reference it in speech, never omit it.`;
}

export const PATIENT_OPENING_INSTRUCTION =
  "[EVENT] The provider has just walked into the exam room and has not said anything yet — you speak first, into silence. Open the visit in character: greet them briefly and state why you're here today, in your own words. Never open as if replying to something (no \"good, thanks\", no answering a question that wasn't asked). 1–3 sentences.";

export const CLOCK_NUDGE_EVENT =
  "[EVENT] You are starting to feel like this visit is running long — you glance at the clock. From now on you are politely trying to wrap up; if the provider hasn't gotten to the point, you push them to.";

/* --------------------------- prep-a-consult sim --------------------------- */

export interface PrepInput {
  specialty: string;
  ageBand: string;
  condition: string;
  worry?: string;
  service: Pick<Scenario, "title" | "serviceDesc" | "priceDisplay" | "priceStructure">;
}

/** One-off sim from structured fields only (PHI-free by design). */
export function buildPrepGeneratorPrompt(input: PrepInput): string {
  return `You are the content engineer for Closer Clinic, a case-acceptance simulator for healthcare providers. A ${input.specialty} provider is prepping for a real consult TOMORROW and described the TYPE of patient (never a real person). Build a one-off practice scenario.

STRUCTURED FIELDS
- Patient age band: ${input.ageBand}
- Condition: ${input.condition}
- Service to present: ${input.service.title} — ${input.service.serviceDesc}
- Price: ${input.service.priceDisplay} (${input.service.priceStructure})
- What the provider is worried the patient will say: ${input.worry ? `"${input.worry}"` : "(nothing specific)"}

Write:
- "patientCc": first-person chief complaint, 1–2 spoken sentences, age-appropriate texture.
- "clinicalContext": a plausible typical chart for this condition — findings, duration, what's been tried. 2–3 sentences. Generic-typical, never a specific person.
- "closeGoal": patient agrees to ${input.service.title} at ${input.service.priceDisplay} and books.
- "objectionSeeds": exactly 5 short natural objections. The provider's stated worry MUST be first (rephrased in patient voice); make the rest fit this condition, service, and price.

Respond with ONLY a JSON object, no markdown fences:
{"patientCc": "...", "clinicalContext": "...", "closeGoal": "...", "objectionSeeds": ["...","...","...","...","..."]}`;
}

/* ------------------------- custom scenario builder ------------------------- */

export interface ScenarioDraftInput {
  specialty: string;
  title: string;
  priceDisplay: string;
  priceStructure: string;
  condition: string;
  typicalPatient?: string;
  objections?: string[];
}

/**
 * Expand a provider's five short answers into a full station record.
 * Also the domain guardrail: refuses non-healthcare services.
 */
export function buildScenarioGeneratorPrompt(input: ScenarioDraftInput): string {
  return `You are the content engineer for Closer Clinic, a case-acceptance training simulator for healthcare providers. A ${input.specialty} provider wants a custom practice station for one of their real services. Expand their answers into a complete scenario record.

PROVIDER'S ANSWERS
- Service name: ${input.title}
- Price: ${input.priceDisplay} (${input.priceStructure})
- Condition/problem it treats: ${input.condition}
- Typical patient: ${input.typicalPatient || "(not specified — infer a plausible typical patient)"}
- Objections they actually hear: ${input.objections?.length ? input.objections.map((o) => `"${o}"`).join(", ") : "(none given)"}

GUARDRAIL: This must be a legitimate healthcare or wellness service. If it is not (e.g. retail, finance, automotive, anything unrelated to patient care), refuse with valid=false and a one-sentence friendly reason. Also refuse if the answers describe a specific real, identifiable patient rather than a type.

Write for a training simulation:
- "patientCc": the patient's chief complaint in first-person patient voice, 1–2 spoken sentences with real texture (like: "My heel's been killing me every morning for a year").
- "clinicalContext": the chart the provider knows walking in — findings, history, failed prior measures, honest efficacy framing. 2–4 sentences, clinically plausible for ${input.specialty}.
- "serviceDesc": one clean line describing the service and structure.
- "closeGoal": the specific yes + next step, mentioning the exact price.
- "objectionSeeds": exactly 5 short, natural objections. The provider's own stated objections MUST appear first (rephrased naturally); fill the rest with the most plausible ones for this service and price.

Respond with ONLY a JSON object, no markdown fences:
{
  "valid": boolean,
  "reason": "only when valid is false — one friendly sentence",
  "scenario": {
    "serviceDesc": "...",
    "patientCc": "...",
    "clinicalContext": "...",
    "closeGoal": "...",
    "objectionSeeds": ["...", "...", "...", "...", "..."]
  },
  "cards": [
    // one flashcard per provider-stated objection (omit if none given):
    {"front": "the objection in patient voice", "isolate": "the isolating question", "reframe": "the honest reframe", "close": "the close attempt"}
  ]
}`;
}

/* ----------------------------- redo the moment ----------------------------- */

/**
 * Grader for a "Redo the Moment" replay: the provider re-entered the
 * conversation shortly before the exchange where the close was lost.
 * Grade only whether that moment was handled better this time.
 */
export function buildRedoGraderPrompt(
  scenario: Scenario,
  originalMoment: string,
  transcript: TranscriptMessage[]
): string {
  const lines = transcript
    .map((m) => {
      if (m.role === "event") return `[STAGE DIRECTION: ${m.text}]`;
      return `${m.role === "provider" ? "PROVIDER" : "PATIENT"}: ${m.text}`;
    })
    .join("\n");

  return `You are an OSCE examiner. In a previous run of this encounter, the provider lost (or nearly lost) the close at this moment:

ORIGINAL MOMENT
${originalMoment}

The provider has now REPLAYED the encounter from two turns before that moment (the transcript below includes the shared history followed by the new attempt). Grade ONLY whether the identified moment was handled better this time — ignore unrelated aspects of the visit.

STATION
- Service: ${scenario.serviceDesc} at ${scenario.priceDisplay} (${scenario.priceStructure})
- Close goal: ${scenario.closeGoal}

TRANSCRIPT (replay)
${lines}

"Handled better" means: at the equivalent moment, the provider used stronger technique (isolated the objection, held the price, tied to findings, actually asked for the close — whichever failed originally) — regardless of whether the patient ultimately said yes.

Respond with ONLY a JSON object, no markdown fences:
{
  "handledBetter": boolean,
  "feedback": "1-2 sentences: what changed versus the original moment, quoting the key new line — or what still went wrong and the line to try next time."
}`;
}

/* ------------------------------ micro-drills ------------------------------ */

export const DRILL_OPENING_INSTRUCTION =
  "[EVENT] This focused practice moment starts now. Nothing has been said yet — you speak first. Open in character with the single line that puts the provider on the spot, per your behavior instruction. Never open as if replying to something. 1–2 sentences.";

/**
 * Narrowed patient prompt for a 3-turn micro-drill: same voice rules as a
 * full rep, but the patient's behavior is pinned to one skill moment.
 */
export function buildDrillPatientSystemPrompt(
  scenario: Scenario,
  snapshot: PersonaSnapshot,
  drill: DrillConfig
): string {
  return `You are roleplaying a PATIENT in a medical office visit for a short focused practice moment (about ${drill.maxTurns} provider turns). This is a training simulation, but you must never acknowledge that.

PATIENT PROFILE
- Name: ${snapshot.name}, ${snapshot.age}, ${snapshot.occupation}, insurance: ${snapshot.insurance}

CONTEXT
The visit is already underway. The provider will likely discuss: ${scenario.serviceDesc} at ${scenario.priceDisplay} (${scenario.priceStructure}).
Chief complaint backstory: ${scenario.patientCc}

YOUR BEHAVIOR THIS MOMENT (follow it precisely)
${drill.patientInstruction}

HARD RULES
1. Stay fully in character. Never coach, never mention AI, simulations, or grading.
2. Keep every reply to 1–3 sentences of natural spoken language — contractions, hesitations, real speech rhythm. No stage directions or narration.
3. This is a short moment, not a full visit: react only to the one skill being practiced, per your behavior instruction.
4. Lines marked [EVENT] are stage directions from the simulation; follow them silently in character.`;
}

/** Pass/fail grader for a micro-drill, scoped to a single rubric dimension. */
export function buildDrillGraderPrompt(
  scenario: Scenario,
  drill: DrillConfig,
  transcript: TranscriptMessage[]
): string {
  const lines = transcript
    .map((m) => {
      if (m.role === "event") return `[STAGE DIRECTION: ${m.text}]`;
      return `${m.role === "provider" ? "PROVIDER" : "PATIENT"}: ${m.text}`;
    })
    .join("\n");

  return `You are an OSCE examiner grading a short focused micro-drill. The provider practiced ONE skill: ${RUBRIC_LABELS[drill.rubricKey]}. Grade ONLY that dimension — ignore everything else (closing, rapport, etc., unless it IS the drilled skill).

STATION CONTEXT
- Service: ${scenario.serviceDesc} at ${scenario.priceDisplay} (${scenario.priceStructure})
- Drill setup: ${drill.setup}

PASS BAR (apply exactly)
${drill.passBar}

TRANSCRIPT
${lines}

Respond with ONLY a JSON object, no markdown fences:
{
  "passed": boolean,
  "feedback": "ONE sentence: if passed, name the specific thing they did right; if failed, name the specific miss and the line to say instead."
}`;
}

const RUBRIC_DEFINITIONS = `RUBRIC (score each 0–20, evidence-first):
Before scoring a category, locate the specific PROVIDER lines relevant to it; place the performance in a band based on that evidence, then pick the exact score within the band. Use the FULL 0–20 range. The middle band (9–12) must be earned by genuinely mixed evidence — when a skill was never demonstrated, score it 0–8; never park a category at 10–12 as a default. Real reps produce spread: expect a standout category and a weak one, not five similar numbers.

Bands (same shape for every category):
  0–4   absent or harmful — the skill never appeared, or what appeared damaged the visit
  5–8   attempted but ineffective — token gesture, formulaic, or abandoned under pressure
  9–12  adequate but generic — present and not wrong, yet interchangeable with any provider
  13–16 strong — tailored to this patient, with one clear miss or missed amplifier
  17–20 excellent — you would teach from this transcript

- rapport (Rapport & listening): 17–20 reflects the patient's exact words and situation, asks real questions and builds on the answers. 13–16 responds to what was said but misses one emotional cue or steamrolls once. 9–12 polite generic empathy ("I understand", "that makes sense") without using the patient's specifics. 5–8 script-driven; talks past a stated worry. 0–4 interrupts, ignores concerns, or lectures.
- framing (Clinical framing): 17–20 ties the recommendation to THIS chart — findings, measurements, failed treatments — AND the concrete consequence of inaction, without fear-mongering. 13–16 cites specific findings but the benefit stays generic, or consequence is missing. 9–12 correct but generic ("this works well for cases like yours"). 5–8 benefits-only sales pitch with no findings. 0–4 no clinical rationale at all.
- price (Price delivery): 17–20 states the number plainly and confidently, then tolerates the silence. Naming what the number covers in the same breath ("$600 for the series of three sessions") still counts as plain delivery — the failure is justifying, apologizing, or rambling past it. 13–16 plain number but immediately keeps selling past it. 9–12 states it wrapped in justification or word salad. 5–8 apologizes for it ("I know it's a lot...") or discounts unprompted. 0–4 dodges the number until forced, or never says it. HARD CAPS: an unprompted discount caps this category at 8; never stating a price caps it at 5; quoting a materially wrong price for the station caps it at 8.
- objections (Objection handling): 17–20 isolates the REAL objection with a question ("If cost weren't a factor, would you want to do this?"), answers it specifically, and re-asks. 13–16 addresses the stated objection directly but never isolates or re-asks. 9–12 generic reassurance at the surface objection. 5–8 caves, drops price, or over-explains defensively. 0–4 argues with the patient or ignores the objection. If the patient never objected (clean early close on easy), score on the evidence that exists and say so in "worked"/"fixes".
- close (Asking for the close): 17–20 assumptive or alternative close ("Let's get your first session scheduled — do mornings or afternoons work?"). 11–15 (score 16 if flawlessly timed) direct ask ("Would you like to move forward?"). 6–10 hints without asking ("something to think about"). HARD CAP: never asking for a decision at all caps this category at 5.

CALIBRATION: a first-week trainee typically totals 35–55. 60–75 is a solid rep with one real gap. 80+ means you would show this transcript as a model of how it's done. Do not compress toward the middle — if the evidence says 4, write 4; if it says 19, write 19. Two categories differing by 8+ points in one rep is normal and expected when the evidence differs.

ETHICS LINE (applies across categories): this app trains confident recommendation of clinically appropriate care — never pressure. Penalize overselling: recommending beyond what the chart supports or inventing urgency/risk caps framing at 8/20. Penalize pressure past a genuine no: once the patient has given a clear, informed, stable refusal, continuing to push caps objections at 8/20 — the correct behavior is to respect the no, chart the indication, and set a return trigger, which scores HIGH. A close obtained by pressure after a genuine no is not credited as "closed".`;

export function buildGraderPrompt(
  scenario: Scenario,
  snapshot: PersonaSnapshot,
  difficulty: Difficulty,
  transcript: TranscriptMessage[]
): string {
  const lines = transcript
    .map((m) => {
      if (m.role === "event") return `[STAGE DIRECTION: ${m.text}]`;
      return `${m.role === "provider" ? "PROVIDER" : "PATIENT"}: ${m.text}`;
    })
    .join("\n");

  return `You are an OSCE examiner grading a healthcare provider's case-acceptance conversation with a simulated patient. Grade the PROVIDER only. Be a rigorous but fair examiner: specific, evidence-based, and coaching-oriented. Every judgment must be grounded in the actual transcript.

STATION
- Service: ${scenario.serviceDesc}
- Price: ${scenario.priceDisplay} (${scenario.priceStructure})
- Clinical context the provider had: ${scenario.clinicalContext}
- Close goal: ${scenario.closeGoal}
- Patient: ${snapshot.name}, ${snapshot.age}, ${snapshot.occupation}, ${snapshot.insurance} — archetype: ${snapshot.archetype}
- Difficulty: ${difficulty}

${RUBRIC_DEFINITIONS}

TRANSCRIPT
${lines}

DETERMINE "closed": true only if the patient clearly agreed to the specific service and to move forward (scheduling, paying, or an unambiguous yes). "I'll think about it", "probably", or agreeing to a follow-up discussion is NOT a close.

Respond with ONLY a JSON object, no markdown fences, no commentary, exactly this shape:
{
  "closed": boolean,
  "scores": {"rapport": 0-20, "framing": 0-20, "price": 0-20, "objections": 0-20, "close": 0-20},
  "total": 0-100,
  "moment": "the single exchange where the close was won or lost — quote or closely paraphrase both sides, 1-3 sentences",
  "momentIndex": the 0-based index of the PROVIDER line where that exchange happened, counting ONLY the PROVIDER lines in order from 0,
  "rewrite": {"you_said": "the provider's single weakest line, quoted VERBATIM from the transcript", "better": "that same moment rewritten in the provider's own voice, 1-2 sentences, applying the rubric skill that failed"},
  "worked": ["2-4 specific things the provider did well, each citing what they said"],
  "fixes": ["2-4 specific fixes, each naming what was said and what to say instead"],
  "drill": "ONE specific line or technique to practice on the next rep, phrased as an instruction with example wording"
}
"total" must equal the sum of the five scores. If a rubric category never came up (e.g. the patient never objected because the provider closed instantly on easy), score it on what evidence exists and note that in "worked" or "fixes".`;
}

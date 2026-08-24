export type Difficulty = "easy" | "moderate" | "hard";
export type Specialty = "podiatry" | "dental" | "medspa";
export type EncounterStatus = "active" | "graded" | "abandoned";

export type StationRole = "provider" | "front_desk";

export interface Scenario {
  slug: string;
  specialty: Specialty;
  /** Who runs this station: the provider in the room, or the front desk at checkout. */
  role?: StationRole;
  title: string;
  serviceDesc: string;
  priceDisplay: string;
  priceStructure: string;
  /** One-off "prep a consult" sim: kept for history, excluded from the roster. */
  isPrep?: boolean;
  createdByUserId?: string | null;
  /** Clinical backstory the provider "knows" walking in. Shown on the chart banner. */
  clinicalContext: string;
  /** Patient's chief complaint, in the patient's words. */
  patientCc: string;
  closeGoal: string;
  /** Specialty-accurate objections the patient can draw from. */
  objectionSeeds: string[];
  difficultyNotes?: string;
  /** When set, the scenario dictates the patient's insurance situation and the
   *  rolled persona's insurance is replaced (e.g. high-deductible plans). */
  insuranceOverride?: string;
  isCustom: boolean;
  active: boolean;
}

export type Gender = "m" | "f";

export interface Persona {
  id: string;
  archetype: string;
  namePool: { name: string; gender: Gender }[];
  ageRange: [number, number];
  insuranceTypes: string[];
  occupations: string[];
  /** Prompt block: who this person is and how they behave in an exam room. */
  personality: string;
  /** How they talk: cadence, verbosity, tics. */
  speechStyle: string;
  /** How their objections tend to come out. */
  objectionFlavor: string;
}

export interface PersonaSnapshot {
  personaId: string;
  archetype: string;
  name: string;
  age: number;
  insurance: string;
  occupation: string;
  gender?: Gender;
  /** TTS voice pinned at roll time so the patient sounds the same all encounter. */
  voiceId?: string;
}

/** Per-encounter spend counters (model + voice), accumulated server-side. */
export interface EncounterUsage {
  modelInputTokens: number;
  modelOutputTokens: number;
  ttsCharacters: number;
  sttSeconds: number;
}

export const EMPTY_USAGE: EncounterUsage = {
  modelInputTokens: 0,
  modelOutputTokens: 0,
  ttsCharacters: 0,
  sttSeconds: 0,
};

export type TranscriptRole = "provider" | "patient" | "event";

export interface TranscriptMessage {
  role: TranscriptRole;
  text: string;
  at: string; // ISO timestamp
  /** Patient turns only: 0–100 receptivity reported by the patient engine. */
  receptivity?: number;
}

export interface EncounterRow {
  id: string;
  userId: string;
  scenarioSlug: string;
  difficulty: Difficulty;
  persona: PersonaSnapshot;
  transcript: TranscriptMessage[];
  status: EncounterStatus;
  startedAt: string;
  endedAt: string | null;
  usage: EncounterUsage;
  /** Defaults to "rep"; test-out/drill/redo encounters carry their kind + meta. */
  kind?: EncounterKind;
  meta?: EncounterMeta;
}

export interface RubricScores {
  rapport: number;
  framing: number;
  price: number;
  objections: number;
  close: number;
}

export interface GradeRow {
  id: string;
  encounterId: string;
  closed: boolean;
  scores: RubricScores;
  total: number;
  moment: string;
  /** 0-based provider-turn index of the won/lost exchange (for Redo the Moment). */
  momentIndex: number | null;
  /** "What you should've said": the weakest verbatim line + a rewrite. */
  rewrite: { youSaid: string; better: string } | null;
  worked: string[];
  fixes: string[];
  drill: string;
  createdAt: string;
}

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  specialty: Specialty | null;
  clinicId: string | null;
  onboarded: boolean;
}

/* ------------------------------- training ------------------------------- */

/**
 * Training content mirrors the five grading rubric categories exactly, so
 * training, grading, and analytics share one skill model. Content is data
 * (specialty-scoped), so dental/med-spa packs are row additions, not code.
 */

export type EncounterKind = "rep" | "test_out" | "drill" | "redo" | "prep";

/** Extra per-encounter context for non-rep kinds. */
export interface EncounterMeta {
  lessonSlug?: string;
  rubricKey?: keyof RubricScores;
  parentEncounterId?: string;
  /** Redo grading result (pass/fail on the single moment). */
  redoResult?: { handledBetter: boolean; feedback: string };
  /** Drill grading result. */
  drillResult?: { passed: boolean; feedback: string };
  /** Price snapshot at creation (scenario overrides applied), so a mid-rep
   *  pricing change never shifts the patient's or grader's number. */
  priceDisplay?: string;
  priceStructure?: string;
  /** Prep consults: the archetype pool the persona was rolled from. */
  prepArchetypes?: string[];
}

/* --------------------------- pricing overrides --------------------------- */

export type PriceKind = "single" | "package" | "program";

/** Structured price editing: amount + structure + optional anchor. */
export interface PriceConfig {
  kind: PriceKind;
  /** Total price in whole dollars. */
  amount: number;
  /** Package/program: number of sessions. */
  sessions?: number;
  /** Program cadence, e.g. "every 2 months". */
  interval?: string;
  /** Optional single-session comparison anchor, whole dollars. */
  anchorAmount?: number;
}

export type OverrideScope = "user" | "clinic";

/** Per-user (or clinic-wide) price override on a scenario. Base rows never mutate. */
export interface ScenarioOverrideRow {
  userId: string;
  scenarioSlug: string;
  scope: OverrideScope;
  config: PriceConfig;
  priceDisplay: string;
  priceStructure: string;
  updatedAt: string;
}

export const MAX_CUSTOM_SCENARIOS_USER = 10;
export const MAX_CUSTOM_SCENARIOS_CLINIC = 25;

/* ---------------------------- assigned drills ---------------------------- */

/** Clinic admin homework: run a station (or a card set) by a due date. */
export interface AssignmentRow {
  id: string;
  adminUserId: string;
  kind: "station" | "cards";
  /** Station assignments: the target scenario. */
  stationSlug: string | null;
  title: string;
  /** "all" or explicit seat userIds. */
  seats: "all" | string[];
  dueAt: string;
  /** Reps (or card sessions) required. */
  targetReps: number;
  /** Minimum letter grade for a rep to count; null = any graded rep. */
  minGrade: string | null;
  createdAt: string;
  active: boolean;
}

export type AssignmentSeatState = "not_started" | "in_progress" | "done";

export interface AssignmentSeatStatus {
  state: AssignmentSeatState;
  countedReps: number;
  bestLetter: string | null;
}

/* ----------------------------- objection cards ----------------------------- */

/** Flashcard: objection on the front, the 3-line play on the back. */
export interface ObjectionCard {
  id: string;
  specialty: Specialty;
  difficulty: Difficulty;
  /** The objection verbatim, in patient voice. */
  front: string;
  back: {
    isolate: string;
    reframe: string;
    close: string;
  };
  /** User-generated (from a custom scenario's objections). */
  custom?: boolean;
  createdByUserId?: string | null;
}

export interface TrainingModule {
  slug: string;
  specialty: Specialty;
  order: number;
  /** Rubric category this module trains; null for the intro module. */
  rubricKey: keyof RubricScores | null;
  title: string;
  subtitle: string;
  /** Core curriculum modules gate/unlock the base stations. */
  core: boolean;
}

export interface LessonCard {
  title?: string;
  /** Max ~150 words. `**bold**` marks key lines. */
  body: string;
}

export interface ExampleLine {
  speaker: "provider" | "patient";
  text: string;
  /** Line-by-line annotation of why this line works or fails. */
  note?: string;
}

export interface LessonExample {
  /** The clinical moment both scripts share. */
  moment: string;
  bad: ExampleLine[];
  good: ExampleLine[];
}

export interface QuizQuestion {
  prompt: string;
  options: string[];
  answer: number;
  /** One-line why, shown instantly after answering. */
  why: string;
}

export interface DrillConfig {
  rubricKey: keyof RubricScores;
  scenarioSlug: string;
  /** Situation shown to the user before the drill starts. */
  setup: string;
  /** Narrowed patient behavior for this 3-turn mini-rep. */
  patientInstruction: string;
  /** What "pass" means, for the narrowed grader. */
  passBar: string;
  maxTurns: number;
}

export interface TrainingLesson {
  slug: string;
  moduleSlug: string;
  specialty: Specialty;
  order: number;
  title: string;
  minutes: number;
  cards: LessonCard[];
  example: LessonExample | null;
  quiz: QuizQuestion[];
  drill: DrillConfig | null;
}

/* ------------------------------ module docs ------------------------------ */

/**
 * The standardized module document: objectives → core concept → word-for-word
 * language → worked dialogues → common mistakes → (tracked check + live drill
 * live on the module's lesson record) → "try it in a rep" CTA.
 * Stored as structured records (canonical TS → Supabase jsonb), specialty-
 * scoped like every other content pack. Section ids power deep links.
 */

export interface ConceptSection {
  id: string;
  title: string;
  /** Short scannable paragraphs; `**bold**` marks key lines; \n\n splits paragraphs. */
  body: string;
}

export interface ScriptLine {
  line: string;
  /** One-line note on WHY this works. */
  why: string;
}

export interface ScriptGroup {
  id: string;
  title: string;
  /** Optional situational context shown above the lines. */
  context?: string;
  lines: ScriptLine[];
}

/** Worked dialogue: patient line → weak vs strong response, annotated. */
export interface WorkedDialogue {
  id: string;
  title: string;
  patient: string;
  weak: string;
  strong: string;
  annotation: string;
}

/** Side-by-side "what it sounds like done wrong" vs the corrected version. */
export interface MistakePair {
  wrong: string;
  right: string;
  note: string;
}

export interface ModuleDoc {
  moduleSlug: string;
  specialty: Specialty;
  /** 3–5 measurable learning objectives. */
  objectives: string[];
  concept: ConceptSection[];
  scripts: ScriptGroup[];
  dialogues: WorkedDialogue[];
  mistakes: MistakePair[];
  /** Deep-link into a station + difficulty that exercises this exact skill. */
  repCta: { stationSlug: string; difficulty: Difficulty; label: string };
  /** Content-review flags for the founder (extrapolations, [NEEDS SOURCE]). */
  flags: string[];
}

export type LessonStatus = "not_started" | "in_progress" | "completed";

export interface LessonProgressRow {
  userId: string;
  lessonSlug: string;
  status: LessonStatus;
  /** Best quiz score 0–100; null before first attempt. */
  quizScore: number | null;
  drillPassed: boolean | null;
  completedAt: string | null;
}

export type UnlockVia = "curriculum" | "test_out" | "module";

export interface UnlockRow {
  userId: string;
  stationSlug: string;
  via: UnlockVia;
  createdAt: string;
}

/** Self-reported real-world outcome — the proof engine. */
export interface OutcomeLogRow {
  id: string;
  userId: string;
  /** YYYY-MM-DD local date the provider is logging for. */
  date: string;
  service: string;
  /** Station link; null on legacy logs whose title no longer matches a scenario. */
  stationSlug?: string | null;
  /** Price snapshot at log time (whole cents); null on legacy logs. */
  amountCents?: number | null;
  /** True when the provider typed the amount; false = prefilled default ("est."). */
  amountEntered?: boolean;
  presented: boolean;
  closed: boolean;
  createdAt: string;
}

/* ------------------------------ audio pairs ------------------------------ */

/** One spoken line of a scripted encounter take. */
export interface PairLine {
  speaker: "patient" | "doctor";
  text: string;
  /** Take B only: what changed the outcome at this moment (pin annotation). */
  beat?: string;
  /** Filled at render time: where this line starts in the stitched audio. */
  startMs?: number;
}

/** "Common close" (A) vs "The fix" (B) — same scenario, two outcomes. */
export interface PairScript {
  take: "A" | "B";
  lines: PairLine[];
}

export const QUIZ_PASS_PCT = 80;
export const TEST_OUT_PASS_TOTAL = 75;

/** Front-desk reps keep the same score keys; the meanings shift to checkout. */
export const FRONT_DESK_RUBRIC_LABELS: Record<keyof RubricScores, string> = {
  rapport: "Rapport at the desk",
  framing: "Scheduling outcome",
  price: "Deposit & payment ask",
  objections: "Objection handling",
  close: "Locking the calendar",
};

export function rubricLabelsFor(role?: StationRole): Record<keyof RubricScores, string> {
  return role === "front_desk" ? FRONT_DESK_RUBRIC_LABELS : RUBRIC_LABELS;
}

export const RUBRIC_LABELS: Record<keyof RubricScores, string> = {
  rapport: "Rapport & listening",
  framing: "Clinical framing",
  price: "Price delivery",
  objections: "Objection handling",
  close: "Asking for the close",
};

export const MAX_PROVIDER_TURNS = 20;
export const NUDGE_AT_TURN = 12;
export const DAILY_ENCOUNTER_LIMIT = 25;

import "server-only";
import type {
  AppUser,
  AssignmentRow,
  Difficulty,
  ObjectionCard,
  EncounterKind,
  EncounterMeta,
  EncounterRow,
  EncounterUsage,
  GradeRow,
  LessonProgressRow,
  ModuleDoc,
  OutcomeLogRow,
  PersonaSnapshot,
  PriceConfig,
  Scenario,
  ScenarioOverrideRow,
  TrainingLesson,
  TrainingModule,
  TranscriptMessage,
  UnlockRow,
  UnlockVia,
} from "../types";
import { isSupabaseConfigured } from "../config";

/** One seat's training standing, for the clinic admin view. */
export interface TeamTrainingRow {
  userId: string;
  name: string;
  email: string;
  seatRole: import("../types").StationRole;
  lessonsCompleted: number;
  lessonsTotal: number;
  quizAvg: number | null;
  coreComplete: boolean;
  unlockedVia: UnlockVia | null;
}

export interface EncounterWithGrade {
  encounter: EncounterRow;
  grade: GradeRow | null;
}

export interface Store {
  // scenarios
  listScenarios(specialty?: string): Promise<Scenario[]>;
  getScenario(slug: string): Promise<Scenario | null>;

  // custom scenarios ("Your Services") + one-off prep sims
  listCustomScenarios(userId: string, opts?: { includeRetired?: boolean }): Promise<Scenario[]>;
  createCustomScenario(
    userId: string,
    input: Omit<Scenario, "slug" | "isCustom" | "active" | "createdByUserId"> & { slug?: string }
  ): Promise<Scenario>;
  updateCustomScenario(slug: string, userId: string, patch: Partial<Scenario>): Promise<void>;
  /** Soft-delete: active=false; encounter history stays intact. */
  retireCustomScenario(slug: string, userId: string): Promise<void>;
  countCustomScenarios(userId: string): Promise<number>;

  // objection cards (seed deck + user customs)
  listObjectionCards(userId: string, specialty: string): Promise<ObjectionCard[]>;
  addObjectionCards(
    userId: string,
    cards: Omit<ObjectionCard, "id" | "custom" | "createdByUserId">[]
  ): Promise<void>;

  // price overrides (base scenarios never mutate)
  getScenarioOverride(userId: string, scenarioSlug: string): Promise<ScenarioOverrideRow | null>;
  listScenarioOverrides(userId: string): Promise<ScenarioOverrideRow[]>;
  upsertScenarioOverride(
    row: Omit<ScenarioOverrideRow, "updatedAt">
  ): Promise<ScenarioOverrideRow>;
  deleteScenarioOverride(userId: string, scenarioSlug: string): Promise<void>;

  // user profile
  getCurrentUser(): Promise<AppUser | null>;
  updateProfile(userId: string, patch: { name?: string; specialty?: string; onboarded?: boolean }): Promise<void>;

  // encounters (all reads/writes are scoped to the calling user via RLS or explicit checks)
  createEncounter(input: {
    userId: string;
    scenarioSlug: string;
    difficulty: Difficulty;
    persona: PersonaSnapshot;
    transcript: TranscriptMessage[];
    kind?: EncounterKind;
    meta?: EncounterMeta;
  }): Promise<EncounterRow>;
  getEncounter(id: string, userId: string): Promise<EncounterRow | null>;
  updateEncounter(
    id: string,
    userId: string,
    patch: {
      transcript?: TranscriptMessage[];
      status?: EncounterRow["status"];
      endedAt?: string;
      meta?: EncounterMeta;
    }
  ): Promise<void>;
  countEncountersToday(userId: string): Promise<number>;
  /** Accumulate model/voice spend counters onto an encounter. */
  recordUsage(id: string, userId: string, delta: Partial<EncounterUsage>): Promise<void>;

  // grades
  saveGrade(input: Omit<GradeRow, "id" | "createdAt"> & { modelRaw: string; userId: string }): Promise<GradeRow>;
  getGradeByEncounter(encounterId: string, userId: string): Promise<GradeRow | null>;

  // history & aggregates
  listEncountersWithGrades(userId: string, opts?: { sinceDays?: number; limit?: number }): Promise<EncounterWithGrade[]>;

  // training content (specialty-scoped data; packs are row additions)
  listTrainingModules(specialty: string): Promise<TrainingModule[]>;
  listTrainingLessons(specialty: string): Promise<TrainingLesson[]>;
  getTrainingLesson(slug: string): Promise<TrainingLesson | null>;
  getModuleDoc(moduleSlug: string): Promise<ModuleDoc | null>;

  // training progress & unlocks
  getLessonProgress(userId: string): Promise<LessonProgressRow[]>;
  upsertLessonProgress(
    userId: string,
    lessonSlug: string,
    patch: Partial<Omit<LessonProgressRow, "userId" | "lessonSlug">>
  ): Promise<LessonProgressRow>;
  listUnlocks(userId: string): Promise<UnlockRow[]>;
  addUnlocks(userId: string, stationSlugs: string[], via: UnlockVia): Promise<void>;

  // real-world outcome logs (self-reported)
  listOutcomeLogs(userId: string, opts?: { sinceDays?: number }): Promise<OutcomeLogRow[]>;
  addOutcomeLog(input: Omit<OutcomeLogRow, "id" | "createdAt">): Promise<OutcomeLogRow>;

  // assigned drills (clinic admin homework)
  createAssignment(input: Omit<AssignmentRow, "id" | "createdAt" | "active">): Promise<AssignmentRow>;
  listAssignmentsByAdmin(adminUserId: string): Promise<AssignmentRow[]>;
  listAssignmentsForSeat(userId: string): Promise<AssignmentRow[]>;
  retireAssignment(id: string, adminUserId: string): Promise<void>;
  /** Objection-card shuffle completions (for card-set assignments). */
  recordCardSession(userId: string): Promise<void>;
  countCardSessions(userId: string, sinceIso: string): Promise<number>;

  // site imports (rate-limited: 3/day/user)
  countSiteImportsToday(userId: string): Promise<number>;
  recordSiteImport(userId: string, url: string): Promise<void>;

  // clinic admin (Phase 1: the signed-in admin's own team policy; Phase 2 wires real clinic membership)
  getRequireCurriculum(adminUserId: string): Promise<boolean>;
  setRequireCurriculum(adminUserId: string, value: boolean): Promise<void>;
  // script cards (per-user tightened lines, cached on content hash)
  getScriptCard(
    userId: string,
    stationSlug: string
  ): Promise<{ contentHash: string; lines: import("../script-card").ScriptCardLines } | null>;
  upsertScriptCard(
    userId: string,
    stationSlug: string,
    contentHash: string,
    lines: import("../script-card").ScriptCardLines
  ): Promise<void>;
  /** Clinic display name for card footers; null for solo accounts. */
  getClinicName(userId: string): Promise<string | null>;

  listTeamTraining(adminUserId: string): Promise<TeamTrainingRow[]>;
  /** Clinic admin sets a member's seat role (provider vs front desk). */
  setSeatRole(adminUserId: string, memberUserId: string, role: import("../types").StationRole): Promise<void>;
}

/* ------------------- user-scoped scenario resolution ------------------- */

import { applyOverride } from "../pricing";

/** One scenario as this user sees it: base or custom, override price applied. */
export async function resolveScenarioForUser(
  store: Store,
  userId: string,
  slug: string
): Promise<Scenario | null> {
  const scenario = await store.getScenario(slug);
  if (!scenario) return null;
  const override = await store.getScenarioOverride(userId, slug);
  return applyOverride(scenario, override);
}

export interface UserRoster {
  /** "Your Services": the user's active custom scenarios, overrides applied. */
  custom: Scenario[];
  /** Built-in stations, overrides applied. */
  builtIn: Scenario[];
  /** Slugs carrying a price override (for the "edited" indicator). */
  editedSlugs: string[];
  /** Override configs by slug, for pre-filling the edit sheet. */
  overrideConfigs: Record<string, PriceConfig>;
}

export async function listRosterForUser(
  store: Store,
  userId: string,
  specialty: string
): Promise<UserRoster> {
  const [base, custom, overrides] = await Promise.all([
    store.listScenarios(specialty),
    store.listCustomScenarios(userId),
    store.listScenarioOverrides(userId),
  ]);
  const bySlug = new Map(overrides.map((o) => [o.scenarioSlug, o]));
  return {
    custom: custom
      .filter((s) => !s.isPrep)
      .map((s) => applyOverride(s, bySlug.get(s.slug) ?? null)),
    builtIn: base.map((s) => applyOverride(s, bySlug.get(s.slug) ?? null)),
    editedSlugs: overrides.map((o) => o.scenarioSlug),
    overrideConfigs: Object.fromEntries(overrides.map((o) => [o.scenarioSlug, o.config])),
  };
}

export async function getStore(): Promise<Store> {
  if (isSupabaseConfigured()) {
    const { SupabaseStore } = await import("./supabase-store");
    return new SupabaseStore();
  }
  const { getMemoryStore } = await import("./memory-store");
  return getMemoryStore();
}

import "server-only";
import { randomUUID } from "crypto";
import type {
  AppUser,
  AssignmentRow,
  EncounterRow,
  EncounterUsage,
  GradeRow,
  LessonProgressRow,
  ModuleDoc,
  OutcomeLogRow,
  ObjectionCard,
  Scenario,
  ScenarioOverrideRow,
  TrainingLesson,
  TrainingModule,
  UnlockRow,
  UnlockVia,
} from "../types";
import { EMPTY_USAGE } from "../types";
import { addUsage } from "../costs";
import type { EncounterWithGrade, Store, TeamTrainingRow } from "./index";
import { listScenarios as codeScenarios, getScenario as codeScenario } from "../scenarios";
import { PODIATRY_MODULES, PODIATRY_LESSONS } from "../training/podiatry-pack";
import { PODIATRY_OBJECTION_CARDS } from "../training/objection-cards";
import { getModuleDocFromCode } from "../training/module-docs";
import { computeTrainingStatus } from "../training";
import { DEV_USER } from "../config";

/**
 * In-memory store for local dev without Supabase. Survives HMR via globalThis;
 * lost on server restart. Never used when Supabase env vars are present.
 */
interface MemoryDb {
  profile: AppUser;
  encounters: Map<string, EncounterRow>;
  grades: Map<string, GradeRow & { modelRaw: string }>; // keyed by encounterId
  lessonProgress: Map<string, LessonProgressRow>; // keyed by `${userId}:${lessonSlug}`
  unlocks: UnlockRow[];
  outcomeLogs: OutcomeLogRow[];
  requireCurriculum: boolean;
  customScenarios: Map<string, Scenario>; // keyed by slug
  overrides: Map<string, ScenarioOverrideRow>; // keyed by `${userId}:${slug}`
  customCards: ObjectionCard[];
  siteImports: { userId: string; url: string; at: string }[];
  assignments: AssignmentRow[];
  cardSessions: { userId: string; at: string }[];
}

const g = globalThis as unknown as { __closerClinicDb?: MemoryDb };

function db(): MemoryDb {
  if (!g.__closerClinicDb) {
    g.__closerClinicDb = {
      profile: {
        id: DEV_USER.id,
        email: DEV_USER.email,
        name: DEV_USER.name,
        specialty: "podiatry",
        onboarded: true,
      },
      encounters: new Map(),
      grades: new Map(),
      lessonProgress: new Map(),
      unlocks: [],
      outcomeLogs: [],
      requireCurriculum: false,
      customScenarios: new Map(),
      overrides: new Map(),
      customCards: [],
      siteImports: [],
      assignments: [],
      cardSessions: [],
    };
    if (process.env.DEV_SEED_STATS === "1") seedStats(g.__closerClinicDb);
  }
  // HMR resilience: a db created by older code may predate newer fields.
  const d = g.__closerClinicDb;
  d.lessonProgress ??= new Map();
  d.unlocks ??= [];
  d.outcomeLogs ??= [];
  d.requireCurriculum ??= false;
  d.customScenarios ??= new Map();
  d.overrides ??= new Map();
  d.customCards ??= [];
  d.siteImports ??= [];
  d.assignments ??= [];
  d.cardSessions ??= [];
  return d;
}

/**
 * DEV_SEED_STATS=1 fills the last week with graded reps so the home stats
 * panel (close rate, streak, sparkline) renders with real numbers while
 * working on the UI. Dev-mode only; never runs against Supabase.
 */
function seedStats(mem: MemoryDb) {
  const days: [daysAgo: number, reps: number][] = [[6, 1], [5, 2], [3, 1], [2, 2], [1, 2], [0, 1]];
  const slugs = ["shockwave-plantar-fasciitis", "laser-nail-fungus-program", "mls-laser-neuropathy"];
  let n = 0;
  for (const [daysAgo, reps] of days) {
    for (let r = 0; r < reps; r++) {
      const id = randomUUID();
      const startedAt = new Date(Date.now() - daysAgo * 86_400_000 - (r + 1) * 60_000).toISOString();
      mem.encounters.set(id, {
        id,
        userId: DEV_USER.id,
        scenarioSlug: slugs[n++ % slugs.length],
        difficulty: "moderate",
        persona: {
          personaId: "seed",
          archetype: "seed",
          name: "Seed Patient",
          age: 52,
          insurance: "PPO, high deductible",
          occupation: "teacher",
        },
        transcript: [],
        status: "graded",
        startedAt,
        endedAt: startedAt,
        usage: { ...EMPTY_USAGE },
      });
      mem.grades.set(id, {
        id: randomUUID(),
        encounterId: id,
        closed: true,
        scores: { rapport: 16, framing: 14, price: 17, objections: 11, close: 17 },
        total: 75,
        momentIndex: 4,
        rewrite: {
          youSaid: "So it's, um, $900 for the whole thing, but honestly we might be able to work something out.",
          better: "The full program — six sessions timed to how your nail grows — is $900. Most patients put it on an HSA card.",
        },
        moment:
          "You anchored the $900 program against the $150 single session before she asked — the price landed as the smart option, not the expensive one.",
        worked: [
          "Opened on her embarrassment about sandals, not the nail itself.",
          "Framed the yearlong program around how slowly nails grow.",
          "Asked for the booking directly, then stayed quiet.",
        ],
        fixes: [
          "You said the price twice before the outcome — lead with the result.",
          "The Vicks objection got a laugh but never a plan.",
        ],
        drill: "Run the price drop again: outcome first, then the number, then silence.",
        createdAt: startedAt,
        modelRaw: "",
      });
    }
  }
  // Older cluster (~5 weeks back) with weaker scores, so the 30-day grade
  // trend has a real "before" to compare against.
  for (let i = 0; i < 5; i++) {
    const id = randomUUID();
    const startedAt = new Date(Date.now() - (33 + i) * 86_400_000).toISOString();
    mem.encounters.set(id, {
      id,
      userId: DEV_USER.id,
      scenarioSlug: slugs[i % slugs.length],
      difficulty: "moderate",
      persona: {
        personaId: "seed",
        archetype: "seed",
        name: "Seed Patient",
        age: 49,
        insurance: "PPO",
        occupation: "nurse",
      },
      transcript: [],
      status: "graded",
      startedAt,
      endedAt: startedAt,
      usage: { ...EMPTY_USAGE },
    });
    mem.grades.set(id, {
      id: randomUUID(),
      encounterId: id,
      closed: i % 2 === 0,
      scores: { rapport: 14, framing: 12, price: 12, objections: 12, close: 13 },
      total: 63,
      momentIndex: 2,
      rewrite: null,
      moment: "Early-days rep — the price was buried in a word salad.",
      worked: ["Warm greeting."],
      fixes: ["State the number plainly."],
      drill: "Say the number, then silence.",
      createdAt: startedAt,
      modelRaw: "",
    });
  }

  // One no-close outside the 7-day home window (visible on Progress · 30D)
  // so the failed-verdict scorecard can be exercised in dev.
  const failId = randomUUID();
  const failStart = new Date(Date.now() - 8 * 86_400_000).toISOString();
  mem.encounters.set(failId, {
    id: failId,
    userId: DEV_USER.id,
    scenarioSlug: "shockwave-plantar-fasciitis",
    difficulty: "hard",
    persona: {
      personaId: "seed",
      archetype: "skeptical engineer",
      name: "Seed Patient",
      age: 47,
      insurance: "HDHP",
      occupation: "engineer",
    },
    transcript: [],
    status: "graded",
    startedAt: failStart,
    endedAt: failStart,
    usage: { ...EMPTY_USAGE },
  });
  mem.grades.set(failId, {
    id: randomUUID(),
    encounterId: failId,
    closed: false,
    scores: { rapport: 12, framing: 9, price: 7, objections: 10, close: 4 },
    total: 42,
    momentIndex: 3,
    rewrite: {
      youSaid: "Well, insurance companies just don't cover shockwave, it's considered experimental by some plans...",
      better: "Fair question. Insurance covers managing the pain — this fixes the tissue. The real cost question is another year of mornings like yours.",
    },
    moment:
      "When he asked why insurance won't cover it, you defended the price instead of reframing the outcome — the visit never recovered.",
    worked: ["Good rapport in the first two minutes."],
    fixes: [
      "Answer the insurance objection with the cost of another year of pain.",
      "You never asked for the booking.",
    ],
    drill: "Rehearse the insurance objection until the reframe is automatic.",
    createdAt: failStart,
    modelRaw: "",
  });

  // Training progress: modules 0–1 complete, module 2 underway — the ladder
  // shows all three states (completed / current / locked) in dev.
  // Modules 0–1 complete, module 2 (framing) in progress — the ladder shows
  // completed / current / locked, and the docs pipeline has real state.
  for (const slug of ["mindset-core", "rapport-core"]) {
    mem.lessonProgress.set(`${DEV_USER.id}:${slug}`, {
      userId: DEV_USER.id,
      lessonSlug: slug,
      status: "completed",
      quizScore: 89,
      drillPassed: null,
      completedAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    });
  }
  mem.lessonProgress.set(`${DEV_USER.id}:framing-core`, {
    userId: DEV_USER.id,
    lessonSlug: "framing-core",
    status: "in_progress",
    quizScore: 92,
    drillPassed: null,
    completedAt: null,
  });

  // Stations were unlocked via the test-out challenge rep.
  mem.unlocks.push(
    ...codeScenarios("podiatry").map((s) => ({
      userId: DEV_USER.id,
      stationSlug: s.slug,
      via: "test_out" as const,
      createdAt: new Date(Date.now() - 6 * 86_400_000).toISOString(),
    }))
  );

  // Real-world outcome logs: presented shockwave/orthotics most days, ~60% closed.
  const outcomes: [daysAgo: number, service: string, closed: boolean][] = [
    [6, "Shockwave series", false],
    [5, "Shockwave series", true],
    [5, "Custom orthotics", true],
    [3, "Laser nail program", false],
    [2, "Shockwave series", true],
    [1, "Custom orthotics", false],
    [1, "Shockwave series", true],
  ];
  for (const [daysAgo, service, closed] of outcomes) {
    const at = new Date(Date.now() - daysAgo * 86_400_000);
    mem.outcomeLogs.push({
      id: randomUUID(),
      userId: DEV_USER.id,
      date: at.toISOString().slice(0, 10),
      service,
      presented: true,
      closed,
      createdAt: at.toISOString(),
    });
  }
}

class MemoryStore implements Store {
  async listScenarios(specialty?: string): Promise<Scenario[]> {
    return codeScenarios(specialty);
  }

  async getScenario(slug: string): Promise<Scenario | null> {
    // Customs/preps are found even when retired — encounter history needs them.
    return codeScenario(slug) ?? db().customScenarios.get(slug) ?? null;
  }

  /* --------------------- custom scenarios & overrides --------------------- */

  async listCustomScenarios(
    userId: string,
    opts?: { includeRetired?: boolean }
  ): Promise<Scenario[]> {
    return [...db().customScenarios.values()].filter(
      (s) => s.createdByUserId === userId && (opts?.includeRetired || s.active)
    );
  }

  async createCustomScenario(
    userId: string,
    input: Omit<Scenario, "slug" | "isCustom" | "active" | "createdByUserId"> & { slug?: string }
  ): Promise<Scenario> {
    const slug = input.slug ?? `custom-${randomUUID().slice(0, 8)}`;
    const row: Scenario = {
      ...input,
      slug,
      isCustom: true,
      active: true,
      createdByUserId: userId,
    };
    db().customScenarios.set(slug, row);
    return row;
  }

  async updateCustomScenario(slug: string, userId: string, patch: Partial<Scenario>): Promise<void> {
    const row = db().customScenarios.get(slug);
    if (!row || row.createdByUserId !== userId) return;
    db().customScenarios.set(slug, { ...row, ...patch, slug, createdByUserId: userId, isCustom: true });
  }

  async retireCustomScenario(slug: string, userId: string): Promise<void> {
    const row = db().customScenarios.get(slug);
    if (!row || row.createdByUserId !== userId) return;
    row.active = false;
  }

  async countCustomScenarios(userId: string): Promise<number> {
    return [...db().customScenarios.values()].filter(
      (s) => s.createdByUserId === userId && s.active && !s.isPrep
    ).length;
  }

  async listObjectionCards(userId: string, specialty: string): Promise<ObjectionCard[]> {
    return [
      ...PODIATRY_OBJECTION_CARDS.filter((c) => c.specialty === specialty),
      ...db().customCards.filter((c) => c.createdByUserId === userId && c.specialty === specialty),
    ];
  }

  async addObjectionCards(
    userId: string,
    cards: Omit<ObjectionCard, "id" | "custom" | "createdByUserId">[]
  ): Promise<void> {
    for (const c of cards) {
      db().customCards.push({
        ...c,
        id: `card-${randomUUID().slice(0, 8)}`,
        custom: true,
        createdByUserId: userId,
      });
    }
  }

  async getScenarioOverride(userId: string, scenarioSlug: string): Promise<ScenarioOverrideRow | null> {
    return db().overrides.get(`${userId}:${scenarioSlug}`) ?? null;
  }

  async listScenarioOverrides(userId: string): Promise<ScenarioOverrideRow[]> {
    return [...db().overrides.values()].filter((o) => o.userId === userId);
  }

  async upsertScenarioOverride(
    row: Omit<ScenarioOverrideRow, "updatedAt">
  ): Promise<ScenarioOverrideRow> {
    const full: ScenarioOverrideRow = { ...row, updatedAt: new Date().toISOString() };
    db().overrides.set(`${row.userId}:${row.scenarioSlug}`, full);
    return full;
  }

  async deleteScenarioOverride(userId: string, scenarioSlug: string): Promise<void> {
    db().overrides.delete(`${userId}:${scenarioSlug}`);
  }

  async getCurrentUser(): Promise<AppUser | null> {
    return db().profile;
  }

  async updateProfile(
    _userId: string,
    patch: { name?: string; specialty?: string; onboarded?: boolean }
  ): Promise<void> {
    const p = db().profile;
    if (patch.name !== undefined) p.name = patch.name;
    if (patch.specialty !== undefined) p.specialty = patch.specialty as AppUser["specialty"];
    if (patch.onboarded !== undefined) p.onboarded = patch.onboarded;
  }

  async createEncounter(input: Parameters<Store["createEncounter"]>[0]): Promise<EncounterRow> {
    const row: EncounterRow = {
      id: randomUUID(),
      userId: input.userId,
      scenarioSlug: input.scenarioSlug,
      difficulty: input.difficulty,
      persona: input.persona,
      transcript: input.transcript,
      status: "active",
      startedAt: new Date().toISOString(),
      endedAt: null,
      usage: { ...EMPTY_USAGE },
      kind: input.kind ?? "rep",
      meta: input.meta,
    };
    db().encounters.set(row.id, row);
    return row;
  }

  async recordUsage(id: string, userId: string, delta: Partial<EncounterUsage>): Promise<void> {
    const row = db().encounters.get(id);
    if (!row || row.userId !== userId) return;
    row.usage = addUsage(row.usage ?? { ...EMPTY_USAGE }, delta);
  }

  async getEncounter(id: string, userId: string): Promise<EncounterRow | null> {
    const row = db().encounters.get(id);
    return row && row.userId === userId ? row : null;
  }

  async updateEncounter(
    id: string,
    userId: string,
    patch: Parameters<Store["updateEncounter"]>[2]
  ): Promise<void> {
    const row = db().encounters.get(id);
    if (!row || row.userId !== userId) return;
    if (patch.transcript) row.transcript = patch.transcript;
    if (patch.status) row.status = patch.status;
    if (patch.endedAt) row.endedAt = patch.endedAt;
    if (patch.meta) row.meta = { ...row.meta, ...patch.meta };
  }

  async countEncountersToday(userId: string): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return [...db().encounters.values()].filter(
      (e) => e.userId === userId && new Date(e.startedAt) >= startOfDay
    ).length;
  }

  async saveGrade(
    input: Omit<GradeRow, "id" | "createdAt"> & { modelRaw: string; userId: string }
  ): Promise<GradeRow> {
    const row: GradeRow & { modelRaw: string } = {
      id: randomUUID(),
      encounterId: input.encounterId,
      closed: input.closed,
      scores: input.scores,
      total: input.total,
      moment: input.moment,
      momentIndex: input.momentIndex ?? null,
      rewrite: input.rewrite ?? null,
      worked: input.worked,
      fixes: input.fixes,
      drill: input.drill,
      createdAt: new Date().toISOString(),
      modelRaw: input.modelRaw,
    };
    db().grades.set(input.encounterId, row);
    return row;
  }

  async getGradeByEncounter(encounterId: string, userId: string): Promise<GradeRow | null> {
    const enc = db().encounters.get(encounterId);
    if (!enc || enc.userId !== userId) return null;
    return db().grades.get(encounterId) ?? null;
  }

  async listEncountersWithGrades(
    userId: string,
    opts?: { sinceDays?: number; limit?: number }
  ): Promise<EncounterWithGrade[]> {
    const since = opts?.sinceDays
      ? Date.now() - opts.sinceDays * 24 * 60 * 60 * 1000
      : 0;
    const rows = [...db().encounters.values()]
      .filter((e) => e.userId === userId && new Date(e.startedAt).getTime() >= since)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .slice(0, opts?.limit ?? 500);
    return rows.map((encounter) => ({
      encounter,
      grade: db().grades.get(encounter.id) ?? null,
    }));
  }

  /* ------------------------------ training ------------------------------ */

  async listTrainingModules(specialty: string): Promise<TrainingModule[]> {
    return PODIATRY_MODULES.filter((m) => m.specialty === specialty).sort((a, b) => a.order - b.order);
  }

  async listTrainingLessons(specialty: string): Promise<TrainingLesson[]> {
    return PODIATRY_LESSONS.filter((l) => l.specialty === specialty);
  }

  async getTrainingLesson(slug: string): Promise<TrainingLesson | null> {
    return PODIATRY_LESSONS.find((l) => l.slug === slug) ?? null;
  }

  async getModuleDoc(moduleSlug: string): Promise<ModuleDoc | null> {
    return getModuleDocFromCode(moduleSlug);
  }

  async getLessonProgress(userId: string): Promise<LessonProgressRow[]> {
    return [...db().lessonProgress.values()].filter((p) => p.userId === userId);
  }

  async upsertLessonProgress(
    userId: string,
    lessonSlug: string,
    patch: Partial<Omit<LessonProgressRow, "userId" | "lessonSlug">>
  ): Promise<LessonProgressRow> {
    const key = `${userId}:${lessonSlug}`;
    const existing = db().lessonProgress.get(key) ?? {
      userId,
      lessonSlug,
      status: "not_started" as const,
      quizScore: null,
      drillPassed: null,
      completedAt: null,
    };
    const next: LessonProgressRow = {
      ...existing,
      ...patch,
      // best quiz score is sticky
      quizScore:
        patch.quizScore !== undefined && patch.quizScore !== null
          ? Math.max(existing.quizScore ?? 0, patch.quizScore)
          : existing.quizScore,
    };
    db().lessonProgress.set(key, next);
    return next;
  }

  async listUnlocks(userId: string): Promise<UnlockRow[]> {
    return db().unlocks.filter((u) => u.userId === userId);
  }

  async addUnlocks(userId: string, stationSlugs: string[], via: UnlockVia): Promise<void> {
    const existing = new Set(db().unlocks.filter((u) => u.userId === userId).map((u) => u.stationSlug));
    const now = new Date().toISOString();
    for (const slug of stationSlugs) {
      if (!existing.has(slug)) {
        db().unlocks.push({ userId, stationSlug: slug, via, createdAt: now });
      }
    }
  }

  /* ------------------------------ outcomes ------------------------------ */

  async listOutcomeLogs(userId: string, opts?: { sinceDays?: number }): Promise<OutcomeLogRow[]> {
    const since = opts?.sinceDays ? Date.now() - opts.sinceDays * 86_400_000 : 0;
    return db()
      .outcomeLogs.filter(
        (o) => o.userId === userId && new Date(o.createdAt).getTime() >= since
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  async addOutcomeLog(input: Omit<OutcomeLogRow, "id" | "createdAt">): Promise<OutcomeLogRow> {
    const row: OutcomeLogRow = { ...input, id: randomUUID(), createdAt: new Date().toISOString() };
    db().outcomeLogs.push(row);
    return row;
  }

  /* ---------------------------- assigned drills ---------------------------- */

  async createAssignment(
    input: Omit<AssignmentRow, "id" | "createdAt" | "active">
  ): Promise<AssignmentRow> {
    const row: AssignmentRow = {
      ...input,
      id: `asg-${randomUUID().slice(0, 8)}`,
      createdAt: new Date().toISOString(),
      active: true,
    };
    db().assignments.push(row);
    return row;
  }

  async listAssignmentsByAdmin(adminUserId: string): Promise<AssignmentRow[]> {
    return db().assignments.filter((a) => a.adminUserId === adminUserId && a.active);
  }

  async listAssignmentsForSeat(userId: string): Promise<AssignmentRow[]> {
    // Dev mode: the single user is both admin and seat; "all" covers them.
    return db().assignments.filter(
      (a) => a.active && (a.seats === "all" || a.seats.includes(userId))
    );
  }

  async retireAssignment(id: string, adminUserId: string): Promise<void> {
    const row = db().assignments.find((a) => a.id === id && a.adminUserId === adminUserId);
    if (row) row.active = false;
  }

  async recordCardSession(userId: string): Promise<void> {
    db().cardSessions.push({ userId, at: new Date().toISOString() });
  }

  async countCardSessions(userId: string, sinceIso: string): Promise<number> {
    return db().cardSessions.filter((c) => c.userId === userId && c.at >= sinceIso).length;
  }

  /* ------------------------------ site imports ---------------------------- */

  async countSiteImportsToday(userId: string): Promise<number> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return db().siteImports.filter(
      (i) => i.userId === userId && new Date(i.at) >= start
    ).length;
  }

  async recordSiteImport(userId: string, url: string): Promise<void> {
    db().siteImports.push({ userId, url, at: new Date().toISOString() });
  }

  /* ----------------------------- clinic admin ---------------------------- */

  async getRequireCurriculum(): Promise<boolean> {
    return db().requireCurriculum;
  }

  async setRequireCurriculum(_adminUserId: string, value: boolean): Promise<void> {
    db().requireCurriculum = value;
  }

  async listTeamTraining(adminUserId: string): Promise<TeamTrainingRow[]> {
    // Dev mode: the admin's own row plus seeded teammates (Phase 2 reads real seats).
    const modules = await this.listTrainingModules("podiatry");
    const lessons = await this.listTrainingLessons("podiatry");
    const progress = await this.getLessonProgress(adminUserId);
    const status = computeTrainingStatus(modules, lessons, progress);
    const unlocks = await this.listUnlocks(adminUserId);
    const self: TeamTrainingRow = {
      userId: adminUserId,
      name: db().profile.name ?? "You",
      email: db().profile.email,
      lessonsCompleted: status.lessonsCompleted,
      lessonsTotal: status.lessonsTotal,
      quizAvg: status.quizAvg,
      coreComplete: status.coreComplete,
      unlockedVia: unlocks[0]?.via ?? (status.coreComplete ? "curriculum" : null),
    };
    if (process.env.DEV_SEED_STATS !== "1") return [self];
    return [
      self,
      {
        userId: "seed-seat-2",
        name: "Dr. A. Okafor",
        email: "aokafor@clinic.example",
        lessonsCompleted: lessons.length,
        lessonsTotal: lessons.length,
        quizAvg: 92,
        coreComplete: true,
        unlockedVia: "curriculum",
      },
      {
        userId: "seed-seat-3",
        name: "Dr. M. Reyes",
        email: "mreyes@clinic.example",
        lessonsCompleted: 4,
        lessonsTotal: lessons.length,
        quizAvg: 78,
        coreComplete: false,
        unlockedVia: "test_out",
      },
      {
        userId: "seed-seat-4",
        name: "T. Nguyen, DPM",
        email: "tnguyen@clinic.example",
        lessonsCompleted: 0,
        lessonsTotal: lessons.length,
        quizAvg: null,
        coreComplete: false,
        unlockedVia: null,
      },
    ];
  }
}

let _store: MemoryStore | null = null;
export function getMemoryStore(): Store {
  if (!_store) _store = new MemoryStore();
  return _store;
}

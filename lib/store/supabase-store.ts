import "server-only";
import type {
  AppUser,
  EncounterRow,
  EncounterUsage,
  GradeRow,
  LessonProgressRow,
  OutcomeLogRow,
  Scenario,
  TrainingLesson,
  TrainingModule,
  UnlockRow,
  UnlockVia,
} from "../types";
import { EMPTY_USAGE } from "../types";
import { addUsage } from "../costs";
import { computeTrainingStatus } from "../training";
import type { EncounterWithGrade, Store, TeamTrainingRow } from "./index";
import { createClient } from "../supabase/server";

/**
 * Supabase-backed store. Every query runs through the request-scoped client,
 * so Postgres RLS enforces that users only touch their own rows — the userId
 * arguments are belt-and-suspenders, not the security boundary.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

function mapScenario(r: any): Scenario {
  return {
    slug: r.slug,
    specialty: r.specialty,
    role: r.role ?? "provider",
    title: r.title,
    serviceDesc: r.service_desc,
    priceDisplay: r.price_display,
    priceStructure: r.price_structure,
    clinicalContext: r.clinical_context,
    patientCc: r.patient_cc,
    closeGoal: r.close_goal,
    objectionSeeds: r.objection_seeds ?? [],
    difficultyNotes: r.difficulty_notes ?? undefined,
    insuranceOverride: r.insurance_override ?? undefined,
    isCustom: r.is_custom,
    active: r.active,
    isPrep: r.is_prep ?? false,
    createdByUserId: r.created_by_user_id ?? null,
  };
}

function mapOverride(r: any): import("../types").ScenarioOverrideRow {
  return {
    userId: r.user_id,
    scenarioSlug: r.scenario_slug,
    scope: r.scope,
    config: r.config,
    priceDisplay: r.price_display,
    priceStructure: r.price_structure,
    updatedAt: r.updated_at,
  };
}

function mapEncounter(r: any): EncounterRow {
  return {
    id: r.id,
    userId: r.user_id,
    scenarioSlug: r.scenario_slug,
    difficulty: r.difficulty,
    persona: r.persona_snapshot,
    transcript: r.transcript ?? [],
    status: r.status,
    startedAt: r.started_at,
    endedAt: r.ended_at,
    usage: { ...EMPTY_USAGE, ...(r.usage ?? {}) },
    kind: r.kind ?? "rep",
    meta: r.meta ?? undefined,
  };
}

function mapModule(r: any): TrainingModule {
  return {
    slug: r.slug,
    specialty: r.specialty,
    order: r.sort_order,
    rubricKey: r.rubric_key ?? null,
    title: r.title,
    subtitle: r.subtitle,
    core: r.core,
  };
}

function mapLesson(r: any): TrainingLesson {
  const c = r.content ?? {};
  return {
    slug: r.slug,
    moduleSlug: r.module_slug,
    specialty: r.specialty,
    order: r.sort_order,
    title: r.title,
    minutes: r.minutes,
    cards: c.cards ?? [],
    example: c.example ?? null,
    quiz: c.quiz ?? [],
    drill: c.drill ?? null,
  };
}

function mapProgress(r: any): LessonProgressRow {
  return {
    userId: r.user_id,
    lessonSlug: r.lesson_slug,
    status: r.status,
    quizScore: r.quiz_score,
    drillPassed: r.drill_passed,
    completedAt: r.completed_at,
  };
}

function mapAssignment(r: any): import("../types").AssignmentRow {
  return {
    id: r.id,
    adminUserId: r.admin_user_id,
    kind: r.kind,
    stationSlug: r.station_slug,
    title: r.title,
    seats: r.seats,
    dueAt: r.due_at,
    targetReps: r.target_reps,
    minGrade: r.min_grade,
    createdAt: r.created_at,
    active: r.active,
  };
}

function mapGrade(r: any): GradeRow {
  return {
    id: r.id,
    encounterId: r.encounter_id,
    closed: r.closed,
    scores: r.rubric,
    total: r.total,
    moment: r.moment,
    momentIndex: r.moment_index ?? null,
    rewrite: r.rewrite ?? null,
    worked: r.worked ?? [],
    fixes: r.fixes ?? [],
    drill: r.drill,
    createdAt: r.created_at,
  };
}

export class SupabaseStore implements Store {
  async listScenarios(specialty?: string): Promise<Scenario[]> {
    const supabase = await createClient();
    let q = supabase
      .from("scenarios")
      .select("*")
      .eq("active", true)
      .eq("is_custom", false)
      .order("sort_order");
    if (specialty) q = q.eq("specialty", specialty);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(mapScenario);
  }

  async getScenario(slug: string): Promise<Scenario | null> {
    // No active filter: encounter history must resolve retired customs/preps.
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapScenario(data) : null;
  }

  /* --------------------- custom scenarios & overrides --------------------- */

  async listCustomScenarios(
    userId: string,
    opts?: { includeRetired?: boolean }
  ): Promise<Scenario[]> {
    const supabase = await createClient();
    let q = supabase.from("scenarios").select("*").eq("created_by_user_id", userId);
    if (!opts?.includeRetired) q = q.eq("active", true);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map(mapScenario);
  }

  async createCustomScenario(
    userId: string,
    input: Omit<Scenario, "slug" | "isCustom" | "active" | "createdByUserId"> & { slug?: string }
  ): Promise<Scenario> {
    const supabase = await createClient();
    const slug = input.slug ?? `custom-${crypto.randomUUID().slice(0, 8)}`;
    const { data, error } = await supabase
      .from("scenarios")
      .insert({
        slug,
        specialty: input.specialty,
        title: input.title,
        service_desc: input.serviceDesc,
        price_display: input.priceDisplay,
        price_structure: input.priceStructure,
        clinical_context: input.clinicalContext,
        patient_cc: input.patientCc,
        close_goal: input.closeGoal,
        objection_seeds: input.objectionSeeds,
        difficulty_notes: input.difficultyNotes ?? null,
        insurance_override: input.insuranceOverride ?? null,
        is_custom: true,
        is_prep: input.isPrep ?? false,
        created_by_user_id: userId,
        active: true,
        sort_order: 1000,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapScenario(data);
  }

  async updateCustomScenario(slug: string, _userId: string, patch: Partial<Scenario>): Promise<void> {
    const supabase = await createClient();
    const row: Record<string, unknown> = {};
    if (patch.title !== undefined) row.title = patch.title;
    if (patch.serviceDesc !== undefined) row.service_desc = patch.serviceDesc;
    if (patch.priceDisplay !== undefined) row.price_display = patch.priceDisplay;
    if (patch.priceStructure !== undefined) row.price_structure = patch.priceStructure;
    if (patch.clinicalContext !== undefined) row.clinical_context = patch.clinicalContext;
    if (patch.patientCc !== undefined) row.patient_cc = patch.patientCc;
    if (patch.closeGoal !== undefined) row.close_goal = patch.closeGoal;
    if (patch.objectionSeeds !== undefined) row.objection_seeds = patch.objectionSeeds;
    if (patch.active !== undefined) row.active = patch.active;
    const { error } = await supabase.from("scenarios").update(row).eq("slug", slug).eq("is_custom", true);
    if (error) throw error;
  }

  async retireCustomScenario(slug: string, userId: string): Promise<void> {
    await this.updateCustomScenario(slug, userId, { active: false });
  }

  async countCustomScenarios(userId: string): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from("scenarios")
      .select("slug", { count: "exact", head: true })
      .eq("created_by_user_id", userId)
      .eq("active", true)
      .eq("is_prep", false);
    if (error) throw error;
    return count ?? 0;
  }

  async listObjectionCards(userId: string, specialty: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("objection_cards")
      .select("*")
      .eq("specialty", specialty)
      .or(`created_by_user_id.is.null,created_by_user_id.eq.${userId}`);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: r.id,
      specialty: r.specialty,
      difficulty: r.difficulty,
      front: r.front,
      back: r.back,
      custom: Boolean(r.created_by_user_id),
      createdByUserId: r.created_by_user_id,
    }));
  }

  async addObjectionCards(
    userId: string,
    cards: Omit<import("../types").ObjectionCard, "id" | "custom" | "createdByUserId">[]
  ): Promise<void> {
    if (cards.length === 0) return;
    const supabase = await createClient();
    const { error } = await supabase.from("objection_cards").insert(
      cards.map((c) => ({
        id: `card-${crypto.randomUUID().slice(0, 8)}`,
        specialty: c.specialty,
        difficulty: c.difficulty,
        front: c.front,
        back: c.back,
        created_by_user_id: userId,
      }))
    );
    if (error) throw error;
  }

  async getScenarioOverride(userId: string, scenarioSlug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scenario_overrides")
      .select("*")
      .eq("user_id", userId)
      .eq("scenario_slug", scenarioSlug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapOverride(data) : null;
  }

  async listScenarioOverrides(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scenario_overrides")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map(mapOverride);
  }

  async upsertScenarioOverride(row: Omit<import("../types").ScenarioOverrideRow, "updatedAt">) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("scenario_overrides")
      .upsert(
        {
          user_id: row.userId,
          scenario_slug: row.scenarioSlug,
          scope: row.scope,
          config: row.config,
          price_display: row.priceDisplay,
          price_structure: row.priceStructure,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,scenario_slug" }
      )
      .select("*")
      .single();
    if (error) throw error;
    return mapOverride(data);
  }

  async deleteScenarioOverride(userId: string, scenarioSlug: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("scenario_overrides")
      .delete()
      .eq("user_id", userId)
      .eq("scenario_slug", scenarioSlug);
    if (error) throw error;
  }

  async getCurrentUser(): Promise<AppUser | null> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    return {
      id: user.id,
      email: user.email ?? "",
      name: profile?.name ?? user.user_metadata?.full_name ?? null,
      clinicId: profile?.clinic_id ?? null,
      specialty: profile?.specialty ?? null,
      onboarded: profile?.onboarded ?? false,
    };
  }

  async updateProfile(
    userId: string,
    patch: { name?: string; specialty?: string; onboarded?: boolean }
  ): Promise<void> {
    const supabase = await createClient();
    const row: Record<string, unknown> = { id: userId };
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.specialty !== undefined) row.specialty = patch.specialty;
    if (patch.onboarded !== undefined) row.onboarded = patch.onboarded;
    const { error } = await supabase.from("profiles").upsert(row);
    if (error) throw error;
  }

  async createEncounter(input: Parameters<Store["createEncounter"]>[0]): Promise<EncounterRow> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("encounters")
      .insert({
        user_id: input.userId,
        scenario_slug: input.scenarioSlug,
        difficulty: input.difficulty,
        persona_snapshot: input.persona,
        transcript: input.transcript,
        status: "active",
        kind: input.kind ?? "rep",
        meta: input.meta ?? null,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapEncounter(data);
  }

  async getEncounter(id: string, _userId: string): Promise<EncounterRow | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("encounters")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw error;
    return data ? mapEncounter(data) : null;
  }

  async updateEncounter(
    id: string,
    _userId: string,
    patch: Parameters<Store["updateEncounter"]>[2]
  ): Promise<void> {
    const supabase = await createClient();
    const row: Record<string, unknown> = {};
    if (patch.transcript) row.transcript = patch.transcript;
    if (patch.status) row.status = patch.status;
    if (patch.endedAt) row.ended_at = patch.endedAt;
    if (patch.meta) {
      const { data } = await supabase.from("encounters").select("meta").eq("id", id).maybeSingle();
      row.meta = { ...(data?.meta ?? {}), ...patch.meta };
    }
    const { error } = await supabase.from("encounters").update(row).eq("id", id);
    if (error) throw error;
  }

  async recordUsage(id: string, _userId: string, delta: Partial<EncounterUsage>): Promise<void> {
    // Turns are sequential per encounter, so read-merge-write is safe here.
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("encounters")
      .select("usage")
      .eq("id", id)
      .maybeSingle();
    if (error || !data) return;
    const merged = addUsage({ ...EMPTY_USAGE, ...(data.usage ?? {}) }, delta);
    await supabase.from("encounters").update({ usage: merged }).eq("id", id);
  }

  async countEncountersToday(userId: string): Promise<number> {
    const supabase = await createClient();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { count, error } = await supabase
      .from("encounters")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("started_at", startOfDay.toISOString());
    if (error) throw error;
    return count ?? 0;
  }

  async saveGrade(
    input: Omit<GradeRow, "id" | "createdAt"> & { modelRaw: string; userId: string }
  ): Promise<GradeRow> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("grades")
      .insert({
        encounter_id: input.encounterId,
        user_id: input.userId,
        closed: input.closed,
        rubric: input.scores,
        total: input.total,
        moment: input.moment,
        moment_index: input.momentIndex ?? null,
        rewrite: input.rewrite ?? null,
        worked: input.worked,
        fixes: input.fixes,
        drill: input.drill,
        model_raw: input.modelRaw,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapGrade(data);
  }

  async getGradeByEncounter(encounterId: string, _userId: string): Promise<GradeRow | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("grades")
      .select("*")
      .eq("encounter_id", encounterId)
      .maybeSingle();
    if (error) throw error;
    return data ? mapGrade(data) : null;
  }

  async listEncountersWithGrades(
    userId: string,
    opts?: { sinceDays?: number; limit?: number }
  ): Promise<EncounterWithGrade[]> {
    const supabase = await createClient();
    let q = supabase
      .from("encounters")
      .select("*, grades(*)")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(opts?.limit ?? 500);
    if (opts?.sinceDays) {
      const since = new Date(Date.now() - opts.sinceDays * 24 * 60 * 60 * 1000);
      q = q.gte("started_at", since.toISOString());
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      encounter: mapEncounter(r),
      grade: r.grades && r.grades.length > 0 ? mapGrade(r.grades[0]) : null,
    }));
  }

  /* ------------------------------ training ------------------------------ */

  async listTrainingModules(specialty: string): Promise<TrainingModule[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("training_modules")
      .select("*")
      .eq("specialty", specialty)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map(mapModule);
  }

  async listTrainingLessons(specialty: string): Promise<TrainingLesson[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("training_lessons")
      .select("*")
      .eq("specialty", specialty)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map(mapLesson);
  }

  async getTrainingLesson(slug: string): Promise<TrainingLesson | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("training_lessons")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    return data ? mapLesson(data) : null;
  }

  async getModuleDoc(moduleSlug: string): Promise<import("../types").ModuleDoc | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("training_module_docs")
      .select("*")
      .eq("module_slug", moduleSlug)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      moduleSlug: data.module_slug,
      specialty: data.specialty,
      ...(data.content ?? {}),
    } as import("../types").ModuleDoc;
  }

  async getLessonProgress(userId: string): Promise<LessonProgressRow[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map(mapProgress);
  }

  async upsertLessonProgress(
    userId: string,
    lessonSlug: string,
    patch: Partial<Omit<LessonProgressRow, "userId" | "lessonSlug">>
  ): Promise<LessonProgressRow> {
    const supabase = await createClient();
    const { data: existing } = await supabase
      .from("lesson_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_slug", lessonSlug)
      .maybeSingle();
    const row: Record<string, unknown> = {
      user_id: userId,
      lesson_slug: lessonSlug,
      updated_at: new Date().toISOString(),
    };
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.drillPassed !== undefined) row.drill_passed = patch.drillPassed;
    if (patch.completedAt !== undefined) row.completed_at = patch.completedAt;
    if (patch.quizScore !== undefined && patch.quizScore !== null) {
      row.quiz_score = Math.max(existing?.quiz_score ?? 0, patch.quizScore);
    }
    const { data, error } = await supabase
      .from("lesson_progress")
      .upsert(row)
      .select("*")
      .single();
    if (error) throw error;
    return mapProgress(data);
  }

  async listUnlocks(userId: string): Promise<UnlockRow[]> {
    const supabase = await createClient();
    const { data, error } = await supabase.from("unlocks").select("*").eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      userId: r.user_id,
      stationSlug: r.station_slug,
      via: r.via,
      createdAt: r.created_at,
    }));
  }

  async addUnlocks(userId: string, stationSlugs: string[], via: UnlockVia): Promise<void> {
    if (stationSlugs.length === 0) return;
    const supabase = await createClient();
    const { error } = await supabase.from("unlocks").upsert(
      stationSlugs.map((slug) => ({ user_id: userId, station_slug: slug, via })),
      { onConflict: "user_id,station_slug", ignoreDuplicates: true }
    );
    if (error) throw error;
  }

  /* ------------------------------ outcomes ------------------------------ */

  async listOutcomeLogs(userId: string, opts?: { sinceDays?: number }): Promise<OutcomeLogRow[]> {
    const supabase = await createClient();
    let q = supabase
      .from("outcome_logs")
      .select("*")
      .eq("user_id", userId)
      .order("log_date", { ascending: false });
    if (opts?.sinceDays) {
      const since = new Date(Date.now() - opts.sinceDays * 86_400_000);
      q = q.gte("log_date", since.toISOString().slice(0, 10));
    }
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      date: r.log_date,
      service: r.service,
      stationSlug: r.station_slug ?? null,
      amountCents: r.amount_cents ?? null,
      amountEntered: Boolean(r.amount_entered),
      presented: r.presented,
      closed: r.closed,
      createdAt: r.created_at,
    }));
  }

  async addOutcomeLog(input: Omit<OutcomeLogRow, "id" | "createdAt">): Promise<OutcomeLogRow> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("outcome_logs")
      .insert({
        user_id: input.userId,
        log_date: input.date,
        service: input.service,
        station_slug: input.stationSlug ?? null,
        amount_cents: input.amountCents ?? null,
        amount_entered: input.amountEntered ?? false,
        presented: input.presented,
        closed: input.closed,
      })
      .select("*")
      .single();
    if (error) throw error;
    return {
      id: data.id,
      userId: data.user_id,
      date: data.log_date,
      service: data.service,
      stationSlug: data.station_slug ?? null,
      amountCents: data.amount_cents ?? null,
      amountEntered: Boolean(data.amount_entered),
      presented: data.presented,
      closed: data.closed,
      createdAt: data.created_at,
    };
  }

  /* ---------------------------- assigned drills ---------------------------- */

  async createAssignment(
    input: Omit<import("../types").AssignmentRow, "id" | "createdAt" | "active">
  ) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assignments")
      .insert({
        admin_user_id: input.adminUserId,
        kind: input.kind,
        station_slug: input.stationSlug,
        title: input.title,
        seats: input.seats,
        due_at: input.dueAt,
        target_reps: input.targetReps,
        min_grade: input.minGrade,
      })
      .select("*")
      .single();
    if (error) throw error;
    return mapAssignment(data);
  }

  async listAssignmentsByAdmin(adminUserId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assignments")
      .select("*")
      .eq("admin_user_id", adminUserId)
      .eq("active", true);
    if (error) throw error;
    return (data ?? []).map(mapAssignment);
  }

  async listAssignmentsForSeat(userId: string) {
    const supabase = await createClient();
    // RLS exposes assignments for the seat's clinic; filter seat lists here.
    const { data, error } = await supabase.from("assignments").select("*").eq("active", true);
    if (error) throw error;
    return (data ?? [])
      .map(mapAssignment)
      .filter((a) => a.seats === "all" || a.seats.includes(userId));
  }

  async retireAssignment(id: string, adminUserId: string): Promise<void> {
    const supabase = await createClient();
    await supabase
      .from("assignments")
      .update({ active: false })
      .eq("id", id)
      .eq("admin_user_id", adminUserId);
  }

  async recordCardSession(userId: string): Promise<void> {
    const supabase = await createClient();
    await supabase.from("card_sessions").insert({ user_id: userId });
  }

  async countCardSessions(userId: string, sinceIso: string): Promise<number> {
    const supabase = await createClient();
    const { count } = await supabase
      .from("card_sessions")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", sinceIso);
    return count ?? 0;
  }

  /* ------------------------------ site imports ---------------------------- */

  async countSiteImportsToday(userId: string): Promise<number> {
    const supabase = await createClient();
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const { count, error } = await supabase
      .from("site_imports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", start.toISOString());
    if (error) throw error;
    return count ?? 0;
  }

  async recordSiteImport(userId: string, url: string): Promise<void> {
    const supabase = await createClient();
    await supabase.from("site_imports").insert({ user_id: userId, url });
  }

  /* ----------------------------- clinic admin ---------------------------- */

  async getRequireCurriculum(adminUserId: string): Promise<boolean> {
    const supabase = await createClient();
    const { data } = await supabase
      .from("clinics")
      .select("require_curriculum")
      .eq("owner_user_id", adminUserId)
      .maybeSingle();
    return data?.require_curriculum ?? false;
  }

  async setRequireCurriculum(adminUserId: string, value: boolean): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("clinics")
      .update({ require_curriculum: value })
      .eq("owner_user_id", adminUserId);
    if (error) throw error;
  }

  async listUnlockedPacks(userId: string): Promise<import("../packs").UnlockedPack[]> {
    const supabase = await createClient();
    // RLS returns public packs plus this user's unlocked ones.
    const { data: packs } = await supabase.from("packs").select("*");
    if (!packs || packs.length === 0) return [];
    const { data: stations } = await supabase
      .from("scenarios")
      .select("*")
      .in("pack_id", packs.map((p: any) => p.id))
      .eq("active", true);
    return packs.map((p: any) => ({
      pack: {
        id: p.id,
        name: p.name,
        vendor: p.vendor,
        specialty: p.specialty,
        branding: p.branding ?? {},
        distribution: p.distribution,
      },
      stations: (stations ?? [])
        .filter((s: any) => s.pack_id === p.id)
        .map(mapScenario),
    }));
  }

  async redeemPackCode(
    userId: string,
    code: string
  ): Promise<{ ok: true; packName: string } | { ok: false; error: string }> {
    // Codes are unreadable under RLS by design — validate with the admin client.
    const { createAdminClient } = await import("../supabase/admin");
    const admin = createAdminClient();
    if (!admin) return { ok: false, error: "Pack redemption isn't available right now." };
    const { data: codeRow } = await admin
      .from("pack_codes")
      .select("pack_id, redeemed_count")
      .eq("code", code.trim().toUpperCase())
      .maybeSingle();
    if (!codeRow) return { ok: false, error: "That code doesn't match any pack." };
    const { data: pack } = await admin
      .from("packs")
      .select("name")
      .eq("id", codeRow.pack_id)
      .maybeSingle();
    const { error } = await admin
      .from("pack_unlocks")
      .upsert({ user_id: userId, pack_id: codeRow.pack_id }, { onConflict: "user_id,pack_id" });
    if (error) return { ok: false, error: "Couldn't unlock the pack. Try again." };
    await admin
      .from("pack_codes")
      .update({ redeemed_count: (codeRow.redeemed_count ?? 0) + 1 })
      .eq("code", code.trim().toUpperCase());
    return { ok: true, packName: pack?.name ?? "Pack" };
  }

  async getScriptCard(userId: string, stationSlug: string) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("script_cards")
      .select("content_hash, lines")
      .eq("user_id", userId)
      .eq("station_slug", stationSlug)
      .maybeSingle();
    return data ? { contentHash: data.content_hash, lines: data.lines } : null;
  }

  async upsertScriptCard(
    userId: string,
    stationSlug: string,
    contentHash: string,
    lines: import("../script-card").ScriptCardLines
  ): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("script_cards")
      .upsert(
        { user_id: userId, station_slug: stationSlug, content_hash: contentHash, lines },
        { onConflict: "user_id,station_slug" }
      );
    if (error) throw error;
  }

  async getClinicName(userId: string): Promise<string | null> {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from("profiles")
      .select("clinic_id")
      .eq("id", userId)
      .maybeSingle();
    if (!profile?.clinic_id) return null;
    const { data: clinic } = await supabase
      .from("clinics")
      .select("name")
      .eq("id", profile.clinic_id)
      .maybeSingle();
    return clinic?.name ?? null;
  }

  async setSeatRole(
    _adminUserId: string,
    memberUserId: string,
    role: import("../types").StationRole
  ): Promise<void> {
    // RLS: only the member's clinic owner can update their profile row.
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ seat_role: role })
      .eq("id", memberUserId);
    if (error) throw error;
  }

  async listTeamTraining(adminUserId: string): Promise<TeamTrainingRow[]> {
    const supabase = await createClient();
    // Clinic members visible to this admin (RLS: clinic-admin read policies).
    const { data: clinic } = await supabase
      .from("clinics")
      .select("id")
      .eq("owner_user_id", adminUserId)
      .maybeSingle();
    if (!clinic) return [];
    const { data: members, error } = await supabase
      .from("profiles")
      .select("id, name, email, specialty, seat_role")
      .eq("clinic_id", clinic.id);
    if (error) throw error;

    const rows: TeamTrainingRow[] = [];
    for (const m of members ?? []) {
      const specialty = m.specialty ?? "podiatry";
      const [modules, lessons, progressRes, unlocksRes] = await Promise.all([
        this.listTrainingModules(specialty),
        this.listTrainingLessons(specialty),
        supabase.from("lesson_progress").select("*").eq("user_id", m.id),
        supabase.from("unlocks").select("via").eq("user_id", m.id).limit(1),
      ]);
      const progress = (progressRes.data ?? []).map(mapProgress);
      const status = computeTrainingStatus(modules, lessons, progress);
      rows.push({
        userId: m.id,
        name: m.name ?? m.email,
        seatRole: m.seat_role ?? "provider",
        email: m.email,
        lessonsCompleted: status.lessonsCompleted,
        lessonsTotal: status.lessonsTotal,
        quizAvg: status.quizAvg,
        coreComplete: status.coreComplete,
        unlockedVia: (unlocksRes.data?.[0]?.via as UnlockVia) ?? null,
      });
    }
    return rows;
  }
}

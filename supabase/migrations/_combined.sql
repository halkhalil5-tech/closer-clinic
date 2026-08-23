-- Closer Clinic — Phase 1 schema
-- Tables for Phase 2 (clinics, subscriptions) are created now so the data
-- model is stable, but Phase 1 code only touches profiles/scenarios/encounters/grades.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text,
  name        text,
  role        text not null default 'provider' check (role in ('provider', 'clinic_admin')),
  specialty   text check (specialty in ('podiatry', 'dental', 'medspa')),
  clinic_id   uuid,
  onboarded   boolean not null default false,
  is_comp     boolean not null default false, -- founder/demo accounts, bypasses billing
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------- clinics
create table public.clinics (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  owner_user_id       uuid not null references public.profiles (id),
  stripe_customer_id  text,
  seat_count          int not null default 5,
  plan                text,
  created_at          timestamptz not null default now()
);

alter table public.profiles
  add constraint profiles_clinic_fk
  foreign key (clinic_id) references public.clinics (id) on delete set null;

-- ------------------------------------------------------------ subscriptions
create table public.subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references public.profiles (id) on delete cascade,
  clinic_id           uuid references public.clinics (id) on delete cascade,
  stripe_sub_id       text unique,
  plan                text,
  status              text not null default 'none',
  seats               int not null default 1,
  current_period_end  timestamptz,
  created_at          timestamptz not null default now(),
  check (user_id is not null or clinic_id is not null)
);

-- --------------------------------------------------------------- scenarios
create table public.scenarios (
  id                   uuid primary key default gen_random_uuid(),
  specialty            text not null check (specialty in ('podiatry', 'dental', 'medspa')),
  slug                 text not null unique,
  title                text not null,
  service_desc         text not null,
  price_display        text not null,
  price_structure      text not null,
  clinical_context     text not null,
  patient_cc           text not null,
  close_goal           text not null,
  objection_seeds      jsonb not null default '[]',
  difficulty_notes     text,
  insurance_override   text,
  is_custom            boolean not null default false,
  created_by_clinic_id uuid references public.clinics (id) on delete cascade,
  active               boolean not null default true,
  sort_order           int not null default 100,
  created_at           timestamptz not null default now()
);

-- -------------------------------------------------------------- encounters
create table public.encounters (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  scenario_slug     text not null references public.scenarios (slug),
  difficulty        text not null check (difficulty in ('easy', 'moderate', 'hard')),
  persona_snapshot  jsonb not null,
  transcript        jsonb not null default '[]',
  status            text not null default 'active' check (status in ('active', 'graded', 'abandoned')),
  started_at        timestamptz not null default now(),
  ended_at          timestamptz
);

create index encounters_user_started_idx on public.encounters (user_id, started_at desc);

-- ------------------------------------------------------------------ grades
create table public.grades (
  id            uuid primary key default gen_random_uuid(),
  encounter_id  uuid not null unique references public.encounters (id) on delete cascade,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  closed        boolean not null,
  rubric        jsonb not null, -- {rapport, framing, price, objections, close} each 0-20
  total         int not null check (total between 0 and 100),
  moment        text not null,
  worked        jsonb not null default '[]',
  fixes         jsonb not null default '[]',
  drill         text not null,
  model_raw     text, -- raw grader output, for debugging
  created_at    timestamptz not null default now()
);

create index grades_user_idx on public.grades (user_id, created_at desc);

-- ------------------------------------------------------------------- RLS
-- Core invariant: a user can never read another user's encounters or
-- transcripts. Clinic-admin aggregate visibility is a Phase 2 policy addition.

alter table public.profiles      enable row level security;
alter table public.clinics       enable row level security;
alter table public.subscriptions enable row level security;
alter table public.scenarios     enable row level security;
alter table public.encounters    enable row level security;
alter table public.grades        enable row level security;

-- profiles: own row only
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- clinics: members can see their clinic; only owner updates (Phase 2 expands)
create policy "clinics_select_member" on public.clinics
  for select using (
    id in (select clinic_id from public.profiles where profiles.id = auth.uid())
    or owner_user_id = auth.uid()
  );

-- subscriptions: own (clinic subs handled by service role webhooks in Phase 2)
create policy "subscriptions_select_own" on public.subscriptions
  for select using (user_id = auth.uid());

-- scenarios: all authenticated users read the shared library and their
-- clinic's custom scenarios. Writes are service-role / Phase 2 admin only.
create policy "scenarios_select" on public.scenarios
  for select using (
    auth.uid() is not null
    and (
      created_by_clinic_id is null
      or created_by_clinic_id in (select clinic_id from public.profiles where profiles.id = auth.uid())
    )
  );

-- encounters: strictly own rows
create policy "encounters_select_own" on public.encounters
  for select using (user_id = auth.uid());
create policy "encounters_insert_own" on public.encounters
  for insert with check (user_id = auth.uid());
create policy "encounters_update_own" on public.encounters
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- grades: strictly own rows
create policy "grades_select_own" on public.grades
  for select using (user_id = auth.uid());
create policy "grades_insert_own" on public.grades
  for insert with check (
    user_id = auth.uid()
    and encounter_id in (select id from public.encounters where encounters.user_id = auth.uid())
  );
-- Per-encounter model + voice spend counters (founder cost dashboard).
-- Shape: {"modelInputTokens": n, "modelOutputTokens": n, "ttsCharacters": n, "sttSeconds": n}
alter table public.encounters
  add column usage jsonb not null default '{}';
-- Closer Clinic — TRAIN pillar: curriculum content, progress, unlocks,
-- real-world outcome logs, and encounter kinds (test-out / drill / redo).
--
-- Content is data with a `specialty` column: dental and med-spa packs are
-- row additions via the seed script — no schema changes.

-- ------------------------------------------------------- training content
create table public.training_modules (
  slug        text primary key,
  specialty   text not null check (specialty in ('podiatry', 'dental', 'medspa')),
  sort_order  int not null,
  rubric_key  text check (rubric_key in ('rapport', 'framing', 'price', 'objections', 'close')),
  title       text not null,
  subtitle    text not null,
  core        boolean not null default true,
  created_at  timestamptz not null default now()
);

create table public.training_lessons (
  slug        text primary key,
  module_slug text not null references public.training_modules (slug) on delete cascade,
  specialty   text not null check (specialty in ('podiatry', 'dental', 'medspa')),
  sort_order  int not null,
  title       text not null,
  minutes     int not null default 4,
  -- Structured lesson body: {cards: [...], example: {...}|null, quiz: [...], drill: {...}|null}
  content     jsonb not null,
  created_at  timestamptz not null default now()
);

create index training_lessons_module_idx on public.training_lessons (module_slug, sort_order);

-- ------------------------------------------------------- lesson progress
create table public.lesson_progress (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  lesson_slug  text not null references public.training_lessons (slug) on delete cascade,
  status       text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  quiz_score   int check (quiz_score between 0 and 100),
  drill_passed boolean,
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (user_id, lesson_slug)
);

-- ------------------------------------------------------------- unlocks
create table public.unlocks (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  station_slug text not null references public.scenarios (slug),
  via          text not null check (via in ('curriculum', 'test_out', 'module')),
  created_at   timestamptz not null default now(),
  primary key (user_id, station_slug)
);

-- --------------------------------------------------------- outcome logs
-- Self-reported real-world results: "Presented shockwave today? Closed?"
create table public.outcome_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  log_date   date not null,
  service    text not null,
  presented  boolean not null default true,
  closed     boolean not null,
  created_at timestamptz not null default now()
);

create index outcome_logs_user_idx on public.outcome_logs (user_id, log_date desc);

-- ------------------------------------------- encounter kinds & metadata
alter table public.encounters
  add column kind text not null default 'rep' check (kind in ('rep', 'test_out', 'drill', 'redo')),
  add column meta jsonb;

-- -------------------------------------------------- clinic training policy
-- Admin toggle: require curriculum completion before reps (default off).
alter table public.clinics
  add column require_curriculum boolean not null default false;

-- ------------------------------------------------------------------- RLS
alter table public.training_modules enable row level security;
alter table public.training_lessons enable row level security;
alter table public.lesson_progress  enable row level security;
alter table public.unlocks          enable row level security;
alter table public.outcome_logs     enable row level security;

-- content: readable by any authenticated user; writes are service-role (seed)
create policy "training_modules_select" on public.training_modules
  for select using (auth.uid() is not null);
create policy "training_lessons_select" on public.training_lessons
  for select using (auth.uid() is not null);

-- progress / unlocks / outcomes: strictly own rows
create policy "lesson_progress_select_own" on public.lesson_progress
  for select using (user_id = auth.uid());
create policy "lesson_progress_upsert_own" on public.lesson_progress
  for insert with check (user_id = auth.uid());
create policy "lesson_progress_update_own" on public.lesson_progress
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "unlocks_select_own" on public.unlocks
  for select using (user_id = auth.uid());
create policy "unlocks_insert_own" on public.unlocks
  for insert with check (user_id = auth.uid());

create policy "outcome_logs_select_own" on public.outcome_logs
  for select using (user_id = auth.uid());
create policy "outcome_logs_insert_own" on public.outcome_logs
  for insert with check (user_id = auth.uid());

-- clinic admins read their members' training progress (aggregate view)
create policy "lesson_progress_select_clinic_admin" on public.lesson_progress
  for select using (
    user_id in (
      select p.id from public.profiles p
      where p.clinic_id in (
        select c.id from public.clinics c where c.owner_user_id = auth.uid()
      )
    )
  );

create policy "unlocks_select_clinic_admin" on public.unlocks
  for select using (
    user_id in (
      select p.id from public.profiles p
      where p.clinic_id in (
        select c.id from public.clinics c where c.owner_user_id = auth.uid()
      )
    )
  );

-- Redo the Moment: the grader records which provider turn lost the close.
alter table public.grades
  add column moment_index int;
-- Closer Clinic — Custom Services & Pricing + Prep Tomorrow's Consult.
--
-- scenario_overrides: per-user (or clinic-wide) price edits on any scenario;
-- base rows never mutate. Custom scenarios live in the existing scenarios
-- table (is_custom=true) with a creator; preps are one-off sims excluded
-- from the roster. Retired customs soft-delete (active=false) so encounter
-- history stays intact.

-- --------------------------------------------------- scenarios extensions
alter table public.scenarios
  add column created_by_user_id uuid references public.profiles (id) on delete set null,
  add column is_prep boolean not null default false;

-- ------------------------------------------------------ price overrides
create table public.scenario_overrides (
  user_id         uuid not null references public.profiles (id) on delete cascade,
  scenario_slug   text not null references public.scenarios (slug) on delete cascade,
  scope           text not null default 'user' check (scope in ('user', 'clinic')),
  config          jsonb not null, -- {kind, amount, sessions?, interval?, anchorAmount?}
  price_display   text not null,
  price_structure text not null,
  updated_at      timestamptz not null default now(),
  primary key (user_id, scenario_slug)
);

-- --------------------------------------------------- encounter kind: prep
alter table public.encounters
  drop constraint encounters_kind_check;
alter table public.encounters
  add constraint encounters_kind_check
  check (kind in ('rep', 'test_out', 'drill', 'redo', 'prep'));

-- ------------------------------------------------------------------- RLS
alter table public.scenario_overrides enable row level security;

create policy "scenario_overrides_select_own" on public.scenario_overrides
  for select using (user_id = auth.uid());
create policy "scenario_overrides_insert_own" on public.scenario_overrides
  for insert with check (user_id = auth.uid());
create policy "scenario_overrides_update_own" on public.scenario_overrides
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "scenario_overrides_delete_own" on public.scenario_overrides
  for delete using (user_id = auth.uid());

-- scenarios: creators see and manage their own customs/preps (including
-- retired, for history); clinic-shared customs come with Phase 2 policies.
create policy "scenarios_select_own_custom" on public.scenarios
  for select using (created_by_user_id = auth.uid());
create policy "scenarios_insert_own_custom" on public.scenarios
  for insert with check (is_custom = true and created_by_user_id = auth.uid());
create policy "scenarios_update_own_custom" on public.scenarios
  for update using (created_by_user_id = auth.uid())
  with check (created_by_user_id = auth.uid());

-- "What you should've said": weakest verbatim line + rewrite, from the grader.
alter table public.grades
  add column rewrite jsonb;

-- Objection card deck: seed rows (created_by null) + user-generated cards.
create table public.objection_cards (
  id                 text primary key,
  specialty          text not null check (specialty in ('podiatry', 'dental', 'medspa')),
  difficulty         text not null check (difficulty in ('easy', 'moderate', 'hard')),
  front              text not null,
  back               jsonb not null, -- {isolate, reframe, close}
  created_by_user_id uuid references public.profiles (id) on delete cascade,
  created_at         timestamptz not null default now()
);

alter table public.objection_cards enable row level security;
create policy "objection_cards_select" on public.objection_cards
  for select using (
    auth.uid() is not null
    and (created_by_user_id is null or created_by_user_id = auth.uid())
  );
create policy "objection_cards_insert_own" on public.objection_cards
  for insert with check (created_by_user_id = auth.uid());

-- Website import rate limiting (3/day/user).
create table public.site_imports (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  url        text not null,
  created_at timestamptz not null default now()
);
alter table public.site_imports enable row level security;
create policy "site_imports_select_own" on public.site_imports
  for select using (user_id = auth.uid());
create policy "site_imports_insert_own" on public.site_imports
  for insert with check (user_id = auth.uid());

-- Assigned drills: clinic-admin homework with due dates and grade targets.
create table public.assignments (
  id            uuid primary key default gen_random_uuid(),
  admin_user_id uuid not null references public.profiles (id) on delete cascade,
  kind          text not null check (kind in ('station', 'cards')),
  station_slug  text references public.scenarios (slug),
  title         text not null,
  seats         jsonb not null default '"all"', -- "all" | [userId, ...]
  due_at        timestamptz not null,
  target_reps   int not null default 1,
  min_grade     text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create table public.card_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.assignments   enable row level security;
alter table public.card_sessions enable row level security;

create policy "assignments_admin_all" on public.assignments
  for all using (admin_user_id = auth.uid()) with check (admin_user_id = auth.uid());
create policy "assignments_select_clinic_member" on public.assignments
  for select using (
    admin_user_id in (
      select c.owner_user_id from public.clinics c
      where c.id in (select p.clinic_id from public.profiles p where p.id = auth.uid())
    )
  );
create policy "card_sessions_own" on public.card_sessions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
-- Module documents: the standardized reading layer of each training module
-- (objectives / concept / scripts / dialogues / mistakes / rep CTA).
-- Structured jsonb, canonical source in lib/training/module-docs.ts, seeded
-- like all other content. Tracked checks + live drills stay on the module's
-- `{slug}-core` row in training_lessons, so quiz/drill/progress APIs are
-- unchanged.
--
-- NOTE: the 18 pre-refactor lesson rows (and their lesson_progress) are
-- superseded by the collapsed `{module}-core` records the seed script now
-- writes. Prune old rows once seeded:
--   delete from public.training_lessons where slug not like '%-core';
-- (cascades old progress; safe pre-launch).

create table public.training_module_docs (
  module_slug text primary key references public.training_modules (slug) on delete cascade,
  specialty   text not null check (specialty in ('podiatry', 'dental', 'medspa')),
  -- {objectives, concept, scripts, dialogues, mistakes, repCta, flags}
  content     jsonb not null,
  created_at  timestamptz not null default now()
);

alter table public.training_module_docs enable row level security;
create policy "module_docs_select" on public.training_module_docs
  for select using (auth.uid() is not null);

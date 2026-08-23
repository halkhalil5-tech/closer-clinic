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

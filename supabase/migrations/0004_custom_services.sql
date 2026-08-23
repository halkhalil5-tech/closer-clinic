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

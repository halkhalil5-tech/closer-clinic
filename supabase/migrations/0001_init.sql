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

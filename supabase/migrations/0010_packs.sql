-- Closer Clinic — vendor station packs (foundation).
-- Packs group stations under a vendor brand. distribution='code' packs unlock
-- per-user by redeeming a code in Settings; 'public' packs are visible to all.

create table public.packs (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  vendor       text not null,
  specialty    text not null check (specialty in ('podiatry', 'dental', 'medspa')),
  branding     jsonb not null default '{}', -- {logoUrl?, accent?}
  distribution text not null default 'code' check (distribution in ('public', 'code')),
  created_at   timestamptz not null default now()
);

create table public.pack_codes (
  code           text primary key,
  pack_id        uuid not null references public.packs (id) on delete cascade,
  redeemed_count int not null default 0,
  created_at     timestamptz not null default now()
);

create table public.pack_unlocks (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  pack_id    uuid not null references public.packs (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, pack_id)
);

alter table public.scenarios add column pack_id uuid references public.packs (id) on delete set null;

alter table public.packs enable row level security;
alter table public.pack_codes enable row level security;
alter table public.pack_unlocks enable row level security;

-- Packs: visible when public or unlocked by this user. Codes: never readable
-- by users (redeem validates server-side). Unlocks: own rows.
create policy "packs_select_visible" on public.packs
  for select using (
    distribution = 'public'
    or id in (select pack_id from public.pack_unlocks where user_id = auth.uid())
  );

create policy "pack_unlocks_select_own" on public.pack_unlocks
  for select using (user_id = auth.uid());

-- Scenario visibility: pack stations require the pack to be visible.
drop policy "scenarios_select" on public.scenarios;
create policy "scenarios_select" on public.scenarios
  for select using (
    auth.uid() is not null
    and (
      created_by_clinic_id is null
      or created_by_clinic_id in (select clinic_id from public.profiles where profiles.id = auth.uid())
    )
    and (
      pack_id is null
      or pack_id in (select id from public.packs where distribution = 'public')
      or pack_id in (select pack_id from public.pack_unlocks where user_id = auth.uid())
    )
  );

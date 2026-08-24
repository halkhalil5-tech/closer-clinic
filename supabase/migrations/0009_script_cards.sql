-- Closer Clinic — script cards: cached Claude-tightened lines per (user, station).
-- content_hash covers the station's resolved content; a price or objection edit
-- regenerates on next print, an unchanged station reprints instantly.

create table public.script_cards (
  user_id      uuid not null references public.profiles (id) on delete cascade,
  station_slug text not null references public.scenarios (slug) on delete cascade,
  content_hash text not null,
  lines        jsonb not null,
  created_at   timestamptz not null default now(),
  primary key (user_id, station_slug)
);

alter table public.script_cards enable row level security;

create policy "script_cards_select_own" on public.script_cards
  for select using (user_id = auth.uid());
create policy "script_cards_upsert_own" on public.script_cards
  for insert with check (user_id = auth.uid());
create policy "script_cards_update_own" on public.script_cards
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

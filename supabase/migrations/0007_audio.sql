-- Closer Clinic — cached AI audio: "Common close / The fix" pairs + personal replays.
--
-- Cache scope: rows are keyed by content_hash — the hash of the station's
-- resolved content plus the script version. Default stations hash identically
-- for every user (one global cache); a customized station hashes differently,
-- so an edit regenerates and an unchanged station never does.

create table public.audio_assets (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null check (kind in ('pair', 'replay')),
  station_slug  text references public.scenarios (slug) on delete cascade,
  content_hash  text not null,
  take          text check (take in ('A', 'B')),
  -- Pair scripts: {take, lines: [{speaker, text, beat?}]}; replay: the moment window.
  script        jsonb not null,
  storage_path  text not null,
  duration_ms   int,
  -- Replays only: the rep this fixes, and its owner.
  encounter_id  uuid references public.encounters (id) on delete cascade,
  user_id       uuid references public.profiles (id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (kind, station_slug, content_hash, take),
  check (kind <> 'replay' or (encounter_id is not null and user_id is not null))
);

create index audio_assets_replay_idx on public.audio_assets (encounter_id) where kind = 'replay';

alter table public.audio_assets enable row level security;

-- Pairs are shared, fictional, scripted content: readable by any signed-in user.
create policy "audio_assets_select_pairs" on public.audio_assets
  for select using (kind = 'pair' and auth.uid() is not null);

-- Replays belong to the rep's owner.
create policy "audio_assets_select_own_replay" on public.audio_assets
  for select using (kind = 'replay' and user_id = auth.uid());

-- Writes go through the service role (generation endpoints); no user policies.

-- Soft monthly TTS budget for generated audio (env TTS_MONTHLY_CHAR_CAP).
create table public.tts_usage (
  month text primary key, -- YYYY-MM
  chars bigint not null default 0
);
alter table public.tts_usage enable row level security;
-- service-role only; no user policies.

-- Storage: public bucket for shared pairs, private bucket for personal replays.
insert into storage.buckets (id, name, public)
values ('audio-pairs', 'audio-pairs', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('audio-replays', 'audio-replays', false)
on conflict (id) do nothing;

create policy "audio_pairs_public_read" on storage.objects
  for select using (bucket_id = 'audio-pairs');

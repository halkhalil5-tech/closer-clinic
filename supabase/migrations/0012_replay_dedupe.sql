-- Replay audio rows carried a NULL station_slug, so the 0007 unique key
-- never deduped them; repeated "Hear it" renders piled up rows and spend.
-- Collapse existing duplicates (keep the newest), then key replays properly.
delete from public.audio_assets a
using public.audio_assets b
where a.kind = b.kind
  and a.encounter_id = b.encounter_id
  and a.content_hash = b.content_hash
  and a.encounter_id is not null
  and a.created_at < b.created_at;

-- NULL encounter_ids never collide, so station-cached rows are unaffected.
create unique index if not exists audio_assets_replay_key
  on public.audio_assets (kind, encounter_id, content_hash);

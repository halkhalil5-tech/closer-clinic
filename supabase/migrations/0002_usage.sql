-- Per-encounter model + voice spend counters (founder cost dashboard).
-- Shape: {"modelInputTokens": n, "modelOutputTokens": n, "ttsCharacters": n, "sttSeconds": n}
alter table public.encounters
  add column usage jsonb not null default '{}';

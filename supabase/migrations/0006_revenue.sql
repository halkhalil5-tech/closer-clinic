-- Closer Clinic — revenue attribution on outcome logs.
--
-- Logs gain a hard station link and a price snapshot taken at log time, so
-- editing a station's price later never rewrites revenue history. amount_entered
-- distinguishes a number the provider typed from a prefilled default; any
-- default in a window renders the revenue figure as "est."

alter table public.outcome_logs
  add column station_slug   text references public.scenarios (slug),
  add column amount_cents   int check (amount_cents is null or amount_cents >= 0),
  add column amount_entered boolean not null default false;

-- Best-effort backfill: the legacy `service` field held the scenario title.
update public.outcome_logs o
set station_slug = s.slug
from public.scenarios s
where o.station_slug is null
  and s.title = o.service;

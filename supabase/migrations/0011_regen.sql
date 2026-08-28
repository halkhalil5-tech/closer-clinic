-- Regenerative medicine specialty: widen every specialty check to include
-- 'regen', and add the compliance sub-score column on grades (additive,
-- nullable — podiatry grades never write it).

alter table public.profiles         drop constraint if exists profiles_specialty_check;
alter table public.profiles         add constraint profiles_specialty_check
  check (specialty in ('podiatry', 'dental', 'medspa', 'regen'));

alter table public.scenarios        drop constraint if exists scenarios_specialty_check;
alter table public.scenarios        add constraint scenarios_specialty_check
  check (specialty in ('podiatry', 'dental', 'medspa', 'regen'));

alter table public.objection_cards  drop constraint if exists objection_cards_specialty_check;
alter table public.objection_cards  add constraint objection_cards_specialty_check
  check (specialty in ('podiatry', 'dental', 'medspa', 'regen'));

alter table public.training_modules drop constraint if exists training_modules_specialty_check;
alter table public.training_modules add constraint training_modules_specialty_check
  check (specialty in ('podiatry', 'dental', 'medspa', 'regen'));

alter table public.training_lessons drop constraint if exists training_lessons_specialty_check;
alter table public.training_lessons add constraint training_lessons_specialty_check
  check (specialty in ('podiatry', 'dental', 'medspa', 'regen'));

alter table public.training_module_docs drop constraint if exists training_module_docs_specialty_check;
alter table public.training_module_docs add constraint training_module_docs_specialty_check
  check (specialty in ('podiatry', 'dental', 'medspa', 'regen'));

alter table public.packs            drop constraint if exists packs_specialty_check;
alter table public.packs            add constraint packs_specialty_check
  check (specialty in ('podiatry', 'dental', 'medspa', 'regen'));

-- Compliance sub-score: {"score": 0-20, "flags": ["..."]} — regen graders only.
alter table public.grades add column if not exists compliance jsonb;

-- Vendor-pack margin framing for script cards (never patient-facing).
alter table public.scenarios add column if not exists margin_note text;

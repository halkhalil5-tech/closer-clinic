-- Cash-pay dermatology vertical: widen specialty checks, plus two additive
-- scenario columns — a mandated close script for printable cards, and an
-- optional persona pool so specialty archetypes never leak across verticals.
alter table public.profiles drop constraint if exists profiles_specialty_check;
alter table public.profiles add constraint profiles_specialty_check check (specialty in ('podiatry', 'dental', 'medspa', 'regen', 'derm'));
alter table public.scenarios drop constraint if exists scenarios_specialty_check;
alter table public.scenarios add constraint scenarios_specialty_check check (specialty in ('podiatry', 'dental', 'medspa', 'regen', 'derm'));
alter table public.objection_cards drop constraint if exists objection_cards_specialty_check;
alter table public.objection_cards add constraint objection_cards_specialty_check check (specialty in ('podiatry', 'dental', 'medspa', 'regen', 'derm'));
alter table public.training_modules drop constraint if exists training_modules_specialty_check;
alter table public.training_modules add constraint training_modules_specialty_check check (specialty in ('podiatry', 'dental', 'medspa', 'regen', 'derm'));
alter table public.training_lessons drop constraint if exists training_lessons_specialty_check;
alter table public.training_lessons add constraint training_lessons_specialty_check check (specialty in ('podiatry', 'dental', 'medspa', 'regen', 'derm'));
alter table public.training_module_docs drop constraint if exists training_module_docs_specialty_check;
alter table public.training_module_docs add constraint training_module_docs_specialty_check check (specialty in ('podiatry', 'dental', 'medspa', 'regen', 'derm'));
alter table public.packs drop constraint if exists packs_specialty_check;
alter table public.packs add constraint packs_specialty_check check (specialty in ('podiatry', 'dental', 'medspa', 'regen', 'derm'));

alter table public.scenarios add column if not exists close_script text;
alter table public.scenarios add column if not exists persona_pool text[];
alter table public.scenarios add column if not exists fd_context text check (fd_context in ('checkout','phone'));

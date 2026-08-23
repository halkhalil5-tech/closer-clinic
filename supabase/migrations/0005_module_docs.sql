-- Module documents: the standardized reading layer of each training module
-- (objectives / concept / scripts / dialogues / mistakes / rep CTA).
-- Structured jsonb, canonical source in lib/training/module-docs.ts, seeded
-- like all other content. Tracked checks + live drills stay on the module's
-- `{slug}-core` row in training_lessons, so quiz/drill/progress APIs are
-- unchanged.
--
-- NOTE: the 18 pre-refactor lesson rows (and their lesson_progress) are
-- superseded by the collapsed `{module}-core` records the seed script now
-- writes. Prune old rows once seeded:
--   delete from public.training_lessons where slug not like '%-core';
-- (cascades old progress; safe pre-launch).

create table public.training_module_docs (
  module_slug text primary key references public.training_modules (slug) on delete cascade,
  specialty   text not null check (specialty in ('podiatry', 'dental', 'medspa')),
  -- {objectives, concept, scripts, dialogues, mistakes, repCta, flags}
  content     jsonb not null,
  created_at  timestamptz not null default now()
);

alter table public.training_module_docs enable row level security;
create policy "module_docs_select" on public.training_module_docs
  for select using (auth.uid() is not null);

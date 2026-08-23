-- RLS policy tests: a user can never read another user's encounters,
-- transcripts, or grades.
--
-- Run against a database with the migration applied (local stack or a
-- disposable branch — NOT production):
--   supabase test db          (uses pgTAP via supabase CLI), or
--   psql "$DB_URL" -f supabase/tests/rls.test.sql
--
-- The script simulates two authenticated users by setting the JWT claims
-- Supabase RLS reads through auth.uid().

begin;

create extension if not exists pgtap;

select plan(8);

-- ------------------------------------------------------------- fixtures
-- Two users seeded directly into auth.users (local test stacks allow this).
insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'alice@test.local'),
  ('22222222-2222-4222-8222-222222222222', 'bob@test.local')
on conflict (id) do nothing;

insert into public.profiles (id, email, name)
values
  ('11111111-1111-4111-8111-111111111111', 'alice@test.local', 'Alice'),
  ('22222222-2222-4222-8222-222222222222', 'bob@test.local', 'Bob')
on conflict (id) do nothing;

insert into public.scenarios (specialty, slug, title, service_desc, price_display,
  price_structure, clinical_context, patient_cc, close_goal)
values ('podiatry', 'rls-test-scenario', 'RLS Test', 'svc', '$1', '$1 once', 'ctx', 'cc', 'goal')
on conflict (slug) do nothing;

-- Alice's encounter + grade (inserted as superuser; RLS applies to selects below)
insert into public.encounters (id, user_id, scenario_slug, difficulty, persona_snapshot, transcript)
values (
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  'rls-test-scenario', 'easy', '{}',
  '[{"role":"provider","text":"SECRET-TRANSCRIPT-CONTENT","at":"2026-01-01T00:00:00Z"}]'
);

insert into public.grades (encounter_id, user_id, closed, rubric, total, moment, drill)
values (
  '33333333-3333-4333-8333-333333333333',
  '11111111-1111-4111-8111-111111111111',
  true, '{"rapport":10,"framing":10,"price":10,"objections":10,"close":10}', 50, 'moment', 'drill'
);

-- --------------------------------------------------- act as Alice (owner)
set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}';

select is(
  (select count(*)::int from public.encounters),
  1,
  'Alice sees her own encounter'
);

select is(
  (select count(*)::int from public.grades),
  1,
  'Alice sees her own grade'
);

select is(
  (select count(*)::int from public.profiles),
  1,
  'Alice sees only her own profile'
);

-- ---------------------------------------------------- act as Bob (other)
set local request.jwt.claims to '{"sub": "22222222-2222-4222-8222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int from public.encounters),
  0,
  'Bob cannot see Alice''s encounters (no transcript leakage)'
);

select is(
  (select count(*)::int from public.grades),
  0,
  'Bob cannot see Alice''s grades'
);

select is(
  (select count(*)::int from public.scenarios where slug = 'rls-test-scenario'),
  1,
  'Bob can read the shared scenario library'
);

-- Bob cannot insert an encounter as Alice
select throws_ok(
  $$insert into public.encounters (user_id, scenario_slug, difficulty, persona_snapshot)
    values ('11111111-1111-4111-8111-111111111111', 'rls-test-scenario', 'easy', '{}')$$,
  '42501',
  'new row violates row-level security policy for table "encounters"',
  'Bob cannot create an encounter owned by Alice'
);

-- Bob cannot update Alice's encounter (0 rows affected under RLS)
update public.encounters
  set status = 'abandoned'
  where id = '33333333-3333-4333-8333-333333333333';

reset role;
set local request.jwt.claims to default;

select is(
  (select status from public.encounters where id = '33333333-3333-4333-8333-333333333333'),
  'active',
  'Bob''s update of Alice''s encounter silently affected zero rows'
);

select * from finish();

rollback;

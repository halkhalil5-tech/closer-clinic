-- Closer Clinic — front-desk stations and seat roles.

alter table public.scenarios
  add column role text not null default 'provider'
  check (role in ('provider', 'front_desk'));

alter table public.profiles
  add column seat_role text not null default 'provider'
  check (seat_role in ('provider', 'front_desk'));

-- Clinic owners can set their members' seat role (scoped update via trigger-free
-- policy: owner of the member's clinic).
create policy "profiles_update_clinic_admin" on public.profiles
  for update using (
    clinic_id in (select c.id from public.clinics c where c.owner_user_id = auth.uid())
  )
  with check (
    clinic_id in (select c.id from public.clinics c where c.owner_user_id = auth.uid())
  );

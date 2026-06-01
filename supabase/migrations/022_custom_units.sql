-- ============================================================
-- 022_custom_units.sql
--
-- Phase 1 of the user-created custom units feature. This migration:
--   1. Adds owner_id / position / is_draft columns to public.units
--   2. Back-fills position for existing seeded units
--   3. Replaces the permissive content-table SELECT policies with
--      owner-aware policies (units / lessons / exercises /
--      exercise_options)
--   4. Adds INSERT / UPDATE / DELETE policies on the content tables so
--      a user can mutate ONLY their own custom content (owner_id =
--      auth.uid() chain)
--
-- This migration does NOT touch the complete_lesson RPC. As long as no
-- custom units exist yet, the existing order_index-based unlock chain
-- behaves identically (positions for seeded units are monotonically
-- increasing, matching order_index). The RPC will be migrated to a
-- position-based lookup in a later phase, when custom units actually
-- start being created.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Schema changes
-- ------------------------------------------------------------

alter table public.units
  add column if not exists owner_id uuid
    references public.profiles(id) on delete cascade,
  add column if not exists position numeric not null default 0,
  add column if not exists is_draft boolean not null default false;

-- One index for owner lookups (custom units only).
create index if not exists idx_units_owner_id
  on public.units(owner_id)
  where owner_id is not null;

-- Backfill position for seeded units: spread by 1000 so drag-and-drop
-- can interpolate midpoints cleanly (e.g. inserting at 500.5 between
-- 0 and 1000 is fine, vs. having to renumber).
update public.units
set position = order_index * 1000
where owner_id is null
  and position = 0;

-- ------------------------------------------------------------
-- 2. Units: replace SELECT, add INSERT/UPDATE/DELETE
-- ------------------------------------------------------------

drop policy if exists "Authenticated users can read units" on public.units;

create policy "Users can read global or own units"
  on public.units for select
  using (owner_id is null or owner_id = auth.uid());

create policy "Users can create own units"
  on public.units for insert
  with check (owner_id = auth.uid());

create policy "Users can update own units"
  on public.units for update
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "Users can delete own units"
  on public.units for delete
  using (owner_id = auth.uid());

-- ------------------------------------------------------------
-- 3. Lessons: transitive ownership via unit.owner_id
-- ------------------------------------------------------------

drop policy if exists "Authenticated users can read lessons" on public.lessons;

create policy "Read lessons of accessible units"
  on public.lessons for select
  using (
    exists (
      select 1 from public.units u
      where u.id = lessons.unit_id
        and (u.owner_id is null or u.owner_id = auth.uid())
    )
  );

create policy "Insert lessons in own units"
  on public.lessons for insert
  with check (
    exists (
      select 1 from public.units u
      where u.id = lessons.unit_id
        and u.owner_id = auth.uid()
    )
  );

create policy "Update lessons in own units"
  on public.lessons for update
  using (
    exists (
      select 1 from public.units u
      where u.id = lessons.unit_id
        and u.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.units u
      where u.id = lessons.unit_id
        and u.owner_id = auth.uid()
    )
  );

create policy "Delete lessons in own units"
  on public.lessons for delete
  using (
    exists (
      select 1 from public.units u
      where u.id = lessons.unit_id
        and u.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 4. Exercises: transitive via lesson → unit
-- ------------------------------------------------------------

drop policy if exists "Authenticated users can read exercises" on public.exercises;

create policy "Read exercises of accessible lessons"
  on public.exercises for select
  using (
    exists (
      select 1 from public.lessons l
      join public.units u on u.id = l.unit_id
      where l.id = exercises.lesson_id
        and (u.owner_id is null or u.owner_id = auth.uid())
    )
  );

create policy "Insert exercises in own lessons"
  on public.exercises for insert
  with check (
    exists (
      select 1 from public.lessons l
      join public.units u on u.id = l.unit_id
      where l.id = exercises.lesson_id
        and u.owner_id = auth.uid()
    )
  );

create policy "Update exercises in own lessons"
  on public.exercises for update
  using (
    exists (
      select 1 from public.lessons l
      join public.units u on u.id = l.unit_id
      where l.id = exercises.lesson_id
        and u.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.lessons l
      join public.units u on u.id = l.unit_id
      where l.id = exercises.lesson_id
        and u.owner_id = auth.uid()
    )
  );

create policy "Delete exercises in own lessons"
  on public.exercises for delete
  using (
    exists (
      select 1 from public.lessons l
      join public.units u on u.id = l.unit_id
      where l.id = exercises.lesson_id
        and u.owner_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- 5. Exercise options: transitive via exercise → lesson → unit
-- ------------------------------------------------------------

drop policy if exists "Authenticated users can read exercise_options" on public.exercise_options;

create policy "Read options of accessible exercises"
  on public.exercise_options for select
  using (
    exists (
      select 1 from public.exercises e
      join public.lessons l on l.id = e.lesson_id
      join public.units u on u.id = l.unit_id
      where e.id = exercise_options.exercise_id
        and (u.owner_id is null or u.owner_id = auth.uid())
    )
  );

create policy "Insert options in own exercises"
  on public.exercise_options for insert
  with check (
    exists (
      select 1 from public.exercises e
      join public.lessons l on l.id = e.lesson_id
      join public.units u on u.id = l.unit_id
      where e.id = exercise_options.exercise_id
        and u.owner_id = auth.uid()
    )
  );

create policy "Update options in own exercises"
  on public.exercise_options for update
  using (
    exists (
      select 1 from public.exercises e
      join public.lessons l on l.id = e.lesson_id
      join public.units u on u.id = l.unit_id
      where e.id = exercise_options.exercise_id
        and u.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.exercises e
      join public.lessons l on l.id = e.lesson_id
      join public.units u on u.id = l.unit_id
      where e.id = exercise_options.exercise_id
        and u.owner_id = auth.uid()
    )
  );

create policy "Delete options in own exercises"
  on public.exercise_options for delete
  using (
    exists (
      select 1 from public.exercises e
      join public.lessons l on l.id = e.lesson_id
      join public.units u on u.id = l.unit_id
      where e.id = exercise_options.exercise_id
        and u.owner_id = auth.uid()
    )
  );

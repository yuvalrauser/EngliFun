-- ============================================================
-- 024_unit_order_index_partial_unique.sql
--
-- The global UNIQUE (course_id, order_index) constraint on `units`
-- was designed for seeded content (10 units per course at 0..9). Once
-- custom user units entered the picture, the constraint started
-- causing intermittent duplicate-key errors:
--
--   "duplicate key value violates unique constraint
--    units_course_id_order_index_key"
--
-- The race: RLS hides other users' custom units from each caller's
-- SELECT, so two users computing max(order_index)+1 to find their next
-- slot will both arrive at the same value and then race against the
-- global INSERT.
--
-- Fix: custom units don't need this uniqueness. They are ordered by
-- `position` (migration 022), not `order_index`. So we replace the
-- global constraint with a partial unique index that only enforces
-- uniqueness on seeded global content (owner_id IS NULL).
-- ============================================================

alter table public.units
  drop constraint if exists units_course_id_order_index_key;

create unique index if not exists units_course_id_order_index_seeded_key
  on public.units (course_id, order_index)
  where owner_id is null;

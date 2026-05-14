-- ============================================================
-- 006_courses_level.sql
-- Adds a `level` column to `courses` so the app can pick the
-- active course by the user's profile.starting_level.
-- Existing single course is preserved as 'beginner'.
-- ============================================================

alter table public.courses
  add column if not exists level text not null default 'beginner';

alter table public.courses
  drop constraint if exists courses_level_check;

alter table public.courses
  add constraint courses_level_check
  check (level in ('beginner', 'elementary', 'intermediate'));

-- Rename the existing course so the new naming is consistent with
-- the upcoming elementary / intermediate courses.
update public.courses
set
  title = 'אנגלית — מתחילים',
  level = 'beginner'
where id = '00000000-0000-0000-0000-000000000001';

-- Exactly one active course per level. We intentionally use a
-- partial index so inactive duplicates remain allowed (useful
-- for retiring old content later without dropping rows).
create unique index if not exists courses_level_active_uniq
  on public.courses(level)
  where is_active = true;

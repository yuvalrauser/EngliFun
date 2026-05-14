-- ============================================================
-- 007_seed_empty_level_courses.sql
-- Course shells for elementary and intermediate so getFullCourse(level)
-- always resolves to a row. Units and lessons are intentionally NOT
-- seeded here — they come in later content batches.
-- ============================================================

insert into public.courses (id, title, description, language_from, language_to, is_active, level)
values
  (
    '00000000-0000-0000-0000-000000000002',
    'אנגלית — בסיסי',
    'קורס אנגלית ברמת בסיסי לדוברי עברית',
    'he',
    'en',
    true,
    'elementary'
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    'אנגלית — בינוני',
    'קורס אנגלית ברמת בינוני לדוברי עברית',
    'he',
    'en',
    true,
    'intermediate'
  )
on conflict (id) do nothing;

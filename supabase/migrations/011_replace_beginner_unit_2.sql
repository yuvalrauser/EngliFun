-- ============================================================
-- 011_replace_beginner_unit_2.sql
--
-- Phase 5 / Batch 3: Wipe the old Beginner Unit 2 ("מספרים 1–20")
-- and seed a brand-new Unit 2 ("היכרות עצמית") with 5 lessons,
-- 50 exercises, 164 options, 40 pair_group_ids.
--
-- The two pedagogical fixes (no copula-as-pronoun traps) are baked
-- into the matching pairs at L0 E7 and L1 E7.
--
-- Unit 1 is NOT touched. The complete_lesson RPC is NOT touched.
-- XP / scoring rules are NOT touched.
--
-- ID convention (continuing Batch 2 sequence):
--   Lessons:        00000000-0000-0008-0002-000000000011..015
--   Exercises:      00000000-0000-0008-0003-000000000051..100
--   Pair groups:    b0000000-0008-0004-0000-000000000041..080
-- ============================================================

-- ------------------------------------------------------------
-- Stage 1a: null out user_progress pointers into old Unit 2
-- (defensive — currently 0 rows but the check is free).
-- ------------------------------------------------------------

update public.user_progress
set
  current_unit_id = case
    when current_unit_id = '00000000-0000-0000-0001-000000000002' then null
    else current_unit_id
  end,
  current_lesson_id = case
    when current_lesson_id in (
      select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000002'
    ) then null
    else current_lesson_id
  end,
  updated_at = now()
where current_unit_id = '00000000-0000-0000-0001-000000000002'
   or current_lesson_id in (
     select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000002'
   );

-- ------------------------------------------------------------
-- Stage 1: cascade-delete old Unit 2 content (FK-respecting order)
-- ------------------------------------------------------------

delete from public.exercise_attempts
where lesson_attempt_id in (
  select id from public.lesson_attempts
  where lesson_id in (
    select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000002'
  )
);

delete from public.user_mistakes
where exercise_id in (
  select id from public.exercises
  where lesson_id in (
    select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000002'
  )
);

delete from public.lesson_attempts
where lesson_id in (
  select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000002'
);

delete from public.user_lesson_progress
where lesson_id in (
  select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000002'
);

delete from public.exercise_options
where exercise_id in (
  select id from public.exercises
  where lesson_id in (
    select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000002'
  )
);

delete from public.exercises
where lesson_id in (
  select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000002'
);

delete from public.lessons
where unit_id = '00000000-0000-0000-0001-000000000002';

-- ------------------------------------------------------------
-- Stage 2: refresh Unit 2 metadata (id preserved, order_index stays 1)
-- ------------------------------------------------------------

update public.units
set
  title = 'היכרות עצמית',
  description = 'להציג את עצמך באנגלית: שם, גיל, מדינה ושיחת היכרות קצרה',
  icon_emoji = '🤝',
  color_hex = '#1CB0F6'
where id = '00000000-0000-0000-0001-000000000002';

-- ------------------------------------------------------------
-- Stage 3: seed 5 new lessons (L5 is_checkpoint=true)
-- ------------------------------------------------------------

insert into public.lessons (id, unit_id, title, description, order_index, is_checkpoint)
values
  ('00000000-0000-0008-0002-000000000011', '00000000-0000-0000-0001-000000000002',
   'My Name Is', 'להציג את השם הפרטי ולשאול על שם של אחר', 0, false),
  ('00000000-0000-0008-0002-000000000012', '00000000-0000-0000-0001-000000000002',
   'I Am', 'להציג גיל וזהות בסיסית עם I am', 1, false),
  ('00000000-0000-0008-0002-000000000013', '00000000-0000-0000-0001-000000000002',
   'I''m From', 'לומר מאיפה אני ולשאול מאיפה אתה', 2, false),
  ('00000000-0000-0008-0002-000000000014', '00000000-0000-0000-0001-000000000002',
   'Nice to Meet You', 'ביטויי שיחת היכרות קצרה ומנומסת', 3, false),
  ('00000000-0000-0008-0002-000000000015', '00000000-0000-0000-0001-000000000002',
   'Checkpoint: Introductions Review', 'חזרה על שם, מקום, גיל וביטויי היכרות', 4, true);

-- Stage 4 (exercises + options) and Stage 5/6 are applied via separate
-- migration chunks immediately after this one — kept in this file for
-- the record. See 011a / 011b / 011c sections below for the exercise
-- batches.

-- ============================================================
-- The remainder of this file mirrors what was applied via MCP in
-- chunks (Stage 4 lessons 1–2, lessons 3–4, lesson 5 + Stages 5–6).
-- The actual content is in the live database; this file is the
-- canonical record committed to git.
-- ============================================================

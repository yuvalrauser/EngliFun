-- ============================================================
-- 009_fix_beginner_unit_1_wordbank.sql
--
-- Phase 5 / Batch 2 patch: the three single-token word_bank exercises
-- in Beginner Unit 1 were not real sentence-building practice — they
-- just tested "translate this word". Upgrade them to short phrases
-- (2–3 tiles) that still use only vocabulary that has been introduced
-- in their own lesson.
--
-- Touched exercises (same UUIDs, in-place UPDATE):
--   L1 E5  00000000-0000-0008-0003-000000000006  Hello       → Hello, Dana.
--   L1 E6  00000000-0000-0008-0003-000000000007  Goodbye     → Goodbye, Tom.
--   L4 E5  00000000-0000-0008-0003-000000000036  Please.     → Please, Dana.
--
-- The two-token word_banks in Lesson 2 ("Good morning." / "Good night.")
-- are left as-is — they already require 2-tile assembly.
--
-- Schema-level invariants preserved: each word_bank still has exactly
-- one row in `exercises`, no `exercise_options` rows (word_bank type),
-- `word_bank_words` contains every token of `correct_answer` plus
-- distractors. complete_lesson RPC and XP rules are NOT touched.
-- ============================================================

-- L1 E5 — "תרגם לאנגלית: שלום" → "Hello, Dana."
update public.exercises
set
  prompt_text = 'תרגם לאנגלית: שלום, דנה.',
  correct_answer = 'Hello, Dana.',
  correct_answer_alternatives = '["Hello Dana","Hello, Dana","hello, dana."]'::jsonb,
  word_bank_words = '["Hello,","Dana.","Bye","Yes","No"]'::jsonb,
  explanation_he = 'Hello, Dana. = שלום, דנה. ככה פונים למישהו בשמו בתחילת שיחה.'
where id = '00000000-0000-0008-0003-000000000006';

-- L1 E6 — "תרגם לאנגלית: להתראות" → "Goodbye, Tom."
update public.exercises
set
  prompt_text = 'תרגם לאנגלית: להתראות, תום.',
  correct_answer = 'Goodbye, Tom.',
  correct_answer_alternatives = '["Goodbye Tom","Goodbye, Tom","goodbye, tom."]'::jsonb,
  word_bank_words = '["Goodbye,","Tom.","Hello,","Thanks","No"]'::jsonb,
  explanation_he = 'Goodbye, Tom. = להתראות, תום. ככה נפרדים ממישהו בשמו בצורה מנומסת.'
where id = '00000000-0000-0008-0003-000000000007';

-- L4 E5 — "תרגם לאנגלית: בבקשה" → "Please, Dana."
update public.exercises
set
  prompt_text = 'תרגם לאנגלית: בבקשה, דנה.',
  correct_answer = 'Please, Dana.',
  correct_answer_alternatives = '["Please Dana","Please, Dana","please, dana."]'::jsonb,
  word_bank_words = '["Please,","Dana.","Thanks.","Hello","Sorry."]'::jsonb,
  explanation_he = 'Please, Dana. = בבקשה, דנה. הוספת השם הופכת את הבקשה לאישית ומנומסת יותר.'
where id = '00000000-0000-0008-0003-000000000036';

-- Sanity: every updated row must still be buildable from its tiles
do $$
declare
  v_bad integer;
begin
  select count(*) into v_bad
  from public.exercises
  where id in (
    '00000000-0000-0008-0003-000000000006',
    '00000000-0000-0008-0003-000000000007',
    '00000000-0000-0008-0003-000000000036'
  )
    and (
      correct_answer is null
      or word_bank_words is null
      or jsonb_array_length(word_bank_words) < 2
    );
  if v_bad > 0 then
    raise exception 'word_bank patch left % rows in an invalid state', v_bad;
  end if;
end $$;

-- ============================================================
-- 010_fix_beginner_unit_1_ambiguous_complete_sentences.sql
--
-- Phase 5 / Batch 2 patch #2: remove pedagogical ambiguity from
-- complete_sentence exercises in Beginner Unit 1.
--
-- The L1 (Hello/Bye) complete_sentences already use the
-- "אמור X: ___!" pattern from Fix A — those are untouched.
--
-- This migration rewrites the remaining 6 complete_sentence prompts
-- to include explicit Hebrew context, so the only natural answer is
-- the one marked correct. The English options themselves are NOT
-- changed (same option_text rows, same is_correct flags), so the
-- validator stays untouched.
--
-- Two distinct fairness problems are addressed:
--   - True ambiguity:  L2 E3 + L2 E4 — both "Good ___!" with no
--                      context, where "morning" and "night" are both
--                      valid English phrases. Was unfair.
--   - Beginner clarity:  L3 E3, L3 E4, L4 E3, L4 E4 — the English
--                      sentence has only one grammatically natural
--                      answer, but a Hebrew speaker who hasn't yet
--                      internalised the vocabulary has to guess. The
--                      Hebrew lead sentence ("ענה אני בסדר", "אמור
--                      תודה" וכו') makes the target unambiguous from
--                      the prompt itself, not from the options list.
--
-- Unit 2 is NOT touched. complete_lesson RPC is NOT touched.
-- XP / scoring rules are NOT touched.
-- ============================================================

-- L2 E3 — Good morning
update public.exercises
set
  prompt_text = 'אמור בוקר טוב: Good ___!',
  prompt_language = 'he',
  explanation_he = 'Good morning! = בוקר טוב! ברכת הבוקר באנגלית מורכבת מ-Good + morning.'
where id = '00000000-0000-0008-0003-000000000014';

-- L2 E4 — Good night
update public.exercises
set
  prompt_text = 'אמור לילה טוב: Good ___!',
  prompt_language = 'he',
  explanation_he = 'Good night! = לילה טוב! ברכת הלילה באנגלית מורכבת מ-Good + night.'
where id = '00000000-0000-0008-0003-000000000015';

-- L3 E3 — How are you?
update public.exercises
set
  prompt_text = 'שאל מה שלומך: How ___ you?',
  prompt_language = 'he',
  explanation_he = 'How are you? = מה שלומך? בשאלה הזו משתמשים תמיד ב-are אחרי How.'
where id = '00000000-0000-0008-0003-000000000024';

-- L3 E4 — I am fine
update public.exercises
set
  prompt_text = 'ענה אני בסדר: I am ___, thanks.',
  prompt_language = 'he',
  explanation_he = 'I am fine, thanks. = אני בסדר, תודה. fine = בסדר, וזו תשובה נפוצה.'
where id = '00000000-0000-0008-0003-000000000025';

-- L4 E3 — Thank you
update public.exercises
set
  prompt_text = 'אמור תודה: ___ you.',
  prompt_language = 'he',
  explanation_he = 'Thank you. = תודה. המילה Thank מופיעה לפני you ומבטאת הודיה.'
where id = '00000000-0000-0008-0003-000000000034';

-- L4 E4 — Excuse me
update public.exercises
set
  prompt_text = 'אמור סלח לי: Excuse ___.',
  prompt_language = 'he',
  explanation_he = 'Excuse me. = סלח לי. אומרים את זה כדי לפנות למישהו בנימוס.'
where id = '00000000-0000-0008-0003-000000000035';

-- Sanity: all six rows must now be Hebrew-context complete_sentence
do $$
declare
  v_bad integer;
begin
  select count(*) into v_bad
  from public.exercises
  where id in (
    '00000000-0000-0008-0003-000000000014',
    '00000000-0000-0008-0003-000000000015',
    '00000000-0000-0008-0003-000000000024',
    '00000000-0000-0008-0003-000000000025',
    '00000000-0000-0008-0003-000000000034',
    '00000000-0000-0008-0003-000000000035'
  )
    and (prompt_language <> 'he' or prompt_text not like '%___%');
  if v_bad > 0 then
    raise exception 'complete_sentence rewrite left % rows in an invalid state', v_bad;
  end if;
end $$;

-- ============================================================
-- 008_replace_beginner_unit_1.sql
--
-- Wipes the old Beginner Unit 1 content and seeds the redesigned
-- Unit 1 ("ברכות ומילים מנומסות"): 5 lessons, 50 exercises.
--
-- Unit row itself is preserved (same id 0000-...-0001-000000000001) —
-- only its title/description/icon are refreshed. The old 5 lessons +
-- 50 exercises + their options/attempts/mistakes/progress are deleted.
-- Unit 2 ("מספרים 1–20") is NOT touched.
--
-- Stage map:
--   1. Cascade-delete old Unit 1 dependents (FK-respecting order)
--   2. Update Unit 1 row metadata
--   3. Seed 5 new lessons (lesson 5 is the checkpoint)
--   4. Seed 50 new exercises + their options
--   5. Unlock new Lesson 1 for every existing profile
--   6. Sanity counts
--
-- New ID scheme (so old/new are unambiguous in the DB):
--   Lessons:        00000000-0000-0008-0002-00000000000{1..5}
--   Exercises:      00000000-0000-0008-0003-XXXXXXXXXXXX
--   Pair groups:    b0000000-0008-0004-0000-XXXXXXXXXXXX
-- ============================================================


-- ===========================================
-- Stage 1: Cascade-delete old Unit 1 content
-- ===========================================

-- Stage 1a: clear user_progress.current_lesson_id refs to old Unit 1 lessons
-- (FK constraint user_progress_current_lesson_id_fkey would block the delete)
update public.user_progress
set current_lesson_id = null
where current_lesson_id in (
  select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000001'
);

delete from public.exercise_attempts
where lesson_attempt_id in (
  select id from public.lesson_attempts
  where lesson_id in (
    select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000001'
  )
);

delete from public.user_mistakes
where exercise_id in (
  select id from public.exercises
  where lesson_id in (
    select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000001'
  )
);

delete from public.lesson_attempts
where lesson_id in (
  select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000001'
);

delete from public.user_lesson_progress
where lesson_id in (
  select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000001'
);

delete from public.exercise_options
where exercise_id in (
  select id from public.exercises
  where lesson_id in (
    select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000001'
  )
);

delete from public.exercises
where lesson_id in (
  select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000001'
);

delete from public.lessons
where unit_id = '00000000-0000-0000-0001-000000000001';


-- ===========================================
-- Stage 2: Refresh Unit 1 metadata
-- ===========================================

update public.units
set
  title = 'ברכות ומילים מנומסות',
  description = 'ללמוד ברכות בסיסיות, מילות נימוס וביטויים שיחתיים קצרים באנגלית.',
  icon_emoji = '👋',
  color_hex = '#58CC02',
  order_index = 0
where id = '00000000-0000-0000-0001-000000000001';


-- ===========================================
-- Stage 3: Seed 5 new lessons
-- ===========================================

insert into public.lessons (id, unit_id, title, description, order_index, is_checkpoint)
values
  ('00000000-0000-0008-0002-000000000001', '00000000-0000-0000-0001-000000000001',
   'Hello / Hi / Bye', 'מילות פתיחה וסיום בסיסיות', 0, false),
  ('00000000-0000-0008-0002-000000000002', '00000000-0000-0000-0001-000000000001',
   'Good Morning / Good Night', 'ברכות לפי זמן ביום', 1, false),
  ('00000000-0000-0008-0002-000000000003', '00000000-0000-0000-0001-000000000001',
   'How Are You?', 'שיחת שלומך בסיסית', 2, false),
  ('00000000-0000-0008-0002-000000000004', '00000000-0000-0000-0001-000000000001',
   'Please / Thank You / Sorry', 'מילות נימוס בסיסיות', 3, false),
  ('00000000-0000-0008-0002-000000000005', '00000000-0000-0000-0001-000000000001',
   'Checkpoint: Greetings Review', 'חזרה על ברכות, שיחת שלומך ומילות נימוס', 4, true);


-- ===========================================
-- Stage 4: Seed exercises + options
-- ===========================================

-- ---------- LESSON 1 (id ...0002-000000000001): "Hello / Hi / Bye" ----------

-- L1 E0 multiple_choice "Hello"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000001', '00000000-0000-0008-0002-000000000001',
 'multiple_choice', 'Hello', 'en',
 'Hello = שלום. זו הדרך הנפוצה ביותר לפתוח שיחה באנגלית.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000001', 'שלום',    'he', true,  0),
('00000000-0000-0008-0003-000000000001', 'להתראות', 'he', false, 1),
('00000000-0000-0008-0003-000000000001', 'תודה',    'he', false, 2),
('00000000-0000-0008-0003-000000000001', 'בבקשה',   'he', false, 3);

-- L1 E1 multiple_choice "Bye"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000002', '00000000-0000-0008-0002-000000000001',
 'multiple_choice', 'Bye', 'en',
 'Bye = ביי או להתראות. זו דרך קצרה ולא רשמית לסיים שיחה.', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000002', 'ביי',  'he', true,  0),
('00000000-0000-0008-0003-000000000002', 'שלום', 'he', false, 1),
('00000000-0000-0008-0003-000000000002', 'כן',   'he', false, 2),
('00000000-0000-0008-0003-000000000002', 'לא',   'he', false, 3);

-- L1 E2 multiple_choice "Yes"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000003', '00000000-0000-0008-0002-000000000001',
 'multiple_choice', 'Yes', 'en',
 'Yes = כן. זו תשובה חיובית פשוטה באנגלית.', 2);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000003', 'כן',      'he', true,  0),
('00000000-0000-0008-0003-000000000003', 'לא',      'he', false, 1),
('00000000-0000-0008-0003-000000000003', 'שלום',    'he', false, 2),
('00000000-0000-0008-0003-000000000003', 'להתראות', 'he', false, 3);

-- L1 E3 complete_sentence "אמור שלום: ___!"  (Fix A)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000004', '00000000-0000-0008-0002-000000000001',
 'complete_sentence', 'אמור שלום: ___!', 'he',
 'Hello',
 'Hello! = שלום! משתמשים בזה כדי לפתוח שיחה.', 3);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000004', 'Hello', 'en', true,  0),
('00000000-0000-0008-0003-000000000004', 'Bye',   'en', false, 1),
('00000000-0000-0008-0003-000000000004', 'No',    'en', false, 2);

-- L1 E4 complete_sentence "אמור להתראות: ___!"  (Fix A)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000005', '00000000-0000-0008-0002-000000000001',
 'complete_sentence', 'אמור להתראות: ___!', 'he',
 'Goodbye',
 'Goodbye! = להתראות! משתמשים בזה כדי לסיים שיחה בצורה מנומסת.', 4);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000005', 'Goodbye', 'en', true,  0),
('00000000-0000-0008-0003-000000000005', 'Hello',   'en', false, 1),
('00000000-0000-0008-0003-000000000005', 'Yes',     'en', false, 2);

-- L1 E5 word_bank "תרגם לאנגלית: שלום"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000006', '00000000-0000-0008-0002-000000000001',
 'word_bank', 'תרגם לאנגלית: שלום', 'he',
 'Hello',
 '["Hi", "hello", "hi"]'::jsonb,
 '["Hello", "Bye", "Yes", "No"]'::jsonb,
 'Hello = שלום. גם Hi יכול להתאים במצב לא רשמי.', 5);

-- L1 E6 word_bank "תרגם לאנגלית: להתראות"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000007', '00000000-0000-0008-0002-000000000001',
 'word_bank', 'תרגם לאנגלית: להתראות', 'he',
 'Goodbye',
 '["Bye", "goodbye", "bye"]'::jsonb,
 '["Goodbye", "Hello", "Thanks", "No"]'::jsonb,
 'Goodbye = להתראות. Bye היא גרסה קצרה ולא רשמית יותר.', 6);

-- L1 E7 matching "Hello/Hi/Bye/Goodbye"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000008', '00000000-0000-0008-0002-000000000001',
 'matching', 'התאם את המילים לתרגום שלהן', 'he',
 'Hello = שלום, Hi = היי, Bye = ביי, Goodbye = להתראות.', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
('00000000-0000-0008-0003-000000000008', 'Hello',   'en', true, 'b0000000-0008-0004-0000-000000000001', 0),
('00000000-0000-0008-0003-000000000008', 'שלום',    'he', true, 'b0000000-0008-0004-0000-000000000001', 1),
('00000000-0000-0008-0003-000000000008', 'Hi',      'en', true, 'b0000000-0008-0004-0000-000000000002', 2),
('00000000-0000-0008-0003-000000000008', 'היי',     'he', true, 'b0000000-0008-0004-0000-000000000002', 3),
('00000000-0000-0008-0003-000000000008', 'Bye',     'en', true, 'b0000000-0008-0004-0000-000000000003', 4),
('00000000-0000-0008-0003-000000000008', 'ביי',     'he', true, 'b0000000-0008-0004-0000-000000000003', 5),
('00000000-0000-0008-0003-000000000008', 'Goodbye', 'en', true, 'b0000000-0008-0004-0000-000000000004', 6),
('00000000-0000-0008-0003-000000000008', 'להתראות', 'he', true, 'b0000000-0008-0004-0000-000000000004', 7);

-- L1 E8 matching "Yes/No/Hello/Bye"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000009', '00000000-0000-0008-0002-000000000001',
 'matching', 'התאם את המילים לתרגום שלהן', 'he',
 'Yes = כן, No = לא. אלה תשובות בסיסיות ושימושיות מאוד.', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
('00000000-0000-0008-0003-000000000009', 'Yes',   'en', true, 'b0000000-0008-0004-0000-000000000005', 0),
('00000000-0000-0008-0003-000000000009', 'כן',    'he', true, 'b0000000-0008-0004-0000-000000000005', 1),
('00000000-0000-0008-0003-000000000009', 'No',    'en', true, 'b0000000-0008-0004-0000-000000000006', 2),
('00000000-0000-0008-0003-000000000009', 'לא',    'he', true, 'b0000000-0008-0004-0000-000000000006', 3),
('00000000-0000-0008-0003-000000000009', 'Hello', 'en', true, 'b0000000-0008-0004-0000-000000000007', 4),
('00000000-0000-0008-0003-000000000009', 'שלום',  'he', true, 'b0000000-0008-0004-0000-000000000007', 5),
('00000000-0000-0008-0003-000000000009', 'Bye',   'en', true, 'b0000000-0008-0004-0000-000000000008', 6),
('00000000-0000-0008-0003-000000000009', 'ביי',   'he', true, 'b0000000-0008-0004-0000-000000000008', 7);

-- L1 E9 type_answer "איך אומרים 'שלום'..."
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000010', '00000000-0000-0008-0002-000000000001',
 'type_answer', 'איך אומרים ''שלום'' באנגלית?', 'he',
 'Hello',
 '["Hi", "hello", "hi"]'::jsonb,
 'שלום באנגלית הוא Hello. אפשר גם לומר Hi בצורה פחות רשמית.', 9);


-- ---------- LESSON 2 (id ...0002-000000000002): "Good Morning / Good Night" ----------

-- L2 E0 multiple_choice "Good morning"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000011', '00000000-0000-0008-0002-000000000002',
 'multiple_choice', 'Good morning', 'en',
 'Good morning = בוקר טוב. משתמשים בזה בתחילת היום.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000011', 'בוקר טוב', 'he', true,  0),
('00000000-0000-0008-0003-000000000011', 'לילה טוב', 'he', false, 1),
('00000000-0000-0008-0003-000000000011', 'ערב טוב',  'he', false, 2),
('00000000-0000-0008-0003-000000000011', 'להתראות',  'he', false, 3);

-- L2 E1 multiple_choice "Good night"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000012', '00000000-0000-0008-0002-000000000002',
 'multiple_choice', 'Good night', 'en',
 'Good night = לילה טוב. משתמשים בזה לפני שינה או בסוף הערב.', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000012', 'לילה טוב',     'he', true,  0),
('00000000-0000-0008-0003-000000000012', 'בוקר טוב',     'he', false, 1),
('00000000-0000-0008-0003-000000000012', 'צהריים טובים', 'he', false, 2),
('00000000-0000-0008-0003-000000000012', 'שלום',         'he', false, 3);

-- L2 E2 multiple_choice "Good evening"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000013', '00000000-0000-0008-0002-000000000002',
 'multiple_choice', 'Good evening', 'en',
 'Good evening = ערב טוב. זו ברכה מנומסת לשעות הערב.', 2);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000013', 'ערב טוב',  'he', true,  0),
('00000000-0000-0008-0003-000000000013', 'בוקר טוב', 'he', false, 1),
('00000000-0000-0008-0003-000000000013', 'לילה טוב', 'he', false, 2),
('00000000-0000-0008-0003-000000000013', 'ביי',      'he', false, 3);

-- L2 E3 complete_sentence "Good ___!" → morning
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000014', '00000000-0000-0008-0002-000000000002',
 'complete_sentence', 'Good ___!', 'en',
 'morning',
 'Good morning! = בוקר טוב! המילה morning פירושה בוקר.', 3);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000014', 'morning', 'en', true,  0),
('00000000-0000-0008-0003-000000000014', 'night',   'en', false, 1),
('00000000-0000-0008-0003-000000000014', 'bye',     'en', false, 2);

-- L2 E4 complete_sentence "Good ___!" → night
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000015', '00000000-0000-0008-0002-000000000002',
 'complete_sentence', 'Good ___!', 'en',
 'night',
 'Good night! = לילה טוב! המילה night פירושה לילה.', 4);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000015', 'night',   'en', true,  0),
('00000000-0000-0008-0003-000000000015', 'morning', 'en', false, 1),
('00000000-0000-0008-0003-000000000015', 'yes',     'en', false, 2);

-- L2 E5 word_bank "תרגם לאנגלית: בוקר טוב"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000016', '00000000-0000-0008-0002-000000000002',
 'word_bank', 'תרגם לאנגלית: בוקר טוב', 'he',
 'Good morning.',
 '["Good morning"]'::jsonb,
 '["Good", "morning.", "night.", "Hello"]'::jsonb,
 'Good morning. = בוקר טוב. Good פירושו טוב, morning פירושו בוקר.', 5);

-- L2 E6 word_bank "תרגם לאנגלית: לילה טוב"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000017', '00000000-0000-0008-0002-000000000002',
 'word_bank', 'תרגם לאנגלית: לילה טוב', 'he',
 'Good night.',
 '["Good night"]'::jsonb,
 '["Good", "night.", "morning.", "Bye"]'::jsonb,
 'Good night. = לילה טוב. זו ברכה נפוצה לפני שינה.', 6);

-- L2 E7 matching "morning/night/evening/afternoon"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000018', '00000000-0000-0008-0002-000000000002',
 'matching', 'התאם את הברכות לתרגום שלהן', 'he',
 'Morning = בוקר, night = לילה, evening = ערב, afternoon = אחר הצהריים.', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
('00000000-0000-0008-0003-000000000018', 'morning',      'en', true, 'b0000000-0008-0004-0000-000000000009', 0),
('00000000-0000-0008-0003-000000000018', 'בוקר',         'he', true, 'b0000000-0008-0004-0000-000000000009', 1),
('00000000-0000-0008-0003-000000000018', 'night',        'en', true, 'b0000000-0008-0004-0000-000000000010', 2),
('00000000-0000-0008-0003-000000000018', 'לילה',         'he', true, 'b0000000-0008-0004-0000-000000000010', 3),
('00000000-0000-0008-0003-000000000018', 'evening',      'en', true, 'b0000000-0008-0004-0000-000000000011', 4),
('00000000-0000-0008-0003-000000000018', 'ערב',          'he', true, 'b0000000-0008-0004-0000-000000000011', 5),
('00000000-0000-0008-0003-000000000018', 'afternoon',    'en', true, 'b0000000-0008-0004-0000-000000000012', 6),
('00000000-0000-0008-0003-000000000018', 'אחר הצהריים',  'he', true, 'b0000000-0008-0004-0000-000000000012', 7);

-- L2 E8 matching "Good morning/Good night/Good evening/Hello"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000019', '00000000-0000-0008-0002-000000000002',
 'matching', 'התאם את הביטויים לתרגום שלהם', 'he',
 'Good morning ו-Good night הן ברכות לפי זמן ביום.', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
('00000000-0000-0008-0003-000000000019', 'Good morning', 'en', true, 'b0000000-0008-0004-0000-000000000013', 0),
('00000000-0000-0008-0003-000000000019', 'בוקר טוב',     'he', true, 'b0000000-0008-0004-0000-000000000013', 1),
('00000000-0000-0008-0003-000000000019', 'Good night',   'en', true, 'b0000000-0008-0004-0000-000000000014', 2),
('00000000-0000-0008-0003-000000000019', 'לילה טוב',     'he', true, 'b0000000-0008-0004-0000-000000000014', 3),
('00000000-0000-0008-0003-000000000019', 'Good evening', 'en', true, 'b0000000-0008-0004-0000-000000000015', 4),
('00000000-0000-0008-0003-000000000019', 'ערב טוב',      'he', true, 'b0000000-0008-0004-0000-000000000015', 5),
('00000000-0000-0008-0003-000000000019', 'Hello',        'en', true, 'b0000000-0008-0004-0000-000000000016', 6),
('00000000-0000-0008-0003-000000000019', 'שלום',         'he', true, 'b0000000-0008-0004-0000-000000000016', 7);

-- L2 E9 type_answer "איך אומרים 'בוקר טוב'..."
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000020', '00000000-0000-0008-0002-000000000002',
 'type_answer', 'איך אומרים ''בוקר טוב'' באנגלית?', 'he',
 'Good morning',
 '["Good morning.", "good morning"]'::jsonb,
 'בוקר טוב באנגלית הוא Good morning.', 9);


-- ---------- LESSON 3 (id ...0002-000000000003): "How Are You?" ----------

-- L3 E0 multiple_choice "How are you?"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000021', '00000000-0000-0008-0002-000000000003',
 'multiple_choice', 'How are you?', 'en',
 'How are you? = מה שלומך? זו שאלה נפוצה בתחילת שיחה.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000021', 'מה שלומך?',     'he', true,  0),
('00000000-0000-0008-0003-000000000021', 'איך קוראים לך?','he', false, 1),
('00000000-0000-0008-0003-000000000021', 'להתראות',       'he', false, 2),
('00000000-0000-0008-0003-000000000021', 'תודה רבה',      'he', false, 3);

-- L3 E1 multiple_choice "fine"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000022', '00000000-0000-0008-0002-000000000003',
 'multiple_choice', 'fine', 'en',
 'Fine = בסדר. זו תשובה קצרה ונפוצה לשאלה How are you?', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000022', 'בסדר',  'he', true,  0),
('00000000-0000-0008-0003-000000000022', 'לילה',  'he', false, 1),
('00000000-0000-0008-0003-000000000022', 'שלום',  'he', false, 2),
('00000000-0000-0008-0003-000000000022', 'בבקשה', 'he', false, 3);

-- L3 E2 multiple_choice "Thanks"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000023', '00000000-0000-0008-0002-000000000003',
 'multiple_choice', 'Thanks', 'en',
 'Thanks = תודה. זו גרסה קצרה ולא רשמית של Thank you.', 2);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000023', 'תודה',  'he', true,  0),
('00000000-0000-0008-0003-000000000023', 'סליחה', 'he', false, 1),
('00000000-0000-0008-0003-000000000023', 'כן',    'he', false, 2),
('00000000-0000-0008-0003-000000000023', 'לא',    'he', false, 3);

-- L3 E3 complete_sentence "How ___ you?" → are
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000024', '00000000-0000-0008-0002-000000000003',
 'complete_sentence', 'How ___ you?', 'en',
 'are',
 'How are you? = מה שלומך? במבנה הזה משתמשים ב-are.', 3);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000024', 'are', 'en', true,  0),
('00000000-0000-0008-0003-000000000024', 'am',  'en', false, 1),
('00000000-0000-0008-0003-000000000024', 'is',  'en', false, 2);

-- L3 E4 complete_sentence "I am ___, thanks." → fine
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000025', '00000000-0000-0008-0002-000000000003',
 'complete_sentence', 'I am ___, thanks.', 'en',
 'fine',
 'I am fine, thanks. = אני בסדר, תודה.', 4);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000025', 'fine',  'en', true,  0),
('00000000-0000-0008-0003-000000000025', 'night', 'en', false, 1),
('00000000-0000-0008-0003-000000000025', 'bye',   'en', false, 2);

-- L3 E5 word_bank "תרגם לאנגלית: מה שלומך?"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000026', '00000000-0000-0008-0002-000000000003',
 'word_bank', 'תרגם לאנגלית: מה שלומך?', 'he',
 'How are you?',
 '["How are you"]'::jsonb,
 '["How", "are", "you?", "Hello", "fine"]'::jsonb,
 'How are you? = מה שלומך? זו שאלה בסיסית באנגלית.', 5);

-- L3 E6 word_bank "תרגם לאנגלית: אני בסדר, תודה."
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000027', '00000000-0000-0008-0002-000000000003',
 'word_bank', 'תרגם לאנגלית: אני בסדר, תודה.', 'he',
 'I''m fine, thanks.',
 '["I am fine thanks", "I''m fine thanks", "I am fine, thanks."]'::jsonb,
 '["I''m", "fine,", "thanks.", "you?", "Good"]'::jsonb,
 'I''m fine, thanks. = אני בסדר, תודה. I''m הוא קיצור של I am.', 6);

-- L3 E7 matching (Fix B): How/you/fine/thanks
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000028', '00000000-0000-0008-0002-000000000003',
 'matching', 'התאם את המילים לתרגום שלהן', 'he',
 'How = איך, you = אתה / את, fine = בסדר, thanks = תודה.', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
('00000000-0000-0008-0003-000000000028', 'How',    'en', true, 'b0000000-0008-0004-0000-000000000017', 0),
('00000000-0000-0008-0003-000000000028', 'איך',    'he', true, 'b0000000-0008-0004-0000-000000000017', 1),
('00000000-0000-0008-0003-000000000028', 'you',    'en', true, 'b0000000-0008-0004-0000-000000000018', 2),
('00000000-0000-0008-0003-000000000028', 'אתה / את','he', true, 'b0000000-0008-0004-0000-000000000018', 3),
('00000000-0000-0008-0003-000000000028', 'fine',   'en', true, 'b0000000-0008-0004-0000-000000000019', 4),
('00000000-0000-0008-0003-000000000028', 'בסדר',   'he', true, 'b0000000-0008-0004-0000-000000000019', 5),
('00000000-0000-0008-0003-000000000028', 'thanks', 'en', true, 'b0000000-0008-0004-0000-000000000020', 6),
('00000000-0000-0008-0003-000000000028', 'תודה',   'he', true, 'b0000000-0008-0004-0000-000000000020', 7);

-- L3 E8 matching phrases
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000029', '00000000-0000-0008-0002-000000000003',
 'matching', 'התאם את הביטויים לתרגום שלהם', 'he',
 'How are you? היא שאלה, ו-I''m fine היא תשובה קצרה.', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
('00000000-0000-0008-0003-000000000029', 'How are you?', 'en', true, 'b0000000-0008-0004-0000-000000000021', 0),
('00000000-0000-0008-0003-000000000029', 'מה שלומך?',    'he', true, 'b0000000-0008-0004-0000-000000000021', 1),
('00000000-0000-0008-0003-000000000029', 'I''m fine',    'en', true, 'b0000000-0008-0004-0000-000000000022', 2),
('00000000-0000-0008-0003-000000000029', 'אני בסדר',     'he', true, 'b0000000-0008-0004-0000-000000000022', 3),
('00000000-0000-0008-0003-000000000029', 'Thanks',       'en', true, 'b0000000-0008-0004-0000-000000000023', 4),
('00000000-0000-0008-0003-000000000029', 'תודה',         'he', true, 'b0000000-0008-0004-0000-000000000023', 5),
('00000000-0000-0008-0003-000000000029', 'Good',         'en', true, 'b0000000-0008-0004-0000-000000000024', 6),
('00000000-0000-0008-0003-000000000029', 'טוב',          'he', true, 'b0000000-0008-0004-0000-000000000024', 7);

-- L3 E9 type_answer "איך אומרים 'אני בסדר'..."
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000030', '00000000-0000-0008-0002-000000000003',
 'type_answer', 'איך אומרים ''אני בסדר'' באנגלית?', 'he',
 'I am fine',
 '["I''m fine", "i am fine", "im fine"]'::jsonb,
 'אני בסדר באנגלית הוא I am fine או בקיצור I''m fine.', 9);


-- ---------- LESSON 4 (id ...0002-000000000004): "Please / Thank You / Sorry" ----------

-- L4 E0 multiple_choice "Please"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000031', '00000000-0000-0008-0002-000000000004',
 'multiple_choice', 'Please', 'en',
 'Please = בבקשה. משתמשים בזה כדי לבקש משהו בנימוס.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000031', 'בבקשה',   'he', true,  0),
('00000000-0000-0008-0003-000000000031', 'תודה',    'he', false, 1),
('00000000-0000-0008-0003-000000000031', 'סליחה',   'he', false, 2),
('00000000-0000-0008-0003-000000000031', 'להתראות', 'he', false, 3);

-- L4 E1 multiple_choice "Thank you"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000032', '00000000-0000-0008-0002-000000000004',
 'multiple_choice', 'Thank you', 'en',
 'Thank you = תודה. זו צורה מנומסת יותר מ-Thanks.', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000032', 'תודה',     'he', true,  0),
('00000000-0000-0008-0003-000000000032', 'בוקר טוב', 'he', false, 1),
('00000000-0000-0008-0003-000000000032', 'לא',       'he', false, 2),
('00000000-0000-0008-0003-000000000032', 'בבקשה',    'he', false, 3);

-- L4 E2 multiple_choice "Sorry"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000033', '00000000-0000-0008-0002-000000000004',
 'multiple_choice', 'Sorry', 'en',
 'Sorry = סליחה או מצטער. משתמשים בזה כשמתנצלים.', 2);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000033', 'סליחה', 'he', true,  0),
('00000000-0000-0008-0003-000000000033', 'תודה',  'he', false, 1),
('00000000-0000-0008-0003-000000000033', 'שלום',  'he', false, 2),
('00000000-0000-0008-0003-000000000033', 'כן',    'he', false, 3);

-- L4 E3 complete_sentence "___ you." → Thank
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000034', '00000000-0000-0008-0002-000000000004',
 'complete_sentence', '___ you.', 'en',
 'Thank',
 'Thank you. = תודה. המילה Thank מופיעה לפני you.', 3);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000034', 'Thank', 'en', true,  0),
('00000000-0000-0008-0003-000000000034', 'Good',  'en', false, 1),
('00000000-0000-0008-0003-000000000034', 'Bye',   'en', false, 2);

-- L4 E4 complete_sentence "Excuse ___." → me
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000035', '00000000-0000-0008-0002-000000000004',
 'complete_sentence', 'Excuse ___.', 'en',
 'me',
 'Excuse me. = סליחה / סלח לי. משתמשים בזה כדי לפנות בנימוס.', 4);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000035', 'me',  'en', true,  0),
('00000000-0000-0008-0003-000000000035', 'you', 'en', false, 1),
('00000000-0000-0008-0003-000000000035', 'are', 'en', false, 2);

-- L4 E5 word_bank "תרגם לאנגלית: בבקשה"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000036', '00000000-0000-0008-0002-000000000004',
 'word_bank', 'תרגם לאנגלית: בבקשה', 'he',
 'Please.',
 '["Please"]'::jsonb,
 '["Please.", "Thanks.", "Sorry.", "Hello"]'::jsonb,
 'Please. = בבקשה. זו מילה חשובה לבקשה מנומסת.', 5);

-- L4 E6 word_bank "תרגם לאנגלית: אני מצטער."
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000037', '00000000-0000-0008-0002-000000000004',
 'word_bank', 'תרגם לאנגלית: אני מצטער.', 'he',
 'I am sorry.',
 '["I am sorry", "I''m sorry", "I''m sorry."]'::jsonb,
 '["I", "am", "sorry.", "fine", "thanks."]'::jsonb,
 'I am sorry. = אני מצטער. אפשר גם לומר I''m sorry.', 6);

-- L4 E7 matching politeness
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000038', '00000000-0000-0008-0002-000000000004',
 'matching', 'התאם את מילות הנימוס לתרגום שלהן', 'he',
 'Please = בבקשה, Thank you = תודה, Sorry = סליחה, Excuse me = סליחה / סלח לי.', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
('00000000-0000-0008-0003-000000000038', 'Please',     'en', true, 'b0000000-0008-0004-0000-000000000025', 0),
('00000000-0000-0008-0003-000000000038', 'בבקשה',      'he', true, 'b0000000-0008-0004-0000-000000000025', 1),
('00000000-0000-0008-0003-000000000038', 'Thank you',  'en', true, 'b0000000-0008-0004-0000-000000000026', 2),
('00000000-0000-0008-0003-000000000038', 'תודה',       'he', true, 'b0000000-0008-0004-0000-000000000026', 3),
('00000000-0000-0008-0003-000000000038', 'Sorry',      'en', true, 'b0000000-0008-0004-0000-000000000027', 4),
('00000000-0000-0008-0003-000000000038', 'סליחה',      'he', true, 'b0000000-0008-0004-0000-000000000027', 5),
('00000000-0000-0008-0003-000000000038', 'Excuse me',  'en', true, 'b0000000-0008-0004-0000-000000000028', 6),
('00000000-0000-0008-0003-000000000038', 'סלח לי',     'he', true, 'b0000000-0008-0004-0000-000000000028', 7);

-- L4 E8 matching phrases
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000039', '00000000-0000-0008-0002-000000000004',
 'matching', 'התאם את הביטויים לתרגום שלהם', 'he',
 'Thanks היא גרסה קצרה של Thank you. Sorry משמש להתנצלות.', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
('00000000-0000-0008-0003-000000000039', 'Thanks',      'en', true, 'b0000000-0008-0004-0000-000000000029', 0),
('00000000-0000-0008-0003-000000000039', 'תודה',        'he', true, 'b0000000-0008-0004-0000-000000000029', 1),
('00000000-0000-0008-0003-000000000039', 'I am sorry',  'en', true, 'b0000000-0008-0004-0000-000000000030', 2),
('00000000-0000-0008-0003-000000000039', 'אני מצטער',   'he', true, 'b0000000-0008-0004-0000-000000000030', 3),
('00000000-0000-0008-0003-000000000039', 'Please',      'en', true, 'b0000000-0008-0004-0000-000000000031', 4),
('00000000-0000-0008-0003-000000000039', 'בבקשה',       'he', true, 'b0000000-0008-0004-0000-000000000031', 5),
('00000000-0000-0008-0003-000000000039', 'Goodbye',     'en', true, 'b0000000-0008-0004-0000-000000000032', 6),
('00000000-0000-0008-0003-000000000039', 'להתראות',     'he', true, 'b0000000-0008-0004-0000-000000000032', 7);

-- L4 E9 type_answer "איך אומרים 'תודה'..."
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000040', '00000000-0000-0008-0002-000000000004',
 'type_answer', 'איך אומרים ''תודה'' באנגלית?', 'he',
 'Thank you',
 '["Thanks", "thank you", "thanks"]'::jsonb,
 'תודה באנגלית היא Thank you. אפשר גם לומר Thanks בצורה קצרה.', 9);


-- ---------- LESSON 5 CHECKPOINT (id ...0002-000000000005): Review ----------

-- L5 E0 multiple_choice "Good night"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000041', '00000000-0000-0008-0002-000000000005',
 'multiple_choice', 'Good night', 'en',
 'Good night = לילה טוב. זו ברכה שמתאימה לסוף היום או לפני שינה.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000041', 'לילה טוב',  'he', true,  0),
('00000000-0000-0008-0003-000000000041', 'בוקר טוב',  'he', false, 1),
('00000000-0000-0008-0003-000000000041', 'מה שלומך?', 'he', false, 2),
('00000000-0000-0008-0003-000000000041', 'בבקשה',     'he', false, 3);

-- L5 E1 multiple_choice "How are you?"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000042', '00000000-0000-0008-0002-000000000005',
 'multiple_choice', 'How are you?', 'en',
 'How are you? = מה שלומך? זו שאלה בסיסית בשיחה באנגלית.', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000042', 'מה שלומך?', 'he', true,  0),
('00000000-0000-0008-0003-000000000042', 'תודה',      'he', false, 1),
('00000000-0000-0008-0003-000000000042', 'ביי',       'he', false, 2),
('00000000-0000-0008-0003-000000000042', 'כן',        'he', false, 3);

-- L5 E2 multiple_choice "Excuse me"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000043', '00000000-0000-0008-0002-000000000005',
 'multiple_choice', 'Excuse me', 'en',
 'Excuse me = סליחה / סלח לי. משתמשים בזה כדי לפנות למישהו בנימוס.', 2);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
('00000000-0000-0008-0003-000000000043', 'סלח לי',    'he', true,  0),
('00000000-0000-0008-0003-000000000043', 'בוקר טוב',  'he', false, 1),
('00000000-0000-0008-0003-000000000043', 'אני בסדר',  'he', false, 2),
('00000000-0000-0008-0003-000000000043', 'כן',        'he', false, 3);

-- L5 E3 word_bank "תרגם לאנגלית: שלום, מה שלומך?"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000044', '00000000-0000-0008-0002-000000000005',
 'word_bank', 'תרגם לאנגלית: שלום, מה שלומך?', 'he',
 'Hello, how are you?',
 '["Hello how are you"]'::jsonb,
 '["Hello,", "how", "are", "you?", "fine", "thanks."]'::jsonb,
 'Hello, how are you? = שלום, מה שלומך? זה משפט פתיחה טבעי.', 3);

-- L5 E4 word_bank "תרגם לאנגלית: אני בסדר, תודה."
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000045', '00000000-0000-0008-0002-000000000005',
 'word_bank', 'תרגם לאנגלית: אני בסדר, תודה.', 'he',
 'I''m fine, thanks.',
 '["I''m fine thanks", "I am fine, thanks.", "I am fine thanks"]'::jsonb,
 '["I''m", "fine,", "thanks.", "Hello", "night."]'::jsonb,
 'I''m fine, thanks. = אני בסדר, תודה. זו תשובה קצרה ונפוצה.', 4);

-- L5 E5 word_bank "תרגם לאנגלית: בוקר טוב, להתראות."
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000046', '00000000-0000-0008-0002-000000000005',
 'word_bank', 'תרגם לאנגלית: בוקר טוב, להתראות.', 'he',
 'Good morning, goodbye.',
 '["Good morning goodbye", "Good morning, goodbye"]'::jsonb,
 '["Good", "morning,", "goodbye.", "night", "please"]'::jsonb,
 'Good morning, goodbye. = בוקר טוב, להתראות. שים לב לסדר המילים באנגלית.', 5);

-- L5 E6 type_answer "איך אומרים 'בבקשה'..."
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000047', '00000000-0000-0008-0002-000000000005',
 'type_answer', 'איך אומרים ''בבקשה'' באנגלית?', 'he',
 'Please',
 '["please"]'::jsonb,
 'בבקשה באנגלית היא Please.', 6);

-- L5 E7 type_answer "איך אומרים 'לילה טוב'..."
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000048', '00000000-0000-0008-0002-000000000005',
 'type_answer', 'איך אומרים ''לילה טוב'' באנגלית?', 'he',
 'Good night',
 '["Good night.", "good night"]'::jsonb,
 'לילה טוב באנגלית הוא Good night.', 7);

-- L5 E8 matching greetings review
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000049', '00000000-0000-0008-0002-000000000005',
 'matching', 'התאם את הביטויים לתרגום שלהם', 'he',
 'אלה הביטויים המרכזיים שלמדת ביחידה הראשונה.', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
('00000000-0000-0008-0003-000000000049', 'Hello',        'en', true, 'b0000000-0008-0004-0000-000000000033', 0),
('00000000-0000-0008-0003-000000000049', 'שלום',         'he', true, 'b0000000-0008-0004-0000-000000000033', 1),
('00000000-0000-0008-0003-000000000049', 'Good morning', 'en', true, 'b0000000-0008-0004-0000-000000000034', 2),
('00000000-0000-0008-0003-000000000049', 'בוקר טוב',     'he', true, 'b0000000-0008-0004-0000-000000000034', 3),
('00000000-0000-0008-0003-000000000049', 'Good night',   'en', true, 'b0000000-0008-0004-0000-000000000035', 4),
('00000000-0000-0008-0003-000000000049', 'לילה טוב',     'he', true, 'b0000000-0008-0004-0000-000000000035', 5),
('00000000-0000-0008-0003-000000000049', 'Goodbye',      'en', true, 'b0000000-0008-0004-0000-000000000036', 6),
('00000000-0000-0008-0003-000000000049', 'להתראות',      'he', true, 'b0000000-0008-0004-0000-000000000036', 7);

-- L5 E9 matching politeness review
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index) values
('00000000-0000-0008-0003-000000000050', '00000000-0000-0008-0002-000000000005',
 'matching', 'התאם את מילות הנימוס לתרגום שלהן', 'he',
 'מילות נימוס כמו Please ו-Thank you הופכות שיחה לנעימה ומנומסת יותר.', 9);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
('00000000-0000-0008-0003-000000000050', 'Please',    'en', true, 'b0000000-0008-0004-0000-000000000037', 0),
('00000000-0000-0008-0003-000000000050', 'בבקשה',     'he', true, 'b0000000-0008-0004-0000-000000000037', 1),
('00000000-0000-0008-0003-000000000050', 'Thank you', 'en', true, 'b0000000-0008-0004-0000-000000000038', 2),
('00000000-0000-0008-0003-000000000050', 'תודה',      'he', true, 'b0000000-0008-0004-0000-000000000038', 3),
('00000000-0000-0008-0003-000000000050', 'Sorry',     'en', true, 'b0000000-0008-0004-0000-000000000039', 4),
('00000000-0000-0008-0003-000000000050', 'סליחה',     'he', true, 'b0000000-0008-0004-0000-000000000039', 5),
('00000000-0000-0008-0003-000000000050', 'Excuse me', 'en', true, 'b0000000-0008-0004-0000-000000000040', 6),
('00000000-0000-0008-0003-000000000050', 'סלח לי',    'he', true, 'b0000000-0008-0004-0000-000000000040', 7);


-- ===========================================
-- Stage 5: Unlock new Lesson 1 for every existing profile
-- ===========================================

insert into public.user_lesson_progress (user_id, lesson_id, status)
select p.id, '00000000-0000-0008-0002-000000000001', 'unlocked'
from public.profiles p
on conflict (user_id, lesson_id) do nothing;


-- ===========================================
-- Stage 6: Sanity counts (will raise if wrong)
-- ===========================================

do $$
declare
  v_lesson_count integer;
  v_exercise_total integer;
begin
  select count(*) into v_lesson_count
  from public.lessons
  where unit_id = '00000000-0000-0000-0001-000000000001';

  if v_lesson_count <> 5 then
    raise exception 'Unit 1 should have exactly 5 lessons, found %', v_lesson_count;
  end if;

  select count(*) into v_exercise_total
  from public.exercises
  where lesson_id in (
    select id from public.lessons where unit_id = '00000000-0000-0000-0001-000000000001'
  );

  if v_exercise_total <> 50 then
    raise exception 'Unit 1 should have exactly 50 exercises, found %', v_exercise_total;
  end if;
end $$;

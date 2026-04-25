-- ============================================================
-- 004_seed_remaining_lessons.sql
-- Seeds 90 exercises across 9 lessons:
--   Unit 1 Lessons 2-5: Greetings & Introductions (40 exercises)
--   Unit 2 Lessons 1-5: Numbers 1-20 (50 exercises)
-- Run AFTER 001/002/003 migrations.
-- ============================================================

-- Lesson UUIDs (from migration 002):
--   U1L2 = 00000000-0000-0000-0002-000000000002  מה שלומך?
--   U1L3 = 00000000-0000-0000-0002-000000000003  הנעים להכיר
--   U1L4 = 00000000-0000-0000-0002-000000000004  להתראות!
--   U1L5 = 00000000-0000-0000-0002-000000000005  חזרה: ברכות
--   U2L1 = 00000000-0000-0000-0002-000000000006  אחד עד חמש
--   U2L2 = 00000000-0000-0000-0002-000000000007  שש עד עשר
--   U2L3 = 00000000-0000-0000-0002-000000000008  אחד-עשר עד חמש-עשר
--   U2L4 = 00000000-0000-0000-0002-000000000009  שש-עשר עד עשרים
--   U2L5 = 00000000-0000-0000-0002-00000000000a  חזרה: מספרים

-- Exercise ID format: 00000000-0000-0000-0003-0000000000NX
--   N = lesson sequence (1=U1L2, 2=U1L3, ..., 9=U2L5)
--   X = exercise number (1-9, a for 10)

-- Pair group IDs (matching exercises): b0000000-0000-0000-0000-0000000000NN

-- ============================================================
-- UNIT 1 LESSON 2: מה שלומך? (How are you?)
-- ============================================================

-- Ex1: MC — "How are you?"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000011', '00000000-0000-0000-0002-000000000002',
  'multiple_choice', 'How are you?', 'en',
  'How are you? = מה שלומך? זו השאלה הנפוצה ביותר לבדוק מה מצב של מישהו.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000011', 'מה שלומך?', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000011', 'מה השעה?', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000011', 'מה השם שלך?', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000011', 'להתראות', 'he', false, 3);

-- Ex2: MC — "Fine"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000012', '00000000-0000-0000-0002-000000000002',
  'multiple_choice', 'Fine', 'en',
  'Fine = בסדר/טוב. זו תשובה נפוצה כשרוצים לומר שהכל טוב.', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000012', 'בסדר', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000012', 'לא טוב', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000012', 'רע', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000012', 'מצוין', 'he', false, 3);

-- Ex3: MC — "Please"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000013', '00000000-0000-0000-0002-000000000002',
  'multiple_choice', 'Please', 'en',
  'Please = בבקשה. אומרים את זה כשמבקשים משהו.', 2);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000013', 'בבקשה', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000013', 'תודה', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000013', 'סליחה', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000013', 'כן', 'he', false, 3);

-- Ex4: WB — "How are you?"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000014', '00000000-0000-0000-0002-000000000002',
  'word_bank', 'תרגם לאנגלית: מה שלומך?', 'he',
  'How are you?', '["How are you"]'::jsonb,
  '["How", "are", "you?", "is", "name", "your"]'::jsonb,
  'How are you? — שים לב לסדר המילים: How (איך), are (פועל), you (אתה).', 3);

-- Ex5: WB — "Fine, thank you"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000015', '00000000-0000-0000-0002-000000000002',
  'word_bank', 'תרגם לאנגלית: בסדר, תודה', 'he',
  'Fine, thank you', '["Fine thank you"]'::jsonb,
  '["Fine,", "thank", "you", "please", "good", "are"]'::jsonb,
  'Fine, thank you = בסדר, תודה. תשובה מנומסת לשאלה "How are you?".', 4);

-- Ex6: TA — Thank you
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000016', '00000000-0000-0000-0002-000000000002',
  'type_answer', 'איך אומרים "תודה" באנגלית?', 'he',
  'Thank you', '["thank you", "Thanks", "thanks"]'::jsonb,
  'תודה באנגלית = Thank you (רשמי) או Thanks (לא רשמי).', 5);

-- Ex7: Matching — 4 pairs
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000017', '00000000-0000-0000-0002-000000000002',
  'matching', 'התאם את המילים לתרגום שלהן', 'he',
  'How=איך, Fine=בסדר, Please=בבקשה, Yes=כן.', 6);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
  ('00000000-0000-0000-0003-000000000017', 'How', 'en', true, 'b0000000-0000-0000-0000-000000000009', 0),
  ('00000000-0000-0000-0003-000000000017', 'איך', 'he', true, 'b0000000-0000-0000-0000-000000000009', 1),
  ('00000000-0000-0000-0003-000000000017', 'Fine', 'en', true, 'b0000000-0000-0000-0000-00000000000a', 2),
  ('00000000-0000-0000-0003-000000000017', 'בסדר', 'he', true, 'b0000000-0000-0000-0000-00000000000a', 3),
  ('00000000-0000-0000-0003-000000000017', 'Please', 'en', true, 'b0000000-0000-0000-0000-00000000000b', 4),
  ('00000000-0000-0000-0003-000000000017', 'בבקשה', 'he', true, 'b0000000-0000-0000-0000-00000000000b', 5),
  ('00000000-0000-0000-0003-000000000017', 'Yes', 'en', true, 'b0000000-0000-0000-0000-00000000000c', 6),
  ('00000000-0000-0000-0003-000000000017', 'כן', 'he', true, 'b0000000-0000-0000-0000-00000000000c', 7);

-- Ex8: CS — "I am ___" (fine)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000018', '00000000-0000-0000-0002-000000000002',
  'complete_sentence', 'I am ___', 'en', 'fine',
  'I am fine = אני בסדר. תשובה נפוצה ל-"How are you?".', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000018', 'fine', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000018', 'are', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000018', 'you', 'en', false, 2);

-- Ex9: TA — Please
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000019', '00000000-0000-0000-0002-000000000002',
  'type_answer', 'איך אומרים "בבקשה" באנגלית?', 'he',
  'Please', '["please"]'::jsonb,
  'Please = בבקשה. שים לב להגייה: פליז.', 8);

-- Ex10: MC — Thanks
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-00000000001a', '00000000-0000-0000-0002-000000000002',
  'multiple_choice', 'Thanks', 'en',
  'Thanks = תודה. צורה מקוצרת של Thank you.', 9);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-00000000001a', 'תודה', 'he', true, 0),
  ('00000000-0000-0000-0003-00000000001a', 'סליחה', 'he', false, 1),
  ('00000000-0000-0000-0003-00000000001a', 'בבקשה', 'he', false, 2),
  ('00000000-0000-0000-0003-00000000001a', 'שלום', 'he', false, 3);

-- ============================================================
-- UNIT 1 LESSON 3: הנעים להכיר (Nice to meet you)
-- ============================================================

-- Ex1: MC — "My name is David"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000021', '00000000-0000-0000-0002-000000000003',
  'multiple_choice', 'My name is David', 'en',
  'My name is David = השם שלי הוא דויד. ככה מציגים את עצמכם.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000021', 'השם שלי הוא דויד', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000021', 'אני בן 10', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000021', 'איך קוראים לך?', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000021', 'נעים מאוד', 'he', false, 3);

-- Ex2: MC — "What is your name?"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000022', '00000000-0000-0000-0002-000000000003',
  'multiple_choice', 'What is your name?', 'en',
  'What is your name? = איך קוראים לך? שאלה לבירור שם.', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000022', 'איך קוראים לך?', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000022', 'מה שלומך?', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000022', 'בן כמה אתה?', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000022', 'מאיפה אתה?', 'he', false, 3);

-- Ex3: MC — "Nice to meet you"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000023', '00000000-0000-0000-0002-000000000003',
  'multiple_choice', 'Nice to meet you', 'en',
  'Nice to meet you = נעים להכיר. אומרים בפגישה ראשונה.', 2);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000023', 'נעים להכיר', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000023', 'להתראות', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000023', 'שלום', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000023', 'תודה רבה', 'he', false, 3);

-- Ex4: WB — "My name is Yuval"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000024', '00000000-0000-0000-0002-000000000003',
  'word_bank', 'תרגם לאנגלית: השם שלי הוא יובל', 'he',
  'My name is Yuval', '["My name is yuval"]'::jsonb,
  '["My", "name", "is", "Yuval", "are", "your"]'::jsonb,
  'My name is = השם שלי הוא. שם פרטי באנגלית כתוב באות גדולה.', 3);

-- Ex5: WB — "Nice to meet you"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000025', '00000000-0000-0000-0002-000000000003',
  'word_bank', 'תרגם לאנגלית: נעים להכיר', 'he',
  'Nice to meet you', '[]'::jsonb,
  '["Nice", "to", "meet", "you", "see", "later"]'::jsonb,
  'Nice to meet you — Nice (נעים), to meet (להכיר), you (אותך).', 4);

-- Ex6: TA — my name
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000026', '00000000-0000-0000-0002-000000000003',
  'type_answer', 'איך אומרים "השם שלי" באנגלית?', 'he',
  'My name', '["my name"]'::jsonb,
  'השם שלי = My name. My = שלי, name = שם.', 5);

-- Ex7: Matching
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000027', '00000000-0000-0000-0002-000000000003',
  'matching', 'התאם את המילים לתרגום שלהן', 'he',
  'name=שם, my=שלי, your=שלך, meet=להכיר.', 6);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
  ('00000000-0000-0000-0003-000000000027', 'name', 'en', true, 'b0000000-0000-0000-0000-00000000000d', 0),
  ('00000000-0000-0000-0003-000000000027', 'שם', 'he', true, 'b0000000-0000-0000-0000-00000000000d', 1),
  ('00000000-0000-0000-0003-000000000027', 'my', 'en', true, 'b0000000-0000-0000-0000-00000000000e', 2),
  ('00000000-0000-0000-0003-000000000027', 'שלי', 'he', true, 'b0000000-0000-0000-0000-00000000000e', 3),
  ('00000000-0000-0000-0003-000000000027', 'your', 'en', true, 'b0000000-0000-0000-0000-00000000000f', 4),
  ('00000000-0000-0000-0003-000000000027', 'שלך', 'he', true, 'b0000000-0000-0000-0000-00000000000f', 5),
  ('00000000-0000-0000-0003-000000000027', 'meet', 'en', true, 'b0000000-0000-0000-0000-000000000010', 6),
  ('00000000-0000-0000-0003-000000000027', 'להכיר', 'he', true, 'b0000000-0000-0000-0000-000000000010', 7);

-- Ex8: CS — "My ___ is David" (name)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000028', '00000000-0000-0000-0002-000000000003',
  'complete_sentence', 'My ___ is David', 'en', 'name',
  'My name is David = השם שלי הוא דויד. המילה החסרה היא name (שם).', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000028', 'name', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000028', 'are', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000028', 'your', 'en', false, 2);

-- Ex9: CS — "What ___ your name?" (is)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000029', '00000000-0000-0000-0002-000000000003',
  'complete_sentence', 'What ___ your name?', 'en', 'is',
  'What is your name? = איך קוראים לך? המילה החסרה היא is (פועל "להיות" ביחיד).', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000029', 'is', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000029', 'are', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000029', 'am', 'en', false, 2);

-- Ex10: TA — nice to meet you
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-00000000002a', '00000000-0000-0000-0002-000000000003',
  'type_answer', 'איך אומרים "נעים להכיר" באנגלית?', 'he',
  'Nice to meet you', '["nice to meet you"]'::jsonb,
  'נעים להכיר = Nice to meet you. ביטוי קבוע, אומרים בפגישה ראשונה.', 9);

-- ============================================================
-- UNIT 1 LESSON 4: להתראות! (Goodbye)
-- ============================================================

-- Ex1: MC — "See you later"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000031', '00000000-0000-0000-0002-000000000004',
  'multiple_choice', 'See you later', 'en',
  'See you later = נתראה אחר כך. דרך לא רשמית להיפרד.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000031', 'נתראה אחר כך', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000031', 'שלום', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000031', 'בוקר טוב', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000031', 'נעים להכיר', 'he', false, 3);

-- Ex2: MC — "Take care"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000032', '00000000-0000-0000-0002-000000000004',
  'multiple_choice', 'Take care', 'en',
  'Take care = שמור על עצמך. ביטוי חם של פרידה.', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000032', 'שמור על עצמך', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000032', 'תודה רבה', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000032', 'בבקשה', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000032', 'נתראה מחר', 'he', false, 3);

-- Ex3: MC — "Have a good day"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000033', '00000000-0000-0000-0002-000000000004',
  'multiple_choice', 'Have a good day', 'en',
  'Have a good day = שיהיה לך יום טוב. איחול נפוץ בפרידה.', 2);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000033', 'שיהיה לך יום טוב', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000033', 'בוקר טוב', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000033', 'לילה טוב', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000033', 'יום הולדת שמח', 'he', false, 3);

-- Ex4: WB — "See you tomorrow"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000034', '00000000-0000-0000-0002-000000000004',
  'word_bank', 'תרגם לאנגלית: נתראה מחר', 'he',
  'See you tomorrow', '[]'::jsonb,
  '["See", "you", "tomorrow", "later", "today", "bye"]'::jsonb,
  'See you tomorrow = נתראה מחר. ביטוי פרידה לימים הבאים.', 3);

-- Ex5: WB — "Have a nice day"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000035', '00000000-0000-0000-0002-000000000004',
  'word_bank', 'תרגם לאנגלית: שיהיה לך יום נעים', 'he',
  'Have a nice day', '[]'::jsonb,
  '["Have", "a", "nice", "day", "good", "night"]'::jsonb,
  'Have a nice day — Have (יהיה), a (תווית), nice (נעים), day (יום).', 4);

-- Ex6: TA — Good night
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000036', '00000000-0000-0000-0002-000000000004',
  'type_answer', 'איך אומרים "לילה טוב" באנגלית?', 'he',
  'Good night', '["good night"]'::jsonb,
  'לילה טוב = Good night. אומרים לפני שהולכים לישון.', 5);

-- Ex7: Matching
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000037', '00000000-0000-0000-0002-000000000004',
  'matching', 'התאם את המילים לתרגום שלהן', 'he',
  'later=אחר כך, tomorrow=מחר, night=לילה, day=יום.', 6);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
  ('00000000-0000-0000-0003-000000000037', 'later', 'en', true, 'b0000000-0000-0000-0000-000000000011', 0),
  ('00000000-0000-0000-0003-000000000037', 'אחר כך', 'he', true, 'b0000000-0000-0000-0000-000000000011', 1),
  ('00000000-0000-0000-0003-000000000037', 'tomorrow', 'en', true, 'b0000000-0000-0000-0000-000000000012', 2),
  ('00000000-0000-0000-0003-000000000037', 'מחר', 'he', true, 'b0000000-0000-0000-0000-000000000012', 3),
  ('00000000-0000-0000-0003-000000000037', 'night', 'en', true, 'b0000000-0000-0000-0000-000000000013', 4),
  ('00000000-0000-0000-0003-000000000037', 'לילה', 'he', true, 'b0000000-0000-0000-0000-000000000013', 5),
  ('00000000-0000-0000-0003-000000000037', 'day', 'en', true, 'b0000000-0000-0000-0000-000000000014', 6),
  ('00000000-0000-0000-0003-000000000037', 'יום', 'he', true, 'b0000000-0000-0000-0000-000000000014', 7);

-- Ex8: CS — "See you ___" (later)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000038', '00000000-0000-0000-0002-000000000004',
  'complete_sentence', 'See you ___', 'en', 'later',
  'See you later = נתראה אחר כך. המילה החסרה היא later.', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000038', 'later', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000038', 'good', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000038', 'have', 'en', false, 2);

-- Ex9: CS — "Good ___" (night)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000039', '00000000-0000-0000-0002-000000000004',
  'complete_sentence', 'Good ___ — sleep well!', 'en', 'night',
  'Good night = לילה טוב. אומרים לפני השינה.', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000039', 'night', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000039', 'you', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000039', 'see', 'en', false, 2);

-- Ex10: TA — Bye
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-00000000003a', '00000000-0000-0000-0002-000000000004',
  'type_answer', 'איך אומרים "ביי" באנגלית?', 'he',
  'Bye', '["bye", "Goodbye", "goodbye"]'::jsonb,
  'ביי = Bye. צורה לא רשמית של Goodbye.', 9);

-- ============================================================
-- UNIT 1 LESSON 5: חזרה: ברכות (Greetings Review)
-- ============================================================

-- Ex1: WB — "Hello, my name is David"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000041', '00000000-0000-0000-0002-000000000005',
  'word_bank', 'תרגם לאנגלית: שלום, השם שלי הוא דויד', 'he',
  'Hello, my name is David', '[]'::jsonb,
  '["Hello,", "my", "name", "is", "David", "are", "you", "your"]'::jsonb,
  'משפט הצגה עצמית מלא: ברכה + שם.', 0);

-- Ex2: WB — "How are you today?"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000042', '00000000-0000-0000-0002-000000000005',
  'word_bank', 'תרגם לאנגלית: מה שלומך היום?', 'he',
  'How are you today?', '["How are you today"]'::jsonb,
  '["How", "are", "you", "today?", "is", "fine", "name"]'::jsonb,
  'today (היום) מוסיף הקשר זמן לשאלה.', 1);

-- Ex3: WB — "Nice to meet you"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000043', '00000000-0000-0000-0002-000000000005',
  'word_bank', 'תרגם לאנגלית: נעים להכיר אותך', 'he',
  'Nice to meet you', '[]'::jsonb,
  '["Nice", "to", "meet", "you", "see", "later", "is", "your"]'::jsonb,
  'Nice to meet you — חזרה על ביטוי הפגישה הראשונה.', 2);

-- Ex4: TA — Hello, how are you
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000044', '00000000-0000-0000-0002-000000000005',
  'type_answer', 'איך אומרים "שלום, מה שלומך" באנגלית?', 'he',
  'Hello, how are you', '["hello, how are you", "Hi, how are you", "hi, how are you"]'::jsonb,
  'משפט מצורף: ברכה + שאלה.', 3);

-- Ex5: CS — "Good ___, how are you?" (morning)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000045', '00000000-0000-0000-0002-000000000005',
  'complete_sentence', 'Good ___, how are you?', 'en', 'morning',
  'Good morning = בוקר טוב. ברכת בוקר.', 4);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000045', 'morning', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000045', 'night', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000045', 'bye', 'en', false, 2);

-- Ex6: MC — "Have a good day"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000046', '00000000-0000-0000-0002-000000000005',
  'multiple_choice', 'Have a good day', 'en',
  'Have a good day = שיהיה לך יום טוב.', 5);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000046', 'שיהיה לך יום טוב', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000046', 'נעים להכיר', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000046', 'בוקר טוב', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000046', 'תודה רבה', 'he', false, 3);

-- Ex7: MC — "Thank you very much"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000047', '00000000-0000-0000-0002-000000000005',
  'multiple_choice', 'Thank you very much', 'en',
  'Thank you very much = תודה רבה. very much מחזק את התודה.', 6);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000047', 'תודה רבה', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000047', 'בבקשה רבה', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000047', 'סליחה רבה', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000047', 'שלום רב', 'he', false, 3);

-- Ex8: Matching — review pairs
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000048', '00000000-0000-0000-0002-000000000005',
  'matching', 'התאם את הביטויים לתרגום שלהן', 'he',
  'Hello=שלום, Goodbye=להתראות, Please=בבקשה, Thank you=תודה.', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
  ('00000000-0000-0000-0003-000000000048', 'Hello', 'en', true, 'b0000000-0000-0000-0000-000000000015', 0),
  ('00000000-0000-0000-0003-000000000048', 'שלום', 'he', true, 'b0000000-0000-0000-0000-000000000015', 1),
  ('00000000-0000-0000-0003-000000000048', 'Goodbye', 'en', true, 'b0000000-0000-0000-0000-000000000016', 2),
  ('00000000-0000-0000-0003-000000000048', 'להתראות', 'he', true, 'b0000000-0000-0000-0000-000000000016', 3),
  ('00000000-0000-0000-0003-000000000048', 'Please', 'en', true, 'b0000000-0000-0000-0000-000000000017', 4),
  ('00000000-0000-0000-0003-000000000048', 'בבקשה', 'he', true, 'b0000000-0000-0000-0000-000000000017', 5),
  ('00000000-0000-0000-0003-000000000048', 'Thank you', 'en', true, 'b0000000-0000-0000-0000-000000000018', 6),
  ('00000000-0000-0000-0003-000000000048', 'תודה', 'he', true, 'b0000000-0000-0000-0000-000000000018', 7);

-- Ex9: CS — "Have a ___ day" (good)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000049', '00000000-0000-0000-0002-000000000005',
  'complete_sentence', 'Have a ___ day', 'en', 'good',
  'Have a good day = שיהיה לך יום טוב. המילה החסרה היא good.', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000049', 'good', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000049', 'go', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000049', 'be', 'en', false, 2);

-- Ex10: TA — Nice to meet you
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-00000000004a', '00000000-0000-0000-0002-000000000005',
  'type_answer', 'איך אומרים "נעים להכיר" באנגלית?', 'he',
  'Nice to meet you', '["nice to meet you"]'::jsonb,
  'נעים להכיר = Nice to meet you. ביטוי קבוע.', 9);

-- ============================================================
-- UNIT 2 LESSON 1: אחד עד חמש (Numbers 1-5)
-- ============================================================

-- Ex1: MC — "one"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000051', '00000000-0000-0000-0002-000000000006',
  'multiple_choice', 'one', 'en',
  'one = אחד. המספר 1 באנגלית.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000051', '1', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000051', '5', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000051', '2', 'en', false, 2),
  ('00000000-0000-0000-0003-000000000051', '4', 'en', false, 3);

-- Ex2: MC — "three"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000052', '00000000-0000-0000-0002-000000000006',
  'multiple_choice', 'three', 'en',
  'three = שלוש. המספר 3 באנגלית.', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000052', '3', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000052', '1', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000052', '2', 'en', false, 2),
  ('00000000-0000-0000-0003-000000000052', '5', 'en', false, 3);

-- Ex3: TA — five
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000053', '00000000-0000-0000-0002-000000000006',
  'type_answer', 'איך אומרים "5" באנגלית?', 'he',
  'five', '["Five"]'::jsonb,
  '5 = five. שים לב לאיות: f-i-v-e.', 2);

-- Ex4: TA — one
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000054', '00000000-0000-0000-0002-000000000006',
  'type_answer', 'איך אומרים "1" באנגלית?', 'he',
  'one', '["One"]'::jsonb,
  '1 = one. הצליל הראשון הוא "וו".', 3);

-- Ex5: Matching — numbers 2-5
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000055', '00000000-0000-0000-0002-000000000006',
  'matching', 'התאם את המספר למילה באנגלית', 'he',
  'two=2, three=3, four=4, five=5.', 4);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
  ('00000000-0000-0000-0003-000000000055', 'two', 'en', true, 'b0000000-0000-0000-0000-000000000019', 0),
  ('00000000-0000-0000-0003-000000000055', '2', 'he', true, 'b0000000-0000-0000-0000-000000000019', 1),
  ('00000000-0000-0000-0003-000000000055', 'three', 'en', true, 'b0000000-0000-0000-0000-00000000001a', 2),
  ('00000000-0000-0000-0003-000000000055', '3', 'he', true, 'b0000000-0000-0000-0000-00000000001a', 3),
  ('00000000-0000-0000-0003-000000000055', 'four', 'en', true, 'b0000000-0000-0000-0000-00000000001b', 4),
  ('00000000-0000-0000-0003-000000000055', '4', 'he', true, 'b0000000-0000-0000-0000-00000000001b', 5),
  ('00000000-0000-0000-0003-000000000055', 'five', 'en', true, 'b0000000-0000-0000-0000-00000000001c', 6),
  ('00000000-0000-0000-0003-000000000055', '5', 'he', true, 'b0000000-0000-0000-0000-00000000001c', 7);

-- Ex6: WB — "I have two cats"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000056', '00000000-0000-0000-0002-000000000006',
  'word_bank', 'תרגם לאנגלית: יש לי שני חתולים', 'he',
  'I have two cats', '[]'::jsonb,
  '["I", "have", "two", "cats", "one", "are"]'::jsonb,
  'I have = יש לי. two = שניים. cats = חתולים.', 5);

-- Ex7: WB — "She is five"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000057', '00000000-0000-0000-0002-000000000006',
  'word_bank', 'תרגם לאנגלית: היא בת חמש', 'he',
  'She is five', '[]'::jsonb,
  '["She", "is", "five", "are", "two", "ten"]'::jsonb,
  'She is five — She (היא), is (פועל יחיד), five (5).', 6);

-- Ex8: CS — "I have ___ apples" (three)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000058', '00000000-0000-0000-0002-000000000006',
  'complete_sentence', 'I have ___ apples', 'en', 'three',
  'three = שלוש. המילה החסרה היא מספר.', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000058', 'three', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000058', 'are', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000058', 'is', 'en', false, 2);

-- Ex9: CS — "We are ___" (four)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000059', '00000000-0000-0000-0002-000000000006',
  'complete_sentence', 'We are ___', 'en', 'four',
  'We are four = אנחנו ארבעה. המילה החסרה היא four.', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000059', 'four', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000059', 'are', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000059', 'see', 'en', false, 2);

-- Ex10: MC — "five"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-00000000005a', '00000000-0000-0000-0002-000000000006',
  'multiple_choice', 'five', 'en',
  'five = חמש. המספר 5.', 9);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-00000000005a', 'חמש', 'he', true, 0),
  ('00000000-0000-0000-0003-00000000005a', 'ארבע', 'he', false, 1),
  ('00000000-0000-0000-0003-00000000005a', 'שלוש', 'he', false, 2),
  ('00000000-0000-0000-0003-00000000005a', 'אחד', 'he', false, 3);

-- ============================================================
-- UNIT 2 LESSON 2: שש עד עשר (Numbers 6-10)
-- ============================================================

-- Ex1: MC — "six"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000061', '00000000-0000-0000-0002-000000000007',
  'multiple_choice', 'six', 'en',
  'six = שש. המספר 6.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000061', '6', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000061', '7', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000061', '8', 'en', false, 2),
  ('00000000-0000-0000-0003-000000000061', '10', 'en', false, 3);

-- Ex2: MC — "ten"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000062', '00000000-0000-0000-0002-000000000007',
  'multiple_choice', 'ten', 'en',
  'ten = עשר. המספר 10.', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000062', '10', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000062', '6', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000062', '9', 'en', false, 2),
  ('00000000-0000-0000-0003-000000000062', '7', 'en', false, 3);

-- Ex3: TA — seven
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000063', '00000000-0000-0000-0002-000000000007',
  'type_answer', 'איך אומרים "7" באנגלית?', 'he',
  'seven', '["Seven"]'::jsonb,
  '7 = seven. שבעה אותיות... לא, רק חמישה: s-e-v-e-n.', 2);

-- Ex4: TA — nine
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000064', '00000000-0000-0000-0002-000000000007',
  'type_answer', 'איך אומרים "9" באנגלית?', 'he',
  'nine', '["Nine"]'::jsonb,
  '9 = nine. שים לב לאיות: n-i-n-e.', 3);

-- Ex5: Matching — numbers 6-9
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000065', '00000000-0000-0000-0002-000000000007',
  'matching', 'התאם את המספר למילה באנגלית', 'he',
  'six=6, seven=7, eight=8, nine=9.', 4);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
  ('00000000-0000-0000-0003-000000000065', 'six', 'en', true, 'b0000000-0000-0000-0000-00000000001d', 0),
  ('00000000-0000-0000-0003-000000000065', '6', 'he', true, 'b0000000-0000-0000-0000-00000000001d', 1),
  ('00000000-0000-0000-0003-000000000065', 'seven', 'en', true, 'b0000000-0000-0000-0000-00000000001e', 2),
  ('00000000-0000-0000-0003-000000000065', '7', 'he', true, 'b0000000-0000-0000-0000-00000000001e', 3),
  ('00000000-0000-0000-0003-000000000065', 'eight', 'en', true, 'b0000000-0000-0000-0000-00000000001f', 4),
  ('00000000-0000-0000-0003-000000000065', '8', 'he', true, 'b0000000-0000-0000-0000-00000000001f', 5),
  ('00000000-0000-0000-0003-000000000065', 'nine', 'en', true, 'b0000000-0000-0000-0000-000000000020', 6),
  ('00000000-0000-0000-0003-000000000065', '9', 'he', true, 'b0000000-0000-0000-0000-000000000020', 7);

-- Ex6: WB — "I have six books"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000066', '00000000-0000-0000-0002-000000000007',
  'word_bank', 'תרגם לאנגלית: יש לי שישה ספרים', 'he',
  'I have six books', '[]'::jsonb,
  '["I", "have", "six", "books", "are", "ten"]'::jsonb,
  'six books = שישה ספרים. במספר רבים מוסיפים s לסוף השם.', 5);

-- Ex7: WB — "He is eight"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000067', '00000000-0000-0000-0002-000000000007',
  'word_bank', 'תרגם לאנגלית: הוא בן שמונה', 'he',
  'He is eight', '[]'::jsonb,
  '["He", "is", "eight", "are", "ten", "six"]'::jsonb,
  'He is eight — He (הוא) דורש is (יחיד), לא are.', 6);

-- Ex8: CS — "We have ___ cats" (seven)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000068', '00000000-0000-0000-0002-000000000007',
  'complete_sentence', 'We have ___ cats', 'en', 'seven',
  'seven = שבע. seven cats = שבעה חתולים.', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000068', 'seven', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000068', 'is', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000068', 'are', 'en', false, 2);

-- Ex9: CS — "They are ___" (ten)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000069', '00000000-0000-0000-0002-000000000007',
  'complete_sentence', 'They are ___', 'en', 'ten',
  'They are ten = הם עשרה. ten = המספר 10.', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000069', 'ten', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000069', 'have', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000069', 'is', 'en', false, 2);

-- Ex10: MC — "eight"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-00000000006a', '00000000-0000-0000-0002-000000000007',
  'multiple_choice', 'eight', 'en',
  'eight = שמונה. המספר 8.', 9);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-00000000006a', 'שמונה', 'he', true, 0),
  ('00000000-0000-0000-0003-00000000006a', 'שש', 'he', false, 1),
  ('00000000-0000-0000-0003-00000000006a', 'תשע', 'he', false, 2),
  ('00000000-0000-0000-0003-00000000006a', 'שבע', 'he', false, 3);

-- ============================================================
-- UNIT 2 LESSON 3: אחד-עשר עד חמש-עשר (Numbers 11-15)
-- ============================================================

-- Ex1: MC — "eleven"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000071', '00000000-0000-0000-0002-000000000008',
  'multiple_choice', 'eleven', 'en',
  'eleven = אחד-עשר. המספר 11.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000071', '11', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000071', '12', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000071', '15', 'en', false, 2),
  ('00000000-0000-0000-0003-000000000071', '13', 'en', false, 3);

-- Ex2: MC — "fifteen"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000072', '00000000-0000-0000-0002-000000000008',
  'multiple_choice', 'fifteen', 'en',
  'fifteen = חמש-עשרה. המספר 15. שים לב: לא fiveteen.', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000072', '15', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000072', '14', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000072', '5', 'en', false, 2),
  ('00000000-0000-0000-0003-000000000072', '50', 'en', false, 3);

-- Ex3: TA — twelve
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000073', '00000000-0000-0000-0002-000000000008',
  'type_answer', 'איך אומרים "12" באנגלית?', 'he',
  'twelve', '["Twelve"]'::jsonb,
  '12 = twelve. שים לב: לא twoteen.', 2);

-- Ex4: TA — thirteen
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000074', '00000000-0000-0000-0002-000000000008',
  'type_answer', 'איך אומרים "13" באנגלית?', 'he',
  'thirteen', '["Thirteen"]'::jsonb,
  '13 = thirteen. שלוש (three) → שלוש-עשרה (thirteen).', 3);

-- Ex5: Matching — 11, 12, 14, 15
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000075', '00000000-0000-0000-0002-000000000008',
  'matching', 'התאם את המספר למילה באנגלית', 'he',
  'eleven=11, twelve=12, fourteen=14, fifteen=15.', 4);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
  ('00000000-0000-0000-0003-000000000075', 'eleven', 'en', true, 'b0000000-0000-0000-0000-000000000021', 0),
  ('00000000-0000-0000-0003-000000000075', '11', 'he', true, 'b0000000-0000-0000-0000-000000000021', 1),
  ('00000000-0000-0000-0003-000000000075', 'twelve', 'en', true, 'b0000000-0000-0000-0000-000000000022', 2),
  ('00000000-0000-0000-0003-000000000075', '12', 'he', true, 'b0000000-0000-0000-0000-000000000022', 3),
  ('00000000-0000-0000-0003-000000000075', 'fourteen', 'en', true, 'b0000000-0000-0000-0000-000000000023', 4),
  ('00000000-0000-0000-0003-000000000075', '14', 'he', true, 'b0000000-0000-0000-0000-000000000023', 5),
  ('00000000-0000-0000-0003-000000000075', 'fifteen', 'en', true, 'b0000000-0000-0000-0000-000000000024', 6),
  ('00000000-0000-0000-0003-000000000075', '15', 'he', true, 'b0000000-0000-0000-0000-000000000024', 7);

-- Ex6: WB — "I am eleven years old"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000076', '00000000-0000-0000-0002-000000000008',
  'word_bank', 'תרגם לאנגלית: אני בן אחת-עשרה', 'he',
  'I am eleven years old', '[]'::jsonb,
  '["I", "am", "eleven", "years", "old", "is", "twelve"]'::jsonb,
  'I am X years old = אני בן X. ביטוי קבוע לציון גיל.', 5);

-- Ex7: WB — "She is twelve"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000077', '00000000-0000-0000-0002-000000000008',
  'word_bank', 'תרגם לאנגלית: היא בת שתים-עשרה', 'he',
  'She is twelve', '[]'::jsonb,
  '["She", "is", "twelve", "are", "eleven", "old"]'::jsonb,
  'She is twelve — אפשר גם She is twelve years old.', 6);

-- Ex8: CS — "He is ___ years old" (thirteen)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000078', '00000000-0000-0000-0002-000000000008',
  'complete_sentence', 'He is ___ years old', 'en', 'thirteen',
  'thirteen = 13. He is thirteen years old = הוא בן 13.', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000078', 'thirteen', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000078', 'three', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000078', 'thirty', 'en', false, 2);

-- Ex9: CS — "We have ___ cats" (fourteen)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000079', '00000000-0000-0000-0002-000000000008',
  'complete_sentence', 'We have ___ cats', 'en', 'fourteen',
  'fourteen = 14. four (4) → fourteen (14).', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000079', 'fourteen', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000079', 'forty', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000079', 'four', 'en', false, 2);

-- Ex10: MC — "fifteen"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-00000000007a', '00000000-0000-0000-0002-000000000008',
  'multiple_choice', 'fifteen', 'en',
  'fifteen = חמש-עשרה.', 9);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-00000000007a', 'חמש-עשרה', 'he', true, 0),
  ('00000000-0000-0000-0003-00000000007a', 'חמישים', 'he', false, 1),
  ('00000000-0000-0000-0003-00000000007a', 'חמש', 'he', false, 2),
  ('00000000-0000-0000-0003-00000000007a', 'ארבע-עשרה', 'he', false, 3);

-- ============================================================
-- UNIT 2 LESSON 4: שש-עשר עד עשרים (Numbers 16-20)
-- ============================================================

-- Ex1: MC — "sixteen"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000081', '00000000-0000-0000-0002-000000000009',
  'multiple_choice', 'sixteen', 'en',
  'sixteen = שש-עשרה. המספר 16.', 0);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000081', '16', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000081', '6', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000081', '60', 'en', false, 2),
  ('00000000-0000-0000-0003-000000000081', '17', 'en', false, 3);

-- Ex2: MC — "twenty"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000082', '00000000-0000-0000-0002-000000000009',
  'multiple_choice', 'twenty', 'en',
  'twenty = עשרים. המספר 20.', 1);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000082', '20', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000082', '12', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000082', '2', 'en', false, 2),
  ('00000000-0000-0000-0003-000000000082', '10', 'en', false, 3);

-- Ex3: TA — seventeen
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000083', '00000000-0000-0000-0002-000000000009',
  'type_answer', 'איך אומרים "17" באנגלית?', 'he',
  'seventeen', '["Seventeen"]'::jsonb,
  '17 = seventeen. שבע (seven) + עשרה (teen) = seventeen.', 2);

-- Ex4: TA — nineteen
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000084', '00000000-0000-0000-0002-000000000009',
  'type_answer', 'איך אומרים "19" באנגלית?', 'he',
  'nineteen', '["Nineteen"]'::jsonb,
  '19 = nineteen. תשע (nine) + עשרה (teen) = nineteen.', 3);

-- Ex5: Matching — 16, 17, 18, 20
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000085', '00000000-0000-0000-0002-000000000009',
  'matching', 'התאם את המספר למילה באנגלית', 'he',
  'sixteen=16, seventeen=17, eighteen=18, twenty=20.', 4);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
  ('00000000-0000-0000-0003-000000000085', 'sixteen', 'en', true, 'b0000000-0000-0000-0000-000000000025', 0),
  ('00000000-0000-0000-0003-000000000085', '16', 'he', true, 'b0000000-0000-0000-0000-000000000025', 1),
  ('00000000-0000-0000-0003-000000000085', 'seventeen', 'en', true, 'b0000000-0000-0000-0000-000000000026', 2),
  ('00000000-0000-0000-0003-000000000085', '17', 'he', true, 'b0000000-0000-0000-0000-000000000026', 3),
  ('00000000-0000-0000-0003-000000000085', 'eighteen', 'en', true, 'b0000000-0000-0000-0000-000000000027', 4),
  ('00000000-0000-0000-0003-000000000085', '18', 'he', true, 'b0000000-0000-0000-0000-000000000027', 5),
  ('00000000-0000-0000-0003-000000000085', 'twenty', 'en', true, 'b0000000-0000-0000-0000-000000000028', 6),
  ('00000000-0000-0000-0003-000000000085', '20', 'he', true, 'b0000000-0000-0000-0000-000000000028', 7);

-- Ex6: WB — "I am sixteen"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000086', '00000000-0000-0000-0002-000000000009',
  'word_bank', 'תרגם לאנגלית: אני בן שש-עשרה', 'he',
  'I am sixteen', '[]'::jsonb,
  '["I", "am", "sixteen", "are", "ten", "old"]'::jsonb,
  'I am sixteen — מספר אישי לציון גיל.', 5);

-- Ex7: WB — "We are twenty"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000087', '00000000-0000-0000-0002-000000000009',
  'word_bank', 'תרגם לאנגלית: אנחנו עשרים', 'he',
  'We are twenty', '[]'::jsonb,
  '["We", "are", "twenty", "is", "ten", "two"]'::jsonb,
  'We are twenty — We (אנחנו) דורש are (פועל רבים).', 6);

-- Ex8: CS — "She is ___ years old" (eighteen)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000088', '00000000-0000-0000-0002-000000000009',
  'complete_sentence', 'She is ___ years old', 'en', 'eighteen',
  'eighteen = 18. שמונה (eight) → eighteen (18). שים לב: רק "t" אחת בקצה של eight.', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000088', 'eighteen', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000088', 'eight', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000088', 'eighty', 'en', false, 2);

-- Ex9: CS — "He has ___ books" (nineteen)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000089', '00000000-0000-0000-0002-000000000009',
  'complete_sentence', 'He has ___ books', 'en', 'nineteen',
  'He has nineteen books = יש לו 19 ספרים.', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000089', 'nineteen', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000089', 'ninety', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000089', 'nine', 'en', false, 2);

-- Ex10: MC — "twenty"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-00000000008a', '00000000-0000-0000-0002-000000000009',
  'multiple_choice', 'twenty', 'en',
  'twenty = עשרים. המספר 20.', 9);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-00000000008a', 'עשרים', 'he', true, 0),
  ('00000000-0000-0000-0003-00000000008a', 'שתים-עשרה', 'he', false, 1),
  ('00000000-0000-0000-0003-00000000008a', 'עשר', 'he', false, 2),
  ('00000000-0000-0000-0003-00000000008a', 'שתיים', 'he', false, 3);

-- ============================================================
-- UNIT 2 LESSON 5: חזרה: מספרים (Numbers Review)
-- ============================================================

-- Ex1: WB — "I am ten years old"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000091', '00000000-0000-0000-0002-000000000010',
  'word_bank', 'תרגם לאנגלית: אני בן עשר', 'he',
  'I am ten years old', '[]'::jsonb,
  '["I", "am", "ten", "years", "old", "are", "twenty", "is"]'::jsonb,
  'משפט שלם לציון גיל. שים לב: years old, לא years.', 0);

-- Ex2: WB — "There are five cats"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000092', '00000000-0000-0000-0002-000000000010',
  'word_bank', 'תרגם לאנגלית: יש חמישה חתולים', 'he',
  'There are five cats', '[]'::jsonb,
  '["There", "are", "five", "cats", "is", "two", "have"]'::jsonb,
  'There are = יש (במספר רבים). cats עם s כי זה רבים.', 1);

-- Ex3: WB — "She has three apples"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000093', '00000000-0000-0000-0002-000000000010',
  'word_bank', 'תרגם לאנגלית: יש לה שלושה תפוחים', 'he',
  'She has three apples', '[]'::jsonb,
  '["She", "has", "three", "apples", "have", "is", "two"]'::jsonb,
  'She has = יש לה. has במקום have בגלל גוף שלישי יחיד.', 2);

-- Ex4: TA — I have two dogs
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000094', '00000000-0000-0000-0002-000000000010',
  'type_answer', 'איך אומרים "יש לי שני כלבים" באנגלית?', 'he',
  'I have two dogs', '["i have two dogs"]'::jsonb,
  'I have = יש לי. two dogs = שני כלבים (עם s ברבים).', 3);

-- Ex5: CS — "I am ___ years old" (twenty)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000095', '00000000-0000-0000-0002-000000000010',
  'complete_sentence', 'I am ___ years old', 'en', 'twenty',
  'twenty = 20. המבוגר ביותר ביחידה הזו.', 4);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000095', 'twenty', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000095', 'twelve', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000095', 'two', 'en', false, 2);

-- Ex6: MC — "He is sixteen years old"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000096', '00000000-0000-0000-0002-000000000010',
  'multiple_choice', 'He is sixteen years old', 'en',
  'He is sixteen years old = הוא בן 16.', 5);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000096', 'הוא בן 16', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000096', 'הוא בן 6', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000096', 'הוא בן 60', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000096', 'היא בת 16', 'he', false, 3);

-- Ex7: MC — "We have eleven books"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000097', '00000000-0000-0000-0002-000000000010',
  'multiple_choice', 'We have eleven books', 'en',
  'We have eleven books = יש לנו 11 ספרים.', 6);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000097', 'יש לנו 11 ספרים', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000097', 'יש לנו 7 ספרים', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000097', 'אנחנו 11 ספרים', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000097', 'יש לי 11 ספרים', 'he', false, 3);

-- Ex8: Matching — mixed numbers
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000098', '00000000-0000-0000-0002-000000000010',
  'matching', 'התאם את המספר למילה באנגלית', 'he',
  'one=1, ten=10, fifteen=15, twenty=20.', 7);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index) values
  ('00000000-0000-0000-0003-000000000098', 'one', 'en', true, 'b0000000-0000-0000-0000-000000000029', 0),
  ('00000000-0000-0000-0003-000000000098', '1', 'he', true, 'b0000000-0000-0000-0000-000000000029', 1),
  ('00000000-0000-0000-0003-000000000098', 'ten', 'en', true, 'b0000000-0000-0000-0000-00000000002a', 2),
  ('00000000-0000-0000-0003-000000000098', '10', 'he', true, 'b0000000-0000-0000-0000-00000000002a', 3),
  ('00000000-0000-0000-0003-000000000098', 'fifteen', 'en', true, 'b0000000-0000-0000-0000-00000000002b', 4),
  ('00000000-0000-0000-0003-000000000098', '15', 'he', true, 'b0000000-0000-0000-0000-00000000002b', 5),
  ('00000000-0000-0000-0003-000000000098', 'twenty', 'en', true, 'b0000000-0000-0000-0000-00000000002c', 6),
  ('00000000-0000-0000-0003-000000000098', '20', 'he', true, 'b0000000-0000-0000-0000-00000000002c', 7);

-- Ex9: CS — "She has ___ books" (fifteen)
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000099', '00000000-0000-0000-0002-000000000010',
  'complete_sentence', 'She has ___ books', 'en', 'fifteen',
  'fifteen = 15. ספרים בכמות גדולה.', 8);
insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index) values
  ('00000000-0000-0000-0003-000000000099', 'fifteen', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000099', 'fifty', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000099', 'five', 'en', false, 2);

-- Ex10: TA — I am eight
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-00000000009a', '00000000-0000-0000-0002-000000000010',
  'type_answer', 'איך אומרים "אני בן שמונה" באנגלית?', 'he',
  'I am eight', '["i am eight", "I am eight years old"]'::jsonb,
  'I am eight = אני בן שמונה. אפשר גם I am eight years old.', 9);

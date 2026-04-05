-- ============================================================
-- Seed Data: Course + Units + Unit 1 Lesson 1 (10 exercises)
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- Course
insert into public.courses (id, title, description, language_from, language_to)
values (
  '00000000-0000-0000-0000-000000000001',
  'אנגלית למתחילים',
  'קורס אנגלית בסיסי לדוברי עברית',
  'he', 'en'
);

-- Units
insert into public.units (id, course_id, title, description, icon_emoji, color_hex, order_index)
values
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001',
   'ברכות והכרות', 'לומדים לברך ולהציג את עצמנו באנגלית', '👋', '#58CC02', 0),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000001',
   'מספרים 1–20', 'לומדים מספרים בסיסיים באנגלית', '🔢', '#CE82FF', 1);

-- Unit 1 Lessons
insert into public.lessons (id, unit_id, title, description, order_index)
values
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001',
   'שלום!', 'מילים ראשונות באנגלית', 0),
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000001',
   'מה שלומך?', 'שואלים ועונים על מצב הרוח', 1),
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000001',
   'הנעים להכיר', 'מציגים את עצמנו', 2),
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0001-000000000001',
   'להתראות!', 'דרכי פרידה באנגלית', 3),
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000001',
   'חזרה: ברכות', 'חזרה על כל מה שלמדנו', 4);

-- Unit 2 Lessons (stubs — exercises will be seeded later)
insert into public.lessons (id, unit_id, title, description, order_index)
values
  ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000002',
   'אחד עד חמש', 'המספרים הראשונים', 0),
  ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000002',
   'שש עד עשר', 'ממשיכים לספור', 1),
  ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000002',
   'אחד-עשר עד חמש-עשר', 'מספרים דו-ספרתיים', 2),
  ('00000000-0000-0000-0002-000000000009', '00000000-0000-0000-0001-000000000002',
   'שש-עשר עד עשרים', 'מסיימים את הסדרה', 3),
  ('00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000002',
   'חזרה: מספרים', 'חזרה על כל המספרים', 4);

-- ============================================================
-- Unit 1, Lesson 1: "שלום!" — 10 exercises
-- ============================================================

-- Exercise 1: multiple_choice — "Hello"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001',
  'multiple_choice', 'Hello', 'en',
  'Hello = שלום. זו הדרך הנפוצה ביותר לומר שלום באנגלית.', 0);

insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index)
values
  ('00000000-0000-0000-0003-000000000001', 'שלום', 'he', true, 0),
  ('00000000-0000-0000-0003-000000000001', 'להתראות', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000001', 'תודה', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000001', 'בבקשה', 'he', false, 3);

-- Exercise 2: multiple_choice — "Goodbye"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000001',
  'multiple_choice', 'Goodbye', 'en',
  'Goodbye = להתראות. אומרים את זה כשנפרדים ממישהו.', 1);

insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index)
values
  ('00000000-0000-0000-0003-000000000002', 'בוקר טוב', 'he', false, 0),
  ('00000000-0000-0000-0003-000000000002', 'להתראות', 'he', true, 1),
  ('00000000-0000-0000-0003-000000000002', 'שלום', 'he', false, 2),
  ('00000000-0000-0000-0003-000000000002', 'ערב טוב', 'he', false, 3);

-- Exercise 3: multiple_choice — "Good morning"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000001',
  'multiple_choice', 'Good morning', 'en',
  'Good morning = בוקר טוב. אומרים את זה בבוקר כשפוגשים מישהו.', 2);

insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index)
values
  ('00000000-0000-0000-0003-000000000003', 'ערב טוב', 'he', false, 0),
  ('00000000-0000-0000-0003-000000000003', 'לילה טוב', 'he', false, 1),
  ('00000000-0000-0000-0003-000000000003', 'בוקר טוב', 'he', true, 2),
  ('00000000-0000-0000-0003-000000000003', 'צהריים טובים', 'he', false, 3);

-- Exercise 4: word_bank — "Hello, how are you?"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000001',
  'word_bank',
  'תרגם לאנגלית: שלום, מה שלומך?', 'he',
  'Hello, how are you?',
  '["Hello how are you"]'::jsonb,
  '["Hello,", "how", "are", "you?", "is", "goodbye"]'::jsonb,
  'Hello, how are you? = שלום, מה שלומך? זו שאלה נפוצה כשפוגשים מישהו.', 3);

-- Exercise 5: word_bank — "Good morning"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, word_bank_words, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000001',
  'word_bank',
  'תרגם לאנגלית: בוקר טוב', 'he',
  'Good morning',
  '[]'::jsonb,
  '["Good", "morning", "night", "evening"]'::jsonb,
  'Good morning = בוקר טוב. Good = טוב, morning = בוקר.', 4);

-- Exercise 6: type_answer — "Hello"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000001',
  'type_answer',
  'איך אומרים "שלום" באנגלית?', 'he',
  'Hello',
  '["Hi", "hello", "hi"]'::jsonb,
  'שלום באנגלית זה Hello או Hi.', 5);

-- Exercise 7: matching — Greetings set 1
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000001',
  'matching',
  'התאם את המילים לתרגום שלהן', 'he',
  'Hello = שלום, Goodbye = להתראות, Good morning = בוקר טוב, Thank you = תודה.', 6);

insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index)
values
  ('00000000-0000-0000-0003-000000000007', 'Hello', 'en', true, 'a0000000-0000-0000-0000-000000000001', 0),
  ('00000000-0000-0000-0003-000000000007', 'שלום', 'he', true, 'a0000000-0000-0000-0000-000000000001', 1),
  ('00000000-0000-0000-0003-000000000007', 'Goodbye', 'en', true, 'a0000000-0000-0000-0000-000000000002', 2),
  ('00000000-0000-0000-0003-000000000007', 'להתראות', 'he', true, 'a0000000-0000-0000-0000-000000000002', 3),
  ('00000000-0000-0000-0003-000000000007', 'Good morning', 'en', true, 'a0000000-0000-0000-0000-000000000003', 4),
  ('00000000-0000-0000-0003-000000000007', 'בוקר טוב', 'he', true, 'a0000000-0000-0000-0000-000000000003', 5),
  ('00000000-0000-0000-0003-000000000007', 'Thank you', 'en', true, 'a0000000-0000-0000-0000-000000000004', 6),
  ('00000000-0000-0000-0003-000000000007', 'תודה', 'he', true, 'a0000000-0000-0000-0000-000000000004', 7);

-- Exercise 8: matching — Greetings set 2
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000001',
  'matching',
  'התאם את המילים לתרגום שלהן', 'he',
  'Good evening = ערב טוב, Good night = לילה טוב, Please = בבקשה, Yes = כן.', 7);

insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, pair_group_id, order_index)
values
  ('00000000-0000-0000-0003-000000000008', 'Good evening', 'en', true, 'a0000000-0000-0000-0000-000000000005', 0),
  ('00000000-0000-0000-0003-000000000008', 'ערב טוב', 'he', true, 'a0000000-0000-0000-0000-000000000005', 1),
  ('00000000-0000-0000-0003-000000000008', 'Good night', 'en', true, 'a0000000-0000-0000-0000-000000000006', 2),
  ('00000000-0000-0000-0003-000000000008', 'לילה טוב', 'he', true, 'a0000000-0000-0000-0000-000000000006', 3),
  ('00000000-0000-0000-0003-000000000008', 'Please', 'en', true, 'a0000000-0000-0000-0000-000000000007', 4),
  ('00000000-0000-0000-0003-000000000008', 'בבקשה', 'he', true, 'a0000000-0000-0000-0000-000000000007', 5),
  ('00000000-0000-0000-0003-000000000008', 'Yes', 'en', true, 'a0000000-0000-0000-0000-000000000008', 6),
  ('00000000-0000-0000-0003-000000000008', 'כן', 'he', true, 'a0000000-0000-0000-0000-000000000008', 7);

-- Exercise 9: complete_sentence — "Good ___ ! How are you?"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000001',
  'complete_sentence',
  'Good ___! How are you?', 'en',
  'morning',
  'Good morning = בוקר טוב. המילה החסרה היא morning (בוקר).', 8);

insert into public.exercise_options (exercise_id, option_text, option_language, is_correct, order_index)
values
  ('00000000-0000-0000-0003-000000000009', 'morning', 'en', true, 0),
  ('00000000-0000-0000-0003-000000000009', 'bye', 'en', false, 1),
  ('00000000-0000-0000-0003-000000000009', 'hello', 'en', false, 2);

-- Exercise 10: type_answer — "Goodbye"
insert into public.exercises (id, lesson_id, type, prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he, order_index)
values ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000001',
  'type_answer',
  'איך אומרים "להתראות" באנגלית?', 'he',
  'Goodbye',
  '["goodbye", "Bye", "bye", "Good bye", "good bye"]'::jsonb,
  'להתראות באנגלית זה Goodbye. אפשר גם לומר בקיצור Bye.', 9);

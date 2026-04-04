# EngliFun — Full Product Specification v3.0
**A Duolingo-Inspired English Learning Platform for Hebrew Speakers**
Graduation Final Project | 2025–2026
Stack: Next.js 14 · TypeScript · Tailwind CSS · Supabase · Vercel

---

## 1. Project Overview

### 1.1 Identity
- **Project Name:** EngliFun
- **Type:** Gamified English Learning Web Application
- **Interface Language:** Hebrew (RTL) — content in English
- **Inspiration:** Duolingo
- **Stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · shadcn/ui · Zustand · Supabase · Vercel · Framer Motion

### 1.2 Vision
EngliFun is a Duolingo-style gamified English-learning platform. The entire interface — navigation, instructions, feedback, and explanations — is in Hebrew. English appears only in learning content. The application must feel like a real educational product: polished, motivating, and architecturally sound.

---

## 2. Three-Layer Feature Model

### MVP (build first — required)
- Authentication (register, login, logout, session)
- Onboarding wizard (level selection, daily XP goal, motivation)
- Dashboard (streak, XP, level, daily goal bar, continue button)
- Learning path screen (locked/unlocked lesson nodes, 3 units minimum)
- Lesson engine (progress bar, hearts, per-exercise feedback, state machine)
- 5 exercise types: multiple_choice, word_bank, type_answer, matching, complete_sentence
- Hearts system (3 per lesson, game over at 0)
- XP system (per lesson, perfect bonus, daily goal tracking)
- Streak system (daily, timezone-aware, danger banner)
- Level system (XP thresholds, level-up notification)
- Leaderboard (weekly XP, top 10, current user highlighted)
- Profile screen (level, XP, streak, stats)
- Review mistakes screen
- Seeded content: 3 units, 5 lessons each, 10 exercises per lesson
- Full Hebrew RTL layout
- Supabase RLS on all tables
- Responsive: desktop + tablet + mobile

### Advanced Version (build second — recommended)
- Lesson completion animations (confetti, XP counter, level-up)
- Checkpoint lessons after every 5 regular lessons
- Review lesson auto-generated from user mistakes
- Enhanced dashboard statistics
- Admin content inspection page (read-only)
- Framer Motion lesson transitions
- Supabase Realtime leaderboard

### Nice-to-Have / Post-MVP
- AI-powered Hebrew explanations via Claude API
- Full admin CRUD panel
- Audio/listen exercise type
- Word arrange exercise type
- Social features, push notifications, mobile app

---

## 3. App Architecture — Four Domains

| Domain | Owns | Tables |
|--------|------|--------|
| Content Domain | courses, units, lessons, exercises, options | courses, units, lessons, exercises, exercise_options |
| User Progress Domain | attempts, completions, mistakes | user_progress, lesson_attempts, exercise_attempts, user_mistakes |
| Gamification Domain | XP, hearts, streaks, levels, leaderboard | profiles (xp/streak/level), leaderboard_view |
| Analytics Domain | aggregated stats | Derived — no separate tables in MVP |

---

## 4. Global Navigation (App Shell)

### Desktop Sidebar
- Dashboard → /dashboard
- Learning Path → /path
- Leaderboard → /leaderboard
- Profile → /profile
- Review Mistakes → /review (only if user has unreviewed mistakes)
- Admin → /admin (only if profile.role = admin)

### Mobile Bottom Tab Bar
- 5 tabs: Dashboard · Path · (Lesson FAB center) · Leaderboard · Profile

### Persistent Header
- EngliFun logo left
- Current streak with flame icon center
- XP total and heart count right

---

## 5. Onboarding Flow

### Registration & Login
- Sign up: email + password + username
- Login: email + password
- Password reset via Supabase Auth email link
- After login: if onboarding_completed = false → /onboarding
- After login: if onboarding_completed = true → /dashboard

### Onboarding Wizard — 5 Steps
1. Welcome screen — mascot + CTA button
2. Level selection — Beginner / Elementary / Intermediate → profiles.starting_level
3. Daily XP goal — 10 / 20 / 30 / 50 XP → profiles.daily_xp_goal
4. Motivation — optional selection → profiles.motivation
5. Ready screen — summary + "התחל ללמוד!" → profiles.onboarding_completed = true

**Decision: Daily goal is XP-based only (NOT minutes). All references to "minutes per day" are removed.**

---

## 6. Course & Content Structure

### Content Hierarchy
```
Course
  └── Unit (topic group)
       └── Lesson (10 exercises per lesson)
              └── Exercise (single question/task)
                     └── ExerciseOption (for MC/matching)
                     └── ExerciseAttempt (user answer)
```

### Exact Progression Rules
- A lesson is COMPLETED when: user answers all exercises AND has ≥1 heart remaining
- A lesson is FAILED when: user loses all 3 hearts before finishing
- Failed lesson does NOT count as completed — user must retry
- Next lesson unlocks immediately when current lesson status = completed
- Next unit unlocks when ALL lessons in current unit are completed
- Checkpoint lessons are NOT mandatory for unlocking in MVP
- Replaying a completed lesson does NOT affect unlock state
- Replayed lessons earn 5 XP, stored with is_replay = true
- Locked lesson tap shows: "השלם את השיעור הקודם תחילה"

### MVP Seeded Content
| Unit | Topic | Lessons | Exercises/Lesson |
|------|-------|---------|-----------------|
| Unit 1 | ברכות והכרות (Greetings) | 5 | 10 |
| Unit 2 | מספרים (Numbers 1–20) | 5 | 10 |
| Unit 3 | צבעים ותכונות (Colors & Adjectives) | 5 | 10 |

Total: 150 exercises minimum

### Content Authoring Rules
- Each lesson: exactly 10 exercises, at least 3 different exercise types
- Type distribution: 3 multiple_choice, 2 word_bank, 2 type_answer or complete_sentence, 2 matching, 1 true_false
- Distractors must be plausible (same semantic category)
- Hebrew explanations: 1–2 sentences max, no grammar jargon for beginners
- Words from exercises 1–3 must reappear in exercises 7–10 (spaced repetition)
- Difficulty: Lesson 1 = single words, Lesson 3 = short phrases, Lesson 5 = full sentences

---

## 7. Exercise Types — Full Specification

### 7.1 Multiple Choice
- Input: tap one of 4 buttons
- Validation: deterministic — compare selected option_id to is_correct = true
- DB fields: exercise(prompt_text, prompt_language, explanation_he) + 4 exercise_options (1 correct)
- Feedback correct: green highlight + checkmark + Hebrew success message
- Feedback wrong: red highlight + reveal correct + explanation_he

### 7.2 Word Bank (MANDATORY — most iconic Duolingo exercise)
- Input: tap tiles from pool to construct sentence in answer area
- Validation: deterministic — join tiles in order, compare to correct_answer (case-insensitive)
- Alternative answers: correct_answer_alternatives (JSON array, check all)
- DB fields: exercise(prompt_text in Hebrew, correct_answer, correct_answer_alternatives, word_bank_words JSON array with 2–3 distractor tiles)
- Feedback correct: answer area turns green + checkmark
- Feedback wrong: area turns red + correct answer shown + explanation_he
- UX: tiles min 44px height, placed tiles removable by tapping

### 7.3 Type the Answer
- Input: keyboard text field
- Validation: exact match (case-insensitive, trimmed) + typo tolerance (Levenshtein ≤1 for words >4 chars)
- Near-miss shows: "כמעט נכון!"
- Alternative answers: correct_answer_alternatives JSON array
- DB fields: exercise(prompt_text, prompt_language, correct_answer, correct_answer_alternatives, explanation_he)
- UX: input field must be dir="ltr" even in RTL page

### 7.4 Matching Pairs
- Input: tap Hebrew tile then English tile
- Validation: deterministic — match by pair_group_id in exercise_options
- 4 pairs per exercise (8 option rows total)
- Wrong pair tap: flash red, deselect — NO heart lost (visual feedback only)
- DB fields: exercise_options with pair_group_id (UUID shared by Hebrew+English pair)

### 7.5 Complete the Sentence
- Input: select from dropdown or inline word buttons (NOT free text)
- Validation: deterministic — compare to correct_answer
- DB fields: exercise(prompt_text with ___ placeholder, correct_answer, explanation_he) + exercise_options (3–4 word choices)
- Feedback correct: blank fills green
- Feedback wrong: blank fills red + correct word + explanation_he

### 7.6 True or False
- Input: tap "נכון" or "לא נכון"
- Validation: deterministic — compare to correct_answer ("true"/"false")
- DB fields: exercise(prompt_text, correct_answer, explanation_he)

---

## 8. Lesson Engine — State Machine

### 8 States
| State | Description | Triggers Next State |
|-------|-------------|---------------------|
| IDLE | No lesson active | User taps unlocked lesson → INTRO |
| INTRO | Lesson intro screen: title, XP, count, hearts | User taps "התחל" → QUESTION |
| QUESTION | Exercise displayed, awaiting answer | User submits → EVALUATING |
| EVALUATING | Validating answer (instant) | Complete → CORRECT or WRONG |
| CORRECT | Green feedback, success message | 1.5s auto OR tap "המשך" → QUESTION or COMPLETED |
| WRONG | Red feedback, correct answer, Hebrew explanation | User taps "המשך" (required) → QUESTION or FAILED |
| FAILED | 0 hearts. Game over screen. | "נסה שוב" → INTRO | "חזור" → IDLE |
| COMPLETED | All exercises done, ≥1 heart. Completion screen. | "המשך" → IDLE (with unlock + XP save) |

### State Rules
- Hearts tracked in Zustand local state, persisted to DB only at COMPLETED or FAILED
- XP calculated at COMPLETED, written to lesson_attempts + profiles.total_xp atomically
- Exercise order fixed by exercise.order_index (no randomization in MVP)
- Progress bar = (current_index / total_exercises) × 100%
- On browser refresh during lesson: return to IDLE (progress lost — acceptable for MVP)

### Zustand Lesson Store Shape
```typescript
interface LessonSessionState {
  lessonId: string;
  exercises: Exercise[];
  currentIndex: number;    // 0-based
  hearts: number;          // starts at 3
  score: number;           // correct answers count
  mistakes: ExerciseMistake[];
  xpEarned: number;
  isPerfect: boolean;
  state: LessonState;      // the 8 states above
  startedAt: Date;
}
```

---

## 9. Gamification Systems

### 9.1 Daily XP Goal System
- Goal options: 10 / 20 / 30 / 50 XP per day
- profiles.daily_xp_goal stores selected value
- profiles.today_xp stores XP earned today (reset via client-side date check)
- profiles.today_date stores last date today_xp was counted
- Dashboard shows progress bar: today_xp / daily_xp_goal
- Daily goal reached: "יעד הושג היום! 🎉" + 5 XP bonus (once per day)

### 9.2 XP Awards
| Action | XP |
|--------|----|
| Lesson completed | 10 XP |
| Lesson perfect (0 mistakes) | 15 XP |
| Lesson replay | 5 XP |
| Daily goal reached | +5 XP bonus |
| Checkpoint lesson | 20 XP |

### 9.3 Hearts System
- 3 hearts per lesson (lesson-scoped in MVP)
- Each wrong answer removes 1 heart
- Exception: Matching Pairs — wrong pair tap does NOT remove hearts
- 0 hearts → FAILED state immediately

### 9.4 Streak System
- A streak day = any day user completes ≥1 non-replay lesson
- Streak increments: today > last_activity_date AND today = last_activity_date + 1 day
- Streak resets: today > last_activity_date + 1 day
- profiles.timezone stores IANA timezone (e.g. "Asia/Jerusalem")
- All date comparisons use user's local timezone
- Danger banner: shown when last_activity_date = yesterday AND no lesson completed today
- Banner text: "הסטריק שלך בסכנה! 🔥 למד שיעור אחד היום כדי לשמור אותו."

### 9.5 Level System
| Level | XP Range | Hebrew Label |
|-------|----------|-------------|
| 1 | 0–49 | מתחיל |
| 2 | 50–149 | לומד |
| 3 | 150–299 | מתקדם |
| 4 | 300–499 | מיומן |
| 5 | 500–749 | מומחה |
| 6 | 750–999 | אלוף |
| 7+ | +250 XP/level | גרנד-מאסטר |

- Level calculated client-side from total_xp (no separate DB field needed)
- Level-up animation triggers when calculated level changes after XP award

### 9.6 Weekly Leaderboard
- Ranked by profiles.weekly_xp (XP earned current Mon–Sun)
- Top 10 displayed, current user highlighted even if outside top 10
- weekly_xp reset every Monday
- MVP: poll every 30 seconds. Advanced: Supabase Realtime.

---

## 10. Database Schema

### profiles
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | References auth.users |
| email | TEXT NOT NULL | |
| username | TEXT UNIQUE NOT NULL | |
| role | TEXT DEFAULT 'user' | user \| admin |
| total_xp | INTEGER DEFAULT 0 | |
| weekly_xp | INTEGER DEFAULT 0 | Resets Monday |
| today_xp | INTEGER DEFAULT 0 | Resets each new day |
| today_date | DATE | Last day today_xp was counted |
| daily_xp_goal | INTEGER DEFAULT 20 | Set in onboarding |
| current_streak | INTEGER DEFAULT 0 | |
| longest_streak | INTEGER DEFAULT 0 | |
| last_activity_date | DATE | In user timezone |
| timezone | TEXT DEFAULT 'Asia/Jerusalem' | IANA string |
| starting_level | TEXT DEFAULT 'beginner' | From onboarding |
| motivation | TEXT | Optional, from onboarding |
| onboarding_completed | BOOLEAN DEFAULT FALSE | |
| created_at | TIMESTAMPTZ DEFAULT NOW() | |

### courses
id, title, description, language_from (he), language_to (en), is_active, created_at

### units
id, course_id, title, description, icon_emoji, color_hex, order_index, created_at

### lessons
id, unit_id, title, description, order_index, xp_reward (10), xp_perfect_bonus (5), xp_replay_reward (5), is_checkpoint (false), exercise_count (10), created_at

### exercises
| Column | Type |
|--------|------|
| id | UUID |
| lesson_id | UUID REFERENCES lessons |
| type | ENUM: multiple_choice \| word_bank \| type_answer \| matching \| complete_sentence \| true_false |
| prompt_text | TEXT NOT NULL |
| prompt_language | TEXT (en\|he) |
| correct_answer | TEXT |
| correct_answer_alternatives | JSONB DEFAULT [] |
| word_bank_words | JSONB DEFAULT [] |
| explanation_he | TEXT NOT NULL |
| order_index | INTEGER NOT NULL |

### exercise_options
id, exercise_id, option_text, option_language, is_correct, pair_group_id (UUID for matching), order_index

### user_progress
id, user_id (UNIQUE per course), course_id, completed_lesson_ids (JSONB array), current_unit_id, current_lesson_id, updated_at

### lesson_attempts
id, user_id, lesson_id, total_exercises, correct_count, hearts_remaining, is_perfect, is_replay, completed, xp_earned, duration_seconds, created_at

### exercise_attempts
id, lesson_attempt_id, exercise_id, user_answer, is_correct, is_near_miss, created_at

### user_mistakes
id, user_id, exercise_id, last_wrong_answer, wrong_count, needs_review, reviewed_at, created_at, updated_at

---

## 11. Screen Acceptance Criteria

### Dashboard — Done When:
1. All data loaded from Supabase on mount
2. Streak matches profiles.current_streak
3. Daily goal bar reflects today_xp accurately
4. Continue button navigates to correct next unlocked lesson
5. Danger banner appears if last_activity_date = yesterday
6. Fully readable in Hebrew RTL

### Learning Path — Done When:
1. Lock/unlock state matches DB completion state
2. Highlighted lesson = lowest-index uncompleted lesson
3. Completed lessons can be replayed
4. Locked lessons cannot be started
5. All 3 MVP units visible

### Lesson Screen — Done When:
1. State machine transitions correctly through all 8 states
2. Progress bar advances each exercise
3. Hearts decrement on WRONG state
4. FAILED triggers at hearts = 0
5. COMPLETED triggers when all exercises done with hearts > 0
6. XP saved to profiles + lesson_attempts after COMPLETED
7. Mistakes saved to user_mistakes
8. All 5 exercise types render and validate correctly
9. Hebrew explanations show on every WRONG state
10. English inputs are dir="ltr"

### Lesson Completion Screen — Done When:
1. XP counter animation plays
2. Correct score displayed
3. Next lesson unlocks after "המשך"
4. Streak updates if first lesson today
5. Daily goal bar updates on return to dashboard

### Profile Screen — Done When:
1. username, level, total_xp, streak (current + longest), join date displayed
2. Accuracy = total correct / total exercise attempts
3. Unit completion breakdown accurate

### Leaderboard — Done When:
1. Top 10 by weekly_xp displayed
2. Current user highlighted
3. Current user rank shown even if outside top 10
4. Data refreshes without full page reload

### Review Mistakes — Done When:
1. All exercises with needs_review = true listed
2. Grouped by unit and lesson
3. Correct answer in review sets needs_review = false
4. Empty state shows when all reviewed

---

## 12. RTL Requirements

- lang="he" dir="rtl" on <html> for all authenticated pages
- Use tailwindcss-rtl plugin or Tailwind logical properties (ms-*, me-*, ps-*, pe-*)
- English text in Hebrew context: wrap in <span dir="ltr">
- Answer inputs for English: dir="ltr" + text-align: left on input element
- Word bank tiles: tiles are dir="ltr", container is dir="rtl"
- Hebrew font: Heebo (Google Fonts)
- English font: Inter or Poppins

---

## 13. Folder Structure

```
src/
  app/
    (public)/              # landing, login, register
    (auth)/                # Next.js middleware protected
      onboarding/
      dashboard/
      path/
      lesson/[id]/
      leaderboard/
      profile/
      review/
      admin/               # role = admin only
  components/
    ui/                    # shadcn/ui base components
    layout/                # AppShell, Sidebar, Header, BottomNav
    lesson/                # LessonEngine, ExerciseRenderer, HeartBar, ProgressBar
    exercises/             # MultipleChoice, WordBank, TypeAnswer, Matching, etc.
    dashboard/             # StreakWidget, XPBar, UnitCard, LeaderboardPreview
    path/                  # PathNode, UnitHeader, LessonNode
  stores/
    lessonStore.ts         # LessonSessionState
    userStore.ts           # profile + auth state
  services/                # All Supabase calls — no direct DB calls in components
    content.ts             # fetch courses, units, lessons, exercises
    progress.ts            # save attempts, update user_progress
    gamification.ts        # XP, streak, level logic
    leaderboard.ts         # fetch/subscribe leaderboard
  lib/
    supabase/              # client + server + middleware
    validators/            # Zod schemas
    constants/             # XP table, level thresholds
    utils/                 # date/timezone, progression logic
  types/                   # TypeScript interfaces for all DB tables
  data/                    # Seed data JSON files
```

---

## 14. Security
- All (auth)/* routes protected by Next.js middleware checking Supabase session
- Unauthenticated users → redirect to /login with returnUrl
- RLS policies on: profiles, user_progress, lesson_attempts, exercise_attempts, user_mistakes
- Policy: users can only SELECT/INSERT/UPDATE their own rows (user_id = auth.uid())
- Content tables (courses, units, lessons, exercises, exercise_options): public SELECT
- Admin routes check profiles.role = admin server-side
- No API keys in client-side code

---

## 15. Development Phases

| Phase | Name | Deliverables |
|-------|------|--------------|
| 1 | Foundation | Setup, DB schema, RLS, Auth, Onboarding, Routes, Base UI, Seed Unit 1 |
| 2 | Learning Engine | Lesson state machine, all 5 exercise types, feedback, hearts, XP, game over, completion |
| 3 | Product Systems | Dashboard, Path, Profile, Leaderboard, Streak, Level-up, Review, Seed Units 2+3 |
| 4 | Polish | Animations, Realtime leaderboard, Checkpoint lessons, Admin page, AI (optional) |

---

## 16. AI Integration (Nice-to-Have — Phase 4 only)

- Use claude-sonnet-4-20250514 via Supabase Edge Function
- Max 2 AI calls per lesson
- Use cases: dynamic Hebrew explanations, hint system, semantic answer evaluation
- Always non-blocking, always has static fallback
- All AI output in Hebrew, 1–2 sentences, beginner-appropriate

---

## 17. Success Criteria

EngliFun v1.0 is complete when:
1. Users can register, complete onboarding, and log in
2. Users can play through 3 units of lessons end-to-end
3. Hearts, XP, streak, and level systems work correctly
4. Leaderboard shows weekly rankings
5. Mistakes can be reviewed
6. UI is fully RTL and Hebrew
7. App is responsive on all screen sizes
8. The experience feels like Duolingo — not a quiz website

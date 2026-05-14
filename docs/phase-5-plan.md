# Phase 5 — Curriculum + Level Routing

> Planning document. No code, no migrations, no commits until each batch is approved.
> Audit-verified against the working tree, `origin/main`, and the live Supabase project `pybobbynrqnmfxlpedmv` at the time of writing.

---

## Decision log (from the conversation that produced this plan)

- The existing 10 lessons (Beginner Unit 1 "ברכות והכרות" and Unit 2 "מספרים 1–20") are **not good enough** and **will be fully replaced** as part of Phase 5. There is no salvage path — fresh lessons, fresh exercises, fresh ordering. The replacement still occupies the same conceptual slots (Greetings → Unit 1, Numbers → Unit 2) but the actual lessons and exercises inside are brand-new content.
- Every other section of the plan below (level architecture, schema, code touchpoints, curriculum map for units 3–10 of Beginner and all of Elementary / Intermediate, implementation order) is approved as-is.

---

## A. Recommended level architecture

**Recommendation: one course per level — add a `level` column to `courses`.**

The DB schema already half-anticipated this: `user_progress.course_id` exists, and the `complete_lesson` RPC already walks **within a single course's units in `order_index` order**, so it's level-agnostic by construction. Three independent courses fit that grain perfectly.

Alternative considered — `level` on `units` — would force every lesson page and the RPC to reason about a synthetic per-level sub-path inside one big course. It would also break a dashboard concept that's already shipping ("course progress %"). Not worth the cleverness.

Concrete shape:

- `courses` rows: `beginner` / `elementary` / `intermediate`, each `is_active = true` and `level` unique.
- A user "is on" exactly one course at a time — the one whose `level` matches `profiles.starting_level`.
- Switching levels (the existing `/api/advance-level` already updates `profiles.starting_level`) is then a **single field change** — no data movement, no row migration. The path screen re-queries with the new level on next render and renders the new course.
- `user_lesson_progress` rows are per `lesson_id` so they survive across courses automatically. If a user re-enters beginner from elementary, their old `completed` rows are still there.
- `profile.total_xp` and `current_streak` are global, intentionally — they don't reset on level up.

Why this is also the safest:

- `getFullCourse()` only needs one extra `WHERE` clause.
- The `complete_lesson` RPC doesn't change at all.
- Existing data: one migration renames the current course's level to `'beginner'` and we're done.

---

## B. Required schema changes

### `006_courses_level` — add the `level` column

1. `ALTER TABLE courses ADD COLUMN level text NOT NULL DEFAULT 'beginner'` with a `CHECK (level IN ('beginner','elementary','intermediate'))`.
2. Backfill: the current single course → `level = 'beginner'`. Title becomes `"אנגלית — מתחילים"` so it reads naturally.
3. `CREATE UNIQUE INDEX courses_level_active_uniq ON courses(level) WHERE is_active = true` — enforces exactly one active course per level, so `single()` queries remain safe.
4. Optional: `ALTER TABLE user_progress ADD COLUMN level text` — denormalised cache so we can show "you're on Elementary" without joining. Not blocking; can skip.

### `007_seed_empty_level_courses` — placeholder courses so every level resolves

Create the two missing course shells:

- `level='elementary'`, `title='אנגלית — בסיסי'`, `is_active=true`, **no units yet**.
- `level='intermediate'`, `title='אנגלית — בינוני'`, `is_active=true`, **no units yet**.

Effect: once `getFullCourse(level)` is wired, an elementary/intermediate user gets a real course row back with `units: []` and the path screen renders an empty-state instead of crashing on `null`.

### `008_wipe_existing_beginner_content` — remove the old Unit 1 + Unit 2 content

The existing 10 lessons and their 100 exercises are being replaced. Pre-launch we have only Yuval + a small handful of test profiles, so a clean wipe is acceptable.

Steps (single transaction):

1. `DELETE FROM exercise_attempts WHERE lesson_attempt_id IN (SELECT id FROM lesson_attempts WHERE lesson_id IN (<old lesson IDs>))`.
2. `DELETE FROM user_mistakes WHERE exercise_id IN (SELECT id FROM exercises WHERE lesson_id IN (<old lesson IDs>))`.
3. `DELETE FROM lesson_attempts WHERE lesson_id IN (<old lesson IDs>)`.
4. `DELETE FROM user_lesson_progress WHERE lesson_id IN (<old lesson IDs>)`.
5. `DELETE FROM exercise_options WHERE exercise_id IN (SELECT id FROM exercises WHERE lesson_id IN (<old lesson IDs>))`.
6. `DELETE FROM exercises WHERE lesson_id IN (<old lesson IDs>)`.
7. `DELETE FROM lessons WHERE id IN (<old lesson IDs>)`.
8. `DELETE FROM units WHERE id IN (<old unit IDs>)`.

`profiles.total_xp`, `current_streak`, `longest_streak`, and `last_activity_date` are **not touched** — Yuval's earned XP/streak survives the content wipe.

### `009_seed_beginner_unit_1_replacement`, `010_seed_beginner_unit_2_replacement`

Two fresh migrations that insert the redesigned Unit 1 and Unit 2 (see section D below for the new content).

### What does NOT change

- `lessons`, `units`, `exercises`, `exercise_options`, `user_lesson_progress`, `lesson_attempts`, `exercise_attempts`, `user_mistakes` schemas.
- The `complete_lesson` RPC.
- XP rules, level thresholds.

### Already-present schema we'll finally start using

- `lessons.is_checkpoint` — set to `true` on the 5th lesson of each unit (the unit's review).
- `lessons.xp_perfect_bonus` already 5. Checkpoint lessons can be tuned to 20 XP later.

---

## C. Required code changes

A small, narrowly-scoped surface. Listed in dependency order.

| File | Change | Why |
|---|---|---|
| `src/services/content.server.ts` | `getFullCourse(level, supabase?)` — adds a required `level` arg, the `.eq("is_active", true)` becomes `.eq("is_active", true).eq("level", level)`. Keep `.single()`. | Single source of truth for course lookup. |
| `src/services/content.ts` | Same treatment for any client-side helpers that fetch course/units. | Consistency. |
| `src/services/progress.server.ts` | `getLessonProgressMap` unchanged (operates on `units` it's given). Auto-init of "first lesson" already uses `units[0].lessons[0]` — once we filter the course by level, this works correctly for whichever course the user is on. | No real change. |
| `src/app/(auth)/path/page.tsx` | Read `profile.starting_level` (already fetched), pass to `getFullCourse(level)`. Add empty-state branch when `course.units.length === 0`. | Path becomes level-aware. |
| `src/app/(auth)/dashboard/page.tsx` | Same — pass `profile.starting_level` to `getFullCourse(level)`. `nextLesson` / `completedCount` / `totalCount` semantics stay scoped to the active course. | Dashboard becomes level-aware. |
| `src/app/(auth)/lesson/[id]/page.tsx` | Optional safety: after fetching the lesson, verify its `unit_id` belongs to the user's current-level course. If not → `redirect("/path")`. | Prevents direct-URL hopping into a course you haven't unlocked. Soft-block, not a blocker for v1. |
| `src/app/api/advance-level/route.ts` | After updating `profiles.starting_level`, **seed the destination course's first lesson** into `user_lesson_progress` as `'unlocked'` (if not already there). | Makes the level-up land on a usable path instead of triggering the auto-init code-path on next render. |
| `src/components/path/course-complete-banner.tsx` | No code change. Semantics already correct — it fires when the *current* course is fully done. | — |
| `src/components/path/learning-path.tsx` | Render an empty-state with the mascot when `units.length === 0`. | UX for level shells that have no content yet. |
| `src/services/leaderboard.ts` | No change. Leaderboard is profile-level (`total_xp` across all courses). | Cross-level competition is a feature. |
| `src/services/gamification.ts` | No change. `getTodayXp` / `getWeeklyXp` are user-scoped, course-agnostic. | — |
| `complete_lesson` RPC | **No change.** It walks within the lesson's own course/unit; level is irrelevant to it. | The hard-won pipeline stays untouched. |
| `src/types/database.ts` | Add `level` to the `Course` interface. | Type safety. |

About 8 files touched, all narrowly. The `complete_lesson` RPC — the single highest-risk surface — is not changing.

---

## D. Full curriculum map

**Convention:** in every unit, **Lesson 5 is the checkpoint** — `is_checkpoint = true`, exercises drawn from the four preceding lessons in proportional mix (≈3 multiple_choice + 3 word_bank + 2 type_answer + 2 matching).

- 10 units × 5 lessons × 10 exercises per lesson = **50 lessons / 500 exercises per level**.
- 3 levels = **150 lessons / 1,500 exercises** total when the curriculum is fully seeded.

All beginner content is fresh — including the replacements for the existing Units 1 and 2.

### Beginner — אנגלית למתחילים (50 lessons, all new)

| # | Unit | Objective | Lesson 1 | Lesson 2 | Lesson 3 | Lesson 4 | Lesson 5 (checkpoint) |
|---|---|---|---|---|---|---|---|
| 1 | Greetings & Hellos (REPLACEMENT) | Greet, say goodbye, basic polite phrases | Hello / Hi / Bye | Good morning / Good night | "How are you?" / "I'm fine, thanks" | Please / Thank you / Sorry / Excuse me | חזרה: ברכות |
| 2 | Introducing Yourself (REPLACEMENT) | Give your name, age, country, nice-to-meet-you | "My name is…" | "I am … years old" | "I'm from Israel" / countries | "Nice to meet you" / "What about you?" | חזרה: היכרות |
| 3 | Pronouns & "to be" | I/you/he/she + am/is/are | I am / I am not | you / we / they are | he / she / it is | yes/no questions with "to be" | חזרה: to be |
| 4 | Numbers 1–20 | Count, ask "how many" | 1–5 | 6–10 | 11–15 | 16–20, "how many?" | חזרה: מספרים |
| 5 | Family & People | Talk about your family | mother / father / parents | brother / sister / siblings | son / daughter / kids | friend / neighbour / person | חזרה: משפחה |
| 6 | Colors & Everyday Objects | Describe objects by color | basic colors (red, blue, green, …) | "What color is …?" | table / chair / book / window | pen / bag / phone / key | חזרה: צבעים וחפצים |
| 7 | Days, Months, Weather | Calendar + small talk | days of the week | months & seasons | weather adjectives (sunny, rainy, cold, hot) | "What's the weather like?" | חזרה: זמן ומזג אוויר |
| 8 | Common Verbs (Present Simple) | Daily actions | eat / drink | sleep / wake up | go / come | work / study / read | חזרה: פעלים בסיסיים |
| 9 | Food, Drinks & Home | Order food, name rooms | bread / cheese / egg | water / juice / coffee | kitchen / bathroom / bedroom | "There is / There are…" | חזרה: אוכל ובית |
| 10 | Beginner Final Review | Mixed mastery across units 1–9 | review 1–3 | review 4–6 | review 7–8 | review 9 | מבחן מסכם — 20 XP |

### Elementary — אנגלית בסיסי (50 lessons)

| # | Unit | Objective | L1 | L2 | L3 | L4 | L5 (checkpoint) |
|---|---|---|---|---|---|---|---|
| 1 | Daily Routine | Describe a typical day | morning routine | at work / school | evening routine | weekends | חזרה: שגרה |
| 2 | Present Continuous | "I am doing X right now" | -ing form | positives | negatives | questions | חזרה: present continuous |
| 3 | Adjectives & Opposites | Describe people & things | size / age | feelings | quality (good / bad) | temperature | חזרה: שמות תואר |
| 4 | Question Words | Ask for information | what / who | where / when | why / how | how much / how many | חזרה: שאלות |
| 5 | Past Simple — Regular | Talk about yesterday | -ed endings | positives | negatives & yes/no | wh-questions | חזרה: עבר רגיל |
| 6 | Past Simple — Irregular | Common irregular verbs | go / see / do | eat / drink / have | come / say / give | "yesterday I…" stories | חזרה: עבר חריג |
| 7 | Articles & Plurals | a / an / the / -s | a vs an | the | plural rules | zero article | חזרה: יידוע ורבים |
| 8 | Prepositions of Place | Locate things | in / on / under | next to / between | behind / in front of | giving directions | חזרה: יחס מקום |
| 9 | Time, Dates & Numbers 20–100 | Tell time and dates | telling time | dates ("on May 14") | 20–100 | prices & quantities | חזרה: זמן ומספרים |
| 10 | Elementary Final Review | Mixed review | review 1–3 | review 4–6 | review 7–8 | review 9 | מבחן מסכם — 20 XP |

### Intermediate — אנגלית בינוני (50 lessons)

| # | Unit | Objective | L1 | L2 | L3 | L4 | L5 (checkpoint) |
|---|---|---|---|---|---|---|---|
| 1 | Talking about the Future | will / going to / present continuous | "will" — predictions | "going to" — plans | present continuous for arrangements | "when I'm older…" | חזרה: עתיד |
| 2 | Modal Verbs | Possibility, advice, obligation | can / could | should / shouldn't | must / mustn't | might / may | חזרה: פעלים עזר |
| 3 | Present Perfect | Connect past to now | have / has + past participle | already / yet / just | for vs since | ever / never | חזרה: present perfect |
| 4 | Comparatives & Superlatives | Compare things | -er forms | more + adj | the most / -est | as…as | חזרה: השוואות |
| 5 | Conditionals 0 & 1 | If-then sentences | zero conditional | first conditional positive | first conditional negative | unless / when | חזרה: תנאי 0 ו-1 |
| 6 | Phrasal Verbs (basic 20) | Idiomatic two-word verbs | turn on / off | look for / look after | pick up / put down | get on / get off | חזרה: פעלים מורכבים |
| 7 | Relative Clauses | who / which / that / where | "who" — people | "which / that" — things | "where" — places | defining vs non-defining | חזרה: משפטי לוואי |
| 8 | Passive Voice (basic) | "is made" / "was built" | passive present | passive past | by + agent | passives in news | חזרה: סביל |
| 9 | Reported Speech (basic) | "He said that…" | reported statements | tense shift | reported questions | "told" vs "said" | חזרה: דיבור עקיף |
| 10 | Intermediate Final Review | Mixed mastery | review 1–3 | review 4–6 | review 7–8 | review 9 | מבחן מסכם — 20 XP |

### Checkpoint UI

`is_checkpoint` is already in the schema. Visual treatment (different icon / border on the path) is a small, optional polish task — out of scope for the content batches, in scope for a later batch.

---

## E. Safe implementation order

Five small, independently shippable batches. Each batch ends with `tsc / lint / build` clean + a manual smoke test + a single commit + push.

### Batch 1 — Plumbing only (no new content). *~1 hour.*

- Migration `006`: add `courses.level`, backfill current course to `beginner`, add the unique partial index.
- Migration `007`: insert empty `elementary` and `intermediate` course rows.
- Code: `getFullCourse(level)` accepts level; `path/page.tsx` and `dashboard/page.tsx` pass `profile.starting_level`; empty-state in `learning-path.tsx` when `units.length === 0`; `advance-level` route seeds the destination course's first lesson unlock if any lessons exist.
- Smoke test: Yuval (`elementary`) hits `/path` → friendly empty state. Manually flip his level back to `beginner` via MCP SQL → he sees the existing 10 lessons exactly as before, no regressions in dashboard/completion flow.
- **No new content seeded yet.** This batch is purely structural so we can ship and confirm the level switch works without any new lesson surface area.

### Batch 2 — Wipe & replace Beginner Unit 1 and Unit 2. *~3 hours.*

- Migration `008`: surgical wipe of the old Unit 1 and Unit 2 plus all attached lessons, exercises, options, lesson_attempts, exercise_attempts, user_mistakes, user_lesson_progress for those lessons. Preserves `profiles` columns (XP, streak, etc).
- Migration `009`: seed the new Beginner Unit 1 ("Greetings & Hellos") — 5 lessons, lesson 5 is `is_checkpoint = true`, 50 exercises total.
- Migration `010`: seed the new Beginner Unit 2 ("Introducing Yourself") — same shape.
- No code changes. Validate end-to-end: path now shows the two new units, Yuval (flipped back to beginner for this test) can play L1 of Unit 1, complete it, XP increments correctly, next lesson unlocks, replays work, checkpoints play normally.
- This batch is also the **content authoring pipeline validation step** — once the format and seed conventions are confirmed working, the remaining units in section E follow the same pattern.

### Batch 3 — Beginner Units 3–10 (8 fresh units). *~1.5 days at 2 units / day.*

- One migration per unit (or 2–3 grouped together for fewer file churn). Each migration is 5 lessons + 50 exercises.
- Smoke-test each new unit before pushing the next.

### Batch 4 — Elementary Units 1–10. *~1.5 days.*

- Same authoring pipeline, inserts under the elementary course shell created in Batch 1.
- A user who flips to elementary now lands on a real path.

### Batch 5 — Intermediate Units 1–10. *~1.5 days.*

- Same.

### Optional Batch 6 — Polish.

- Checkpoint visual treatment on `LessonNode`.
- Show current-level chip on the dashboard greeting card ("רמה: בסיסי").
- Allow downgrade as well as upgrade in `/api/advance-level` (for users who advanced too fast).

Rough total estimate after Batch 1 ships: **~5 working days** of focused content authoring. Engine work is essentially done.

---

## F. First coding task — Batch 1

### Title

*Phase 5 Batch 1 — Courses get a `level` column; path and dashboard route by user level.*

### Deliverables (sequenced)

1. **`supabase/migrations/006_courses_level.sql`** — applied via `mcp__supabase__apply_migration`, verified with `execute_sql`.
2. **`supabase/migrations/007_seed_empty_level_courses.sql`** — applied + verified.
3. **Code commit** touching:
   - `src/services/content.server.ts`
   - `src/services/content.ts` (if applicable)
   - `src/types/database.ts`
   - `src/app/(auth)/path/page.tsx`
   - `src/app/(auth)/dashboard/page.tsx`
   - `src/components/path/learning-path.tsx`
   - `src/app/api/advance-level/route.ts`

### Verification

- `npx tsc --noEmit --incremental false` → 0.
- `npm run lint` → 0 errors.
- `npm run build` → 0.
- MCP SQL: confirm `courses` has 3 rows with distinct `level`s, all `is_active = true`, unique index in place.
- Live: Yuval (currently `starting_level = elementary`) opens `/path` → empty-state with mascot. Hits "התקדם לרמה הבאה" → `intermediate` → still empty-state. Manually flip his level back to `beginner` via SQL → sees the original 10 lessons (still in place at this point in time — they will only be wiped in Batch 2). Lesson save / path / dashboard all still work.

### Final report (after Batch 1 push)

- Files changed.
- Migration verification SQL with results.
- Smoke-test outcomes for each level.
- Confirm `complete_lesson` RPC, header pills, profile stats, leaderboard all behave identically to pre-Phase-5.

### Explicit non-goals for Batch 1

- No new lessons or exercises.
- No content wipe yet (that's Batch 2).
- No checkpoint visuals.
- No UI redesign of the path.
- No changes to the `complete_lesson` RPC.
- No changes to scoring or XP rules.

---

## Standing constraints across all Phase 5 batches

- Do **not** modify the `complete_lesson` RPC.
- Do **not** add AI / audio / admin features.
- Commits are human-style: no `Co-Authored-By:` AI lines, no "Generated by" footers.
- Push only via `git@github-personal:yuvalrauser/EngliFun.git`. No HTTPS.
- Use the project-scoped Supabase MCP (`pybobbynrqnmfxlpedmv`) for any DB read or DDL.
- After every batch: `tsc / lint / build` all green, manual smoke test passes, one logical commit, one push, short final report.
- `.claude/settings.local.json` is never staged.

# EngliFun

A Duolingo-style web app for learning English, built for Hebrew speakers. Final-year project.

**Live app:** [engli-fun-vert.vercel.app](https://engli-fun-vert.vercel.app/)

The user picks a starting level (Beginner / Elementary / Intermediate), works through a gated path of lessons earning XP, hearts and streak points, sees themselves on a leaderboard, can revisit past mistakes from a dedicated `/review` page, and can build their own custom UNITs from five different exercise types.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS v4 (RTL-native, dvh, safe-area-inset) |
| Client state | Zustand |
| Drag & Drop | @dnd-kit (core + sortable) |
| Auth + DB + RLS | Supabase (Postgres 15 + PL/pgSQL RPC) |
| Deploy | Vercel |
| Fonts | Heebo (HE) + Inter (EN) via `next/font` |

## Features

- **Learning path** — 3 courses (beginner / elementary / intermediate), each with 10 UNITs × 5 lessons × up to 10 exercises.
- **5 exercise types** — matching, multiple_choice, complete_sentence, word_bank, type_answer.
- **Lesson engine** — 7-state machine: `intro → active_question → correct_feedback / wrong_feedback → transition → completed / failed`.
- **XP, streak, hearts** — every lesson completion is routed through a single atomic PL/pgSQL RPC (`complete_lesson`) that updates everything in one transaction.
- **Mistake review** — `/review` groups wrong attempts by UNIT and lesson, with a "mark as reviewed" action persisted to the DB.
- **Custom user units** — users build their own UNITs (up to 5 lessons each), drag-and-drop to place them on the path, edit each of the 5 exercise types in a dedicated editor, with transitive RLS hiding the content from other users. Custom lessons award 0 XP (to prevent grinding) but are freely replayable.
- **Mobile-first** — dvh, safe-area-inset, and JS-based zoom blocking that actually works on iOS Safari.

## Data Model

```
courses
 └── units            (owner_id null = global | uuid = custom, position numeric, is_draft)
      └── lessons
           └── exercises
                └── exercise_options   (matching uses pair_group_id)
```

Progress tables: `user_lesson_progress`, `user_progress`, `lesson_attempts`, `exercise_attempts`, `user_mistakes`, `profiles`.

## Security

Every table is protected by **Row Level Security**. Custom-unit content is filtered transitively: `lessons` checks its parent `units.owner_id`, `exercises` checks through `lessons`, and so on. There is no path to read another user's content even if the application code is buggy.

## Try It

The production app is hosted on Vercel: **[engli-fun-vert.vercel.app](https://engli-fun-vert.vercel.app/)**.

## Local Development

Prerequisites: Node.js 20+, a Supabase project.

```bash
git clone git@github.com:yuvalrauser/EngliFun.git
cd EngliFun
npm install
```

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

Apply the migrations from `supabase/migrations/` in order (`001_…` through the latest) using the Supabase CLI or MCP, then:

```bash
npm run dev
```

## Scripts

- `npm run dev` — dev server with Turbopack
- `npm run build` — production build
- `npm run start` — run the build
- `npm run lint` — ESLint

## Project Structure

```
src/
 ├─ app/                  Next.js App Router
 │   ├─ (auth)/           authenticated pages: path, lesson, profile, review, dashboard
 │   └─ (public)/         login / signup / reset-password
 ├─ components/           ui, lesson engine, path, exercises, editors
 ├─ services/             content/progress fetchers (server)
 ├─ stores/               Zustand: lessonStore, userStore
 ├─ lib/                  supabase clients, utils, constants
 ├─ types/                database + lesson types
 └─ middleware.ts         Edge auth gating

supabase/migrations/      sql migrations (source of truth)
docs/architecture-summary.md   extended architecture write-up
```

## Further Reading

[docs/architecture-summary.md](docs/architecture-summary.md) — full architecture overview: layers, data model, the `complete_lesson` RPC, RLS design, patterns, and trade-offs.

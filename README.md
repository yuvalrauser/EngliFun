# EngliFun

אפליקציית ווב בסגנון Duolingo ללימוד אנגלית עבור דוברי עברית. נבנתה כפרויקט גמר.

המשתמש מתחיל ברמה (Beginner / Elementary / Intermediate), עובר מסלול שיעורים סדרתי עם XP, לבבות, streak ולוח מובילים, יכול לחזור על טעויות בדף `/review`, ולבנות לעצמו יחידות מותאמות (UNITs) משלו עם 5 סוגי תרגילים שונים.

## Tech Stack

| שכבה | טכנולוגיה |
|---|---|
| Framework | Next.js 16 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| UI | React 19 + Tailwind CSS v4 (RTL native, dvh, safe-area-inset) |
| Client state | Zustand |
| Drag & Drop | @dnd-kit (core + sortable) |
| Auth + DB + RLS | Supabase (Postgres 15 + PL/pgSQL RPC) |
| Deploy | Vercel |
| Fonts | Heebo (HE) + Inter (EN) דרך `next/font` |

## פיצ'רים עיקריים

- **מסלול לימוד**: 3 קורסים (beginner/elementary/intermediate), כל אחד 10 UNITs × 5 שיעורים × עד 10 תרגילים.
- **5 סוגי תרגילים**: matching, multiple_choice, complete_sentence, word_bank, type_answer.
- **מנוע שיעור** (state machine 7 מצבים): intro → active_question → correct_feedback / wrong_feedback → transition → completed / failed.
- **XP + streak + לבבות**: כל סיום שיעור עובר דרך RPC אטומי בודד (`complete_lesson`) שמעדכן את הכל ב-transaction.
- **חזרה על טעויות**: דף `/review` מציג תרגילים שגויים מקובצים לפי UNIT ושיעור, עם סימון "נסקר" שנשמר ל-DB.
- **Custom user units**: המשתמש בונה יחידות משלו (עד 5 שיעורים), עם drag-and-drop למיקום במסלול, עורכים מלאים ל-5 סוגי התרגילים, ו-RLS שמסתיר את התוכן ממשתמשים אחרים. שיעורים מותאמים מקבלים 0 XP (מניעת grinding) אבל ניתנים לחזרה חופשית.
- **מובייל-ראשון**: dvh / safe-area-inset / חסימת זום מותאמת ל-iOS.

## מבנה הנתונים

```
courses
 └── units            (owner_id null = גלובלי | uuid = מותאם, position numeric, is_draft)
      └── lessons
           └── exercises
                └── exercise_options   (matching משתמש ב-pair_group_id)
```

טבלאות progress: `user_lesson_progress`, `user_progress`, `lesson_attempts`, `exercise_attempts`, `user_mistakes`, `profiles`.

## אבטחה

כל הטבלאות מאחורי **Row Level Security**. תוכן יחידות מסונן transitive: `lessons` בודק את ה-`units.owner_id` שלו, `exercises` דרך `lessons`, וכן הלאה. אין דרך לקרוא תוכן של משתמש אחר גם אם הקוד פגום.

## התחלה מהירה

דרישות מקדימות: Node.js 20+, חשבון Supabase.

```bash
git clone git@github.com:yuvalrauser/EngliFun.git
cd EngliFun
npm install
```

צור `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
```

הרץ את המיגרציות מ-`supabase/migrations/` בסדר עולה (`001_…` עד הקובץ האחרון) דרך Supabase CLI או ה-MCP.

```bash
npm run dev
```

האפליקציה תרוץ ב-[http://localhost:3000](http://localhost:3000).

## סקריפטים

- `npm run dev` — שרת פיתוח עם Turbopack
- `npm run build` — build לפרודקשן
- `npm run start` — הרצת build
- `npm run lint` — ESLint

## מבנה הקבצים

```
src/
 ├─ app/                  Next.js App Router
 │   ├─ (auth)/           דפים מאומתים: path, lesson, profile, review, dashboard
 │   └─ (public)/         login / signup / reset-password
 ├─ components/           ui, lesson engine, path, exercises, editors
 ├─ services/             content/progress fetchers (server)
 ├─ stores/               Zustand: lessonStore, userStore
 ├─ lib/                  supabase clients, utils, constants
 ├─ types/                database + lesson types
 └─ middleware.ts         Edge auth gating

supabase/migrations/      sql migrations (source of truth)
docs/architecture-summary.md   סיכום ארכיטקטוני מורחב
```

## תיעוד נוסף

[docs/architecture-summary.md](docs/architecture-summary.md) — סקירה ארכיטקטונית מלאה: שכבות, מודל נתונים, ה-RPC `complete_lesson`, ה-RLS, patterns, ו-trade-offs.

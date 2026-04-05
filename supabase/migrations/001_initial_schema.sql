-- ============================================================
-- EngliFun — Initial Schema Migration
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  username text unique not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  total_xp integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_activity_date date,
  timezone text not null default 'Asia/Jerusalem',
  daily_xp_goal integer not null default 20 check (daily_xp_goal in (10, 20, 30, 50)),
  starting_level text not null default 'beginner' check (starting_level in ('beginner', 'elementary', 'intermediate')),
  motivation text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || left(new.id::text, 8))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 2. COURSES
-- ============================================================
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  language_from text not null default 'he',
  language_to text not null default 'en',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 3. UNITS
-- ============================================================
create table public.units (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  icon_emoji text,
  color_hex text,
  order_index integer not null,
  created_at timestamptz not null default now(),
  unique (course_id, order_index)
);

-- ============================================================
-- 4. LESSONS
-- ============================================================
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  unit_id uuid not null references public.units(id) on delete cascade,
  title text not null,
  description text,
  order_index integer not null,
  xp_reward integer not null default 10,
  xp_perfect_bonus integer not null default 5,
  xp_replay_reward integer not null default 5,
  is_checkpoint boolean not null default false,
  exercise_count integer not null default 10,
  created_at timestamptz not null default now(),
  unique (unit_id, order_index)
);

-- ============================================================
-- 5. EXERCISES
-- ============================================================
create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  type text not null check (type in (
    'multiple_choice', 'word_bank', 'type_answer',
    'matching', 'complete_sentence'
  )),
  prompt_text text not null,
  prompt_language text not null default 'en' check (prompt_language in ('en', 'he')),
  correct_answer text,
  correct_answer_alternatives jsonb not null default '[]'::jsonb,
  word_bank_words jsonb not null default '[]'::jsonb,
  explanation_he text not null,
  order_index integer not null,
  created_at timestamptz not null default now(),
  unique (lesson_id, order_index)
);

-- ============================================================
-- 6. EXERCISE OPTIONS (for multiple_choice, matching, complete_sentence)
-- ============================================================
create table public.exercise_options (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  option_text text not null,
  option_language text not null default 'en' check (option_language in ('en', 'he')),
  is_correct boolean not null default false,
  pair_group_id uuid,
  order_index integer not null default 0
);

-- ============================================================
-- 7. USER LESSON PROGRESS (replaces completed_lesson_ids JSONB)
-- ============================================================
create table public.user_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'locked' check (status in ('locked', 'unlocked', 'completed')),
  completed_at timestamptz,
  best_score integer,
  last_attempt_at timestamptz,
  unique (user_id, lesson_id)
);

-- ============================================================
-- 8. USER PROGRESS (course-level tracking)
-- ============================================================
create table public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  current_unit_id uuid references public.units(id),
  current_lesson_id uuid references public.lessons(id),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

-- ============================================================
-- 9. LESSON ATTEMPTS
-- ============================================================
create table public.lesson_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  total_exercises integer not null,
  correct_count integer not null,
  hearts_remaining integer not null,
  is_perfect boolean not null default false,
  is_replay boolean not null default false,
  completed boolean not null default false,
  xp_earned integer not null default 0,
  daily_goal_bonus boolean not null default false,
  duration_seconds integer,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 10. EXERCISE ATTEMPTS
-- ============================================================
create table public.exercise_attempts (
  id uuid primary key default gen_random_uuid(),
  lesson_attempt_id uuid not null references public.lesson_attempts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  user_answer text,
  is_correct boolean not null,
  is_near_miss boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 11. USER MISTAKES
-- ============================================================
create table public.user_mistakes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  last_wrong_answer text,
  wrong_count integer not null default 1,
  needs_review boolean not null default true,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, exercise_id)
);

-- ============================================================
-- 12. INDEXES
-- ============================================================
create index idx_units_course_order on public.units(course_id, order_index);
create index idx_lessons_unit_order on public.lessons(unit_id, order_index);
create index idx_exercises_lesson_order on public.exercises(lesson_id, order_index);
create index idx_exercise_options_exercise on public.exercise_options(exercise_id);
create index idx_user_lesson_progress_user on public.user_lesson_progress(user_id);
create index idx_user_lesson_progress_status on public.user_lesson_progress(user_id, status);
create index idx_lesson_attempts_user on public.lesson_attempts(user_id, created_at desc);
create index idx_lesson_attempts_user_lesson on public.lesson_attempts(user_id, lesson_id);
create index idx_exercise_attempts_lesson_attempt on public.exercise_attempts(lesson_attempt_id);
create index idx_user_mistakes_user_review on public.user_mistakes(user_id, needs_review);
create index idx_profiles_total_xp on public.profiles(total_xp desc);

-- ============================================================
-- 13. ROW LEVEL SECURITY
-- ============================================================

-- Profiles: read own full row, read others' public fields via leaderboard view
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Content tables: public read for all authenticated users
alter table public.courses enable row level security;
create policy "Authenticated users can read courses"
  on public.courses for select
  using (auth.role() = 'authenticated');

alter table public.units enable row level security;
create policy "Authenticated users can read units"
  on public.units for select
  using (auth.role() = 'authenticated');

alter table public.lessons enable row level security;
create policy "Authenticated users can read lessons"
  on public.lessons for select
  using (auth.role() = 'authenticated');

alter table public.exercises enable row level security;
create policy "Authenticated users can read exercises"
  on public.exercises for select
  using (auth.role() = 'authenticated');

alter table public.exercise_options enable row level security;
create policy "Authenticated users can read exercise_options"
  on public.exercise_options for select
  using (auth.role() = 'authenticated');

-- User data tables: own rows only
alter table public.user_lesson_progress enable row level security;
create policy "Users can read own lesson progress"
  on public.user_lesson_progress for select
  using (auth.uid() = user_id);
create policy "Users can insert own lesson progress"
  on public.user_lesson_progress for insert
  with check (auth.uid() = user_id);
create policy "Users can update own lesson progress"
  on public.user_lesson_progress for update
  using (auth.uid() = user_id);

alter table public.user_progress enable row level security;
create policy "Users can read own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);
create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);
create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);

alter table public.lesson_attempts enable row level security;
create policy "Users can read own attempts"
  on public.lesson_attempts for select
  using (auth.uid() = user_id);
create policy "Users can insert own attempts"
  on public.lesson_attempts for insert
  with check (auth.uid() = user_id);

alter table public.exercise_attempts enable row level security;
create policy "Users can read own exercise attempts"
  on public.exercise_attempts for select
  using (
    exists (
      select 1 from public.lesson_attempts la
      where la.id = lesson_attempt_id and la.user_id = auth.uid()
    )
  );
-- Insert via lesson_attempt_id join (user owns the parent lesson_attempt)
create policy "Users can insert own exercise attempts"
  on public.exercise_attempts for insert
  with check (
    exists (
      select 1 from public.lesson_attempts la
      where la.id = lesson_attempt_id and la.user_id = auth.uid()
    )
  );

alter table public.user_mistakes enable row level security;
create policy "Users can read own mistakes"
  on public.user_mistakes for select
  using (auth.uid() = user_id);
create policy "Users can insert own mistakes"
  on public.user_mistakes for insert
  with check (auth.uid() = user_id);
create policy "Users can update own mistakes"
  on public.user_mistakes for update
  using (auth.uid() = user_id);

-- ============================================================
-- 14. LEADERBOARD VIEW (exposes only public fields)
-- ============================================================
create or replace view public.leaderboard_view as
select
  id,
  username,
  total_xp,
  current_streak
from public.profiles
order by total_xp desc;

-- Grant access to the view (bypasses profiles RLS)
grant select on public.leaderboard_view to authenticated;

-- ============================================================
-- 15. COMPLETE LESSON RPC (atomic lesson completion)
-- ============================================================
create or replace function public.complete_lesson(
  p_lesson_id uuid,
  p_total_exercises integer,
  p_correct_count integer,
  p_hearts_remaining integer,
  p_is_perfect boolean,
  p_duration_seconds integer,
  p_exercise_attempts jsonb -- array of {exercise_id, user_answer, is_correct, is_near_miss}
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_user_id uuid := auth.uid();
  v_lesson record;
  v_is_replay boolean;
  v_xp integer;
  v_attempt_id uuid;
  v_today date;
  v_last_activity date;
  v_new_streak integer;
  v_longest integer;
  v_daily_xp integer;
  v_daily_goal integer;
  v_daily_goal_bonus boolean := false;
  v_attempt jsonb;
  v_unit record;
  v_next_lesson record;
begin
  -- Get lesson details
  select l.*, u.course_id, u.id as u_id, u.order_index as unit_order
  into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where l.id = p_lesson_id;

  if not found then
    raise exception 'Lesson not found';
  end if;

  -- Check if replay
  select exists(
    select 1 from public.user_lesson_progress
    where user_id = v_user_id and lesson_id = p_lesson_id and status = 'completed'
  ) into v_is_replay;

  -- Calculate XP
  if v_is_replay then
    v_xp := v_lesson.xp_replay_reward;  -- 5 XP, no perfect bonus
  elsif p_is_perfect then
    v_xp := v_lesson.xp_reward + v_lesson.xp_perfect_bonus;  -- 10 + 5 = 15
  else
    v_xp := v_lesson.xp_reward;  -- 10
  end if;

  -- Check daily goal bonus
  v_today := (now() at time zone (
    select timezone from public.profiles where id = v_user_id
  ))::date;

  select daily_xp_goal, last_activity_date, current_streak, longest_streak
  into v_daily_goal, v_last_activity, v_new_streak, v_longest
  from public.profiles where id = v_user_id;

  -- Compute today's XP so far (before this lesson)
  select coalesce(sum(xp_earned), 0) into v_daily_xp
  from public.lesson_attempts
  where user_id = v_user_id
    and completed = true
    and (created_at at time zone (
      select timezone from public.profiles where id = v_user_id
    ))::date = v_today;

  -- Award daily goal bonus if this lesson pushes past the goal (and not already awarded today)
  if v_daily_xp < v_daily_goal and (v_daily_xp + v_xp) >= v_daily_goal then
    -- Check no bonus already awarded today
    if not exists (
      select 1 from public.lesson_attempts
      where user_id = v_user_id
        and daily_goal_bonus = true
        and (created_at at time zone (
          select timezone from public.profiles where id = v_user_id
        ))::date = v_today
    ) then
      v_xp := v_xp + 5;
      v_daily_goal_bonus := true;
    end if;
  end if;

  -- Insert lesson attempt
  insert into public.lesson_attempts (
    user_id, lesson_id, total_exercises, correct_count, hearts_remaining,
    is_perfect, is_replay, completed, xp_earned, daily_goal_bonus, duration_seconds
  ) values (
    v_user_id, p_lesson_id, p_total_exercises, p_correct_count, p_hearts_remaining,
    p_is_perfect, v_is_replay, true, v_xp, v_daily_goal_bonus, p_duration_seconds
  ) returning id into v_attempt_id;

  -- Insert exercise attempts
  for v_attempt in select * from jsonb_array_elements(p_exercise_attempts)
  loop
    insert into public.exercise_attempts (
      lesson_attempt_id, exercise_id, user_answer, is_correct, is_near_miss
    ) values (
      v_attempt_id,
      (v_attempt->>'exercise_id')::uuid,
      v_attempt->>'user_answer',
      (v_attempt->>'is_correct')::boolean,
      coalesce((v_attempt->>'is_near_miss')::boolean, false)
    );

    -- Upsert mistakes for wrong answers
    if not (v_attempt->>'is_correct')::boolean then
      insert into public.user_mistakes (user_id, exercise_id, last_wrong_answer, wrong_count, needs_review)
      values (v_user_id, (v_attempt->>'exercise_id')::uuid, v_attempt->>'user_answer', 1, true)
      on conflict (user_id, exercise_id) do update set
        last_wrong_answer = excluded.last_wrong_answer,
        wrong_count = user_mistakes.wrong_count + 1,
        needs_review = true,
        updated_at = now();
    end if;
  end loop;

  -- Update streak
  if v_last_activity is null or v_last_activity < v_today then
    if v_last_activity = v_today - 1 then
      -- Consecutive day
      v_new_streak := v_new_streak + 1;
    elsif v_last_activity is null or v_last_activity < v_today - 1 then
      -- Gap > 1 day (or first ever) → reset to 1
      v_new_streak := 1;
    end if;
    -- Same day → no change (handled by the outer if)

    if v_new_streak > v_longest then
      v_longest := v_new_streak;
    end if;
  end if;

  -- Update profile
  update public.profiles set
    total_xp = total_xp + v_xp,
    current_streak = v_new_streak,
    longest_streak = v_longest,
    last_activity_date = v_today
  where id = v_user_id;

  -- Update lesson progress (if not replay)
  if not v_is_replay then
    insert into public.user_lesson_progress (user_id, lesson_id, status, completed_at, best_score)
    values (v_user_id, p_lesson_id, 'completed', now(), p_correct_count)
    on conflict (user_id, lesson_id) do update set
      status = 'completed',
      completed_at = now(),
      best_score = greatest(user_lesson_progress.best_score, p_correct_count),
      last_attempt_at = now();

    -- Unlock next lesson in same unit
    select l.* into v_next_lesson
    from public.lessons l
    where l.unit_id = v_lesson.unit_id
      and l.order_index = v_lesson.order_index + 1;

    if found then
      insert into public.user_lesson_progress (user_id, lesson_id, status)
      values (v_user_id, v_next_lesson.id, 'unlocked')
      on conflict (user_id, lesson_id) do nothing;
    else
      -- Current unit is done — unlock first lesson of next unit
      select u.* into v_unit
      from public.units u
      where u.course_id = v_lesson.course_id
        and u.order_index = v_lesson.unit_order + 1;

      if found then
        select l.* into v_next_lesson
        from public.lessons l
        where l.unit_id = v_unit.id
        order by l.order_index asc
        limit 1;

        if found then
          insert into public.user_lesson_progress (user_id, lesson_id, status)
          values (v_user_id, v_next_lesson.id, 'unlocked')
          on conflict (user_id, lesson_id) do nothing;
        end if;
      end if;
    end if;
  else
    -- Replay: just update last_attempt_at and best_score
    update public.user_lesson_progress set
      best_score = greatest(best_score, p_correct_count),
      last_attempt_at = now()
    where user_id = v_user_id and lesson_id = p_lesson_id;
  end if;

  -- Update course-level progress pointer
  insert into public.user_progress (user_id, course_id, current_unit_id, current_lesson_id)
  values (v_user_id, v_lesson.course_id, v_lesson.u_id, p_lesson_id)
  on conflict (user_id, course_id) do update set
    current_unit_id = coalesce(
      (select u.id from public.units u
       join public.lessons l on l.unit_id = u.id
       join public.user_lesson_progress ulp on ulp.lesson_id = l.id and ulp.user_id = v_user_id
       where u.course_id = v_lesson.course_id and ulp.status = 'unlocked'
       order by u.order_index asc, l.order_index asc
       limit 1),
      user_progress.current_unit_id
    ),
    current_lesson_id = coalesce(
      (select l.id from public.lessons l
       join public.user_lesson_progress ulp on ulp.lesson_id = l.id and ulp.user_id = v_user_id
       where ulp.status = 'unlocked'
       order by l.order_index asc
       limit 1),
      user_progress.current_lesson_id
    ),
    updated_at = now();

  return jsonb_build_object(
    'attempt_id', v_attempt_id,
    'xp_earned', v_xp,
    'is_replay', v_is_replay,
    'daily_goal_bonus', v_daily_goal_bonus,
    'current_streak', v_new_streak,
    'total_xp', (select total_xp from public.profiles where id = v_user_id)
  );
end;
$$;

-- ============================================================
-- 005_fix_complete_lesson_pipeline.sql
-- Canonical complete_lesson RPC with validated progress updates.
-- Run after 001/002/003/004.
-- ============================================================

drop function if exists public.complete_lesson(
  uuid,
  integer,
  integer,
  integer,
  boolean,
  integer,
  jsonb
);

drop function if exists public.complete_lesson(
  uuid,
  uuid,
  integer,
  integer,
  integer,
  boolean,
  integer,
  jsonb
);

create or replace function public.complete_lesson(
  p_user_id uuid,
  p_lesson_id uuid,
  p_total_exercises integer,
  p_correct_count integer,
  p_hearts_remaining integer,
  p_is_perfect boolean,
  p_duration_seconds integer,
  p_exercise_attempts jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auth_user_id uuid := auth.uid();
  v_lesson record;
  v_profile record;
  v_attempt_id uuid;
  v_attempt jsonb;
  v_actual_total integer;
  v_payload_count integer;
  v_valid_correct_count integer;
  v_valid_is_perfect boolean;
  v_is_replay boolean;
  v_xp integer;
  v_today date;
  v_daily_xp integer;
  v_daily_goal_reached boolean := false;
  v_streak_updated boolean := false;
  v_new_streak integer;
  v_longest_streak integer;
  v_next_lesson_id uuid;
  v_current_lesson_id uuid;
  v_current_unit_id uuid;
  v_total_xp integer;
begin
  if v_auth_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_user_id is null or p_user_id <> v_auth_user_id then
    raise exception 'User mismatch';
  end if;

  if p_lesson_id is null then
    raise exception 'Lesson id is required';
  end if;

  if p_hearts_remaining is null or p_hearts_remaining < 0 or p_hearts_remaining > 3 then
    raise exception 'Invalid hearts remaining';
  end if;

  if p_exercise_attempts is null or jsonb_typeof(p_exercise_attempts) <> 'array' then
    raise exception 'Exercise attempts must be a JSON array';
  end if;

  select
    l.id,
    l.unit_id,
    l.order_index,
    l.xp_reward,
    l.xp_perfect_bonus,
    l.xp_replay_reward,
    u.course_id,
    u.order_index as unit_order
  into v_lesson
  from public.lessons l
  join public.units u on u.id = l.unit_id
  where l.id = p_lesson_id;

  if not found then
    raise exception 'Lesson not found';
  end if;

  select *
  into v_profile
  from public.profiles
  where id = p_user_id;

  if not found then
    raise exception 'Profile not found';
  end if;

  select count(*)::integer
  into v_actual_total
  from public.exercises
  where lesson_id = p_lesson_id;

  if v_actual_total <= 0 then
    raise exception 'Lesson has no exercises';
  end if;

  if p_total_exercises is null or p_total_exercises <> v_actual_total then
    raise exception 'Invalid total exercise count';
  end if;

  select count(*)::integer
  into v_payload_count
  from (
    select distinct attempt.value->>'exercise_id' as exercise_id
    from jsonb_array_elements(p_exercise_attempts) as attempt(value)
    where attempt.value ? 'exercise_id'
  ) distinct_attempts;

  if v_payload_count <> v_actual_total then
    raise exception 'Exercise attempt count does not match lesson exercise count';
  end if;

  if (
    select count(*)::integer
    from jsonb_array_elements(p_exercise_attempts) as attempt(value)
  ) <> v_actual_total then
    raise exception 'Duplicate exercise attempts are not allowed';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_exercise_attempts) as attempt(value)
    left join public.exercises e
      on e.id = (attempt.value->>'exercise_id')::uuid
     and e.lesson_id = p_lesson_id
    where not (attempt.value ? 'exercise_id')
       or e.id is null
  ) then
    raise exception 'Exercise attempts contain an exercise outside this lesson';
  end if;

  select count(*)::integer
  into v_valid_correct_count
  from jsonb_array_elements(p_exercise_attempts) as attempt(value)
  where coalesce((attempt.value->>'is_correct')::boolean, false) = true;

  if p_correct_count is null
     or p_correct_count < 0
     or p_correct_count > v_actual_total
     or p_correct_count <> v_valid_correct_count then
    raise exception 'Invalid correct exercise count';
  end if;

  v_valid_is_perfect := v_valid_correct_count = v_actual_total
    and p_hearts_remaining = 3;

  if coalesce(p_is_perfect, false) <> v_valid_is_perfect then
    raise exception 'Invalid perfect lesson flag';
  end if;

  select exists (
    select 1
    from public.user_lesson_progress
    where user_id = p_user_id
      and lesson_id = p_lesson_id
      and status = 'completed'
  ) into v_is_replay;

  if v_is_replay then
    v_xp := v_lesson.xp_replay_reward;
  elsif v_valid_is_perfect then
    v_xp := v_lesson.xp_reward + v_lesson.xp_perfect_bonus;
  else
    v_xp := v_lesson.xp_reward;
  end if;

  v_today := (now() at time zone coalesce(v_profile.timezone, 'Asia/Jerusalem'))::date;

  select coalesce(sum(la.xp_earned), 0)::integer
  into v_daily_xp
  from public.lesson_attempts la
  where la.user_id = p_user_id
    and la.completed = true
    and (la.created_at at time zone coalesce(v_profile.timezone, 'Asia/Jerusalem'))::date = v_today;

  if v_daily_xp < v_profile.daily_xp_goal
     and (v_daily_xp + v_xp) >= v_profile.daily_xp_goal
     and not exists (
       select 1
       from public.lesson_attempts la
       where la.user_id = p_user_id
         and la.daily_goal_bonus = true
         and (la.created_at at time zone coalesce(v_profile.timezone, 'Asia/Jerusalem'))::date = v_today
     ) then
    v_xp := v_xp + 5;
    v_daily_goal_reached := true;
  end if;

  insert into public.lesson_attempts (
    user_id,
    lesson_id,
    total_exercises,
    correct_count,
    hearts_remaining,
    is_perfect,
    is_replay,
    completed,
    xp_earned,
    daily_goal_bonus,
    duration_seconds
  ) values (
    p_user_id,
    p_lesson_id,
    v_actual_total,
    v_valid_correct_count,
    p_hearts_remaining,
    v_valid_is_perfect,
    v_is_replay,
    true,
    v_xp,
    v_daily_goal_reached,
    greatest(coalesce(p_duration_seconds, 0), 0)
  )
  returning id into v_attempt_id;

  for v_attempt in
    select attempt.value
    from jsonb_array_elements(p_exercise_attempts) as attempt(value)
  loop
    insert into public.exercise_attempts (
      lesson_attempt_id,
      exercise_id,
      user_answer,
      is_correct,
      is_near_miss
    ) values (
      v_attempt_id,
      (v_attempt->>'exercise_id')::uuid,
      v_attempt->>'user_answer',
      coalesce((v_attempt->>'is_correct')::boolean, false),
      coalesce((v_attempt->>'is_near_miss')::boolean, false)
    );

    if not coalesce((v_attempt->>'is_correct')::boolean, false) then
      insert into public.user_mistakes (
        user_id,
        exercise_id,
        last_wrong_answer,
        wrong_count,
        needs_review
      ) values (
        p_user_id,
        (v_attempt->>'exercise_id')::uuid,
        v_attempt->>'user_answer',
        1,
        true
      )
      on conflict (user_id, exercise_id) do update set
        last_wrong_answer = excluded.last_wrong_answer,
        wrong_count = user_mistakes.wrong_count + 1,
        needs_review = true,
        updated_at = now();
    end if;
  end loop;

  v_new_streak := v_profile.current_streak;
  v_longest_streak := v_profile.longest_streak;

  if v_profile.last_activity_date is null or v_profile.last_activity_date < v_today then
    v_streak_updated := true;

    if v_profile.last_activity_date = v_today - 1 then
      v_new_streak := v_profile.current_streak + 1;
    else
      v_new_streak := 1;
    end if;

    v_longest_streak := greatest(v_profile.longest_streak, v_new_streak);
  end if;

  update public.profiles
  set
    total_xp = total_xp + v_xp,
    current_streak = v_new_streak,
    longest_streak = v_longest_streak,
    last_activity_date = v_today
  where id = p_user_id
  returning total_xp into v_total_xp;

  insert into public.user_lesson_progress (
    user_id,
    lesson_id,
    status,
    completed_at,
    best_score,
    last_attempt_at
  ) values (
    p_user_id,
    p_lesson_id,
    'completed',
    now(),
    v_valid_correct_count,
    now()
  )
  on conflict (user_id, lesson_id) do update set
    status = 'completed',
    completed_at = coalesce(user_lesson_progress.completed_at, now()),
    best_score = greatest(
      coalesce(user_lesson_progress.best_score, 0),
      excluded.best_score
    ),
    last_attempt_at = now();

  select l.id
  into v_next_lesson_id
  from public.lessons l
  where l.unit_id = v_lesson.unit_id
    and l.order_index = v_lesson.order_index + 1
  limit 1;

  if v_next_lesson_id is null then
    select l.id
    into v_next_lesson_id
    from public.units u
    join public.lessons l on l.unit_id = u.id
    where u.course_id = v_lesson.course_id
      and u.order_index = v_lesson.unit_order + 1
    order by l.order_index asc
    limit 1;
  end if;

  if v_next_lesson_id is not null then
    insert into public.user_lesson_progress (
      user_id,
      lesson_id,
      status
    ) values (
      p_user_id,
      v_next_lesson_id,
      'unlocked'
    )
    on conflict (user_id, lesson_id) do update set
      status = case
        when user_lesson_progress.status = 'completed' then 'completed'
        else 'unlocked'
      end;
  end if;

  select l.id, l.unit_id
  into v_current_lesson_id, v_current_unit_id
  from public.lessons l
  join public.units u on u.id = l.unit_id
  join public.user_lesson_progress ulp
    on ulp.lesson_id = l.id
   and ulp.user_id = p_user_id
  where u.course_id = v_lesson.course_id
    and ulp.status = 'unlocked'
  order by u.order_index asc, l.order_index asc
  limit 1;

  insert into public.user_progress (
    user_id,
    course_id,
    current_unit_id,
    current_lesson_id,
    updated_at
  ) values (
    p_user_id,
    v_lesson.course_id,
    v_current_unit_id,
    v_current_lesson_id,
    now()
  )
  on conflict (user_id, course_id) do update set
    current_unit_id = excluded.current_unit_id,
    current_lesson_id = excluded.current_lesson_id,
    updated_at = now();

  return jsonb_build_object(
    'lesson_attempt_id', v_attempt_id,
    'xp_earned', v_xp,
    'total_xp', v_total_xp,
    'correct_count', v_valid_correct_count,
    'total_exercises', v_actual_total,
    'completed', true,
    'is_perfect', v_valid_is_perfect,
    'daily_goal_reached', v_daily_goal_reached,
    'streak_updated', v_streak_updated,
    'current_streak', v_new_streak,
    'next_lesson_id', v_next_lesson_id
  );
end;
$$;

revoke all on function public.complete_lesson(
  uuid,
  uuid,
  integer,
  integer,
  integer,
  boolean,
  integer,
  jsonb
) from public;

grant execute on function public.complete_lesson(
  uuid,
  uuid,
  integer,
  integer,
  integer,
  boolean,
  integer,
  jsonb
) to authenticated;

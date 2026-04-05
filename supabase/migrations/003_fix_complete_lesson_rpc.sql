-- ============================================================
-- Fix: complete_lesson RPC — add p_user_id parameter
-- auth.uid() returns null inside security definer functions
-- Run this in Supabase SQL Editor
-- ============================================================

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
as $$
declare
  v_user_id uuid := p_user_id;
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
    v_xp := v_lesson.xp_replay_reward;
  elsif p_is_perfect then
    v_xp := v_lesson.xp_reward + v_lesson.xp_perfect_bonus;
  else
    v_xp := v_lesson.xp_reward;
  end if;

  -- Check daily goal bonus
  v_today := (now() at time zone (
    select timezone from public.profiles where id = v_user_id
  ))::date;

  select daily_xp_goal, last_activity_date, current_streak, longest_streak
  into v_daily_goal, v_last_activity, v_new_streak, v_longest
  from public.profiles where id = v_user_id;

  select coalesce(sum(xp_earned), 0) into v_daily_xp
  from public.lesson_attempts
  where user_id = v_user_id
    and completed = true
    and (created_at at time zone (
      select timezone from public.profiles where id = v_user_id
    ))::date = v_today;

  if v_daily_xp < v_daily_goal and (v_daily_xp + v_xp) >= v_daily_goal then
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
      v_new_streak := v_new_streak + 1;
    elsif v_last_activity is null or v_last_activity < v_today - 1 then
      v_new_streak := 1;
    end if;

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

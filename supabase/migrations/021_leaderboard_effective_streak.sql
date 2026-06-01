-- ============================================================
-- 021_leaderboard_effective_streak.sql
--
-- The DB only updates `profiles.current_streak` when a lesson is
-- completed via `complete_lesson`. If a user disappears for days
-- or weeks, the column keeps the stored value, which is misleading
-- when surfaced in the leaderboard. The client-side app now
-- computes an "effective" streak (0 if last activity > 1 day ago)
-- for the header, dashboard, and profile via lib/utils/streak.ts.
--
-- This migration mirrors that rule inside the public leaderboard
-- view so other users don't see a stale streak.
--
-- Rule: streak is alive only if last_activity_date is today or
-- yesterday (in server-side current_date). Anything older → 0.
-- ============================================================

create or replace view public.leaderboard_view as
select
  id,
  username,
  total_xp,
  case
    when last_activity_date is null then 0
    when last_activity_date >= (current_date - 1) then current_streak
    else 0
  end as current_streak
from public.profiles
order by total_xp desc;

-- Keep the previous security_invoker=false behavior from migration 020 so
-- the view can read all profiles regardless of the caller's RLS.
alter view public.leaderboard_view set (security_invoker = false);

grant select on public.leaderboard_view to authenticated;

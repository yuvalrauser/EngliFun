-- ============================================================
-- 023_zero_xp_custom_lessons.sql
--
-- User-created custom lessons should not award XP — otherwise users
-- could grind XP from content they wrote themselves. New custom
-- lessons created from `path/actions.ts` already insert with 0
-- rewards; this backfills the few lessons that were created before
-- that code change.
--
-- Seeded global content (owner_id IS NULL) is untouched.
-- ============================================================

update public.lessons
set
  xp_reward = 0,
  xp_perfect_bonus = 0,
  xp_replay_reward = 0
where unit_id in (
  select id from public.units where owner_id is not null
);

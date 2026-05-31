/**
 * Streak helpers.
 *
 * The DB only updates `profiles.current_streak` when a lesson is completed.
 * If a user disappears for weeks, the stored value remains the streak as of
 * their last completion — which is misleading on the profile, header, and
 * leaderboard. These helpers compute the *effective* streak the user actually
 * has right now, accounting for inactivity.
 *
 * Rule (mirrors Duolingo-style): streak is alive only if the last activity
 * was today or yesterday in the user's timezone. Anything older = broken.
 */

/** Returns YYYY-MM-DD for the current moment in the given IANA timezone. */
function todayIsoInTimezone(timezone: string): string {
  // en-CA formats as YYYY-MM-DD which round-trips cleanly to Date(YYYY-MM-DD).
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone });
}

/** Day difference, treating both inputs as midnight UTC. Positive = lastDate is earlier. */
function dayDiff(todayIso: string, lastIso: string): number {
  const today = Date.parse(todayIso);
  const last = Date.parse(lastIso);
  if (!Number.isFinite(today) || !Number.isFinite(last)) return Infinity;
  return Math.round((today - last) / 86400000);
}

/**
 * The streak value to display. Returns 0 if the streak is broken (no activity
 * in the past day in the user's timezone). Otherwise returns the stored value.
 */
export function effectiveStreak(
  currentStreak: number,
  lastActivityDate: string | null,
  timezone: string | null = null
): number {
  if (!currentStreak || currentStreak <= 0) return 0;
  if (!lastActivityDate) return 0;
  const tz = timezone || "Asia/Jerusalem";
  const todayIso = todayIsoInTimezone(tz);
  // lastActivityDate from Supabase is "YYYY-MM-DD" (date column) — use as-is.
  const lastIso = lastActivityDate.slice(0, 10);
  const diff = dayDiff(todayIso, lastIso);
  // 0 = active today, 1 = active yesterday — streak alive.
  // 2+ days = broken.
  return diff <= 1 ? currentStreak : 0;
}

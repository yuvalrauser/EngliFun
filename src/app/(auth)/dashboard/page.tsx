import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFullCourse } from "@/services/content.server";
import { getLessonProgressMap, buildLessonStatuses, getNextLesson } from "@/services/progress.server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import type { Profile } from "@/types/database";

function isStreakInDanger(profile: Profile): boolean {
  if (!profile.last_activity_date || profile.current_streak === 0) return false;

  const timezone = profile.timezone || "Asia/Jerusalem";
  const todayStr = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  const lastStr = new Date(profile.last_activity_date).toISOString().slice(0, 10);

  const today = new Date(todayStr);
  const last = new Date(lastStr);
  const diffDays = Math.round((today.getTime() - last.getTime()) / 86400000);

  // Streak is in danger if last activity was yesterday (diffDays === 1)
  return diffDays === 1;
}

export default async function DashboardPage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch (e) {
    console.error("Failed to create supabase client:", e);
    redirect("/login");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) console.error("Profile fetch error:", profileError);
  if (!profile) redirect("/login");

  const p = profile as Profile;

  let nextLesson = null;
  let completedCount = 0;
  let totalCount = 0;

  try {
    const course = await getFullCourse(supabase);
    if (course) {
      const progressMap = await getLessonProgressMap(user.id, course.units, supabase);
      const lessonStatuses = buildLessonStatuses(course.units, progressMap);
      nextLesson = getNextLesson(lessonStatuses);

      for (const ls of lessonStatuses.values()) {
        totalCount++;
        if (ls.status === "completed") completedCount++;
      }
    }
  } catch (e) {
    console.error("Course/progress error:", e);
  }

  // Today's XP — sum xp_earned from completed lesson_attempts dated today (user timezone)
  let todayXp = 0;
  try {
    const tz = p.timezone || "Asia/Jerusalem";
    const todayLocal = new Date().toLocaleDateString("en-CA", { timeZone: tz });
    const todayStart = new Date(`${todayLocal}T00:00:00`);
    const sinceIso = new Date(todayStart.getTime() - 24 * 3600 * 1000).toISOString();
    const { data: attempts } = await supabase
      .from("lesson_attempts")
      .select("xp_earned, created_at")
      .eq("user_id", user.id)
      .eq("completed", true)
      .gte("created_at", sinceIso);
    if (attempts) {
      todayXp = attempts
        .filter((a) => {
          const d = new Date(a.created_at).toLocaleDateString("en-CA", { timeZone: tz });
          return d === todayLocal;
        })
        .reduce((sum, a) => sum + (a.xp_earned ?? 0), 0);
    }
  } catch (e) {
    console.error("Today XP error:", e);
  }

  const streakInDanger = isStreakInDanger(p);

  return (
    <DashboardContent
      profile={p}
      nextLesson={nextLesson}
      completedCount={completedCount}
      totalCount={totalCount}
      streakInDanger={streakInDanger}
      todayXp={todayXp}
    />
  );
}

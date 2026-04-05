import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFullCourse } from "@/services/content.server";
import { getLessonProgressMap, buildLessonStatuses, getNextLesson } from "@/services/progress.server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";
import type { Profile } from "@/types/database";

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

  if (profileError) {
    console.error("Profile fetch error:", profileError);
  }

  if (!profile) redirect("/login");

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

  return (
    <DashboardContent
      profile={profile as Profile}
      nextLesson={nextLesson}
      completedCount={completedCount}
      totalCount={totalCount}
    />
  );
}

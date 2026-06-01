import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getFullCourse } from "@/services/content.server";
import { getLessonProgressMap, buildLessonStatuses } from "@/services/progress.server";
import { LearningPath } from "@/components/path/learning-path";
import type { CourseLevel, Profile } from "@/types/database";

export default async function PathPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("starting_level")
    .eq("id", user.id)
    .single();

  const level = (profile?.starting_level as CourseLevel) ?? "beginner";

  const course = await getFullCourse(level, supabase);
  if (!course) {
    return (
      <main className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">לא נמצא קורס פעיל</p>
      </main>
    );
  }

  const progressMap = await getLessonProgressMap(user.id, course.units, supabase);
  const lessonStatuses = buildLessonStatuses(course.units, progressMap);

  const lessonStatusEntries = Array.from(lessonStatuses.entries());

  const allCompleted =
    lessonStatusEntries.length > 0 &&
    lessonStatusEntries.every(([, l]) => l.status === "completed");

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
      </div>
      <div className="mx-auto max-w-lg mb-6">
        <Link
          href="/path/new"
          className="flex items-center justify-center gap-2 w-full rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          <span className="text-lg">＋</span>
          <span>צור יחידה משלך</span>
        </Link>
      </div>
      <LearningPath
        units={course.units}
        lessonStatuses={lessonStatusEntries}
        allCompleted={allCompleted}
        currentLevel={level as Profile["starting_level"]}
        currentUserId={user.id}
      />
    </main>
  );
}

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFullCourse } from "@/services/content.server";
import { getLessonProgressMap, buildLessonStatuses } from "@/services/progress.server";
import { LearningPath } from "@/components/path/learning-path";

export default async function PathPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const course = await getFullCourse(supabase);
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

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{course.description}</p>
      </div>
      <LearningPath units={course.units} lessonStatuses={lessonStatusEntries} />
    </main>
  );
}

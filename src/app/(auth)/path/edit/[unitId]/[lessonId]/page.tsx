import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LessonEditor } from "@/components/path/lesson-editor";
import type { Lesson, Exercise, ExerciseOption, Unit } from "@/types/database";

interface PageProps {
  params: Promise<{ unitId: string; lessonId: string }>;
}

export default async function LessonEditPage({ params }: PageProps) {
  const { unitId, lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: unit } = await supabase
    .from("units")
    .select("*")
    .eq("id", unitId)
    .single();
  if (!unit) notFound();
  if ((unit as Unit).owner_id !== user.id) redirect("/path");

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", lessonId)
    .eq("unit_id", unitId)
    .single();
  if (!lesson) notFound();

  const { data: exercises } = await supabase
    .from("exercises")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_index");

  const exerciseIds = (exercises ?? []).map((e) => e.id);
  const { data: options } =
    exerciseIds.length > 0
      ? await supabase
          .from("exercise_options")
          .select("*")
          .in("exercise_id", exerciseIds)
          .order("order_index")
      : { data: [] };

  const optionsByExercise = new Map<string, ExerciseOption[]>();
  for (const o of options ?? []) {
    const list = optionsByExercise.get(o.exercise_id) ?? [];
    list.push(o as ExerciseOption);
    optionsByExercise.set(o.exercise_id, list);
  }

  const exercisesWithOptions = (exercises ?? []).map((e) => ({
    ...(e as Exercise),
    exercise_options: optionsByExercise.get(e.id) ?? [],
  }));

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/path/edit/${unitId}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            ← חזרה ליחידה
          </Link>
        </div>
        <LessonEditor
          unitId={unitId}
          lesson={lesson as Lesson}
          exercises={exercisesWithOptions}
        />
      </div>
    </main>
  );
}

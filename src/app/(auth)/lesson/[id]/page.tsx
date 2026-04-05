import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LessonEngine } from "@/components/lesson/lesson-engine";
import type { Lesson } from "@/types/database";
import type { ExerciseWithOptions } from "@/types/lesson";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (!lesson) redirect("/path");

  // Fetch exercises with options
  const { data: exercises } = await supabase
    .from("exercises")
    .select("*, exercise_options(*)")
    .eq("lesson_id", id)
    .order("order_index");

  if (!exercises || exercises.length === 0) redirect("/path");

  return (
    <LessonEngine
      lesson={lesson as Lesson}
      exercises={exercises as ExerciseWithOptions[]}
    />
  );
}

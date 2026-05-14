import { createClient } from "@/lib/supabase/client";
import type { Course, CourseLevel, Unit, Lesson } from "@/types/database";
import type { ExerciseWithOptions } from "@/types/lesson";

const supabase = createClient();

export async function getCourse(level: CourseLevel): Promise<Course | null> {
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .eq("level", level)
    .single();
  return data;
}

export async function getUnits(courseId: string): Promise<Unit[]> {
  const { data } = await supabase
    .from("units")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index");
  return data ?? [];
}

export async function getLessons(unitId: string): Promise<Lesson[]> {
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("unit_id", unitId)
    .order("order_index");
  return data ?? [];
}

export async function getExercisesWithOptions(
  lessonId: string
): Promise<ExerciseWithOptions[]> {
  const { data } = await supabase
    .from("exercises")
    .select("*, exercise_options(*)")
    .eq("lesson_id", lessonId)
    .order("order_index");
  return (data ?? []) as ExerciseWithOptions[];
}

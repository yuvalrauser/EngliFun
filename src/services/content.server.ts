import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Course, Unit, Lesson } from "@/types/database";

export interface UnitWithLessons extends Unit {
  lessons: Lesson[];
}

export interface CourseWithUnits extends Course {
  units: UnitWithLessons[];
}

export async function getFullCourse(supabase?: SupabaseClient): Promise<CourseWithUnits | null> {
  const sb = supabase ?? await createClient();

  const { data: course } = await sb
    .from("courses")
    .select("*")
    .eq("is_active", true)
    .single();

  if (!course) return null;

  const { data: units } = await sb
    .from("units")
    .select("*")
    .eq("course_id", course.id)
    .order("order_index");

  if (!units || units.length === 0) return { ...course, units: [] };

  const unitIds = units.map((u) => u.id);
  const { data: lessons } = await sb
    .from("lessons")
    .select("*")
    .in("unit_id", unitIds)
    .order("order_index");

  const lessonsByUnit = new Map<string, Lesson[]>();
  for (const lesson of lessons ?? []) {
    const list = lessonsByUnit.get(lesson.unit_id) ?? [];
    list.push(lesson as Lesson);
    lessonsByUnit.set(lesson.unit_id, list);
  }

  const unitsWithLessons: UnitWithLessons[] = units.map((unit) => ({
    ...(unit as Unit),
    lessons: lessonsByUnit.get(unit.id) ?? [],
  }));

  return { ...(course as Course), units: unitsWithLessons };
}

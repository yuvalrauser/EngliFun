"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CourseLevel } from "@/types/database";

export interface CreateCustomUnitInput {
  title: string;
  description: string;
  icon_emoji: string;
  color_hex: string;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
  unitId?: string;
}

/**
 * Create a custom unit owned by the authenticated user.
 * Side effects:
 *   - inserts 1 unit (owner_id = auth.uid(), is_draft = true)
 *   - inserts 5 placeholder lessons under that unit
 *   - inserts 5 user_lesson_progress rows with status='unlocked' so the
 *     owner can edit any of the 5 lessons immediately while the unit is
 *     in draft.
 */
export async function createCustomUnit(
  input: CreateCustomUnitInput,
): Promise<ActionResult> {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "חובה לתת שם ליחידה" };
  if (title.length > 80) return { ok: false, error: "השם ארוך מדי (מקסימום 80 תווים)" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("starting_level")
    .eq("id", user.id)
    .single();
  const level = (profile?.starting_level as CourseLevel | undefined) ?? "beginner";

  const { data: course } = await supabase
    .from("courses")
    .select("id")
    .eq("level", level)
    .eq("is_active", true)
    .single();
  if (!course) return { ok: false, error: "לא נמצא קורס פעיל" };

  // Append at the end of the path. Plenty of headroom for drag-and-drop.
  const { data: lastUnit } = await supabase
    .from("units")
    .select("position, order_index")
    .eq("course_id", course.id)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  const newPosition = (lastUnit?.position ?? 0) + 1000;
  // order_index has a UNIQUE(course_id, order_index) constraint; bump it
  // far above seeded range (0..9) so custom units never collide.
  const newOrderIndex = Math.max(lastUnit?.order_index ?? 0, 100) + 1;

  const { data: unit, error: unitErr } = await supabase
    .from("units")
    .insert({
      course_id: course.id,
      title,
      description: input.description.trim() || null,
      icon_emoji: input.icon_emoji.trim() || "📝",
      color_hex: input.color_hex || "#9CA3AF",
      order_index: newOrderIndex,
      position: newPosition,
      owner_id: user.id,
      is_draft: true,
    })
    .select("id")
    .single();
  if (unitErr || !unit) {
    return { ok: false, error: unitErr?.message ?? "שגיאה ביצירת היחידה" };
  }

  // 5 placeholder lessons with default titles. The owner edits them via
  // the unit-edit page in Phase 4.
  const lessons = Array.from({ length: 5 }, (_, i) => ({
    unit_id: unit.id,
    title: `שיעור ${i + 1}`,
    description: null,
    order_index: i,
    is_checkpoint: false,
    exercise_count: 0,
  }));
  const { data: insertedLessons, error: lessonErr } = await supabase
    .from("lessons")
    .insert(lessons)
    .select("id");
  if (lessonErr || !insertedLessons) {
    // Roll back the unit since we left lessons in a bad state.
    await supabase.from("units").delete().eq("id", unit.id);
    return { ok: false, error: lessonErr?.message ?? "שגיאה ביצירת השיעורים" };
  }

  // All 5 lessons are immediately "unlocked" while the unit is a draft.
  // (buildLessonStatuses also force-unlocks draft lessons; this row makes
  // the state explicit and survives a publish.)
  const progressRows = insertedLessons.map((l) => ({
    user_id: user.id,
    lesson_id: l.id,
    status: "unlocked" as const,
  }));
  await supabase.from("user_lesson_progress").insert(progressRows);

  revalidatePath("/path");
  return { ok: true, unitId: unit.id };
}

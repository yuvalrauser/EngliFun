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

/**
 * Move a user-owned custom unit to a new position in the path. The
 * caller computes `newPosition` as the midpoint of the two neighbors
 * in the visually-reordered list. RLS ensures the user can only
 * update their own units; seeded units (owner_id IS NULL) can't be
 * moved.
 */
export async function reorderCustomUnit(
  unitId: string,
  newPosition: number,
): Promise<ActionResult> {
  if (!Number.isFinite(newPosition)) {
    return { ok: false, error: "מיקום לא תקין" };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { error } = await supabase
    .from("units")
    .update({ position: newPosition })
    .eq("id", unitId)
    .eq("owner_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/path");
  return { ok: true };
}

export interface UpdateUnitMetadataInput {
  unitId: string;
  title: string;
  description: string;
  icon_emoji: string;
  color_hex: string;
}

/** Update an owned unit's metadata. RLS enforces ownership. */
export async function updateUnitMetadata(
  input: UpdateUnitMetadataInput,
): Promise<ActionResult> {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "חובה לתת שם ליחידה" };
  if (title.length > 80) return { ok: false, error: "השם ארוך מדי" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { error } = await supabase
    .from("units")
    .update({
      title,
      description: input.description.trim() || null,
      icon_emoji: input.icon_emoji.trim() || "📝",
      color_hex: input.color_hex || "#9CA3AF",
    })
    .eq("id", input.unitId)
    .eq("owner_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/path");
  revalidatePath(`/path/edit/${input.unitId}`);
  return { ok: true };
}

/** Rename a lesson in an owned unit. */
export async function updateLessonTitle(
  lessonId: string,
  title: string,
): Promise<ActionResult> {
  const t = title.trim();
  if (!t) return { ok: false, error: "חובה לתת שם לשיעור" };
  if (t.length > 80) return { ok: false, error: "השם ארוך מדי" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  // RLS already gates this through the units → owner_id chain, but we still
  // check user is signed in. The .update will silently match 0 rows if the
  // lesson belongs to a seeded unit.
  const { data, error } = await supabase
    .from("lessons")
    .update({ title: t })
    .eq("id", lessonId)
    .select("id, unit_id");
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false, error: "אין הרשאה לערוך את השיעור" };
  }

  revalidatePath(`/path/edit/${data[0].unit_id}`);
  return { ok: true };
}

/** Delete a lesson belonging to an owned unit. */
export async function deleteCustomLesson(lessonId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data, error } = await supabase
    .from("lessons")
    .delete()
    .eq("id", lessonId)
    .select("id, unit_id");
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false, error: "אין הרשאה למחוק שיעור זה" };
  }

  revalidatePath("/path");
  revalidatePath(`/path/edit/${data[0].unit_id}`);
  return { ok: true };
}

/** Append a new empty lesson to the end of an owned unit. */
export async function addLessonToUnit(unitId: string): Promise<ActionResult & { lessonId?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  // Verify ownership + find next order_index.
  const { data: unit } = await supabase
    .from("units")
    .select("id, owner_id")
    .eq("id", unitId)
    .single();
  if (!unit || unit.owner_id !== user.id) {
    return { ok: false, error: "אין הרשאה" };
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("order_index")
    .eq("unit_id", unitId)
    .order("order_index", { ascending: false })
    .limit(1);
  const nextOrderIndex = (lessons?.[0]?.order_index ?? -1) + 1;

  const { data: inserted, error } = await supabase
    .from("lessons")
    .insert({
      unit_id: unitId,
      title: `שיעור ${nextOrderIndex + 1}`,
      description: null,
      order_index: nextOrderIndex,
      is_checkpoint: false,
      exercise_count: 0,
    })
    .select("id")
    .single();
  if (error || !inserted) return { ok: false, error: error?.message ?? "שגיאה" };

  // Draft progress row so it shows as unlocked.
  await supabase.from("user_lesson_progress").insert({
    user_id: user.id,
    lesson_id: inserted.id,
    status: "unlocked",
  });

  revalidatePath("/path");
  revalidatePath(`/path/edit/${unitId}`);
  return { ok: true, lessonId: inserted.id };
}

/**
 * Delete a user-owned custom unit. Cascades through lessons → exercises →
 * exercise_options + user_lesson_progress via FK on delete cascade. RLS
 * + the explicit owner_id filter block deletion of seeded units.
 */
export async function deleteCustomUnit(unitId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { error } = await supabase
    .from("units")
    .delete()
    .eq("id", unitId)
    .eq("owner_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/path");
  return { ok: true };
}

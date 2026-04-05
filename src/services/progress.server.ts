import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserLessonProgress, LessonProgressStatus } from "@/types/database";
import type { UnitWithLessons } from "@/services/content.server";

export type LessonStatus = LessonProgressStatus | "current";

export interface LessonWithStatus {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  unit_id: string;
  xp_reward: number;
  exercise_count: number;
  status: LessonStatus;
  best_score: number | null;
}

/**
 * Get all lesson progress rows for this user.
 * If none exist, auto-initialize: unlock the first lesson of the first unit.
 */
export async function getLessonProgressMap(
  userId: string,
  units: UnitWithLessons[],
  supabase?: SupabaseClient
): Promise<Map<string, UserLessonProgress>> {
  const sb = supabase ?? await createClient();

  const { data: rows } = await sb
    .from("user_lesson_progress")
    .select("*")
    .eq("user_id", userId);

  const progressMap = new Map<string, UserLessonProgress>();
  for (const row of rows ?? []) {
    progressMap.set(row.lesson_id, row as UserLessonProgress);
  }

  // Auto-initialize: if no progress at all, unlock the first lesson
  if (progressMap.size === 0 && units.length > 0 && units[0].lessons.length > 0) {
    const firstLesson = units[0].lessons[0];
    const { data: inserted } = await sb
      .from("user_lesson_progress")
      .insert({
        user_id: userId,
        lesson_id: firstLesson.id,
        status: "unlocked",
      })
      .select()
      .single();

    if (inserted) {
      progressMap.set(firstLesson.id, inserted as UserLessonProgress);
    }
  }

  return progressMap;
}

/**
 * Build a flat list of lessons with their display status.
 * "current" = the first unlocked (non-completed) lesson.
 */
export function buildLessonStatuses(
  units: UnitWithLessons[],
  progressMap: Map<string, UserLessonProgress>
): Map<string, LessonWithStatus> {
  const result = new Map<string, LessonWithStatus>();
  let foundCurrent = false;

  for (const unit of units) {
    for (const lesson of unit.lessons) {
      const progress = progressMap.get(lesson.id);
      let status: LessonStatus = "locked";

      if (progress) {
        status = progress.status as LessonStatus;
      }

      // Mark the first unlocked lesson as "current"
      if (!foundCurrent && status === "unlocked") {
        status = "current";
        foundCurrent = true;
      }

      result.set(lesson.id, {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        order_index: lesson.order_index,
        unit_id: lesson.unit_id,
        xp_reward: lesson.xp_reward,
        exercise_count: lesson.exercise_count,
        status,
        best_score: progress?.best_score ?? null,
      });
    }
  }

  return result;
}

/**
 * Find the next lesson the user should play.
 */
export function getNextLesson(
  lessonStatuses: Map<string, LessonWithStatus>
): LessonWithStatus | null {
  for (const lesson of lessonStatuses.values()) {
    if (lesson.status === "current") return lesson;
  }
  return null;
}

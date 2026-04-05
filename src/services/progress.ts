import { createClient } from "@/lib/supabase/client";
import type { UserLessonProgress, UserProgress, CompleteLessonResult } from "@/types/database";
import type { ExerciseAttemptPayload } from "@/types/lesson";

export async function getUserLessonProgress(
  userId: string
): Promise<UserLessonProgress[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_lesson_progress")
    .select("*")
    .eq("user_id", userId);
  return data ?? [];
}

export async function getUserProgress(
  userId: string,
  courseId: string
): Promise<UserProgress | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .single();
  return data;
}

export async function completeLesson(params: {
  lessonId: string;
  totalExercises: number;
  correctCount: number;
  heartsRemaining: number;
  isPerfect: boolean;
  durationSeconds: number;
  exerciseAttempts: ExerciseAttemptPayload[];
}): Promise<CompleteLessonResult> {
  const supabase = createClient();

  // Get current user ID
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase.rpc("complete_lesson", {
    p_user_id: user.id,
    p_lesson_id: params.lessonId,
    p_total_exercises: params.totalExercises,
    p_correct_count: params.correctCount,
    p_hearts_remaining: params.heartsRemaining,
    p_is_perfect: params.isPerfect,
    p_duration_seconds: params.durationSeconds,
    p_exercise_attempts: params.exerciseAttempts,
  });

  if (error) {
    console.error("complete_lesson RPC error:", error);
    throw error;
  }

  // Supabase RPC with jsonb return: data is the object directly
  const result = typeof data === "string" ? JSON.parse(data) : data;

  if (!result || typeof result.xp_earned === "undefined") {
    console.error("complete_lesson RPC returned unexpected data:", data);
    throw new Error("Invalid RPC response");
  }

  return result as CompleteLessonResult;
}

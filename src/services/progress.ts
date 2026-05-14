import { createClient } from "@/lib/supabase/client";
import type { UserLessonProgress, UserProgress, CompleteLessonResult } from "@/types/database";
import type { ExerciseAttemptPayload } from "@/types/lesson";

function parseCompleteLessonResult(data: unknown): CompleteLessonResult {
  let result: unknown;

  try {
    result = typeof data === "string" ? JSON.parse(data) : data;
  } catch (err) {
    console.error("complete_lesson RPC returned invalid JSON:", err, data);
    throw new Error("שמירת השיעור נכשלה: תשובה לא תקינה מהשרת");
  }

  if (!result || typeof result !== "object") {
    console.error("complete_lesson RPC returned empty data:", data);
    throw new Error("שמירת השיעור נכשלה: תשובה ריקה מהשרת");
  }

  const value = result as Record<string, unknown>;
  const hasNumber = (key: string) => typeof value[key] === "number" && Number.isFinite(value[key]);
  const hasBoolean = (key: string) => typeof value[key] === "boolean";
  const hasString = (key: string) => typeof value[key] === "string";

  if (
    !hasString("lesson_attempt_id") ||
    !hasNumber("xp_earned") ||
    !hasNumber("total_xp") ||
    !hasNumber("correct_count") ||
    !hasNumber("total_exercises") ||
    !hasBoolean("completed") ||
    !hasBoolean("is_perfect") ||
    !hasBoolean("daily_goal_reached") ||
    !hasBoolean("streak_updated") ||
    !hasNumber("current_streak") ||
    !(value.next_lesson_id === null || typeof value.next_lesson_id === "string")
  ) {
    console.error("complete_lesson RPC returned unexpected data:", data);
    throw new Error("שמירת השיעור נכשלה: תשובה לא תקינה מהשרת");
  }

  return value as unknown as CompleteLessonResult;
}

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

const RPC_TIMEOUT_MS = 8000;

export async function completeLesson(params: {
  userId: string;
  lessonId: string;
  totalExercises: number;
  correctCount: number;
  heartsRemaining: number;
  isPerfect: boolean;
  durationSeconds: number;
  exerciseAttempts: ExerciseAttemptPayload[];
}): Promise<CompleteLessonResult> {
  if (!params.userId) throw new Error("Not authenticated");
  if (!params.lessonId) throw new Error("Missing lesson id");

  const supabase = createClient();

  const rpcPromise = supabase.rpc("complete_lesson", {
    p_user_id: params.userId,
    p_lesson_id: params.lessonId,
    p_total_exercises: params.totalExercises,
    p_correct_count: params.correctCount,
    p_hearts_remaining: params.heartsRemaining,
    p_is_perfect: params.isPerfect,
    p_duration_seconds: params.durationSeconds,
    p_exercise_attempts: params.exerciseAttempts,
  });

  // Hard timeout — without this the UI hangs forever if the network call stalls.
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error("שמירת השיעור הסתיימה ב-timeout — נסה שוב")),
      RPC_TIMEOUT_MS,
    ),
  );

  const { data, error } = await Promise.race([rpcPromise, timeoutPromise]);

  if (error) {
    console.error("complete_lesson RPC error:", error);
    throw new Error(error.message || "שמירת השיעור נכשלה");
  }

  return parseCompleteLessonResult(data);
}

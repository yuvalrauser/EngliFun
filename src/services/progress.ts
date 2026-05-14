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

const RPC_TIMEOUT_MS = 15000;

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
  if (!params.lessonId) throw new Error("Missing lesson id");

  // Go through the Next.js API route instead of supabase-js directly.
  // The browser-side supabase client occasionally hangs forever on Vercel
  // (we saw zero outbound POSTs even when /rest/v1/rpc/complete_lesson was
  // attempted). The server route uses cookies and runs server-side fetch,
  // which doesn't have that failure mode.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RPC_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch("/api/complete-lesson", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        lessonId: params.lessonId,
        totalExercises: params.totalExercises,
        correctCount: params.correctCount,
        heartsRemaining: params.heartsRemaining,
        isPerfect: params.isPerfect,
        durationSeconds: params.durationSeconds,
        exerciseAttempts: params.exerciseAttempts,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") {
      throw new Error("שמירת השיעור הסתיימה ב-timeout — נסה שוב");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let serverMessage = "";
    try {
      const errBody = await response.json();
      serverMessage = errBody?.error ?? "";
    } catch {
      // ignore body parse failures
    }
    console.error("complete-lesson route error:", response.status, serverMessage);
    throw new Error(serverMessage || `שמירת השיעור נכשלה (${response.status})`);
  }

  const payload = (await response.json()) as { result: unknown };
  return parseCompleteLessonResult(payload.result);
}

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ExerciseAttemptPayload } from "@/types/lesson";

interface CompleteLessonRequest {
  lessonId: string;
  totalExercises: number;
  correctCount: number;
  heartsRemaining: number;
  isPerfect: boolean;
  durationSeconds: number;
  exerciseAttempts: ExerciseAttemptPayload[];
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: CompleteLessonRequest;
  try {
    body = (await request.json()) as CompleteLessonRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.lessonId || !Array.isArray(body?.exerciseAttempts)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("complete_lesson", {
    p_user_id: user.id,
    p_lesson_id: body.lessonId,
    p_total_exercises: body.totalExercises,
    p_correct_count: body.correctCount,
    p_hearts_remaining: body.heartsRemaining,
    p_is_perfect: body.isPerfect,
    p_duration_seconds: body.durationSeconds,
    p_exercise_attempts: body.exerciseAttempts,
  });

  if (error) {
    console.error("complete-lesson RPC error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ result: data });
}

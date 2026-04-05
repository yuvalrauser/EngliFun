import type { Exercise, ExerciseOption } from "./database";

// ============================================================
// Lesson engine — 7-state machine
// intro → active_question → correct_feedback
// → wrong_feedback → transition → completed → failed
// ============================================================
export type LessonState =
  | "intro"
  | "active_question"
  | "correct_feedback"
  | "wrong_feedback"
  | "transition"
  | "completed"
  | "failed";

export interface ExerciseMistake {
  exercise_id: string;
  user_answer: string;
  is_near_miss: boolean;
}

export interface ExerciseWithOptions extends Exercise {
  exercise_options: ExerciseOption[];
}

export interface LessonSessionState {
  lessonId: string;
  exercises: ExerciseWithOptions[];
  currentIndex: number;
  hearts: number;
  score: number;
  mistakes: ExerciseMistake[];
  attempts: ExerciseAttemptPayload[];
  xpEarned: number;
  isPerfect: boolean;
  state: LessonState;
  startedAt: Date;
  lastAnswer: string;
  lastCorrectAnswer: string;
  lastExplanation: string;
  lastIsNearMiss: boolean;
}

// ============================================================
// Exercise attempt payload (sent to RPC)
// ============================================================
export interface ExerciseAttemptPayload {
  exercise_id: string;
  user_answer: string;
  is_correct: boolean;
  is_near_miss: boolean;
}

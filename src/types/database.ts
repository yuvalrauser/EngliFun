// ============================================================
// Database table types — mirrors the Supabase schema exactly
// ============================================================

export interface Profile {
  id: string;
  email: string;
  username: string;
  role: "user" | "admin";
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  timezone: string;
  daily_xp_goal: 10 | 20 | 30 | 50;
  starting_level: "beginner" | "elementary" | "intermediate";
  motivation: string | null;
  onboarding_completed: boolean;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  language_from: string;
  language_to: string;
  is_active: boolean;
  created_at: string;
}

export interface Unit {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  icon_emoji: string | null;
  color_hex: string | null;
  order_index: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  title: string;
  description: string | null;
  order_index: number;
  xp_reward: number;
  xp_perfect_bonus: number;
  xp_replay_reward: number;
  is_checkpoint: boolean;
  exercise_count: number;
  created_at: string;
}

export type ExerciseType =
  | "multiple_choice"
  | "word_bank"
  | "type_answer"
  | "matching"
  | "complete_sentence";

export interface Exercise {
  id: string;
  lesson_id: string;
  type: ExerciseType;
  prompt_text: string;
  prompt_language: "en" | "he";
  correct_answer: string | null;
  correct_answer_alternatives: string[];
  word_bank_words: string[];
  explanation_he: string;
  order_index: number;
  created_at: string;
}

export interface ExerciseOption {
  id: string;
  exercise_id: string;
  option_text: string;
  option_language: "en" | "he";
  is_correct: boolean;
  pair_group_id: string | null;
  order_index: number;
}

export type LessonProgressStatus = "locked" | "unlocked" | "completed";

export interface UserLessonProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  completed_at: string | null;
  best_score: number | null;
  last_attempt_at: string | null;
}

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  current_unit_id: string | null;
  current_lesson_id: string | null;
  updated_at: string;
}

export interface LessonAttempt {
  id: string;
  user_id: string;
  lesson_id: string;
  total_exercises: number;
  correct_count: number;
  hearts_remaining: number;
  is_perfect: boolean;
  is_replay: boolean;
  completed: boolean;
  xp_earned: number;
  daily_goal_bonus: boolean;
  duration_seconds: number | null;
  created_at: string;
}

export interface ExerciseAttempt {
  id: string;
  lesson_attempt_id: string;
  exercise_id: string;
  user_answer: string | null;
  is_correct: boolean;
  is_near_miss: boolean;
  created_at: string;
}

export interface UserMistake {
  id: string;
  user_id: string;
  exercise_id: string;
  last_wrong_answer: string | null;
  wrong_count: number;
  needs_review: boolean;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Leaderboard view
// ============================================================
export interface LeaderboardEntry {
  id: string;
  username: string;
  total_xp: number;
  current_streak: number;
}

// ============================================================
// complete_lesson RPC response
// ============================================================
export interface CompleteLessonResult {
  attempt_id: string;
  xp_earned: number;
  is_replay: boolean;
  daily_goal_bonus: boolean;
  current_streak: number;
  total_xp: number;
}

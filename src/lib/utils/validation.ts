import type { ExerciseWithOptions } from "@/types/lesson";

/** Levenshtein distance for typo tolerance */
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export interface ValidationResult {
  isCorrect: boolean;
  isNearMiss: boolean;
  correctAnswer: string;
}

function normalize(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Validate a multiple_choice answer */
export function validateMultipleChoice(
  exercise: ExerciseWithOptions,
  selectedOptionId: string
): ValidationResult {
  const selected = exercise.exercise_options.find((o) => o.id === selectedOptionId);
  const correct = exercise.exercise_options.find((o) => o.is_correct);
  return {
    isCorrect: selected?.is_correct ?? false,
    isNearMiss: false,
    correctAnswer: correct?.option_text ?? "",
  };
}

/** Validate a word_bank answer (joined tiles vs correct_answer) */
export function validateWordBank(
  exercise: ExerciseWithOptions,
  selectedTiles: string[]
): ValidationResult {
  const userAnswer = normalize(selectedTiles.join(" "));
  const correct = normalize(exercise.correct_answer ?? "");
  const alts = (exercise.correct_answer_alternatives ?? []).map(normalize);

  const isCorrect = userAnswer === correct || alts.includes(userAnswer);
  return {
    isCorrect,
    isNearMiss: false,
    correctAnswer: exercise.correct_answer ?? "",
  };
}

/** Validate a type_answer with typo tolerance */
export function validateTypeAnswer(
  exercise: ExerciseWithOptions,
  userInput: string
): ValidationResult {
  const answer = normalize(userInput);
  const correct = normalize(exercise.correct_answer ?? "");
  const alts = (exercise.correct_answer_alternatives ?? []).map(normalize);

  // Exact match
  if (answer === correct || alts.includes(answer)) {
    return { isCorrect: true, isNearMiss: false, correctAnswer: exercise.correct_answer ?? "" };
  }

  // Typo tolerance: Levenshtein ≤1 for words >4 chars
  const allCorrect = [correct, ...alts];
  for (const c of allCorrect) {
    if (c.length > 4 && levenshtein(answer, c) <= 1) {
      return { isCorrect: true, isNearMiss: true, correctAnswer: exercise.correct_answer ?? "" };
    }
  }

  return { isCorrect: false, isNearMiss: false, correctAnswer: exercise.correct_answer ?? "" };
}

/** Validate a complete_sentence answer */
export function validateCompleteSentence(
  exercise: ExerciseWithOptions,
  selectedOptionId: string
): ValidationResult {
  const selected = exercise.exercise_options.find((o) => o.id === selectedOptionId);
  return {
    isCorrect: selected?.is_correct ?? false,
    isNearMiss: false,
    correctAnswer: exercise.correct_answer ?? "",
  };
}

/** Check if all matching pairs have been found */
export function validateMatching(
  exercise: ExerciseWithOptions,
  matchedPairIds: Set<string>
): ValidationResult {
  const totalPairs = new Set(
    exercise.exercise_options.map((o) => o.pair_group_id).filter(Boolean)
  );
  return {
    isCorrect: matchedPairIds.size === totalPairs.size,
    isNearMiss: false,
    correctAnswer: "",
  };
}

/** Check if two matching options share the same pair_group_id */
export function isMatchingPairCorrect(
  exercise: ExerciseWithOptions,
  optionId1: string,
  optionId2: string
): boolean {
  const opt1 = exercise.exercise_options.find((o) => o.id === optionId1);
  const opt2 = exercise.exercise_options.find((o) => o.id === optionId2);
  return !!(opt1?.pair_group_id && opt1.pair_group_id === opt2?.pair_group_id);
}

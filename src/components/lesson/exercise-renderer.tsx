"use client";

import { useLessonStore } from "@/stores/lessonStore";
import { MultipleChoice } from "@/components/exercises/multiple-choice";
import { WordBank } from "@/components/exercises/word-bank";
import { TypeAnswer } from "@/components/exercises/type-answer";
import { CompleteSentence } from "@/components/exercises/complete-sentence";
import { Matching } from "@/components/exercises/matching";
import {
  validateMultipleChoice,
  validateWordBank,
  validateTypeAnswer,
  validateCompleteSentence,
} from "@/lib/utils/validation";
import { cn } from "@/lib/utils";

export function ExerciseRenderer() {
  const {
    exercises,
    currentIndex,
    state,
    submitCorrect,
    submitWrong,
    recordPartialMistake,
  } = useLessonStore();
  const exercise = exercises[currentIndex];

  if (!exercise) return null;

  const locked = state !== "active_question";

  function handleResult(answer: string, isCorrect: boolean, isNearMiss: boolean, correctAnswer: string) {
    if (isCorrect) {
      submitCorrect(answer);
    } else {
      submitWrong(answer, correctAnswer, exercise.explanation_he, isNearMiss);
    }
  }

  function renderExercise() {
    switch (exercise.type) {
      case "multiple_choice":
        return (
          <MultipleChoice
            key={exercise.id}
            exercise={exercise}
            onSubmit={(optionId) => {
              const r = validateMultipleChoice(exercise, optionId);
              handleResult(
                exercise.exercise_options.find((o) => o.id === optionId)?.option_text ?? "",
                r.isCorrect,
                r.isNearMiss,
                r.correctAnswer
              );
            }}
          />
        );

      case "word_bank":
        return (
          <WordBank
            key={exercise.id}
            exercise={exercise}
            onSubmit={(tiles) => {
              const r = validateWordBank(exercise, tiles);
              handleResult(tiles.join(" "), r.isCorrect, r.isNearMiss, r.correctAnswer);
            }}
          />
        );

      case "type_answer":
        return (
          <TypeAnswer
            key={exercise.id}
            exercise={exercise}
            onSubmit={(answer) => {
              const r = validateTypeAnswer(exercise, answer);
              handleResult(answer, r.isCorrect, r.isNearMiss, r.correctAnswer);
            }}
          />
        );

      case "complete_sentence":
        return (
          <CompleteSentence
            key={exercise.id}
            exercise={exercise}
            onSubmit={(optionId) => {
              const r = validateCompleteSentence(exercise, optionId);
              handleResult(
                exercise.exercise_options.find((o) => o.id === optionId)?.option_text ?? "",
                r.isCorrect,
                r.isNearMiss,
                r.correctAnswer
              );
            }}
          />
        );

      case "matching":
        return (
          <Matching
            key={exercise.id}
            exercise={exercise}
            // Each wrong pair pick deducts a heart immediately; the matching
            // exercise keeps running until all pairs are matched (or hearts
            // hit zero, in which case the store transitions to "failed").
            onWrongAttempt={(answer) => recordPartialMistake(answer)}
            onComplete={() => submitCorrect("all_pairs_matched")}
          />
        );

      default:
        return <p className="text-center text-muted-foreground">סוג תרגיל לא נתמך</p>;
    }
  }

  // Once an answer has been submitted, lock the exercise so the user can't fix
  // their answer in place — only the feedback bar's "המשך" button is active.
  return (
    <div
      className={cn(
        locked && "pointer-events-none opacity-60 select-none"
      )}
      aria-disabled={locked}
    >
      {renderExercise()}
    </div>
  );
}

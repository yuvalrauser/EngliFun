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
  validateMatching,
} from "@/lib/utils/validation";

export function ExerciseRenderer() {
  const { exercises, currentIndex, submitCorrect, submitWrong } = useLessonStore();
  const exercise = exercises[currentIndex];

  if (!exercise) return null;

  function handleResult(answer: string, isCorrect: boolean, isNearMiss: boolean, correctAnswer: string) {
    if (isCorrect) {
      submitCorrect(answer);
    } else {
      submitWrong(answer, correctAnswer, exercise.explanation_he, isNearMiss);
    }
  }

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
          onComplete={(matchedPairIds) => {
            const r = validateMatching(exercise, matchedPairIds);
            // Matching always succeeds when onComplete fires (all pairs matched)
            submitCorrect("all_pairs_matched");
          }}
        />
      );

    default:
      return <p className="text-center text-muted-foreground">סוג תרגיל לא נתמך</p>;
  }
}

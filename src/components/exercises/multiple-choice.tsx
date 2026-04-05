"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/utils/shuffle";
import type { ExerciseWithOptions } from "@/types/lesson";

interface MultipleChoiceProps {
  exercise: ExerciseWithOptions;
  onSubmit: (selectedOptionId: string) => void;
}

export function MultipleChoice({ exercise, onSubmit }: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const shuffledOptions = useMemo(
    () => shuffle(exercise.exercise_options),
    [exercise.id] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg font-bold" dir={exercise.prompt_language === "en" ? "ltr" : "rtl"}>
          {exercise.prompt_text}
        </p>
      </div>

      <div className="space-y-3">
        {shuffledOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={cn(
              "w-full rounded-2xl border-2 p-4 text-right text-base font-medium transition-all active:scale-[0.98]",
              selected === opt.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/40"
            )}
            dir={opt.option_language === "en" ? "ltr" : "rtl"}
          >
            {opt.option_text}
          </button>
        ))}
      </div>

      <button
        onClick={() => selected && onSubmit(selected)}
        disabled={!selected}
        className={cn(
          "w-full rounded-2xl py-4 text-lg font-bold transition-all",
          selected
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98]"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        בדוק
      </button>
    </div>
  );
}

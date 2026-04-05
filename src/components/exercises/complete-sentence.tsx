"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/utils/shuffle";
import type { ExerciseWithOptions } from "@/types/lesson";

interface CompleteSentenceProps {
  exercise: ExerciseWithOptions;
  onSubmit: (selectedOptionId: string) => void;
}

export function CompleteSentence({ exercise, onSubmit }: CompleteSentenceProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const shuffledOptions = useMemo(
    () => shuffle(exercise.exercise_options),
    [exercise.id] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const parts = exercise.prompt_text.split("___");

  return (
    <div className="space-y-6">
      {/* Sentence with blank */}
      <div className="text-center rounded-2xl bg-card p-6 ring-1 ring-border" dir="ltr">
        <p className="text-xl font-bold leading-relaxed">
          {parts[0]}
          <span className={cn(
            "inline-block min-w-[80px] mx-1 border-b-2 px-2 pb-1 text-center",
            selected ? "border-primary text-primary" : "border-muted-foreground/30"
          )}>
            {selected
              ? exercise.exercise_options.find((o) => o.id === selected)?.option_text
              : ""}
          </span>
          {parts[1] ?? ""}
        </p>
      </div>

      {/* Word options */}
      <div className="flex flex-wrap gap-3 justify-center">
        {shuffledOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setSelected(opt.id)}
            className={cn(
              "rounded-2xl border-2 px-6 min-h-[44px] text-base font-medium transition-all active:scale-95",
              selected === opt.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/40"
            )}
            dir="ltr"
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

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ExerciseWithOptions } from "@/types/lesson";

interface TypeAnswerProps {
  exercise: ExerciseWithOptions;
  onSubmit: (answer: string) => void;
}

export function TypeAnswer({ exercise, onSubmit }: TypeAnswerProps) {
  const [answer, setAnswer] = useState("");

  function handleSubmit() {
    if (answer.trim()) onSubmit(answer.trim());
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg font-bold">{exercise.prompt_text}</p>
      </div>

      <input
        type="text"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="הקלד את התשובה באנגלית..."
        dir="ltr"
        className="w-full rounded-2xl border-2 border-border bg-card px-4 py-4 text-lg text-left font-medium outline-none transition-colors focus:border-primary placeholder:text-muted-foreground/50"
        autoFocus
        autoComplete="off"
      />

      <button
        onClick={handleSubmit}
        disabled={!answer.trim()}
        className={cn(
          "w-full rounded-2xl py-4 text-lg font-bold transition-all",
          answer.trim()
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98]"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        בדוק
      </button>
    </div>
  );
}

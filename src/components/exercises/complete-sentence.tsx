"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/utils/shuffle";
import type { ExerciseWithOptions } from "@/types/lesson";

interface CompleteSentenceProps {
  exercise: ExerciseWithOptions;
  onSubmit: (selectedOptionId: string) => void;
}

export function CompleteSentence({ exercise, onSubmit }: CompleteSentenceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [shuffledOptions] = useState(() => shuffle(exercise.exercise_options));

  const parts = exercise.prompt_text.split("___");
  const promptIsHebrew = exercise.prompt_language === "he";

  // For Hebrew-context prompts with embedded English (e.g. "אמור X: I ___ Y."),
  // split the pre-blank text at the first English letter so the Hebrew context
  // renders as RTL and the entire English clause (including the blank + any
  // trailing tokens like "?" / ".") renders as one coherent LTR isolate.
  // Without this, neutral punctuation drifts to the wrong visual side.
  const firstEnIdx = promptIsHebrew ? parts[0].search(/[A-Za-z]/) : -1;
  const heContext = firstEnIdx >= 0 ? parts[0].slice(0, firstEnIdx) : "";
  const enLead = firstEnIdx >= 0 ? parts[0].slice(firstEnIdx) : parts[0];
  const enTrail = parts[1] ?? "";

  const selectedText = selected
    ? exercise.exercise_options.find((o) => o.id === selected)?.option_text ?? ""
    : "";

  const blankNode = (
    <span
      className={cn(
        "inline-block min-w-[80px] mx-1 border-b-2 px-2 pb-1 text-center align-baseline",
        selected ? "border-primary text-primary" : "border-muted-foreground/30"
      )}
    >
      {selectedText}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Sentence with blank.
          Hebrew context renders RTL on the right; English clause + blank + any
          trailing punctuation render LTR on the left as one bidi isolate. */}
      <div
        className="text-center rounded-2xl bg-card p-6 ring-1 ring-border"
        dir={promptIsHebrew ? "rtl" : "ltr"}
      >
        <p className="text-xl font-bold leading-relaxed">
          {heContext && <span dir="rtl">{heContext}</span>}
          <span dir="ltr" style={{ unicodeBidi: "isolate" }}>
            {enLead}
            {blankNode}
            {enTrail}
          </span>
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

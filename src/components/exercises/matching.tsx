"use client";

import { useState, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/utils/shuffle";
import { isMatchingPairCorrect } from "@/lib/utils/validation";
import type { ExerciseWithOptions } from "@/types/lesson";

interface MatchingProps {
  exercise: ExerciseWithOptions;
  onComplete: (matchedPairIds: Set<string>) => void;
}

export function Matching({ exercise, onComplete }: MatchingProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [matchedOptionIds, setMatchedOptionIds] = useState<Set<string>>(new Set());
  const [flashWrong, setFlashWrong] = useState<Set<string>>(new Set());

  // Shuffle each column independently so pairs don't line up
  const heOptions = useMemo(
    () => shuffle(exercise.exercise_options.filter((o) => o.option_language === "he")),
    [exercise.id] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const enOptions = useMemo(
    () => shuffle(exercise.exercise_options.filter((o) => o.option_language === "en")),
    [exercise.id] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const totalPairs = new Set(
    exercise.exercise_options.map((o) => o.pair_group_id).filter(Boolean)
  ).size;

  const handleSelect = useCallback((optionId: string) => {
    if (matchedOptionIds.has(optionId)) return;

    if (!selectedId) {
      setSelectedId(optionId);
      return;
    }

    if (selectedId === optionId) {
      setSelectedId(null);
      return;
    }

    if (isMatchingPairCorrect(exercise, selectedId, optionId)) {
      const opt = exercise.exercise_options.find((o) => o.id === optionId);
      const pairId = opt?.pair_group_id ?? "";
      const newPairs = new Set(matchedPairs);
      newPairs.add(pairId);
      const newMatched = new Set(matchedOptionIds);
      newMatched.add(selectedId);
      newMatched.add(optionId);

      setMatchedPairs(newPairs);
      setMatchedOptionIds(newMatched);
      setSelectedId(null);

      if (newPairs.size === totalPairs) {
        setTimeout(() => onComplete(newPairs), 400);
      }
    } else {
      const wrongSet = new Set([selectedId, optionId]);
      setFlashWrong(wrongSet);
      setTimeout(() => {
        setFlashWrong(new Set());
        setSelectedId(null);
      }, 600);
    }
  }, [selectedId, matchedOptionIds, matchedPairs, exercise, totalPairs, onComplete]);

  function renderOption(opt: { id: string; option_text: string; option_language: string }) {
    const isMatched = matchedOptionIds.has(opt.id);
    const isSelected = selectedId === opt.id;
    const isWrong = flashWrong.has(opt.id);

    return (
      <button
        key={opt.id}
        onClick={() => handleSelect(opt.id)}
        disabled={isMatched}
        className={cn(
          "rounded-xl border-2 px-4 min-h-[48px] text-base font-medium transition-all w-full",
          isMatched && "border-success/40 bg-success/10 text-success opacity-70",
          isSelected && !isMatched && "border-primary bg-primary/10 shadow-sm",
          isWrong && "border-destructive bg-destructive/10",
          !isMatched && !isSelected && !isWrong && "border-border bg-card hover:border-primary/30 active:scale-[0.97]",
        )}
        dir={opt.option_language === "en" ? "ltr" : "rtl"}
      >
        {isMatched ? "✓ " : ""}{opt.option_text}
      </button>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg font-bold">{exercise.prompt_text}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {matchedPairs.size}/{totalPairs} זוגות
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground text-center mb-1">English</div>
          {enOptions.map(renderOption)}
        </div>
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground text-center mb-1">עברית</div>
          {heOptions.map(renderOption)}
        </div>
      </div>
    </div>
  );
}

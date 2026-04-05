"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { shuffle } from "@/lib/utils/shuffle";
import type { ExerciseWithOptions } from "@/types/lesson";

interface WordBankProps {
  exercise: ExerciseWithOptions;
  onSubmit: (selectedTiles: string[]) => void;
}

export function WordBank({ exercise, onSubmit }: WordBankProps) {
  const [selected, setSelected] = useState<number[]>([]);

  // Shuffle tile order so they don't appear in correct sentence order
  const shuffledTiles = useMemo(() => {
    const indexed = exercise.word_bank_words.map((word, origIdx) => ({ word, origIdx }));
    return shuffle(indexed);
  }, [exercise.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function addTile(shuffledIdx: number) {
    if (!selected.includes(shuffledIdx)) {
      setSelected([...selected, shuffledIdx]);
    }
  }

  function removeTile(shuffledIdx: number) {
    setSelected(selected.filter((i) => i !== shuffledIdx));
  }

  // Get the actual words in the order user selected
  const selectedWords = selected.map((i) => shuffledTiles[i].word);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-lg font-bold">{exercise.prompt_text}</p>
      </div>

      {/* Answer area */}
      <div
        className="min-h-[60px] rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-3 flex flex-wrap gap-2 items-center"
        dir="ltr"
      >
        {selected.length === 0 && (
          <span className="text-muted-foreground text-sm w-full text-center">לחץ על מילים כדי לבנות משפט</span>
        )}
        {selected.map((shuffledIdx) => (
          <button
            key={shuffledIdx}
            onClick={() => removeTile(shuffledIdx)}
            className="rounded-xl bg-primary text-primary-foreground px-4 min-h-[44px] text-base font-medium shadow-sm transition-all hover:bg-primary/90 active:scale-95"
          >
            {shuffledTiles[shuffledIdx].word}
          </button>
        ))}
      </div>

      {/* Tile pool */}
      <div className="flex flex-wrap gap-2 justify-center" dir="ltr">
        {shuffledTiles.map((tile, shuffledIdx) => {
          const isUsed = selected.includes(shuffledIdx);
          return (
            <button
              key={shuffledIdx}
              onClick={() => addTile(shuffledIdx)}
              disabled={isUsed}
              className={cn(
                "rounded-xl border-2 px-4 min-h-[44px] text-base font-medium transition-all",
                isUsed
                  ? "border-transparent bg-muted/50 text-muted-foreground/30 cursor-not-allowed"
                  : "border-border bg-card shadow-sm hover:border-primary/40 active:scale-95"
              )}
            >
              {tile.word}
            </button>
          );
        })}
      </div>

      <button
        onClick={() => selected.length > 0 && onSubmit(selectedWords)}
        disabled={selected.length === 0}
        className={cn(
          "w-full rounded-2xl py-4 text-lg font-bold transition-all",
          selected.length > 0
            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98]"
            : "bg-muted text-muted-foreground cursor-not-allowed"
        )}
      >
        בדוק
      </button>
    </div>
  );
}

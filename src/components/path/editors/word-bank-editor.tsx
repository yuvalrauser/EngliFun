"use client";

import { useState, useTransition } from "react";
import { upsertCustomExercise } from "@/app/(auth)/path/actions";
import type { ExerciseWithOptions } from "@/types/lesson";

interface WordBankEditorProps {
  lessonId: string;
  existing: ExerciseWithOptions | null;
  onSaved: () => void;
  onCancel: () => void;
}

function deriveInitial(ex: ExerciseWithOptions | null) {
  if (!ex) {
    return {
      promptText: "",
      correctAnswer: "",
      tiles: "",
      alternatives: "",
      explanation: "",
    };
  }
  return {
    promptText: ex.prompt_text,
    correctAnswer: ex.correct_answer ?? "",
    tiles: (ex.word_bank_words ?? []).join(" "),
    alternatives: (ex.correct_answer_alternatives ?? []).join("\n"),
    explanation: ex.explanation_he,
  };
}

export function WordBankEditor({
  lessonId,
  existing,
  onSaved,
  onCancel,
}: WordBankEditorProps) {
  const init = deriveInitial(existing);
  const [prompt, setPrompt] = useState(init.promptText);
  const [correctAnswer, setCorrectAnswer] = useState(init.correctAnswer);
  const [tilesText, setTilesText] = useState(init.tiles);
  const [altText, setAltText] = useState(init.alternatives);
  const [explanation, setExplanation] = useState(init.explanation);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const tiles = tilesText
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  const alternatives = altText
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

  // Auto-derive tiles from the correct_answer split + a few decoys can be
  // added manually. We show a preview of the current tiles so the user
  // catches typos.

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await upsertCustomExercise({
        id: existing?.id,
        lessonId,
        type: "word_bank",
        promptText: prompt,
        promptLanguage: "he",
        explanationHe: explanation,
        correctAnswer,
        correctAnswerAlternatives: alternatives,
        wordBankWords: tiles,
      });
      if (!result.ok) {
        setError(result.error ?? "שגיאה");
        return;
      }
      onSaved();
    });
  }

  return (
    <div className="space-y-4 mt-2">
      <div>
        <label className="block text-xs font-semibold mb-1">השאלה בעברית</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="למשל: תרגם לאנגלית: אני אוכל לחם."
          maxLength={150}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">
          התשובה המלאה באנגלית (חייבת ≥2 מילים)
        </label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          dir="ltr"
          placeholder="I eat bread."
          maxLength={80}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">
          מילים (tiles) — כל המילים של התשובה + אופציונלי כמה הסחות
        </label>
        <input
          type="text"
          value={tilesText}
          onChange={(e) => setTilesText(e.target.value)}
          dir="ltr"
          placeholder="I eat bread. drink water."
          maxLength={200}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <div className="flex flex-wrap gap-1 mt-2 min-h-[1.5rem]">
          {tiles.map((t, i) => (
            <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-xs" dir="ltr">{t}</span>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">
          תשובות חלופיות (כל שורה תשובה אחת — אופציונלי)
        </label>
        <textarea
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          rows={2}
          maxLength={200}
          dir="ltr"
          placeholder={"I eat bread\nI'm eating bread"}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">הסבר (יוצג אחרי טעות)</label>
        <textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          rows={2}
          maxLength={200}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {error && <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive text-center">{error}</div>}

      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold">ביטול</button>
        <button type="button" onClick={handleSave} disabled={pending} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">{pending ? "שומר..." : "שמור"}</button>
      </div>
    </div>
  );
}

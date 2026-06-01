"use client";

import { useState, useTransition } from "react";
import { upsertCustomExercise } from "@/app/(auth)/path/actions";
import type { ExerciseWithOptions } from "@/types/lesson";

interface TypeAnswerEditorProps {
  lessonId: string;
  existing: ExerciseWithOptions | null;
  onSaved: () => void;
  onCancel: () => void;
}

export function TypeAnswerEditor({
  lessonId,
  existing,
  onSaved,
  onCancel,
}: TypeAnswerEditorProps) {
  const [prompt, setPrompt] = useState(existing?.prompt_text ?? "");
  const [correctAnswer, setCorrectAnswer] = useState(existing?.correct_answer ?? "");
  const [altText, setAltText] = useState(
    (existing?.correct_answer_alternatives ?? []).join("\n"),
  );
  const [explanation, setExplanation] = useState(existing?.explanation_he ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const alternatives = altText
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await upsertCustomExercise({
        id: existing?.id,
        lessonId,
        type: "type_answer",
        promptText: prompt,
        promptLanguage: "he",
        explanationHe: explanation,
        correctAnswer,
        correctAnswerAlternatives: alternatives,
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
          placeholder="למשל: איך אומרים 'תפוח' באנגלית?"
          maxLength={150}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">התשובה הנכונה</label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => setCorrectAnswer(e.target.value)}
          dir="ltr"
          placeholder="apple"
          maxLength={80}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">
          תשובות חלופיות (כל שורה תשובה אחת — אופציונלי)
        </label>
        <textarea
          value={altText}
          onChange={(e) => setAltText(e.target.value)}
          rows={3}
          maxLength={200}
          dir="ltr"
          placeholder={"Apple\napple."}
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

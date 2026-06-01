"use client";

import { useState, useTransition } from "react";
import { upsertCustomExercise } from "@/app/(auth)/path/actions";
import type { ExerciseWithOptions } from "@/types/lesson";

interface Option {
  text: string;
  isCorrect: boolean;
}

interface CompleteSentenceEditorProps {
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
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      explanation: "",
    };
  }
  const opts = ex.exercise_options.map((o) => ({
    text: o.option_text,
    isCorrect: o.is_correct,
  }));
  while (opts.length < 3) opts.push({ text: "", isCorrect: false });
  return {
    promptText: ex.prompt_text,
    correctAnswer: ex.correct_answer ?? "",
    options: opts.slice(0, 3),
    explanation: ex.explanation_he,
  };
}

export function CompleteSentenceEditor({
  lessonId,
  existing,
  onSaved,
  onCancel,
}: CompleteSentenceEditorProps) {
  const init = deriveInitial(existing);
  const [prompt, setPrompt] = useState(init.promptText);
  const [correctAnswer, setCorrectAnswer] = useState(init.correctAnswer);
  const [options, setOptions] = useState<Option[]>(init.options);
  const [explanation, setExplanation] = useState(init.explanation);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setCorrect(idx: number) {
    setOptions((prev) =>
      prev.map((o, i) => ({ ...o, isCorrect: i === idx })),
    );
    // Also sync correctAnswer to the selected option's text for convenience.
    const t = options[idx]?.text;
    if (t) setCorrectAnswer(t);
  }

  function updateOption(idx: number, text: string) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, text } : o)));
    if (options[idx]?.isCorrect) setCorrectAnswer(text);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await upsertCustomExercise({
        id: existing?.id,
        lessonId,
        type: "complete_sentence",
        promptText: prompt,
        promptLanguage: "he",
        explanationHe: explanation,
        correctAnswer,
        options: options.map((o) => ({
          text: o.text,
          language: "en",
          isCorrect: o.isCorrect,
        })),
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
        <label className="block text-xs font-semibold mb-1">
          השאלה — חובה לכלול ___ במקום בו ייכנס התשובה
        </label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="למשל: אמור אני אוכל לחם: I ___ bread."
          maxLength={150}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold mb-1">
          3 אפשרויות באנגלית (סמן את הנכונה)
        </label>
        <div className="space-y-2">
          {options.map((o, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setCorrect(idx)}
                className={`h-6 w-6 shrink-0 rounded-full border-2 ${o.isCorrect ? "bg-success border-success" : "border-border"}`}
              />
              <input
                type="text"
                value={o.text}
                onChange={(e) => updateOption(idx, e.target.value)}
                dir="ltr"
                maxLength={30}
                placeholder={`אפשרות ${idx + 1}`}
                className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
          ))}
        </div>
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

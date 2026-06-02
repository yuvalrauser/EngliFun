"use client";

import { useState, useTransition } from "react";
import { upsertCustomExercise } from "@/app/(auth)/path/actions";
import type { ExerciseWithOptions } from "@/types/lesson";

interface Option {
  text: string;
  language: "en" | "he";
  isCorrect: boolean;
}

interface MultipleChoiceEditorProps {
  lessonId: string;
  existing: ExerciseWithOptions | null;
  onSaved: (saved: ExerciseWithOptions) => void;
  onCancel: () => void;
}

function deriveInitial(ex: ExerciseWithOptions | null): {
  promptText: string;
  promptLanguage: "en" | "he";
  options: Option[];
  explanation: string;
} {
  if (!ex) {
    return {
      promptText: "",
      promptLanguage: "en",
      options: [
        { text: "", language: "he", isCorrect: true },
        { text: "", language: "he", isCorrect: false },
        { text: "", language: "he", isCorrect: false },
        { text: "", language: "he", isCorrect: false },
      ],
      explanation: "",
    };
  }
  const opts = ex.exercise_options.map((o) => ({
    text: o.option_text,
    language: o.option_language as "en" | "he",
    isCorrect: o.is_correct,
  }));
  while (opts.length < 4) {
    opts.push({ text: "", language: "he", isCorrect: false });
  }
  return {
    promptText: ex.prompt_text,
    promptLanguage: ex.prompt_language as "en" | "he",
    options: opts.slice(0, 4),
    explanation: ex.explanation_he,
  };
}

export function MultipleChoiceEditor({
  lessonId,
  existing,
  onSaved,
  onCancel,
}: MultipleChoiceEditorProps) {
  const init = deriveInitial(existing);
  const [prompt, setPrompt] = useState(init.promptText);
  const [promptLang, setPromptLang] = useState<"en" | "he">(init.promptLanguage);
  const [optionsLang, setOptionsLang] = useState<"en" | "he">(
    init.options[0]?.language ?? "he",
  );
  const [options, setOptions] = useState<Option[]>(init.options);
  const [explanation, setExplanation] = useState(init.explanation);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function setCorrect(idx: number) {
    setOptions((prev) => prev.map((o, i) => ({ ...o, isCorrect: i === idx })));
  }

  function updateOption(idx: number, text: string) {
    setOptions((prev) => prev.map((o, i) => (i === idx ? { ...o, text } : o)));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await upsertCustomExercise({
        id: existing?.id,
        lessonId,
        type: "multiple_choice",
        promptText: prompt,
        promptLanguage: promptLang,
        explanationHe: explanation,
        options: options.map((o) => ({
          text: o.text,
          language: optionsLang,
          isCorrect: o.isCorrect,
        })),
      });
      if (!result.ok || !result.exercise) {
        setError(result.error ?? "שגיאה");
        return;
      }
      onSaved(result.exercise);
    });
  }

  return (
    <div className="space-y-4 mt-2">
      <div>
        <label className="block text-xs font-semibold mb-1">השאלה</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          dir={promptLang === "en" ? "ltr" : "rtl"}
          maxLength={120}
          placeholder={promptLang === "en" ? "e.g. apple" : "לדוגמה: תפוח"}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <div className="flex gap-2 mt-2 text-xs">
          <span className="text-muted-foreground">שפת השאלה:</span>
          <button type="button" onClick={() => setPromptLang("en")} className={promptLang === "en" ? "font-bold text-primary" : "text-muted-foreground"}>English</button>
          <button type="button" onClick={() => setPromptLang("he")} className={promptLang === "he" ? "font-bold text-primary" : "text-muted-foreground"}>עברית</button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1">
          <label className="block text-xs font-semibold">4 אפשרויות (סמן את הנכונה)</label>
          <div className="flex gap-2 text-xs">
            <span className="text-muted-foreground">שפה:</span>
            <button type="button" onClick={() => setOptionsLang("en")} className={optionsLang === "en" ? "font-bold text-primary" : "text-muted-foreground"}>EN</button>
            <button type="button" onClick={() => setOptionsLang("he")} className={optionsLang === "he" ? "font-bold text-primary" : "text-muted-foreground"}>HE</button>
          </div>
        </div>
        <div className="space-y-2">
          {options.map((o, idx) => (
            <div key={idx} className="flex gap-2 items-center">
              <button
                type="button"
                onClick={() => setCorrect(idx)}
                className={`h-6 w-6 shrink-0 rounded-full border-2 ${o.isCorrect ? "bg-success border-success" : "border-border"}`}
                aria-label="סמן כתשובה נכונה"
              />
              <input
                type="text"
                value={o.text}
                onChange={(e) => updateOption(idx, e.target.value)}
                dir={optionsLang === "en" ? "ltr" : "rtl"}
                maxLength={40}
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

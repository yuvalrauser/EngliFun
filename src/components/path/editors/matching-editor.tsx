"use client";

import { useState, useTransition } from "react";
import { upsertCustomExercise } from "@/app/(auth)/path/actions";
import type { ExerciseWithOptions } from "@/types/lesson";

interface MatchingEditorProps {
  lessonId: string;
  existing: ExerciseWithOptions | null;
  onSaved: (saved: ExerciseWithOptions) => void;
  onCancel: () => void;
}

interface Pair {
  en: string;
  he: string;
}

const EMPTY_PAIRS: Pair[] = [
  { en: "", he: "" },
  { en: "", he: "" },
  { en: "", he: "" },
  { en: "", he: "" },
];

function deriveInitialPairs(ex: ExerciseWithOptions | null): Pair[] {
  if (!ex) return EMPTY_PAIRS.map((p) => ({ ...p }));
  // Group options by pair_group_id, then pick the en + he from each group.
  const groups = new Map<string, { en?: string; he?: string }>();
  for (const opt of ex.exercise_options) {
    if (!opt.pair_group_id) continue;
    const g = groups.get(opt.pair_group_id) ?? {};
    if (opt.option_language === "en") g.en = opt.option_text;
    if (opt.option_language === "he") g.he = opt.option_text;
    groups.set(opt.pair_group_id, g);
  }
  const pairs: Pair[] = [];
  for (const g of groups.values()) {
    pairs.push({ en: g.en ?? "", he: g.he ?? "" });
  }
  while (pairs.length < 4) pairs.push({ en: "", he: "" });
  return pairs.slice(0, 4);
}

export function MatchingEditor({
  lessonId,
  existing,
  onSaved,
  onCancel,
}: MatchingEditorProps) {
  const [prompt, setPrompt] = useState(
    existing?.prompt_text ?? "התאם את המילים לתרגום שלהן",
  );
  const [explanation, setExplanation] = useState(
    existing?.explanation_he ?? "התאמת אוצר מילים.",
  );
  const [pairs, setPairs] = useState<Pair[]>(deriveInitialPairs(existing));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updatePair(idx: number, key: keyof Pair, value: string) {
    setPairs((prev) => prev.map((p, i) => (i === idx ? { ...p, [key]: value } : p)));
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const result = await upsertCustomExercise({
        id: existing?.id,
        lessonId,
        type: "matching",
        promptText: prompt,
        promptLanguage: "he",
        explanationHe: explanation,
        pairs: pairs.map((p) => ({ en: p.en, he: p.he })),
      });
      if (!result.ok || !result.exercise) {
        setError(result.error ?? "שגיאה");
        return;
      }
      onSaved(result.exercise);
    });
  }

  const allFilled = pairs.every((p) => p.en.trim() && p.he.trim());

  return (
    <div className="space-y-4 mt-2">
      <div>
        <label className="block text-xs font-semibold mb-1">הוראה למשתמש</label>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          maxLength={120}
          className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-semibold">זוגות התאמה</label>
        {pairs.map((p, idx) => (
          <div key={idx} className="grid grid-cols-2 gap-2">
            <input
              type="text"
              value={p.en}
              onChange={(e) => updatePair(idx, "en", e.target.value)}
              placeholder="English"
              dir="ltr"
              maxLength={40}
              className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <input
              type="text"
              value={p.he}
              onChange={(e) => updatePair(idx, "he", e.target.value)}
              placeholder="עברית"
              maxLength={40}
              className="w-full rounded-xl border-2 border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        ))}
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

      {error && (
        <div className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive text-center">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold"
        >
          ביטול
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || !allFilled}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {pending ? "שומר..." : "שמור"}
        </button>
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCustomExercise } from "@/app/(auth)/path/actions";
import { MatchingEditor } from "@/components/path/editors/matching-editor";
import { MultipleChoiceEditor } from "@/components/path/editors/multiple-choice-editor";
import { CompleteSentenceEditor } from "@/components/path/editors/complete-sentence-editor";
import { WordBankEditor } from "@/components/path/editors/word-bank-editor";
import { TypeAnswerEditor } from "@/components/path/editors/type-answer-editor";
import type { Lesson, ExerciseType } from "@/types/database";
import type { ExerciseWithOptions } from "@/types/lesson";

const TYPE_LABEL_HE: Record<ExerciseType, string> = {
  multiple_choice: "רב-ברירה",
  complete_sentence: "השלמת משפט",
  word_bank: "Word bank",
  matching: "התאמה",
  type_answer: "הקלדת תשובה",
};

const TYPE_ICON: Record<ExerciseType, string> = {
  multiple_choice: "🔘",
  complete_sentence: "✏️",
  word_bank: "🧩",
  matching: "🔗",
  type_answer: "⌨️",
};

interface LessonEditorProps {
  unitId: string;
  lesson: Lesson;
  exercises: ExerciseWithOptions[];
}

type ModalState =
  | { mode: "closed" }
  | { mode: "picker" }
  | { mode: "edit"; type: ExerciseType; exercise: ExerciseWithOptions | null };

export function LessonEditor({ unitId, lesson, exercises: initial }: LessonEditorProps) {
  const router = useRouter();
  const [exercises, setExercises] = useState(initial);
  const [modal, setModal] = useState<ModalState>({ mode: "closed" });
  const [pending, startTransition] = useTransition();

  function handleAdd(type: ExerciseType) {
    setModal({ mode: "edit", type, exercise: null });
  }

  function handleEdit(exercise: ExerciseWithOptions) {
    setModal({ mode: "edit", type: exercise.type, exercise });
  }

  function handleDelete(exercise: ExerciseWithOptions) {
    if (!window.confirm(`למחוק תרגיל "${exercise.prompt_text}"?`)) return;
    startTransition(async () => {
      const result = await deleteCustomExercise(exercise.id);
      if (!result.ok) {
        window.alert(result.error ?? "שגיאה");
        return;
      }
      setExercises((prev) => prev.filter((e) => e.id !== exercise.id));
      router.refresh();
    });
  }

  function handleSaved() {
    setModal({ mode: "closed" });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <h1 className="text-xl font-bold">{lesson.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {exercises.length} תרגילים
        </p>
      </div>

      <div className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-3">
        <h2 className="text-lg font-bold">תרגילים</h2>

        {exercises.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            אין תרגילים — הוסף את הראשון למטה
          </p>
        )}

        {exercises.map((ex, idx) => (
          <div key={ex.id} className="flex items-center gap-3 rounded-2xl border border-border p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground">
                {TYPE_ICON[ex.type]} {TYPE_LABEL_HE[ex.type]}
              </div>
              <div
                className="text-sm font-medium truncate"
                dir={ex.prompt_language === "en" ? "ltr" : "rtl"}
              >
                {ex.prompt_text}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleEdit(ex)}
              className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary shrink-0"
            >
              ערוך
            </button>
            <button
              type="button"
              onClick={() => handleDelete(ex)}
              disabled={pending}
              className="text-destructive/70 hover:text-destructive shrink-0 disabled:opacity-50"
              aria-label="מחק"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => setModal({ mode: "picker" })}
          className="w-full rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
        >
          ＋ הוסף תרגיל
        </button>
      </div>

      {modal.mode === "picker" && (
        <TypePickerModal
          onClose={() => setModal({ mode: "closed" })}
          onPick={handleAdd}
        />
      )}

      {modal.mode === "edit" && (
        <EditorModal
          unitId={unitId}
          lessonId={lesson.id}
          type={modal.type}
          existing={modal.exercise}
          onClose={() => setModal({ mode: "closed" })}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

function TypePickerModal({
  onClose,
  onPick,
}: {
  onClose: () => void;
  onPick: (type: ExerciseType) => void;
}) {
  const types: ExerciseType[] = [
    "matching",
    "multiple_choice",
    "complete_sentence",
    "word_bank",
    "type_answer",
  ];
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-card p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-center mb-4">בחר סוג תרגיל</h3>
        <div className="grid grid-cols-1 gap-2">
          {types.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onPick(t)}
              className="flex items-center gap-3 rounded-2xl border-2 border-border p-4 text-right hover:border-primary hover:bg-primary/5 transition-all"
            >
              <span className="text-2xl">{TYPE_ICON[t]}</span>
              <span className="font-semibold flex-1">{TYPE_LABEL_HE[t]}</span>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full rounded-xl border border-border py-2 text-sm font-semibold"
        >
          ביטול
        </button>
      </div>
    </div>
  );
}

function EditorModal({
  unitId: _unitId,
  lessonId,
  type,
  existing,
  onClose,
  onSaved,
}: {
  unitId: string;
  lessonId: string;
  type: ExerciseType;
  existing: ExerciseWithOptions | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const editorProps = { lessonId, existing, onSaved, onCancel: onClose };
  const editor =
    type === "matching" ? <MatchingEditor {...editorProps} /> :
    type === "multiple_choice" ? <MultipleChoiceEditor {...editorProps} /> :
    type === "complete_sentence" ? <CompleteSentenceEditor {...editorProps} /> :
    type === "word_bank" ? <WordBankEditor {...editorProps} /> :
    <TypeAnswerEditor {...editorProps} />;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-card p-5 shadow-xl max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-center mb-1">
          {TYPE_ICON[type]} {TYPE_LABEL_HE[type]}
        </h3>
        {void _unitId}
        {editor}
      </div>
    </div>
  );
}

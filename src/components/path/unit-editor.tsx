"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  updateUnitMetadata,
  updateLessonTitle,
  deleteCustomLesson,
  addLessonToUnit,
  deleteCustomUnit,
} from "@/app/(auth)/path/actions";
import type { Lesson, Unit } from "@/types/database";
import { cn } from "@/lib/utils";

const PALETTE = [
  "#58CC02", "#1CB0F6", "#FFB020", "#FF6B6B", "#00C2A8",
  "#4D96FF", "#FFD43B", "#8B5CF6", "#9CA3AF",
];

interface UnitEditorProps {
  unit: Unit;
  lessons: Lesson[];
}

export function UnitEditor({ unit, lessons: initialLessons }: UnitEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(unit.title);
  const [description, setDescription] = useState(unit.description ?? "");
  const [icon, setIcon] = useState(unit.icon_emoji ?? "📝");
  const [color, setColor] = useState(unit.color_hex ?? "#9CA3AF");
  const [meta, setMeta] = useState<{ saving: boolean; error: string | null }>({
    saving: false,
    error: null,
  });
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons);
  const [pending, startTransition] = useTransition();

  async function saveMetadata() {
    setMeta({ saving: true, error: null });
    const result = await updateUnitMetadata({
      unitId: unit.id,
      title,
      description,
      icon_emoji: icon,
      color_hex: color,
    });
    setMeta({ saving: false, error: result.ok ? null : result.error ?? "שגיאה" });
    if (result.ok) router.refresh();
  }

  function handleLessonTitleSave(lessonId: string, newTitle: string) {
    startTransition(async () => {
      const result = await updateLessonTitle(lessonId, newTitle);
      if (!result.ok) {
        window.alert(result.error ?? "שגיאה");
        router.refresh();
      } else {
        setLessons((prev) =>
          prev.map((l) => (l.id === lessonId ? { ...l, title: newTitle } : l)),
        );
      }
    });
  }

  function handleDeleteLesson(lessonId: string, lessonTitle: string) {
    if (!window.confirm(`למחוק את "${lessonTitle}" וכל התרגילים שבו?`)) return;
    startTransition(async () => {
      const result = await deleteCustomLesson(lessonId);
      if (!result.ok) {
        window.alert(result.error ?? "שגיאה");
        return;
      }
      setLessons((prev) => prev.filter((l) => l.id !== lessonId));
      router.refresh();
    });
  }

  function handleAddLesson() {
    startTransition(async () => {
      const result = await addLessonToUnit(unit.id);
      if (!result.ok) {
        window.alert(result.error ?? "שגיאה");
        return;
      }
      router.refresh();
    });
  }

  function handleDeleteUnit() {
    if (
      !window.confirm(
        `למחוק את היחידה "${unit.title}" וכל השיעורים והתרגילים שבה? פעולה זו לא ניתנת לביטול.`,
      )
    )
      return;
    startTransition(async () => {
      const result = await deleteCustomUnit(unit.id);
      if (!result.ok) {
        window.alert(result.error ?? "שגיאה במחיקה");
        return;
      }
      router.push("/path");
      router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      {/* Metadata editor */}
      <div className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-4">
        <h1 className="text-xl font-bold">פרטי היחידה</h1>

        <div
          className="flex items-center gap-4 rounded-2xl p-3"
          style={{ background: `linear-gradient(to left, ${color}20, ${color}08)` }}
        >
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${color}30` }}
          >
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold truncate">{title || "שם היחידה"}</p>
            {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">שם</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={80}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-base focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">תיאור</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
            rows={2}
            className="w-full rounded-xl border-2 border-border bg-card px-4 py-2.5 text-base focus:border-primary focus:outline-none resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">אייקון</label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            maxLength={4}
            className="w-20 rounded-xl border-2 border-border bg-card px-4 py-2.5 text-2xl text-center focus:border-primary focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">צבע</label>
          <div className="flex flex-wrap gap-2">
            {PALETTE.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={cn(
                  "h-8 w-8 rounded-full border-2 transition-all",
                  color === c ? "border-foreground scale-110" : "border-transparent",
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {meta.error && (
          <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive text-center">
            {meta.error}
          </div>
        )}
        <button
          type="button"
          onClick={saveMetadata}
          disabled={meta.saving}
          className="w-full rounded-2xl bg-primary py-3 text-base font-bold text-primary-foreground shadow-md transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {meta.saving ? "שומר..." : "שמור פרטי יחידה"}
        </button>
      </div>

      {/* Lessons list */}
      <div className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">שיעורים</h2>
          <span className="text-xs text-muted-foreground">{lessons.length} שיעורים</span>
        </div>

        {lessons.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            אין שיעורים — הוסף את הראשון
          </p>
        )}

        {lessons.map((lesson, idx) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            displayIndex={idx + 1}
            disabled={pending}
            onRename={(newTitle) => handleLessonTitleSave(lesson.id, newTitle)}
            onDelete={() => handleDeleteLesson(lesson.id, lesson.title)}
            editHref={`/path/edit/${unit.id}/${lesson.id}`}
          />
        ))}

        <button
          type="button"
          onClick={handleAddLesson}
          disabled={pending}
          className="w-full rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors disabled:opacity-60"
        >
          ＋ הוסף שיעור
        </button>
      </div>

      {/* Destructive action — fenced off at the bottom of the page. */}
      <div className="rounded-3xl bg-destructive/5 p-6 ring-1 ring-destructive/20">
        <h3 className="text-sm font-bold text-destructive mb-1">איזור מחיקה</h3>
        <p className="text-xs text-muted-foreground mb-3">
          מחיקת היחידה תמחק גם את כל השיעורים והתרגילים שבה. לא ניתן לבטל.
        </p>
        <button
          type="button"
          onClick={handleDeleteUnit}
          disabled={pending}
          className="w-full rounded-xl bg-destructive py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          מחק יחידה
        </button>
      </div>
    </div>
  );
}

interface LessonRowProps {
  lesson: Lesson;
  displayIndex: number;
  disabled: boolean;
  onRename: (title: string) => void;
  onDelete: () => void;
  editHref: string;
}

function LessonRow({ lesson, displayIndex, disabled, onRename, onDelete, editHref }: LessonRowProps) {
  const [titleDraft, setTitleDraft] = useState(lesson.title);
  const [editing, setEditing] = useState(false);

  function commitTitle() {
    setEditing(false);
    if (titleDraft.trim() && titleDraft !== lesson.title) {
      onRename(titleDraft.trim());
    } else {
      setTitleDraft(lesson.title);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
        {displayIndex}
      </div>
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            type="text"
            value={titleDraft}
            autoFocus
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") {
                setTitleDraft(lesson.title);
                setEditing(false);
              }
            }}
            maxLength={80}
            className="w-full rounded-md border border-primary px-2 py-1 text-sm focus:outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="w-full text-right font-semibold text-sm truncate hover:text-primary"
          >
            {lesson.title}
          </button>
        )}
        <div className="text-xs text-muted-foreground mt-0.5">
          {lesson.exercise_count} תרגילים
        </div>
      </div>
      <Link
        href={editHref}
        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shrink-0"
      >
        ערוך
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={disabled}
        className="text-destructive/70 hover:text-destructive shrink-0 disabled:opacity-50"
        aria-label="מחק שיעור"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
}

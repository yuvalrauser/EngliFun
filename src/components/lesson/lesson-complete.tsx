"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Mascot } from "@/components/ui/mascot";
import { useLessonStore } from "@/stores/lessonStore";
import { completeLesson } from "@/services/progress";

export function LessonComplete() {
  const router = useRouter();
  const store = useLessonStore();
  const [xp, setXp] = useState(0);
  const [saving, setSaving] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const savedRef = useRef(false);

  const total = store.exercises.length;

  // Deduplicate attempts: keep only the last attempt per exercise
  const correctCount = (() => {
    const deduped = new Map<string, boolean>();
    for (const a of store.attempts) {
      deduped.set(a.exercise_id, a.is_correct);
    }
    return Array.from(deduped.values()).filter(Boolean).length;
  })();

  useEffect(() => {
    if (savedRef.current) return;
    savedRef.current = true;

    // Snapshot store values at call time
    const { lessonId, exercises, hearts, attempts, startedAt } = useLessonStore.getState();
    const totalEx = exercises.length;
    const dur = Math.floor((Date.now() - startedAt.getTime()) / 1000);

    // Deduplicate
    const deduped = new Map<string, (typeof attempts)[number]>();
    for (const a of attempts) {
      deduped.set(a.exercise_id, a);
    }
    const finalAttempts = Array.from(deduped.values());
    const correct = finalAttempts.filter((a) => a.is_correct).length;

    async function save() {
      try {
        const result = await completeLesson({
          lessonId,
          totalExercises: totalEx,
          correctCount: correct,
          heartsRemaining: hearts,
          isPerfect: correct === totalEx && hearts === 3,
          durationSeconds: dur,
          exerciseAttempts: finalAttempts,
        });
        setXp(result.xp_earned);
      } catch (err) {
        console.error("Failed to save lesson:", err);
        setErrorMsg(
          err instanceof Error ? err.message : "שגיאה בשמירת התוצאות"
        );
      } finally {
        setSaving(false);
      }
    }
    save();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <Mascot size="lg" className="animate-float mb-4" />

      <h1 className="text-3xl font-bold mb-2">
        {correctCount === total ? "!מושלם" : "!כל הכבוד"}
      </h1>
      <p className="text-muted-foreground mb-6">
        {correctCount === total ? "סיימת בלי אף טעות!" : "סיימת את השיעור בהצלחה!"}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-8">
        <div className="rounded-2xl bg-xp-gold/20 p-4 text-center min-w-[80px]">
          <div className="text-2xl font-bold text-xp-gold-foreground">
            {saving ? "..." : errorMsg ? "—" : `+${xp}`}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">XP</div>
        </div>
        <div className="rounded-2xl bg-primary/10 p-4 text-center min-w-[80px]">
          <div className="text-2xl font-bold text-primary">{correctCount}/{total}</div>
          <div className="text-xs text-muted-foreground mt-0.5">נכונות</div>
        </div>
        <div className="rounded-2xl bg-red-50 p-4 text-center min-w-[80px]">
          <div className="text-2xl font-bold">
            {"❤️".repeat(store.hearts)}{"🖤".repeat(3 - store.hearts)}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">לבבות</div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive max-w-xs">
          <p className="font-semibold mb-1">שגיאה בשמירה</p>
          <p className="text-xs opacity-80">{errorMsg}</p>
        </div>
      )}

      <button
        onClick={() => router.push("/path")}
        className="w-full max-w-xs rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
      >
        המשך
      </button>
    </div>
  );
}

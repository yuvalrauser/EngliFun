"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mascot } from "@/components/ui/mascot";
import { LevelUpModal } from "@/components/lesson/level-up-modal";
import { useLessonStore } from "@/stores/lessonStore";
import { useUserStore } from "@/stores/userStore";
import { completeLesson } from "@/services/progress";
import { getLevel, getLevelLabel } from "@/lib/constants/levels";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

type SaveStatus = "saving" | "success" | "error";

function getFinalAttemptSnapshot() {
  const { lessonId, exercises, hearts, attempts, startedAt } = useLessonStore.getState();
  const deduped = new Map<string, (typeof attempts)[number]>();

  for (const attempt of attempts) {
    deduped.set(attempt.exercise_id, attempt);
  }

  const finalAttempts = Array.from(deduped.values());
  const correctCount = finalAttempts.filter((attempt) => attempt.is_correct).length;

  return {
    lessonId,
    totalExercises: exercises.length,
    correctCount,
    heartsRemaining: hearts,
    isPerfect: correctCount === exercises.length && hearts === 3,
    durationSeconds: Math.max(0, Math.floor((Date.now() - startedAt.getTime()) / 1000)),
    exerciseAttempts: finalAttempts,
  };
}

export function LessonComplete() {
  const router = useRouter();
  const store = useLessonStore();
  const profile = useUserStore((s) => s.profile);
  const setProfile = useUserStore((s) => s.setProfile);
  const [xp, setXp] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saving");
  const [errorMsg, setErrorMsg] = useState("");
  const [levelUp, setLevelUp] = useState<{ level: number; label: string } | null>(null);
  const autoSaveStartedRef = useRef(false);

  // For 0-XP lessons (custom user-built units), the save still runs in
  // the background but the user shouldn't have to wait for it: there's no
  // XP to compute and the only thing the RPC does is mark the row
  // completed. Show "+0" immediately and let המשך be clickable.
  const isZeroXp = store.lessonXpReward === 0;
  const saving = !isZeroXp && saveStatus === "saving";
  const saved = isZeroXp || saveStatus === "success";
  const total = store.exercises.length;

  const correctCount = (() => {
    const deduped = new Map<string, boolean>();
    for (const attempt of store.attempts) {
      deduped.set(attempt.exercise_id, attempt.is_correct);
    }
    return Array.from(deduped.values()).filter(Boolean).length;
  })();

  const saveLesson = useCallback(async () => {
    try {
      setSaveStatus("saving");
      setErrorMsg("");

      // Use the user id from the Zustand profile that was server-hydrated by
      // AuthLayout — calling supabase.auth.getUser() here can hang on a stale
      // cookie refresh, which was the actual root cause of the "שומר" lockup.
      const userId = profile?.id;
      if (!userId) {
        throw new Error("צריך להתחבר מחדש כדי לשמור את השיעור");
      }

      const snapshot = getFinalAttemptSnapshot();
      const xpBefore = profile?.total_xp ?? 0;
      // Use console.error so the line shows up even when info/log are filtered out.
      console.error("[complete-lesson] STEP-1 sending snapshot", {
        userId,
        lessonId: snapshot.lessonId,
        totalExercises: snapshot.totalExercises,
        correctCount: snapshot.correctCount,
        heartsRemaining: snapshot.heartsRemaining,
        attempts: snapshot.exerciseAttempts.length,
      });
      const result = await completeLesson({ ...snapshot, userId });
      console.error("[complete-lesson] STEP-2 rpc returned", result);

      // Update XP + success state IMMEDIATELY from the RPC result.
      // Profile re-fetch happens in the background and must not block the UI.
      setXp(result.xp_earned);

      const levelBefore = getLevel(xpBefore);
      const levelAfter = getLevel(result.total_xp);
      if (levelAfter > levelBefore) {
        setLevelUp({ level: levelAfter, label: getLevelLabel(result.total_xp) });
      }

      if (profile) {
        setProfile({
          ...profile,
          total_xp: result.total_xp,
          current_streak: result.current_streak,
          longest_streak: Math.max(profile.longest_streak, result.current_streak),
          last_activity_date: new Date().toISOString().slice(0, 10),
        });
      }

      setSaveStatus("success");
      // Intentionally NO router.refresh() here: it would re-render the
      // /lesson/[id] server component, produce a new `exercises` array
      // reference, and risk knocking the lesson engine back to its intro
      // state. /path and /dashboard are server components that already
      // fetch fresh data when the user navigates to them.

      // Best-effort fresh profile sync — never blocks the success UI.
      const supabase = createClient();
      supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()
        .then(({ data: freshProfile, error: profileError }) => {
          if (profileError) {
            console.warn("Background profile refresh failed:", profileError);
            return;
          }
          if (freshProfile) setProfile(freshProfile as Profile);
        });
    } catch (err) {
      console.error("Failed to save lesson:", err);
      setErrorMsg(err instanceof Error ? err.message : "שגיאה בשמירת תוצאות השיעור");
      setSaveStatus("error");
    }
  }, [profile, setProfile]);

  useEffect(() => {
    if (autoSaveStartedRef.current) return;
    autoSaveStartedRef.current = true;
    saveLesson();
  }, [saveLesson]);

  function handleContinue() {
    if (!saved) return;
    router.push("/path");
    router.refresh();
  }

  return (
    <>
      {saved && levelUp && (
        <LevelUpModal
          newLevel={levelUp.level}
          newLabel={levelUp.label}
          onClose={() => setLevelUp(null)}
        />
      )}

      <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
        <Mascot size="lg" className="animate-float mb-4" />

        <h1 className="text-3xl font-bold mb-2">
          {correctCount === total ? "!מושלם" : "!כל הכבוד"}
        </h1>
        <p className="text-muted-foreground mb-6">
          {correctCount === total
            ? "סיימת בלי אף טעות!"
            : "סיימת את השיעור בהצלחה!"}
        </p>

        <div className="flex items-center gap-4 mb-8">
          <div className="rounded-2xl bg-xp-gold/20 p-4 text-center min-w-[80px] flex flex-col items-center justify-center">
            {saving ? (
              <div
                className="h-7 w-7 rounded-full border-2 border-xp-gold-foreground/30 border-t-xp-gold-foreground animate-spin"
                aria-label="שומר"
              />
            ) : (
              <div className="text-2xl font-bold text-xp-gold-foreground">
                {errorMsg ? "—" : `+${xp}`}
              </div>
            )}
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

        {saveStatus === "error" ? (
          <div className="flex w-full max-w-xs flex-col gap-3">
            <button
              onClick={saveLesson}
              className="w-full rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
            >
              נסה לשמור שוב
            </button>
            <button
              onClick={() => router.push("/path")}
              className="w-full rounded-2xl border-2 border-border py-3.5 text-base font-medium transition-all hover:bg-muted active:scale-[0.98]"
            >
              חזרה למסלול בלי לסמן כהושלם
            </button>
          </div>
        ) : (
          <button
            onClick={handleContinue}
            disabled={!saved}
            className="w-full max-w-xs rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none"
          >
            {saving ? "שומר תוצאות..." : "המשך"}
          </button>
        )}
      </div>
    </>
  );
}

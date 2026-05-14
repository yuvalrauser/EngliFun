"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/database";

const LEVEL_LABEL_HE: Record<Profile["starting_level"], string> = {
  beginner: "מתחיל",
  elementary: "בסיסי",
  intermediate: "בינוני",
};

interface CourseCompleteBannerProps {
  currentLevel: Profile["starting_level"];
}

export function CourseCompleteBanner({ currentLevel }: CourseCompleteBannerProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "advancing" | "advanced" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [newLabel, setNewLabel] = useState<string | null>(null);

  const isMax = currentLevel === "intermediate";
  const currentLabel = LEVEL_LABEL_HE[currentLevel];

  async function handleAdvance() {
    setStatus("advancing");
    setErrorMsg("");
    try {
      const res = await fetch("/api/advance-level", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "שגיאה בשדרוג הרמה");
      setNewLabel(data.new_level_label);
      setStatus("advanced");
      router.refresh();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "שגיאה בשדרוג הרמה");
      setStatus("error");
    }
  }

  return (
    <div className="mb-4 rounded-3xl bg-gradient-to-l from-success/15 to-success/5 p-5 ring-1 ring-success/20 text-center">
      <div className="text-4xl mb-2 animate-float">🎉</div>
      <h2 className="text-xl font-bold mb-1">!כל הכבוד — סיימת את הקורס</h2>
      <p className="text-sm text-muted-foreground mb-4">
        השלמת את כל השיעורים ברמה{" "}
        <span className="font-semibold text-foreground">{currentLabel}</span>.
        אפשר לחזור על שיעורים כדי לצבור עוד XP, או להתקדם לרמה הבאה.
      </p>

      {status === "advanced" && newLabel && (
        <div className="mb-3 rounded-xl bg-success/15 border border-success/30 px-3 py-2 text-sm font-semibold text-success">
          🚀 עברת לרמה: {newLabel}
        </div>
      )}

      {status === "error" && errorMsg && (
        <div className="mb-3 rounded-xl bg-destructive/10 border border-destructive/30 px-3 py-2 text-sm text-destructive">
          {errorMsg}
        </div>
      )}

      {!isMax && status !== "advanced" && (
        <button
          onClick={handleAdvance}
          disabled={status === "advancing"}
          className={cn(
            "w-full max-w-xs rounded-2xl py-3 text-base font-bold transition-all",
            status === "advancing"
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : "bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98]"
          )}
        >
          {status === "advancing" ? "מעדכן..." : "התקדם לרמה הבאה"}
        </button>
      )}

      {(isMax || status === "advanced") && (
        <p className="text-xs text-muted-foreground">
          תוכן נוסף לרמה הזו יתווסף בקרוב. בינתיים אפשר להתאמן שוב על השיעורים למעלה.
        </p>
      )}
    </div>
  );
}

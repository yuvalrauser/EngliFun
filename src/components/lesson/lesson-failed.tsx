"use client";

import { useRouter } from "next/navigation";
import { Mascot } from "@/components/ui/mascot";
import { useLessonStore } from "@/stores/lessonStore";

export function LessonFailed() {
  const router = useRouter();
  const { exercises, score, reset, goTo } = useLessonStore();
  const total = exercises.length;

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <Mascot size="lg" className="mb-4 opacity-80" />

      <h1 className="text-3xl font-bold mb-2 text-destructive">נגמרו הלבבות</h1>
      <p className="text-muted-foreground mb-2">
        ענית נכון על {score} מתוך {total} תרגילים
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        אל תוותר! נסה שוב ותראה שיפור
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={() => {
            reset();
            goTo("intro");
          }}
          className="w-full rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98]"
        >
          נסה שוב
        </button>
        <button
          onClick={() => router.push("/path")}
          className="w-full rounded-2xl border-2 border-border py-3.5 text-base font-medium transition-all hover:bg-muted active:scale-[0.98]"
        >
          חזרה למסלול
        </button>
      </div>
    </div>
  );
}

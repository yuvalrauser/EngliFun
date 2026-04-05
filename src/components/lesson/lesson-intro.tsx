"use client";

import { Mascot } from "@/components/ui/mascot";
import { useLessonStore } from "@/stores/lessonStore";

interface LessonIntroProps {
  title: string;
  exerciseCount: number;
  xpReward: number;
}

export function LessonIntro({ title, exerciseCount, xpReward }: LessonIntroProps) {
  const { goTo } = useLessonStore();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
      <Mascot size="lg" className="animate-bounce-subtle mb-6" />

      <h1 className="text-3xl font-bold mb-2">{title}</h1>

      <div className="flex items-center gap-4 mt-4 mb-8">
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-2">
          <span>📝</span>
          <span className="text-sm font-medium">{exerciseCount} תרגילים</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-xp-gold/20 px-4 py-2">
          <span>⚡</span>
          <span className="text-sm font-medium">+{xpReward} XP</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-red-50 px-4 py-2">
          <span>❤️</span>
          <span className="text-sm font-medium">3 לבבות</span>
        </div>
      </div>

      <button
        onClick={() => goTo("active_question")}
        className="w-full max-w-xs rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl active:scale-[0.98]"
      >
        !התחל
      </button>
    </div>
  );
}

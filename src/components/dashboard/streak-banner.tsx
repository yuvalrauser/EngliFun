"use client";

import Link from "next/link";

interface StreakBannerProps {
  nextLessonId: string | null;
}

export function StreakBanner({ nextLessonId }: StreakBannerProps) {
  const href = nextLessonId ? `/lesson/${nextLessonId}` : "/path";

  return (
    <Link href={href} className="block group">
      <div className="rounded-2xl bg-gradient-to-l from-orange-500 to-red-500 p-4 flex items-center gap-3 shadow-md shadow-orange-500/20 transition-all group-hover:shadow-lg group-hover:shadow-orange-500/30 active:scale-[0.98]">
        <span className="text-2xl shrink-0 animate-bounce-subtle">🔥</span>
        <div className="flex-1">
          <p className="font-bold text-white text-sm">
            הסטריק שלך בסכנה!
          </p>
          <p className="text-white/80 text-xs mt-0.5">
            למד שיעור אחד היום כדי לשמור על הסטריק
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-white/20 px-3 py-1.5 text-xs font-bold text-white">
          למד עכשיו
        </div>
      </div>
    </Link>
  );
}

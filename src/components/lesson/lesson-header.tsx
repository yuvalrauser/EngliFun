"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLessonStore } from "@/stores/lessonStore";

export function LessonHeader() {
  const router = useRouter();
  const { exercises, currentIndex, hearts, state } = useLessonStore();

  const total = exercises.length;
  const progress = state === "completed" ? 100 : total > 0 ? (currentIndex / total) * 100 : 0;

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {/* Close button */}
      <button
        onClick={() => router.push("/path")}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
        title="צא מהשיעור"
      >
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Progress bar */}
      <div className="flex-1 h-4 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Hearts */}
      <div className="flex items-center gap-0.5 shrink-0">
        {Array.from({ length: 3 }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "text-xl transition-all",
              i < hearts ? "text-heart scale-100" : "text-muted-foreground/30 scale-90"
            )}
          >
            ❤️
          </span>
        ))}
      </div>
    </div>
  );
}

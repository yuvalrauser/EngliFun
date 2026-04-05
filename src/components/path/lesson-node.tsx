"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { LessonWithStatus } from "@/services/progress.server";

interface LessonNodeProps {
  lesson: LessonWithStatus;
  index: number;
  totalInUnit: number;
}

export function LessonNode({ lesson, index, totalInUnit }: LessonNodeProps) {
  const isPlayable =
    lesson.status === "current" ||
    lesson.status === "unlocked" ||
    lesson.status === "completed";
  const isCurrent = lesson.status === "current";
  const isCompleted = lesson.status === "completed";
  const isLocked = lesson.status === "locked";

  // Zigzag offset: sine wave pattern for a winding path feel
  const amplitude = 60;
  const offset = Math.sin((index / Math.max(totalInUnit - 1, 1)) * Math.PI) * amplitude;

  const node = (
    <div
      className="flex flex-col items-center gap-2"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {/* Main circle */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full transition-all duration-300",
          // Size
          isCurrent ? "h-20 w-20" : "h-16 w-16",
          // Colors per state
          isCurrent && "bg-primary shadow-lg shadow-primary/30 animate-pulse-glow",
          isCompleted && "bg-success shadow-md shadow-success/20",
          lesson.status === "unlocked" && "bg-card border-[3px] border-primary/50 shadow-md hover:border-primary hover:shadow-lg",
          isLocked && "bg-muted/80 opacity-50 grayscale",
          // Interaction
          isPlayable && !isLocked && "cursor-pointer hover:scale-110 active:scale-95",
          !isPlayable && "cursor-not-allowed"
        )}
      >
        {/* Inner icon */}
        {isCurrent && (
          <svg className="h-8 w-8 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
        {isCompleted && (
          <svg className="h-7 w-7 text-success-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {lesson.status === "unlocked" && (
          <span className="text-2xl">📖</span>
        )}
        {isLocked && (
          <svg className="h-6 w-6 text-muted-foreground/60" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C9.24 2 7 4.24 7 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-1V7c0-2.76-2.24-5-5-5zm3 8H9V7c0-1.66 1.34-3 3-3s3 1.34 3 3v3z" />
          </svg>
        )}

        {/* Score badge for completed lessons */}
        {isCompleted && lesson.best_score !== null && (
          <div className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-xp-gold text-[10px] font-bold text-xp-gold-foreground shadow-sm">
            {lesson.best_score}
          </div>
        )}

        {/* XP badge for current */}
        {isCurrent && (
          <div className="absolute -top-2 -left-2 rounded-full bg-xp-gold px-2 py-0.5 text-[10px] font-bold text-xp-gold-foreground shadow-sm animate-bounce-subtle">
            +{lesson.xp_reward}
          </div>
        )}
      </div>

      {/* Lesson title */}
      <span
        className={cn(
          "text-xs font-semibold text-center max-w-[100px] leading-tight",
          isCurrent && "text-primary font-bold text-sm",
          isCompleted && "text-success",
          lesson.status === "unlocked" && "text-foreground",
          isLocked && "text-muted-foreground/50"
        )}
      >
        {lesson.title}
      </span>
    </div>
  );

  if (isPlayable) {
    return (
      <Link href={`/lesson/${lesson.id}`} className="block">
        {node}
      </Link>
    );
  }

  return node;
}

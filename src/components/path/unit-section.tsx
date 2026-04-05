"use client";

import { cn } from "@/lib/utils";
import { LessonNode } from "@/components/path/lesson-node";
import type { UnitWithLessons } from "@/services/content.server";
import type { LessonWithStatus } from "@/services/progress.server";

interface UnitSectionProps {
  unit: UnitWithLessons;
  lessonStatuses: Map<string, LessonWithStatus>;
  isFirst: boolean;
}

export function UnitSection({ unit, lessonStatuses, isFirst }: UnitSectionProps) {
  const lessons = unit.lessons.map((l) => lessonStatuses.get(l.id)!).filter(Boolean);
  const completedCount = lessons.filter((l) => l.status === "completed").length;
  const totalCount = lessons.length;
  const isUnitComplete = completedCount === totalCount && totalCount > 0;
  const hasStarted = lessons.some(
    (l) => l.status === "completed" || l.status === "current" || l.status === "unlocked"
  );

  const bgColor = isUnitComplete
    ? "from-success/20 to-success/5"
    : hasStarted
      ? "from-primary/10 to-primary/5"
      : "from-muted to-muted/50";

  return (
    <section className="relative">
      {/* Unit banner */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl p-5 mb-2",
          "bg-gradient-to-l",
          bgColor
        )}
        style={
          unit.color_hex && !isUnitComplete
            ? { background: `linear-gradient(to left, ${unit.color_hex}15, ${unit.color_hex}08)` }
            : undefined
        }
      >
        <div className="flex items-center gap-4">
          {/* Unit icon */}
          <div
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl",
              isUnitComplete ? "bg-success/20" : "bg-white/60"
            )}
            style={
              unit.color_hex && !isUnitComplete
                ? { backgroundColor: unit.color_hex + "20" }
                : undefined
            }
          >
            {isUnitComplete ? "✅" : (unit.icon_emoji ?? "📚")}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold leading-tight">{unit.title}</h2>
            {unit.description && (
              <p className="text-sm text-muted-foreground mt-0.5 truncate">{unit.description}</p>
            )}
          </div>

          {/* Completion badge */}
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
              isUnitComplete
                ? "bg-success text-success-foreground"
                : "bg-white/80 text-muted-foreground"
            )}
          >
            {completedCount}/{totalCount}
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mt-4 h-2.5 rounded-full bg-white/50 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                isUnitComplete ? "bg-success" : "bg-primary"
              )}
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Lesson nodes in winding path layout */}
      <div className="relative flex flex-col items-center gap-6 py-6 px-4">
        {/* SVG connector path */}
        {lessons.length > 1 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            {lessons.slice(0, -1).map((_, idx) => {
              const totalH = lessons.length;
              const y1Pct = ((idx * 1.0) / (totalH - 1)) * 100 + 100 / (totalH * 2);
              const y2Pct = (((idx + 1) * 1.0) / (totalH - 1)) * 100 + 100 / (totalH * 2);
              const amplitude = 60;
              const x1 = 50 + (Math.sin((idx / Math.max(totalH - 1, 1)) * Math.PI) * amplitude) / 3;
              const x2 = 50 + (Math.sin(((idx + 1) / Math.max(totalH - 1, 1)) * Math.PI) * amplitude) / 3;

              const isSegmentDone =
                lessons[idx].status === "completed" &&
                (lessons[idx + 1].status === "completed" ||
                  lessons[idx + 1].status === "current" ||
                  lessons[idx + 1].status === "unlocked");

              return (
                <line
                  key={idx}
                  x1={`${x1}%`}
                  y1={`${y1Pct}%`}
                  x2={`${x2}%`}
                  y2={`${y2Pct}%`}
                  stroke={isSegmentDone ? "oklch(0.72 0.19 145)" : "oklch(0.88 0.01 260)"}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={isSegmentDone ? "none" : "8 8"}
                />
              );
            })}
          </svg>
        )}

        {/* Nodes */}
        {lessons.map((lesson, idx) => (
          <div key={lesson.id} className="relative z-10">
            <LessonNode lesson={lesson} index={idx} totalInUnit={totalCount} />
          </div>
        ))}
      </div>
    </section>
  );
}

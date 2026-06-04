"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { LessonNode } from "@/components/path/lesson-node";
import type { UnitWithLessons } from "@/services/content.server";
import type { LessonWithStatus } from "@/services/progress.server";

interface UnitSectionProps {
  unit: UnitWithLessons;
  lessonStatuses: Map<string, LessonWithStatus>;
  isFirst: boolean;
  allowReplays?: boolean;
  /** True when the unit belongs to the signed-in user (custom unit). */
  isOwnedByCurrentUser?: boolean;
}

export function UnitSection({
  unit,
  lessonStatuses,
  allowReplays = false,
  isOwnedByCurrentUser = false,
}: UnitSectionProps) {
  // Owners can always replay their custom lessons — useful while iterating
  // on the content. Seeded units still gate replays on full-course completion.
  const replaysActive = allowReplays || isOwnedByCurrentUser;
  // Only owned custom units are draggable. Seeded units are sortable-disabled
  // so they still appear as drop targets but the user can't grab them.
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: unit.id, disabled: !isOwnedByCurrentUser });
  const dragStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  const lessons = unit.lessons.map((l) => lessonStatuses.get(l.id)!).filter(Boolean);
  const pathRef = useRef<HTMLDivElement>(null);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  // Measure actual centers of each lesson circle so the SVG connector lands on
  // them. The previous percentage-based math broke whenever the current node
  // was larger than the others, when labels wrapped, or on the bottom segment.
  useEffect(() => {
    function measure() {
      const container = pathRef.current;
      if (!container) return;
      const cRect = container.getBoundingClientRect();
      const circles = container.querySelectorAll<HTMLElement>("[data-lesson-circle]");
      const next = Array.from(circles).map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left + r.width / 2 - cRect.left,
          y: r.top + r.height / 2 - cRect.top,
        };
      });
      setPoints(next);
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (pathRef.current) ro.observe(pathRef.current);
    window.addEventListener("resize", measure);
    // Re-measure after fonts/images settle the layout.
    const t = window.setTimeout(measure, 300);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.clearTimeout(t);
    };
  }, [lessons.length]);
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
    <section ref={setNodeRef} style={dragStyle} className="relative">
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
          {/* Owner controls — drag handle + delete */}
          {isOwnedByCurrentUser && (
            <div className="flex flex-col items-center gap-1 shrink-0 -ml-1">
              <button
                type="button"
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/70 hover:text-foreground"
                aria-label="גרור לסידור מחדש"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <circle cx="9" cy="6" r="1.5" />
                  <circle cx="15" cy="6" r="1.5" />
                  <circle cx="9" cy="12" r="1.5" />
                  <circle cx="15" cy="12" r="1.5" />
                  <circle cx="9" cy="18" r="1.5" />
                  <circle cx="15" cy="18" r="1.5" />
                </svg>
              </button>
              <Link
                href={`/path/edit/${unit.id}`}
                className="text-muted-foreground/70 hover:text-foreground"
                aria-label="ערוך יחידה"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Link>
            </div>
          )}
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
      <div
        ref={pathRef}
        className="relative flex flex-col items-center gap-6 py-6 px-4"
      >
        {/* SVG connector path — coordinates come from measured circle centers */}
        {points.length > 1 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 0 }}
          >
            {points.slice(0, -1).map((p, idx) => {
              const next = points[idx + 1];
              if (!next) return null;
              const isSegmentDone =
                lessons[idx].status === "completed" &&
                (lessons[idx + 1].status === "completed" ||
                  lessons[idx + 1].status === "current" ||
                  lessons[idx + 1].status === "unlocked");

              return (
                <line
                  key={idx}
                  x1={p.x}
                  y1={p.y}
                  x2={next.x}
                  y2={next.y}
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
            <LessonNode
              lesson={lesson}
              index={idx}
              totalInUnit={totalCount}
              allowReplays={replaysActive}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { UnitSection } from "@/components/path/unit-section";
import { CourseCompleteBanner } from "@/components/path/course-complete-banner";
import { MascotWithBubble } from "@/components/ui/mascot";
import { reorderCustomUnit } from "@/app/(auth)/path/actions";
import type { UnitWithLessons } from "@/services/content.server";
import type { LessonWithStatus } from "@/services/progress.server";
import type { Profile } from "@/types/database";

interface LearningPathProps {
  units: UnitWithLessons[];
  lessonStatuses: [string, LessonWithStatus][];
  allCompleted: boolean;
  currentLevel: Profile["starting_level"];
  currentUserId: string;
}

const LEVEL_LABEL_HE: Record<Profile["starting_level"], string> = {
  beginner: "מתחיל",
  elementary: "בסיסי",
  intermediate: "בינוני",
};

function midpointPosition(prev: number | null, next: number | null): number {
  if (prev !== null && next !== null) return (prev + next) / 2;
  if (prev !== null) return prev + 1000;
  // First seeded unit has position 0, so next/2 would also give 0 (a tie).
  // Push strictly below by 1000 so the dragged unit lands above it.
  if (next !== null) return next - 1000;
  return 1000;
}

export function LearningPath({
  units,
  lessonStatuses,
  allCompleted,
  currentLevel,
  currentUserId,
}: LearningPathProps) {
  // Local order state lets us optimistically reflect a drag-and-drop while
  // the server action lands. Re-sync from props if the server returns new
  // units (e.g. router.refresh after creating a unit).
  const [orderedUnits, setOrderedUnits] = useState(units);
  useEffect(() => {
    setOrderedUnits(units);
  }, [units]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  const statusMap = new Map(lessonStatuses);

  if (orderedUnits.length === 0) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <MascotWithBubble
            size="lg"
            message={`תוכן הקורס ברמה ${LEVEL_LABEL_HE[currentLevel]} בהכנה — יתווסף בקרוב!`}
          />
          <p className="mt-6 text-sm text-muted-foreground max-w-xs">
            בינתיים אפשר לעבור לרמה אחרת מהפרופיל או להמשיך לתרגל ברמות הקודמות.
          </p>
        </div>
      </div>
    );
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = orderedUnits.findIndex((u) => u.id === active.id);
    const newIndex = orderedUnits.findIndex((u) => u.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    // The seeded units are sortable-disabled below, so `active` is always
    // an owned custom unit. (Defense in depth: the server action rejects
    // foreign units anyway.)
    const moved = orderedUnits[oldIndex];
    if (moved.owner_id !== currentUserId) return;

    const reordered = arrayMove(orderedUnits, oldIndex, newIndex);
    const prev = reordered[newIndex - 1]?.position ?? null;
    const next = reordered[newIndex + 1]?.position ?? null;
    const newPosition = midpointPosition(prev, next);

    // Optimistic UI: paint the new order immediately.
    setOrderedUnits(
      reordered.map((u) => (u.id === moved.id ? { ...u, position: newPosition } : u)),
    );

    const result = await reorderCustomUnit(moved.id, newPosition);
    if (!result.ok) {
      // Roll back.
      setOrderedUnits(units);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-2">
      {allCompleted && <CourseCompleteBanner currentLevel={currentLevel} />}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedUnits.map((u) => u.id)}
          strategy={verticalListSortingStrategy}
        >
          {orderedUnits.map((unit, idx) => (
            <UnitSection
              key={unit.id}
              unit={unit}
              lessonStatuses={statusMap}
              isFirst={idx === 0}
              allowReplays={allCompleted}
              isOwnedByCurrentUser={unit.owner_id === currentUserId}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

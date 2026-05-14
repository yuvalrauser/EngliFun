"use client";

import { UnitSection } from "@/components/path/unit-section";
import { CourseCompleteBanner } from "@/components/path/course-complete-banner";
import type { UnitWithLessons } from "@/services/content.server";
import type { LessonWithStatus } from "@/services/progress.server";
import type { Profile } from "@/types/database";

interface LearningPathProps {
  units: UnitWithLessons[];
  lessonStatuses: [string, LessonWithStatus][];
  allCompleted: boolean;
  currentLevel: Profile["starting_level"];
}

export function LearningPath({
  units,
  lessonStatuses,
  allCompleted,
  currentLevel,
}: LearningPathProps) {
  const statusMap = new Map(lessonStatuses);

  return (
    <div className="mx-auto max-w-lg space-y-2">
      {allCompleted && <CourseCompleteBanner currentLevel={currentLevel} />}
      {units.map((unit, idx) => (
        <UnitSection
          key={unit.id}
          unit={unit}
          lessonStatuses={statusMap}
          isFirst={idx === 0}
          allowReplays={allCompleted}
        />
      ))}
    </div>
  );
}

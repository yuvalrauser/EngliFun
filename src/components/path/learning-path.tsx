"use client";

import { UnitSection } from "@/components/path/unit-section";
import type { UnitWithLessons } from "@/services/content.server";
import type { LessonWithStatus } from "@/services/progress.server";

interface LearningPathProps {
  units: UnitWithLessons[];
  lessonStatuses: [string, LessonWithStatus][];
}

export function LearningPath({ units, lessonStatuses }: LearningPathProps) {
  const statusMap = new Map(lessonStatuses);

  return (
    <div className="mx-auto max-w-lg space-y-2">
      {units.map((unit, idx) => (
        <UnitSection
          key={unit.id}
          unit={unit}
          lessonStatuses={statusMap}
          isFirst={idx === 0}
        />
      ))}
    </div>
  );
}

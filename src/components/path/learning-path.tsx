"use client";

import { UnitSection } from "@/components/path/unit-section";
import { CourseCompleteBanner } from "@/components/path/course-complete-banner";
import { MascotWithBubble } from "@/components/ui/mascot";
import type { UnitWithLessons } from "@/services/content.server";
import type { LessonWithStatus } from "@/services/progress.server";
import type { Profile } from "@/types/database";

interface LearningPathProps {
  units: UnitWithLessons[];
  lessonStatuses: [string, LessonWithStatus][];
  allCompleted: boolean;
  currentLevel: Profile["starting_level"];
}

const LEVEL_LABEL_HE: Record<Profile["starting_level"], string> = {
  beginner: "מתחיל",
  elementary: "בסיסי",
  intermediate: "בינוני",
};

export function LearningPath({
  units,
  lessonStatuses,
  allCompleted,
  currentLevel,
}: LearningPathProps) {
  const statusMap = new Map(lessonStatuses);

  if (units.length === 0) {
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

"use client";

import { useEffect } from "react";
import { useLessonStore } from "@/stores/lessonStore";
import { LessonHeader } from "@/components/lesson/lesson-header";
import { LessonIntro } from "@/components/lesson/lesson-intro";
import { LessonComplete } from "@/components/lesson/lesson-complete";
import { LessonFailed } from "@/components/lesson/lesson-failed";
import { ExerciseRenderer } from "@/components/lesson/exercise-renderer";
import { FeedbackBar } from "@/components/lesson/feedback-bar";
import type { ExerciseWithOptions } from "@/types/lesson";
import type { Lesson } from "@/types/database";

interface LessonEngineProps {
  lesson: Lesson;
  exercises: ExerciseWithOptions[];
}

export function LessonEngine({ lesson, exercises }: LessonEngineProps) {
  const { state, initLesson } = useLessonStore();

  useEffect(() => {
    initLesson(lesson.id, exercises);
  }, [lesson.id, exercises, initLesson]);

  // During intro — no header
  if (state === "intro") {
    return (
      <LessonIntro
        title={lesson.title}
        exerciseCount={lesson.exercise_count}
        xpReward={lesson.xp_reward}
      />
    );
  }

  // Completed
  if (state === "completed") {
    return <LessonComplete />;
  }

  // Failed
  if (state === "failed") {
    return <LessonFailed />;
  }

  // Active question / feedback states
  return (
    <div className="flex flex-col min-h-screen">
      <LessonHeader />
      <div className="flex-1 flex items-start justify-center px-4 pt-6 pb-40">
        <div className="w-full max-w-lg">
          <ExerciseRenderer />
        </div>
      </div>
      <FeedbackBar />
    </div>
  );
}

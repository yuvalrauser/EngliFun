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
  const state = useLessonStore((s) => s.state);
  const lessonIdInStore = useLessonStore((s) => s.lessonId);
  const initLesson = useLessonStore((s) => s.initLesson);

  useEffect(() => {
    // Re-init when navigating to a different lesson, OR when revisiting the
    // SAME lesson after it was already completed/failed in this tab — the
    // latter is the replay flow: user clicked a completed lesson node and
    // expects a fresh run, not the lingering "כל הכבוד" screen from before.
    // The guard against re-init on a mid-session router.refresh() is the
    // `state in {intro, active_question, ...}` check — a router refresh
    // mid-lesson keeps the store in those active states.
    const isSameLesson = lessonIdInStore === lesson.id;
    const isFinishedSnapshot = state === "completed" || state === "failed";
    if (!isSameLesson || isFinishedSnapshot) {
      initLesson(lesson.id, exercises, lesson.xp_reward);
    }
    // We deliberately exclude `state` from the deps: the effect should only
    // re-fire on actual navigation, not when the store transitions to
    // "completed" at the end of the current run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.id, lesson.xp_reward, lessonIdInStore, exercises, initLesson]);

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

  // Active question / feedback states.
  // ExerciseRenderer locks itself when state is in feedback — no extra wrapper needed.
  return (
    <div className="flex flex-col min-h-dvh">
      <LessonHeader />
      <div className="flex-1 flex items-start justify-center px-4 pt-6 pb-[calc(10rem+env(safe-area-inset-bottom))]">
        <div className="w-full max-w-lg">
          <ExerciseRenderer />
        </div>
      </div>
      <FeedbackBar />
    </div>
  );
}

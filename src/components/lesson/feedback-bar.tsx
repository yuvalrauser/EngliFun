"use client";

import { cn } from "@/lib/utils";
import { useLessonStore } from "@/stores/lessonStore";

export function FeedbackBar() {
  const { state, lastAnswer, lastCorrectAnswer, lastExplanation, lastIsNearMiss, advanceToNext } =
    useLessonStore();

  if (state !== "correct_feedback" && state !== "wrong_feedback") return null;

  const isCorrect = state === "correct_feedback";

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t-2 p-5 pb-8 md:pb-5",
        isCorrect
          ? "bg-green-50 border-success text-green-900"
          : "bg-red-50 border-destructive text-red-900"
      )}
    >
      <div className="mx-auto max-w-lg">
        <div className="flex items-start gap-3">
          <div className="text-3xl shrink-0">
            {isCorrect ? "🎉" : "😕"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg">
              {isCorrect
                ? lastIsNearMiss
                  ? "!כמעט מושלם"
                  : "!נכון"
                : "לא נכון"}
            </div>
            {!isCorrect && (
              <>
                {lastCorrectAnswer && (
                  <p className="text-sm mt-1">
                    התשובה הנכונה: <span dir="ltr" className="font-semibold">{lastCorrectAnswer}</span>
                  </p>
                )}
                {lastExplanation && (
                  <p className="text-sm mt-1 opacity-80">{lastExplanation}</p>
                )}
              </>
            )}
            {isCorrect && lastIsNearMiss && (
              <p className="text-sm mt-1 opacity-80">שים לב לאיות הנכון</p>
            )}
          </div>
        </div>

        <button
          onClick={advanceToNext}
          className={cn(
            "w-full mt-4 rounded-2xl py-3.5 text-base font-bold transition-all active:scale-[0.98]",
            isCorrect
              ? "bg-success text-success-foreground"
              : "bg-destructive text-white"
          )}
        >
          המשך
        </button>
      </div>
    </div>
  );
}

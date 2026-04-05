import { create } from "zustand";
import type {
  LessonSessionState,
  LessonState,
  ExerciseWithOptions,
} from "@/types/lesson";
import { HEARTS_PER_LESSON } from "@/lib/constants/xp";

interface LessonStore extends LessonSessionState {
  initLesson: (lessonId: string, exercises: ExerciseWithOptions[]) => void;
  goTo: (state: LessonState) => void;
  submitCorrect: (answer: string) => void;
  submitWrong: (answer: string, correctAnswer: string, explanation: string, isNearMiss: boolean) => void;
  advanceToNext: () => void;
  setXpEarned: (xp: number) => void;
  reset: () => void;
}

const initialState: LessonSessionState = {
  lessonId: "",
  exercises: [],
  currentIndex: 0,
  hearts: HEARTS_PER_LESSON,
  score: 0,
  mistakes: [],
  attempts: [],
  xpEarned: 0,
  isPerfect: true,
  state: "intro",
  startedAt: new Date(),
  lastAnswer: "",
  lastCorrectAnswer: "",
  lastExplanation: "",
  lastIsNearMiss: false,
};

export const useLessonStore = create<LessonStore>((set, get) => ({
  ...initialState,

  initLesson: (lessonId, exercises) =>
    set({
      ...initialState,
      lessonId,
      exercises,
      state: "intro",
      startedAt: new Date(),
    }),

  goTo: (state) => set({ state }),

  submitCorrect: (answer) => {
    const s = get();
    const exercise = s.exercises[s.currentIndex];
    set({
      score: s.score + 1,
      state: "correct_feedback",
      lastAnswer: answer,
      lastCorrectAnswer: "",
      lastExplanation: "",
      lastIsNearMiss: false,
      attempts: [
        ...s.attempts,
        {
          exercise_id: exercise.id,
          user_answer: answer,
          is_correct: true,
          is_near_miss: false,
        },
      ],
    });
  },

  submitWrong: (answer, correctAnswer, explanation, isNearMiss) => {
    const s = get();
    const exercise = s.exercises[s.currentIndex];
    const newHearts = s.hearts - 1;
    set({
      hearts: newHearts,
      isPerfect: false,
      state: newHearts <= 0 ? "failed" : "wrong_feedback",
      lastAnswer: answer,
      lastCorrectAnswer: correctAnswer,
      lastExplanation: explanation,
      lastIsNearMiss: isNearMiss,
      mistakes: [
        ...s.mistakes,
        { exercise_id: exercise.id, user_answer: answer, is_near_miss: isNearMiss },
      ],
      attempts: [
        ...s.attempts,
        {
          exercise_id: exercise.id,
          user_answer: answer,
          is_correct: false,
          is_near_miss: isNearMiss,
        },
      ],
    });
  },

  advanceToNext: () => {
    const s = get();
    const nextIndex = s.currentIndex + 1;
    if (nextIndex >= s.exercises.length) {
      set({ state: "completed" });
    } else {
      set({ currentIndex: nextIndex, state: "active_question" });
    }
  },

  setXpEarned: (xp) => set({ xpEarned: xp }),

  reset: () => set({ ...initialState, startedAt: new Date() }),
}));

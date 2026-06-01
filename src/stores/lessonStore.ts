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
  // Used by multi-step exercises (e.g. matching) where each wrong attempt
  // should cost a heart without interrupting the exercise. Records a mistake
  // and decrements hearts; transitions to "failed" if hearts hit zero. Does
  // NOT push to attempts — the exercise still produces a single attempts entry
  // when it finally completes via submitCorrect.
  recordPartialMistake: (answer: string) => void;
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

  initLesson: (lessonId, exercises) => {
    const current = get();
    // Idempotent: if the lesson engine re-renders for the same lesson — for
    // example after a background fetch updates the user profile, which causes
    // upstream server components to re-render with a new `exercises` prop
    // reference — never wipe the active session. Only initialize on a real
    // lesson switch.
    if (current.lessonId === lessonId && current.exercises.length > 0) {
      return;
    }
    set({
      ...initialState,
      lessonId,
      exercises,
      state: "intro",
      startedAt: new Date(),
    });
  },

  goTo: (state) => set({ state }),

  submitCorrect: (answer) => {
    const s = get();
    // Ignore re-submits while showing feedback — the user must click "המשך"
    // to advance, otherwise they could fix a wrong answer in place and lose
    // the mistake record while still losing hearts.
    if (s.state !== "active_question") return;
    const exercise = s.exercises[s.currentIndex];

    // For multi-step exercises like matching, the user may have racked up
    // wrong attempts (via recordPartialMistake) before finally completing
    // the exercise. Those wrong attempts already cost hearts; here we make
    // sure the exercise is also persisted as is_correct=false so that the
    // complete_lesson RPC creates a user_mistakes row for /review and the
    // score doesn't reward an exercise that had errors.
    const hadPartialMistakes = s.mistakes.some(
      (m) => m.exercise_id === exercise.id,
    );

    if (hadPartialMistakes) {
      set({
        // No score bump (the exercise wasn't clean).
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
            is_correct: false,
            is_near_miss: false,
          },
        ],
      });
      return;
    }

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
    if (s.state !== "active_question") return;
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

  recordPartialMistake: (answer) => {
    const s = get();
    if (s.state !== "active_question") return;
    const exercise = s.exercises[s.currentIndex];
    const newHearts = s.hearts - 1;
    if (newHearts <= 0) {
      // Out of hearts — fail the lesson immediately with feedback context.
      set({
        hearts: 0,
        isPerfect: false,
        state: "failed",
        lastAnswer: answer,
        lastCorrectAnswer: "",
        lastExplanation: exercise.explanation_he,
        lastIsNearMiss: false,
        mistakes: [
          ...s.mistakes,
          { exercise_id: exercise.id, user_answer: answer, is_near_miss: false },
        ],
      });
      return;
    }
    // Keep state = "active_question" so the matching exercise continues.
    set({
      hearts: newHearts,
      isPerfect: false,
      mistakes: [
        ...s.mistakes,
        { exercise_id: exercise.id, user_answer: answer, is_near_miss: false },
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

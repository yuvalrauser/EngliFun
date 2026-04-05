// XP award values
export const XP_LESSON_COMPLETE = 10;
export const XP_PERFECT_BONUS = 5;
export const XP_REPLAY = 5;
export const XP_DAILY_GOAL_BONUS = 5;
export const XP_CHECKPOINT = 20;

// Daily goal options (XP per day)
export const DAILY_GOAL_OPTIONS = [10, 20, 30, 50] as const;
export type DailyGoalOption = (typeof DAILY_GOAL_OPTIONS)[number];

// Hearts
export const HEARTS_PER_LESSON = 3;

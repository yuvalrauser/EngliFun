export interface LevelInfo {
  level: number;
  minXp: number;
  label: string;
}

const LEVEL_THRESHOLDS: LevelInfo[] = [
  { level: 1, minXp: 0, label: "מתחיל" },
  { level: 2, minXp: 50, label: "לומד" },
  { level: 3, minXp: 150, label: "מתקדם" },
  { level: 4, minXp: 300, label: "מיומן" },
  { level: 5, minXp: 500, label: "מומחה" },
  { level: 6, minXp: 750, label: "אלוף" },
];

const GRAND_MASTER_BASE = 1000;
const GRAND_MASTER_STEP = 250;
const GRAND_MASTER_LABEL = "גרנד-מאסטר";

export function getLevel(xp: number): number {
  // Check grand master levels (7+)
  if (xp >= GRAND_MASTER_BASE) {
    return 7 + Math.floor((xp - GRAND_MASTER_BASE) / GRAND_MASTER_STEP);
  }
  // Check defined levels (6 down to 1)
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].minXp) {
      return LEVEL_THRESHOLDS[i].level;
    }
  }
  return 1;
}

export function getLevelLabel(xp: number): string {
  const level = getLevel(xp);
  if (level >= 7) return GRAND_MASTER_LABEL;
  return LEVEL_THRESHOLDS[level - 1].label;
}

export function getXpForNextLevel(xp: number): { current: number; next: number } {
  const level = getLevel(xp);
  if (level >= 7) {
    const grandMasterLevel = level - 7;
    const current = GRAND_MASTER_BASE + grandMasterLevel * GRAND_MASTER_STEP;
    const next = current + GRAND_MASTER_STEP;
    return { current, next };
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1].minXp;
  const nextThreshold =
    level < LEVEL_THRESHOLDS.length
      ? LEVEL_THRESHOLDS[level].minXp
      : GRAND_MASTER_BASE;
  return { current: currentThreshold, next: nextThreshold };
}

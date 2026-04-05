"use client";

import Link from "next/link";
import { getLevel, getLevelLabel, getXpForNextLevel } from "@/lib/constants/levels";
import type { Profile } from "@/types/database";
import type { LessonWithStatus } from "@/services/progress.server";

interface DashboardContentProps {
  profile: Profile;
  nextLesson: LessonWithStatus | null;
  completedCount: number;
  totalCount: number;
}

export function DashboardContent({
  profile,
  nextLesson,
  completedCount,
  totalCount,
}: DashboardContentProps) {
  const level = getLevel(profile.total_xp);
  const levelLabel = getLevelLabel(profile.total_xp);
  const { current: xpCurrent, next: xpNext } = getXpForNextLevel(profile.total_xp);
  const xpProgress =
    xpNext > xpCurrent
      ? ((profile.total_xp - xpCurrent) / (xpNext - xpCurrent)) * 100
      : 100;

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-lg space-y-5">
        {/* Greeting banner */}
        <div className="rounded-3xl bg-gradient-to-l from-primary/8 to-primary/3 px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-sm text-muted-foreground">שלום, </span>
            <span className="text-2xl font-bold">{profile.username}!</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/owl.png"
            alt="EngliFun"
            className="w-60 object-contain animate-float"
          />
        </div>

        {/* Continue learning CTA */}
        {nextLesson ? (
          <Link href={`/lesson/${nextLesson.id}`} className="block group">
            <div className="relative overflow-hidden rounded-3xl bg-primary p-5 text-primary-foreground shadow-lg shadow-primary/25 transition-all group-hover:shadow-xl group-hover:shadow-primary/30 group-hover:scale-[1.01] active:scale-[0.99]">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/20">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-lg">המשך ללמוד</div>
                  <div className="text-sm text-primary-foreground/70 truncate">{nextLesson.title}</div>
                </div>
                <div className="rounded-full bg-xp-gold px-3 py-1.5 text-sm font-bold text-xp-gold-foreground shadow-sm">
                  +{nextLesson.xp_reward} XP
                </div>
              </div>
              {/* Decorative circles */}
              <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-white/5" />
              <div className="absolute -bottom-4 -left-10 h-20 w-20 rounded-full bg-white/5" />
            </div>
          </Link>
        ) : (
          <div className="rounded-3xl bg-gradient-to-l from-success/15 to-success/5 p-6 text-center">
            <div className="text-4xl mb-2 animate-float">🎉</div>
            <div className="font-bold text-lg">כל השיעורים הושלמו!</div>
            <div className="text-sm text-muted-foreground mt-1">
              אפשר לחזור על שיעורים קודמים כדי לצבור עוד XP
            </div>
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Streak */}
          <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-border">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xl font-bold">{profile.current_streak}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">סטריק</div>
          </div>
          {/* XP */}
          <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-border">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xl font-bold text-xp-gold-foreground">{profile.total_xp}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">XP</div>
          </div>
          {/* Lessons done */}
          <div className="rounded-2xl bg-card p-4 text-center shadow-sm ring-1 ring-border">
            <div className="text-2xl mb-1">📖</div>
            <div className="text-xl font-bold">{completedCount}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">שיעורים</div>
          </div>
        </div>

        {/* Level card */}
        <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {level}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{levelLabel}</div>
              <div className="text-xs text-muted-foreground">
                {profile.total_xp} / {xpNext} XP לרמה הבאה
              </div>
            </div>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-primary to-primary/80 transition-all duration-700"
              style={{ width: `${Math.min(xpProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Course progress card */}
        <div className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">התקדמות בקורס</span>
            <span className="text-xs font-medium text-muted-foreground">
              {completedCount}/{totalCount} שיעורים
            </span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-success to-success/80 transition-all duration-700"
              style={{
                width: totalCount > 0 ? `${(completedCount / totalCount) * 100}%` : "0%",
              }}
            />
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/path">
            <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-colors hover:bg-muted/50">
              <span className="text-2xl">📖</span>
              <span className="text-sm font-semibold">מסלול למידה</span>
            </div>
          </Link>
          <Link href="/review">
            <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-colors hover:bg-muted/50">
              <span className="text-2xl">🔄</span>
              <span className="text-sm font-semibold">חזרה על טעויות</span>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}

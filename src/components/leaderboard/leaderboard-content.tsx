"use client";

import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";
import type { LeaderboardEntry } from "@/types/database";

interface LeaderboardContentProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

const RANK_ICONS = ["🥇", "🥈", "🥉"];

export function LeaderboardContent({
  entries,
  currentUserId,
}: LeaderboardContentProps) {
  const meInTop = entries.some((e) => e.id === currentUserId);
  if (entries.length === 0) {
    return (
      <main className="px-4 py-6 md:px-8">
        <h1 className="text-2xl font-bold text-center mb-2">טבלת המובילים</h1>
        <EmptyState
          message="עדיין אין מתחרים! השלם שיעורים כדי להיות הראשון בטבלה."
          actionLabel="התחל ללמוד"
          actionHref="/path"
        />
      </main>
    );
  }

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-1">🏆 טבלת המובילים</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">דירוג לפי סך ה-XP</p>

        {entries.length < 3 && (
          <div className="mb-4 rounded-2xl bg-primary/5 ring-1 ring-primary/20 px-4 py-3 text-center text-xs text-muted-foreground">
            עדיין מעט משתתפים בטבלה — תמשיכו ללמוד כדי לעלות בדירוג!
          </div>
        )}

        {!meInTop && entries.length > 0 && (
          <div className="mb-4 rounded-2xl bg-card ring-1 ring-border px-4 py-3 text-center text-xs text-muted-foreground">
            עדיין לא ב-10 המובילים — כל שיעור מקרב אותך לטבלה.
          </div>
        )}

        <div className="space-y-2">
          {entries.map((entry, idx) => {
            const isMe = entry.id === currentUserId;
            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-3 rounded-2xl p-4 transition-all",
                  isMe
                    ? "bg-primary/10 ring-2 ring-primary/30"
                    : "bg-card ring-1 ring-border"
                )}
              >
                {/* Rank */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-lg font-bold">
                  {idx < 3 ? RANK_ICONS[idx] : idx + 1}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className={cn("font-semibold truncate", isMe && "text-primary")}>
                    {entry.username}
                    {isMe && <span className="text-xs text-muted-foreground ms-1">(את/ה)</span>}
                  </div>
                  {entry.current_streak > 0 && (
                    <div className="text-xs text-muted-foreground">🔥 {entry.current_streak} ימים</div>
                  )}
                </div>

                {/* XP */}
                <div className="text-sm font-bold text-xp-gold-foreground">
                  {entry.total_xp} XP
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

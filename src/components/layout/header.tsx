"use client";

import { useUserStore } from "@/stores/userStore";
import { getLevelLabel } from "@/lib/constants/levels";
import { LogoutButton } from "@/components/layout/logout-button";

export function Header() {
  const { profile } = useUserStore();

  const totalXp = profile?.total_xp ?? 0;
  const streak = profile?.current_streak ?? 0;
  const levelLabel = getLevelLabel(totalXp);

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      {/* Mobile logo */}
      <div className="md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/brand/owl.png"
          alt="EngliFun"
          width={110}
          height={55}
          className="object-contain"
        />
      </div>

      {/* Stats pills */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1" title="סטריק">
          <span>🔥</span>
          <span className="font-bold text-orange-600">{streak}</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1" title="XP">
          <span>⚡</span>
          <span className="font-bold text-amber-600">{totalXp}</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1" title="רמה">
          <span>🎯</span>
          <span className="font-medium text-primary text-xs">{levelLabel}</span>
        </div>
      </div>

      <LogoutButton />
    </header>
  );
}

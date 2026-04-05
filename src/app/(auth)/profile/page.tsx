import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Mascot } from "@/components/ui/mascot";
import { getLevel, getLevelLabel, getXpForNextLevel } from "@/lib/constants/levels";
import type { Profile } from "@/types/database";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  const p = profile as Profile;
  const level = getLevel(p.total_xp);
  const levelLabel = getLevelLabel(p.total_xp);
  const { next: xpNext } = getXpForNextLevel(p.total_xp);

  // Get accuracy stats
  const { count: totalAttempts } = await supabase
    .from("exercise_attempts")
    .select("*", { count: "exact", head: true })
    .eq("lesson_attempt_id", user.id); // will be 0 for new users

  const { count: correctAttempts } = await supabase
    .from("exercise_attempts")
    .select("*", { count: "exact", head: true })
    .eq("lesson_attempt_id", user.id)
    .eq("is_correct", true);

  const joinDate = new Date(p.created_at).toLocaleDateString("he-IL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-lg space-y-5">
        {/* Profile header */}
        <div className="flex flex-col items-center text-center rounded-3xl bg-gradient-to-b from-primary/10 to-transparent p-6">
          <Mascot size="md" className="mb-3" />
          <h1 className="text-2xl font-bold">{p.username}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            חבר מאז {joinDate}
          </p>
          <div className="mt-3 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
            רמה {level} — {levelLabel}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-card p-4 text-center ring-1 ring-border">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xl font-bold">{p.total_xp}</div>
            <div className="text-xs text-muted-foreground">XP סה״כ</div>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center ring-1 ring-border">
            <div className="text-2xl mb-1">🔥</div>
            <div className="text-xl font-bold">{p.current_streak}</div>
            <div className="text-xs text-muted-foreground">סטריק נוכחי</div>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center ring-1 ring-border">
            <div className="text-2xl mb-1">🏆</div>
            <div className="text-xl font-bold">{p.longest_streak}</div>
            <div className="text-xs text-muted-foreground">סטריק שיא</div>
          </div>
          <div className="rounded-2xl bg-card p-4 text-center ring-1 ring-border">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xl font-bold">{p.daily_xp_goal}</div>
            <div className="text-xs text-muted-foreground">יעד יומי</div>
          </div>
        </div>

        {/* Level progress */}
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold">התקדמות לרמה הבאה</span>
            <span className="text-xs text-muted-foreground">{p.total_xp}/{xpNext} XP</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-primary to-primary/80 transition-all duration-700"
              style={{
                width: `${Math.min(((p.total_xp - (xpNext - 50)) / 50) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Motivation */}
        {p.motivation && (
          <div className="rounded-2xl bg-card p-4 ring-1 ring-border text-center">
            <div className="text-xs text-muted-foreground mb-1">למה אני לומד</div>
            <div className="font-medium">{p.motivation}</div>
          </div>
        )}
      </div>
    </main>
  );
}

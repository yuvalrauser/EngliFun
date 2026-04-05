import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

const supabase = createClient();

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export async function updateOnboarding(
  userId: string,
  updates: {
    starting_level: Profile["starting_level"];
    daily_xp_goal: Profile["daily_xp_goal"];
    motivation?: string;
  }
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      ...updates,
      onboarding_completed: true,
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function getTodayXp(userId: string, timezone: string): Promise<number> {
  const { data } = await supabase
    .from("lesson_attempts")
    .select("xp_earned, created_at")
    .eq("user_id", userId)
    .eq("completed", true);

  if (!data) return 0;

  // Filter by today in user's timezone client-side
  const today = new Date().toLocaleDateString("en-CA", { timeZone: timezone });
  return data
    .filter((a) => {
      const attemptDate = new Date(a.created_at).toLocaleDateString("en-CA", {
        timeZone: timezone,
      });
      return attemptDate === today;
    })
    .reduce((sum, a) => sum + a.xp_earned, 0);
}

export async function getWeeklyXp(userId: string, timezone: string): Promise<number> {
  const { data } = await supabase
    .from("lesson_attempts")
    .select("xp_earned, created_at")
    .eq("user_id", userId)
    .eq("completed", true);

  if (!data) return 0;

  // Find Monday of current week in user's timezone
  const now = new Date();
  const nowLocal = new Date(
    now.toLocaleString("en-US", { timeZone: timezone })
  );
  const day = nowLocal.getDay();
  const diff = day === 0 ? 6 : day - 1; // Monday = 0
  const monday = new Date(nowLocal);
  monday.setDate(nowLocal.getDate() - diff);
  monday.setHours(0, 0, 0, 0);

  return data
    .filter((a) => {
      const attemptLocal = new Date(
        new Date(a.created_at).toLocaleString("en-US", { timeZone: timezone })
      );
      return attemptLocal >= monday;
    })
    .reduce((sum, a) => sum + a.xp_earned, 0);
}

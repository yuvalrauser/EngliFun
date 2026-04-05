import { createClient } from "@/lib/supabase/client";
import type { LeaderboardEntry } from "@/types/database";

const supabase = createClient();

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const { data } = await supabase
    .from("leaderboard_view")
    .select("*")
    .limit(limit);
  return data ?? [];
}

export async function getUserRank(userId: string): Promise<number | null> {
  const { data } = await supabase
    .from("leaderboard_view")
    .select("id");

  if (!data) return null;
  const index = data.findIndex((entry) => entry.id === userId);
  return index >= 0 ? index + 1 : null;
}

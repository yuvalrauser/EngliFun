import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LeaderboardContent } from "@/components/leaderboard/leaderboard-content";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: entries } = await supabase
    .from("leaderboard_view")
    .select("*")
    .limit(10);

  return (
    <LeaderboardContent
      entries={entries ?? []}
      currentUserId={user.id}
    />
  );
}

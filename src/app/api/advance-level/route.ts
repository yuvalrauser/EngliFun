import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

type Level = Profile["starting_level"];

const NEXT_LEVEL: Record<Level, Level | null> = {
  beginner: "elementary",
  elementary: "intermediate",
  intermediate: null,
};

const LEVEL_LABEL_HE: Record<Level, string> = {
  beginner: "מתחיל",
  elementary: "בסיסי",
  intermediate: "בינוני",
};

export async function POST() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("starting_level")
    .eq("id", user.id)
    .single();

  if (fetchError || !profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const current = profile.starting_level as Level;
  const next = NEXT_LEVEL[current];

  if (!next) {
    return NextResponse.json(
      { error: "כבר ברמה הגבוהה ביותר" },
      { status: 400 },
    );
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ starting_level: next })
    .eq("id", user.id);

  if (updateError) {
    console.error("advance-level update error:", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    previous_level: current,
    new_level: next,
    new_level_label: LEVEL_LABEL_HE[next],
  });
}

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

  // Unlock the first lesson of the destination course, if it has any content
  // yet. Without this, an advanced user would land on /path and the
  // auto-init code in getLessonProgressMap would have to do it on next
  // render — and only if the course actually has lessons.
  let firstLessonSeeded = false;
  try {
    const { data: destCourse } = await supabase
      .from("courses")
      .select("id")
      .eq("is_active", true)
      .eq("level", next)
      .single();

    if (destCourse?.id) {
      const { data: firstLesson } = await supabase
        .from("lessons")
        .select("id, unit_id, units!inner(course_id, order_index)")
        .eq("units.course_id", destCourse.id)
        .order("order_index", { referencedTable: "units", ascending: true })
        .order("order_index", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (firstLesson?.id) {
        await supabase
          .from("user_lesson_progress")
          .upsert(
            {
              user_id: user.id,
              lesson_id: firstLesson.id,
              status: "unlocked",
            },
            { onConflict: "user_id,lesson_id", ignoreDuplicates: true },
          );
        firstLessonSeeded = true;
      }
    }
  } catch (e) {
    console.error("advance-level first-lesson unlock failed:", e);
  }

  return NextResponse.json({
    ok: true,
    previous_level: current,
    new_level: next,
    new_level_label: LEVEL_LABEL_HE[next],
    first_lesson_seeded: firstLessonSeeded,
  });
}

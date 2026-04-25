import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json();
  const { starting_level, daily_xp_goal, motivation } = body;

  const { error } = await supabase
    .from("profiles")
    .update({
      starting_level: starting_level ?? "beginner",
      daily_xp_goal: daily_xp_goal ?? 20,
      motivation: motivation ?? null,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    console.error("complete-onboarding error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Set the cookie so middleware doesn't query DB on every request
  const response = NextResponse.json({ ok: true });
  response.cookies.set("ef_onboarded", "1", {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

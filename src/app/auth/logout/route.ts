import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const response = NextResponse.redirect(new URL("/login", request.url), {
    status: 302,
  });

  // Clear onboarding cookie on logout
  response.cookies.delete("ef_onboarded");

  return response;
}

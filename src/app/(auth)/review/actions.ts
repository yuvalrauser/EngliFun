"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface MarkReviewedResult {
  ok: boolean;
  error?: string;
}

/**
 * Mark a user_mistakes row as reviewed. RLS gates ownership. Using a
 * Server Action (not a direct client supabase call) so we can issue
 * `revalidatePath('/review')` afterwards — the previous client-side flow
 * worked optimistically but Next.js's Router Cache would serve a stale
 * `/review` once the user navigated away and back.
 */
export async function markMistakeReviewed(
  mistakeId: string,
): Promise<MarkReviewedResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "לא מחובר" };

  const { data, error } = await supabase
    .from("user_mistakes")
    .update({ needs_review: false, reviewed_at: new Date().toISOString() })
    .eq("id", mistakeId)
    .eq("user_id", user.id)
    .select("id");
  if (error) return { ok: false, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false, error: "אין הרשאה לעדכן" };
  }

  revalidatePath("/review");
  return { ok: true };
}

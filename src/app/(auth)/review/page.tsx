import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";
import { ReviewContent } from "@/components/review/review-content";

export interface MistakeWithContext {
  id: string;
  exercise_id: string;
  wrong_count: number;
  last_wrong_answer: string | null;
  prompt_text: string;
  prompt_language: string;
  type: string;
  explanation_he: string;
  lesson_title: string;
  unit_title: string;
  unit_order: number;
  lesson_order: number;
}

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: mistakes } = await supabase
    .from("user_mistakes")
    .select(`
      id,
      exercise_id,
      wrong_count,
      last_wrong_answer,
      exercises (
        prompt_text,
        prompt_language,
        type,
        explanation_he,
        lessons (
          title,
          order_index,
          units (
            title,
            order_index
          )
        )
      )
    `)
    .eq("user_id", user.id)
    .eq("needs_review", true)
    .order("updated_at", { ascending: false });

  if (!mistakes || mistakes.length === 0) {
    return (
      <main className="px-4 py-6 md:px-8">
        <h1 className="text-2xl font-bold text-center mb-2">חזרה על טעויות</h1>
        <EmptyState
          message="!אין טעויות לחזור עליהן. כל הכבוד"
          actionLabel="חזרה למסלול"
          actionHref="/path"
        />
      </main>
    );
  }

  // Flatten and type the joined data
  const flat: MistakeWithContext[] = mistakes
    .filter((m) => m.exercises)
    .map((m) => {
      const ex = m.exercises as any;
      const lesson = ex.lessons as any;
      const unit = lesson?.units as any;
      return {
        id: m.id,
        exercise_id: m.exercise_id,
        wrong_count: m.wrong_count,
        last_wrong_answer: m.last_wrong_answer,
        prompt_text: ex.prompt_text,
        prompt_language: ex.prompt_language,
        type: ex.type,
        explanation_he: ex.explanation_he,
        lesson_title: lesson?.title ?? "",
        unit_title: unit?.title ?? "",
        unit_order: unit?.order_index ?? 0,
        lesson_order: lesson?.order_index ?? 0,
      };
    });

  return <ReviewContent mistakes={flat} />;
}

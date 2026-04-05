import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: mistakes } = await supabase
    .from("user_mistakes")
    .select("*, exercises(prompt_text, type, explanation_he, lesson_id)")
    .eq("user_id", user.id)
    .eq("needs_review", true)
    .order("updated_at", { ascending: false });

  if (!mistakes || mistakes.length === 0) {
    return (
      <main className="px-4 py-6 md:px-8">
        <h1 className="text-2xl font-bold text-center mb-2">חזרה על טעויות</h1>
        <EmptyState
          message="אין טעויות לחזור עליהן! המשך ללמוד ואני אזכור לך מה צריך לתרגל."
          actionLabel="חזרה למסלול"
          actionHref="/path"
        />
      </main>
    );
  }

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-1">🔄 חזרה על טעויות</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {mistakes.length} תרגילים לחזרה
        </p>

        <div className="space-y-3">
          {mistakes.map((m) => (
            <div key={m.id} className="rounded-2xl bg-card p-4 ring-1 ring-border">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium" dir="ltr">{m.exercises?.prompt_text}</p>
                  <p className="text-sm text-muted-foreground mt-1">{m.exercises?.explanation_he}</p>
                </div>
                <div className="shrink-0 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive">
                  {m.wrong_count}x
                </div>
              </div>
              {m.last_wrong_answer && (
                <div className="mt-2 text-sm text-muted-foreground">
                  התשובה שלך: <span dir="ltr" className="font-medium text-destructive">{m.last_wrong_answer}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

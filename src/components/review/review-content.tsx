"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { MistakeWithContext } from "@/app/(auth)/review/page";

interface ReviewContentProps {
  mistakes: MistakeWithContext[];
}

export function ReviewContent({ mistakes }: ReviewContentProps) {
  const [reviewed, setReviewed] = useState<Set<string>>(new Set());

  // Group by unit → lesson
  const grouped = new Map<string, { unitTitle: string; lessons: Map<string, { lessonTitle: string; items: MistakeWithContext[] }> }>();

  for (const m of mistakes) {
    if (reviewed.has(m.id)) continue;
    const unitKey = `${m.unit_order}-${m.unit_title}`;
    const lessonKey = `${m.lesson_order}-${m.lesson_title}`;

    if (!grouped.has(unitKey)) {
      grouped.set(unitKey, { unitTitle: m.unit_title, lessons: new Map() });
    }
    const unit = grouped.get(unitKey)!;
    if (!unit.lessons.has(lessonKey)) {
      unit.lessons.set(lessonKey, { lessonTitle: m.lesson_title, items: [] });
    }
    unit.lessons.get(lessonKey)!.items.push(m);
  }

  const remaining = mistakes.filter((m) => !reviewed.has(m.id)).length;

  async function markReviewed(id: string) {
    const supabase = createClient();
    await supabase
      .from("user_mistakes")
      .update({ needs_review: false, reviewed_at: new Date().toISOString() })
      .eq("id", id);
    setReviewed((prev) => new Set([...prev, id]));
  }

  return (
    <main className="px-4 py-6 md:px-8">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-bold text-center mb-1">🔄 חזרה על טעויות</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {remaining > 0 ? `${remaining} תרגילים לחזרה` : "!כל הטעויות נסקרו"}
        </p>

        {remaining === 0 && (
          <div className="rounded-2xl bg-success/10 p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <div className="font-bold text-lg">כל הכבוד! סיימת את כל החזרות</div>
          </div>
        )}

        {Array.from(grouped.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([unitKey, { unitTitle, lessons }]) => (
            <div key={unitKey} className="mb-6">
              {/* Unit header */}
              <div className="rounded-2xl bg-gradient-to-l from-primary/10 to-primary/5 px-4 py-3 mb-3">
                <h2 className="font-bold text-base">{unitTitle}</h2>
              </div>

              {Array.from(lessons.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([lessonKey, { lessonTitle, items }]) => (
                  <div key={lessonKey} className="mb-4">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1 mb-2">
                      {lessonTitle}
                    </h3>
                    <div className="space-y-2">
                      {items.map((m) => (
                        <MistakeCard
                          key={m.id}
                          mistake={m}
                          onMarkReviewed={() => markReviewed(m.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ))}
      </div>
    </main>
  );
}

function MistakeCard({
  mistake,
  onMarkReviewed,
}: {
  mistake: MistakeWithContext;
  onMarkReviewed: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl bg-card ring-1 ring-border overflow-hidden">
      {/* Header row */}
      <button
        className="w-full px-4 py-3 flex items-start gap-3 text-right hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <p
            className="font-medium text-sm truncate"
            dir={mistake.prompt_language === "en" ? "ltr" : "rtl"}
          >
            {mistake.prompt_text}
          </p>
          {mistake.last_wrong_answer && (
            <p className="text-xs text-destructive mt-0.5" dir="ltr">
              ✗ {mistake.last_wrong_answer}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            {mistake.wrong_count}x
          </span>
          <svg
            className={cn("h-4 w-4 text-muted-foreground transition-transform", expanded && "rotate-180")}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>

      {/* Expanded explanation */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50">
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            💡 {mistake.explanation_he}
          </p>
          <button
            onClick={onMarkReviewed}
            className="mt-3 w-full rounded-xl bg-success/10 border border-success/30 py-2.5 text-sm font-semibold text-success hover:bg-success/20 transition-colors active:scale-[0.98]"
          >
            ✓ סימון כנסקר
          </button>
        </div>
      )}
    </div>
  );
}

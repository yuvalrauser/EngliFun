"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCustomUnit } from "@/app/(auth)/path/actions";
import { cn } from "@/lib/utils";

const DEFAULT_ICON = "📝";
const DEFAULT_COLOR = "#9CA3AF";

// A small curated palette so the page doesn't ship a full color picker.
// The user can still type any hex if they really want.
const PALETTE = [
  "#58CC02", // green (primary)
  "#1CB0F6", // blue
  "#FFB020", // orange
  "#FF6B6B", // red
  "#00C2A8", // teal
  "#4D96FF", // royal blue
  "#FFD43B", // yellow
  "#8B5CF6", // purple
  "#9CA3AF", // gray (default)
];

export function NewUnitForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(DEFAULT_ICON);
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [serverError, setServerError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    startTransition(async () => {
      const result = await createCustomUnit({
        title,
        description,
        icon_emoji: icon,
        color_hex: color,
      });
      if (!result.ok) {
        setServerError(result.error ?? "שגיאה לא ידועה");
        return;
      }
      router.push("/path");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl bg-card p-6 ring-1 ring-border">
      {/* Preview */}
      <div
        className="flex items-center gap-4 rounded-2xl p-4"
        style={{ background: `linear-gradient(to left, ${color}20, ${color}08)` }}
      >
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
          style={{ backgroundColor: `${color}30` }}
        >
          {icon || DEFAULT_ICON}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold leading-tight truncate">
            {title || "שם היחידה"}
          </h2>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">{description}</p>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1.5">שם היחידה</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="למשל: צבעים מתקדמים"
          maxLength={80}
          required
          className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1.5">תיאור (אופציונלי)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="על מה היחידה תתמקד"
          maxLength={200}
          rows={2}
          className="w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none resize-none"
        />
      </div>

      {/* Icon */}
      <div>
        <label className="block text-sm font-medium mb-1.5">אייקון (אימוג&apos;י)</label>
        <input
          type="text"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          placeholder={DEFAULT_ICON}
          maxLength={4}
          className="w-20 rounded-xl border-2 border-border bg-card px-4 py-3 text-2xl text-center focus:border-primary focus:outline-none"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium mb-1.5">צבע</label>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={cn(
                "h-9 w-9 rounded-full border-2 transition-all",
                color === c ? "border-foreground scale-110" : "border-transparent",
              )}
              style={{ backgroundColor: c }}
              aria-label={`צבע ${c}`}
            />
          ))}
        </div>
      </div>

      {serverError && (
        <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive text-center">
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !title.trim()}
        className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isPending ? "יוצר..." : "צור יחידה"}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        אחרי יצירה, היחידה תופיע בסוף המסלול עם 5 שיעורים ריקים שתוכל למלא.
      </p>
    </form>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DAILY_GOAL_OPTIONS, type DailyGoalOption } from "@/lib/constants/xp";
import { Button } from "@/components/ui/button";
// mascot imported via StepOwl component below
import { motion, AnimatePresence } from "framer-motion";
import type { Profile } from "@/types/database";

type Step = 0 | 1 | 2 | 3 | 4;

const LEVEL_OPTIONS: { value: Profile["starting_level"]; label: string; desc: string; emoji: string }[] = [
  { value: "beginner", label: "מתחיל", desc: "אני רק מתחיל ללמוד אנגלית", emoji: "🌱" },
  { value: "elementary", label: "בסיסי", desc: "אני מכיר מילים וביטויים בסיסיים", emoji: "📗" },
  { value: "intermediate", label: "בינוני", desc: "אני יכול לנהל שיחה פשוטה", emoji: "📘" },
];

const GOAL_LABELS: Record<DailyGoalOption, { label: string; emoji: string; desc: string }> = {
  10: { label: "קליל", emoji: "🌱", desc: "5 דקות ביום" },
  20: { label: "רגיל", emoji: "📚", desc: "10 דקות ביום" },
  30: { label: "רציני", emoji: "💪", desc: "15 דקות ביום" },
  50: { label: "אינטנסיבי", emoji: "🔥", desc: "20 דקות ביום" },
};

const MOTIVATION_OPTIONS = [
  { label: "לעבודה / קריירה", emoji: "💼" },
  { label: "לטיולים", emoji: "✈️" },
  { label: "לימודים", emoji: "🎓" },
  { label: "תרבות ובידור", emoji: "🎬" },
  { label: "סתם בשביל הכיף", emoji: "😄" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [level, setLevel] = useState<Profile["starting_level"]>("beginner");
  const [goal, setGoal] = useState<DailyGoalOption>(20);
  const [motivation, setMotivation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [saveError, setSaveError] = useState("");

  async function handleComplete() {
    setIsLoading(true);
    setSaveError("");
    try {
      const res = await fetch("/api/complete-onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          starting_level: level,
          daily_xp_goal: goal,
          motivation: motivation || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `שגיאת שרת ${res.status}`);
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Onboarding error:", err);
      setSaveError(err instanceof Error ? err.message : "שגיאה בשמירה. נסה שוב.");
      setIsLoading(false);
    }
  }

  function next() {
    if (step < 4) setStep((s) => (s + 1) as Step);
  }

  function back() {
    if (step > 0) setStep((s) => (s - 1) as Step);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      {/* Emergency exit */}
      <div className="absolute top-4 left-4">
        <button
          onClick={async () => {
            await fetch("/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          התנתקות
        </button>
      </div>

      <div className="w-full max-w-lg flex flex-col gap-6">

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 0 && <StepWelcome onNext={next} />}
            {step === 1 && (
              <StepLevel value={level} onChange={setLevel} onNext={next} onBack={back} />
            )}
            {step === 2 && (
              <StepGoal value={goal} onChange={setGoal} onNext={next} onBack={back} />
            )}
            {step === 3 && (
              <StepMotivation value={motivation} onChange={setMotivation} onNext={next} onBack={back} />
            )}
            {step === 4 && (
              <StepReady
                level={level}
                goal={goal}
                isLoading={isLoading}
                saveError={saveError}
                onComplete={handleComplete}
                onBack={back}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Progress bar — below the buttons */}
        <div className="h-2 rounded-full bg-muted overflow-hidden mx-4">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>
      </div>
    </main>
  );
}

// ============================================================
// Step 0: Welcome — mascot hero
// ============================================================
// Shared owl header used in every step
function StepOwl({ animate = "float" }: { animate?: "float" | "bounce" }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/owl.png"
      alt="EngliFun"
      className={`w-52 object-contain drop-shadow-lg mb-8 ${animate === "float" ? "animate-float" : "animate-bounce-subtle"}`}
    />
  );
}

function StepWelcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="flex flex-col items-center text-center">
      <StepOwl />
      <h1 className="text-3xl font-bold mb-3">!ברוך הבא ל-EngliFun</h1>
      <p className="text-lg text-muted-foreground mb-2">
        אני אלמד אותך אנגלית בכיף!
      </p>
      <p className="text-sm text-muted-foreground mb-8">
        כמה שאלות קצרות ונתחיל ללמוד ביחד
      </p>
      <Button onClick={onNext} className="h-14 px-12 text-lg font-semibold rounded-2xl shadow-lg shadow-primary/25">
        בואו נתחיל!
      </Button>
    </div>
  );
}

// ============================================================
// Step 1: Level selection
// ============================================================
function StepLevel({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: Profile["starting_level"];
  onChange: (v: Profile["starting_level"]) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <StepOwl />
      <p className="text-xl font-bold mb-6">מה הרמה שלך באנגלית?</p>

      <div className="w-full space-y-3 mb-8">
        {LEVEL_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`w-full rounded-2xl border-2 p-4 text-right transition-all flex items-center gap-3 ${
              value === opt.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/40 bg-card"
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <div className="flex-1">
              <div className="font-semibold text-base">{opt.label}</div>
              <div className="text-sm text-muted-foreground">{opt.desc}</div>
            </div>
            {value === opt.value && (
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="white" className="h-4 w-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex w-full gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 rounded-xl">
          חזרה
        </Button>
        <Button onClick={onNext} className="h-12 flex-[2] text-base font-semibold rounded-xl">
          המשך
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Step 2: Daily XP goal
// ============================================================
function StepGoal({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: DailyGoalOption;
  onChange: (v: DailyGoalOption) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <StepOwl />
      <p className="text-xl font-bold mb-6">כמה תרצה ללמוד כל יום?</p>

      <div className="w-full space-y-3 mb-8">
        {DAILY_GOAL_OPTIONS.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`w-full rounded-2xl border-2 p-4 transition-all flex items-center gap-3 ${
              value === opt
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/40 bg-card"
            }`}
          >
            <span className="text-2xl">{GOAL_LABELS[opt].emoji}</span>
            <div className="flex-1 text-right">
              <div className="font-semibold text-base">{GOAL_LABELS[opt].label}</div>
              <div className="text-sm text-muted-foreground">{opt} XP ביום — {GOAL_LABELS[opt].desc}</div>
            </div>
            {value === opt && (
              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                <svg viewBox="0 0 20 20" fill="white" className="h-4 w-4">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="flex w-full gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 rounded-xl">
          חזרה
        </Button>
        <Button onClick={onNext} className="h-12 flex-[2] text-base font-semibold rounded-xl">
          המשך
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Step 3: Motivation (optional)
// ============================================================
function StepMotivation({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <StepOwl />
      <p className="text-xl font-bold mb-6">למה אתה רוצה ללמוד אנגלית?</p>

      <div className="w-full space-y-3 mb-8">
        {MOTIVATION_OPTIONS.map((opt) => (
          <button
            key={opt.label}
            onClick={() => onChange(value === opt.label ? "" : opt.label)}
            className={`w-full rounded-2xl border-2 p-4 text-right transition-all flex items-center gap-3 ${
              value === opt.label
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/40 bg-card"
            }`}
          >
            <span className="text-xl">{opt.emoji}</span>
            <div className="font-medium flex-1">{opt.label}</div>
          </button>
        ))}
      </div>

      <div className="flex w-full gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 rounded-xl">
          חזרה
        </Button>
        <Button onClick={onNext} className="h-12 flex-[2] text-base font-semibold rounded-xl">
          {value ? "המשך" : "דלג"}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// Step 4: Ready / Summary
// ============================================================
function StepReady({
  level,
  goal,
  isLoading,
  saveError,
  onComplete,
  onBack,
}: {
  level: Profile["starting_level"];
  goal: DailyGoalOption;
  saveError?: string;
  isLoading: boolean;
  onComplete: () => void;
  onBack: () => void;
}) {
  const levelLabel = LEVEL_OPTIONS.find((o) => o.value === level)!.label;

  return (
    <div className="flex flex-col items-center text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/owl.png" alt="EngliFun" className="w-40 object-contain animate-bounce-subtle mb-3 drop-shadow-md" />
      <h2 className="text-2xl font-bold mb-1">!מוכנים לצאת לדרך</h2>
      <p className="text-muted-foreground mb-6">הנה הסיכום שלך:</p>

      <div className="w-full rounded-2xl bg-card shadow-sm ring-1 ring-border p-5 mb-8 text-right space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base">{levelLabel}</span>
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <span>🎯</span> רמה
          </span>
        </div>
        <div className="border-t border-border" />
        <div className="flex items-center justify-between">
          <span className="font-semibold text-base">{goal} XP ביום</span>
          <span className="text-sm text-muted-foreground flex items-center gap-1.5">
            <span>⚡</span> יעד יומי
          </span>
        </div>
      </div>

      {saveError && (
        <p className="text-sm text-destructive mb-3 text-center">{saveError}</p>
      )}

      <div className="flex w-full gap-3">
        <Button variant="outline" onClick={onBack} className="h-12 flex-1 rounded-xl" disabled={isLoading}>
          חזרה
        </Button>
        <Button
          onClick={onComplete}
          disabled={isLoading}
          className="h-14 flex-[2] text-lg font-semibold rounded-2xl shadow-lg shadow-primary/25"
        >
          {isLoading ? "שומר..." : "!התחל ללמוד"}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { FormField } from "@/components/ui/form-field";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const result = resetPasswordSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/update-password`,
    });

    setIsLoading(false);

    if (resetError) {
      setError("שגיאה בשליחת הקישור. נסה שוב.");
      return;
    }

    setSent(true);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-primary/5 to-background">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/owl.png" alt="EngliFun" className="h-20 object-contain" />
        </div>

        <div className="rounded-3xl bg-card shadow-sm ring-1 ring-border p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-5xl mb-4">📧</div>
              <h1 className="text-2xl font-bold mb-2">בדוק את האימייל</h1>
              <p className="text-muted-foreground text-sm mt-1 mb-6">
                שלחנו קישור לאיפוס סיסמה אל{" "}
                <span dir="ltr" className="font-medium text-foreground">{email}</span>
              </p>
              <Link href="/login" className="text-sm font-medium text-primary hover:underline">
                חזרה להתחברות
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">איפוס סיסמה</h1>
                <p className="text-muted-foreground text-sm mt-1">נשלח לך קישור לאיפוס במייל</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  id="email"
                  name="email"
                  type="email"
                  label="אימייל"
                  placeholder="name@example.com"
                  dir="ltr"
                  className="text-left h-12"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  error={error}
                  autoComplete="email"
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isLoading ? "שולח..." : "שלח קישור לאיפוס"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-muted-foreground">
                <Link href="/login" className="font-medium text-primary hover:underline">
                  חזרה להתחברות
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

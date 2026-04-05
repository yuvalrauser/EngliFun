"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

  if (sent) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 text-4xl">📧</div>
            <CardTitle className="text-2xl">בדוק את האימייל</CardTitle>
            <CardDescription>
              שלחנו קישור לאיפוס סיסמה אל{" "}
              <span dir="ltr" className="font-medium">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:underline"
            >
              חזרה להתחברות
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-4xl font-bold text-primary">EngliFun</div>
          <CardTitle className="text-2xl">איפוס סיסמה</CardTitle>
          <CardDescription>הזן את האימייל שלך ונשלח לך קישור לאיפוס</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              id="email"
              name="email"
              type="email"
              label="אימייל"
              placeholder="name@example.com"
              dir="ltr"
              className="text-left"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(""); }}
              error={error}
              autoComplete="email"
            />

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "שולח..." : "שלח קישור לאיפוס"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              חזרה להתחברות
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

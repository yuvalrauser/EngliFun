"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterFormData } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterFormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof RegisterFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: { username: form.username },
      },
    });

    if (error) {
      setIsLoading(false);
      if (error.message.includes("already registered")) {
        setServerError("כתובת האימייל כבר רשומה במערכת");
      } else {
        setServerError("שגיאה בהרשמה. נסה שוב.");
      }
      return;
    }

    router.push("/onboarding");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-4xl font-bold text-primary">EngliFun</div>
          <CardTitle className="text-2xl">יצירת חשבון</CardTitle>
          <CardDescription>הצטרף אלינו והתחל ללמוד אנגלית</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              id="username"
              name="username"
              label="שם משתמש"
              placeholder="your_username"
              dir="ltr"
              className="text-left"
              value={form.username}
              onChange={handleChange}
              error={errors.username}
              autoComplete="username"
            />
            <FormField
              id="email"
              name="email"
              type="email"
              label="אימייל"
              placeholder="name@example.com"
              dir="ltr"
              className="text-left"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              autoComplete="email"
            />
            <FormField
              id="password"
              name="password"
              type="password"
              label="סיסמה"
              placeholder="לפחות 6 תווים"
              dir="ltr"
              className="text-left"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              autoComplete="new-password"
            />
            <FormField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="אימות סיסמה"
              placeholder="הזן את הסיסמה שוב"
              dir="ltr"
              className="text-left"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />

            {serverError && (
              <p className="text-sm text-destructive text-center">{serverError}</p>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={isLoading}
            >
              {isLoading ? "נרשם..." : "הרשמה"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            כבר יש לך חשבון?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              התחברות
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordSchema, type UpdatePasswordFormData } from "@/lib/validators/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FormField } from "@/components/ui/form-field";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState<UpdatePasswordFormData>({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdatePasswordFormData, string>>>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setServerError("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setServerError("");

    const result = updatePasswordSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof UpdatePasswordFormData;
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({ password: form.password });

    if (error) {
      setIsLoading(false);
      setServerError("שגיאה בעדכון הסיסמה. נסה שוב.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 text-4xl font-bold text-primary">EngliFun</div>
          <CardTitle className="text-2xl">סיסמה חדשה</CardTitle>
          <CardDescription>הזן את הסיסמה החדשה שלך</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              id="password"
              name="password"
              type="password"
              label="סיסמה חדשה"
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
              {isLoading ? "מעדכן..." : "עדכן סיסמה"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

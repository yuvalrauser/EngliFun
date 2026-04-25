"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updatePasswordSchema, type UpdatePasswordFormData } from "@/lib/validators/auth";
import { FormField } from "@/components/ui/form-field";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState<UpdatePasswordFormData>({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof UpdatePasswordFormData, string>>>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      setServerError("שגיאה בעדכון הסיסמה. הקישור אולי פג תוקף — בקש קישור חדש.");
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 2000);
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
          {success ? (
            <div className="text-center">
              <div className="text-5xl mb-4">✅</div>
              <h1 className="text-2xl font-bold mb-2">הסיסמה עודכנה!</h1>
              <p className="text-muted-foreground text-sm">מעביר אותך לאפליקציה...</p>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h1 className="text-2xl font-bold">סיסמה חדשה</h1>
                <p className="text-muted-foreground text-sm mt-1">בחר סיסמה חזקה לחשבון שלך</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormField
                  id="password"
                  name="password"
                  type="password"
                  label="סיסמה חדשה"
                  placeholder="לפחות 6 תווים"
                  dir="ltr"
                  className="text-left h-12"
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
                  className="text-left h-12"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                />

                {serverError && (
                  <div className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive text-center">
                    {serverError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mt-2"
                >
                  {isLoading ? "מעדכן..." : "עדכן סיסמה"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

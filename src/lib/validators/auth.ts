import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "שם המשתמש חייב להכיל לפחות 3 תווים")
    .max(20, "שם המשתמש יכול להכיל עד 20 תווים")
    .regex(/^[a-zA-Z0-9_]+$/, "שם המשתמש יכול להכיל רק אותיות באנגלית, מספרים וקו תחתון"),
  email: z
    .string()
    .email("כתובת אימייל לא תקינה"),
  password: z
    .string()
    .min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
  confirmPassword: z
    .string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "הסיסמאות לא תואמות",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z
    .string()
    .email("כתובת אימייל לא תקינה"),
  password: z
    .string()
    .min(1, "נא להזין סיסמה"),
});

export const resetPasswordSchema = z.object({
  email: z
    .string()
    .email("כתובת אימייל לא תקינה"),
});

export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(6, "הסיסמה חייבת להכיל לפחות 6 תווים"),
  confirmPassword: z
    .string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "הסיסמאות לא תואמות",
  path: ["confirmPassword"],
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

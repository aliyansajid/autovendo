import { z } from "zod";

type TFn = (key: string) => string;

export const createLoginSchema = (t: TFn) =>
  z.object({
    email: z.email(t("invalidEmail")),
    password: z.string().min(1, t("passwordRequired")),
    rememberme: z.boolean(),
  });

export const createForgotPasswordSchema = (t: TFn) =>
  z.object({
    email: z.email(t("invalidEmail")),
  });

export const createResetPasswordSchema = (t: TFn) =>
  z
    .object({
      password: z.string().min(8, t("passwordMinLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });

export const createUpdatePasswordSchema = (t: TFn) =>
  z
    .object({
      currentPassword: z.string().min(1, t("currentPasswordRequired")),
      newPassword: z.string().min(8, t("newPasswordMinLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });

// Static fallbacks for non-i18n contexts
export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberme: z.boolean(),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

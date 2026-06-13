import { z } from "zod";

type TFn = (key: string) => string;

export const createSignupSchema = (t: TFn) =>
  z
    .object({
      name: z.string().min(3, t("nameMinLength")),
      email: z.email(t("invalidEmail")),
      password: z.string().min(8, t("passwordMinLength")),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("passwordsDoNotMatch"),
      path: ["confirmPassword"],
    });

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

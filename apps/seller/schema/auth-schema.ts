import { z } from "zod";

type TFn = (key: string) => string;

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

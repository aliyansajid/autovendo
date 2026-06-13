import { z } from "zod";

type TFn = (key: string) => string;

export const createDealerContactSchema = (t: TFn) =>
  z.object({
    name: z.string().min(3, t("nameMinLength")).max(50, t("nameMaxLength")),
    email: z.email(t("invalidEmail")),
    phone: z
      .string()
      .min(1, t("phoneRequired"))
      .regex(/^(\+41|0041|0)[0-9\s.-]{8,}$/, t("invalidPhoneFormat")),
    message: z.string().max(500, t("messageMaxLength")).optional(),
  });

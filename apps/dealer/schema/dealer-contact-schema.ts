import { z } from "zod";

type TFn = (key: string) => string;

export const createDealerContactSchema = (t: TFn) =>
  z.object({
    name: z.string().min(3, t("nameMinLength")).max(50, t("nameMaxLength")),
    phone: z.string().min(1, t("phoneRequired")),
    email: z.email(t("invalidEmail")),
    message: z.string().max(500, t("messageMaxLength")).optional(),
  });

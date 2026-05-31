import { z } from "zod";

type TFn = (key: string) => string;

export const createContactFormSchema = (t: TFn) =>
  z.object({
    name: z.string().min(3, t("nameMin")).max(50, t("nameMax")),
    email: z.email(t("invalidEmail")),
    phone: z
      .string()
      .min(1, t("phoneRequired"))
      .regex(/^(\+41|0041|0)[0-9\s.-]{8,}$/, t("invalidPhone")),
    subject: z.string().max(100, t("subjectMax")).optional(),
    message: z.string().max(500, t("messageMax")).optional(),
  });

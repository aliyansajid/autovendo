import { z } from "zod";

type TFn = (key: string) => string;

export const createSellerProfileSchema = (t: TFn) =>
  z.object({
    name: z.string().min(3, t("nameMinLength")).max(50, t("nameMaxLength")),
    email: z.email(t("invalidEmail")),
    phoneNumber: z
      .string()
      .min(1, t("phoneRequired"))
      .regex(
        /^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/,
        t("invalidPhoneFormat"),
      ),
    streetAddress: z
      .string()
      .min(5, t("addressMinLength"))
      .max(100, t("addressMaxLength")),
    zipCode: z
      .string()
      .min(4, t("zipCodeMinLength"))
      .max(10, t("zipCodeMaxLength")),
    city: z.string().min(2, t("cityMinLength")).max(50, t("cityMaxLength")),
  });

import { z } from "zod";

type TFn = (key: string) => string;

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const createOptionalImage = (t: TFn) =>
  z
    .union([z.instanceof(File), z.string().url()])
    .refine(
      (file) =>
        typeof file === "string" ||
        (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)),
      { message: t("invalidImageType") },
    )
    .optional()
    .nullable();

export const createSellerProfileSchema = (t: TFn) =>
  z.object({
    // User fields
    name: z.string().min(2, t("nameMinLength")).max(50, t("nameMaxLength")),
    email: z.string().email(t("invalidEmail")),
    image: createOptionalImage(t),

    // Seller fields
    firstName: z.string().min(2, t("firstNameMinLength")).max(50, t("firstNameMaxLength")),
    lastName: z.string().min(2, t("lastNameMinLength")).max(50, t("lastNameMaxLength")),
    phoneNumber: z
      .string()
      .min(1, t("phoneRequired"))
      .regex(
        /^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/,
        t("invalidPhoneFormat"),
      ),
    sellerEmail: z.string().email(t("invalidEmail")),
    streetAddress: z
      .string()
      .min(5, t("addressMinLength"))
      .max(100, t("addressMaxLength")),
    zipCode: z
      .string()
      .min(4, t("zipCodeMinLength"))
      .max(10, t("zipCodeMaxLength")),
    city: z.string().min(2, t("cityMinLength")).max(50, t("cityMaxLength")),
    country: z.literal("Switzerland"),
  });

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
      {
        message: t("invalidImageType"),
      },
    )
    .optional()
    .nullable();

const createOptionalString = () =>
  z.string().optional().or(z.literal("")).nullable();

const createOptionalUrl = (t: TFn) =>
  z.string().url(t("invalidUrl")).optional().or(z.literal("")).nullable();

export const createSellerProfileSchema = (t: TFn) =>
  z.object({
    name: z.string().min(3, t("nameMinLength")).max(50, t("nameMaxLength")),
    email: z.string().email(t("invalidEmail")),
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

export const createDealerProfileSchema = (t: TFn) =>
  z.object({
    // User fields
    name: z.string().min(3, t("nameMinLength")).max(50, t("nameMaxLength")),
    email: z.string().email(t("invalidEmail")),
    image: createOptionalImage(t),

    // Dealer fields
    companyName: createOptionalString(),
    description: createOptionalString(),
    website: createOptionalUrl(t),
    logo: createOptionalImage(t),
    coverImage: createOptionalImage(t),
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
    uidNumber: createOptionalString(),
    contactPerson: createOptionalString(),
    phoneNumber: z
      .string()
      .min(1, t("phoneRequired"))
      .regex(
        /^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/,
        t("invalidPhoneFormat"),
      ),
    businessEmail: z.string().email(t("invalidEmail")),

    // Opening Hours
    openingHours: z
      .array(
        z.object({
          day: z.string(),
          isOpen: z.boolean(),
          openTime: z.string().optional().nullable(),
          closeTime: z.string().optional().nullable(),
        }),
      )
      .optional()
      .nullable(),
  });

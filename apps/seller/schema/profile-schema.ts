import { z } from "zod";
import { swissCities } from "@repo/vehicle-constants";

type TFn = (key: string) => string;

// Canonical city identifiers (e.g. "AARAU"). Used to validate the city select
// against real Swiss municipalities instead of a free-text length check.
const SWISS_CITY_VALUES = new Set(swissCities.map((c) => c.value));

// Swiss postal codes (PLZ) are always exactly 4 digits (1000–9999).
const SWISS_ZIP_REGEX = /^\d{4}$/;

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const createOptionalImage = (t: TFn) =>
  z
    .union([z.instanceof(File), z.url()])
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
  z.url(t("invalidUrl")).optional().or(z.literal("")).nullable();

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
      .regex(SWISS_ZIP_REGEX, t("invalidZipCode")),
    city: z
      .string()
      .refine((val) => SWISS_CITY_VALUES.has(val), t("invalidCity")),
  });

export const createDealerProfileSchema = (t: TFn) =>
  z.object({
    // User fields
    name: z.string().min(3, t("nameMinLength")).max(50, t("nameMaxLength")),
    email: z.email(t("invalidEmail")),
    image: createOptionalImage(t),

    // Dealer fields
    companyName: z
      .string()
      .min(3, t("companyNameMinLength"))
      .max(50, t("companyNameMaxLength")),
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
      .regex(SWISS_ZIP_REGEX, t("invalidZipCode")),
    city: z
      .string()
      .refine((val) => SWISS_CITY_VALUES.has(val), t("invalidCity")),
    country: z.literal("Switzerland"),
    uidNumber: z
      .string()
      .min(1, t("uidRequired"))
      .regex(/^CHE-\d{3}\.\d{3}\.\d{3}$/, t("invalidUidFormat")),
    contactPerson: z
      .string()
      .min(3, t("contactPersonMinLength"))
      .max(50, t("contactPersonMaxLength")),
    phoneNumber: z
      .string()
      .min(1, t("phoneRequired"))
      .regex(
        /^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/,
        t("invalidPhoneFormat"),
      ),
    businessEmail: z.email(t("invalidEmail")),

    // Opening Hours
    openingHours: z.array(
      z.object({
        day: z.string(),
        isOpen: z.boolean(),
        openTime: z.string().optional().nullable(),
        closeTime: z.string().optional().nullable(),
      }),
    ),
  });

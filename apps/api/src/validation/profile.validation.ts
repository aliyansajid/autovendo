/**
 * Server-side validation schemas for seller & dealer profiles — mirrors the
 * client schema (apps/seller/schema/profile-schema.ts). Applied at the
 * controller boundary via ZodValidationPipe. Updates are partial (the API sets
 * only provided fields), so every field is optional but must be valid when sent.
 *
 * Unknown keys are stripped. Notably `image` (the user avatar) is intentionally
 * NOT listed here — it is saved separately through Better Auth, so it is dropped
 * from the dealer-profile payload rather than written to the Dealer row.
 */
import { z } from "zod";
import { SWISS_CITY_VALUES as SWISS_CITY_LIST } from "./swiss-cities";

const SWISS_CITY_VALUES = new Set(SWISS_CITY_LIST);

const swissZip = z.string().regex(/^\d{4}$/, "Invalid Swiss postal code");
const swissPhone = z
  .string()
  .regex(
    /^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/,
    "Invalid phone number",
  );
const swissCity = z
  .string()
  .refine((v) => SWISS_CITY_VALUES.has(v), "Invalid city");

export const sellerProfileSchema = z
  .object({
    phoneNumber: swissPhone,
    streetAddress: z.string().min(5).max(100),
    zipCode: swissZip,
    city: swissCity,
  })
  .partial();

export type SellerProfileInput = z.infer<typeof sellerProfileSchema>;

export const dealerProfileSchema = z
  .object({
    companyName: z.string().min(3).max(50),
    description: z.string().max(2000).nullish(),
    website: z.union([z.string().url(), z.literal("")]).nullish(),
    logo: z.string().nullish(),
    coverImage: z.string().nullish(),
    country: z.literal("Switzerland").optional(),
    streetAddress: z.string().min(5).max(100),
    zipCode: swissZip,
    city: swissCity,
    uidNumber: z.string().regex(/^CHE-\d{3}\.\d{3}\.\d{3}$/, "Invalid UID"),
    contactPerson: z.string().min(3).max(50),
    phoneNumber: swissPhone,
    businessEmail: z.string().email(),
    openingHours: z.array(
      z.object({
        day: z.string(),
        isOpen: z.boolean(),
        openTime: z.string().nullish(),
        closeTime: z.string().nullish(),
      }),
    ),
  })
  .partial();

export type DealerProfileInput = z.infer<typeof dealerProfileSchema>;

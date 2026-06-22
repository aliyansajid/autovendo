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
    name: z.string().min(3).max(50),
    email: z.email(),
    phoneNumber: swissPhone,
    streetAddress: z.string().min(5).max(100),
    zipCode: swissZip,
    city: swissCity,
  })
  .partial();

export type SellerProfileInput = z.infer<typeof sellerProfileSchema>;

export const dealerProfileSchema = z
  .object({
    name: z.string().min(3).max(50),
    email: z.email(),
    companyName: z.string().min(3).max(50),
    description: z.string().max(500).or(z.literal("")).nullish(),
    website: z.union([z.url(), z.literal("")]).nullish(),
    logo: z.url().nullish(),
    coverImage: z.url().nullish(),
    country: z.literal("Switzerland").optional(),
    streetAddress: z.string().min(5).max(100),
    zipCode: swissZip,
    city: swissCity,
    uidNumber: z.string().regex(/^CHE-\d{3}\.\d{3}\.\d{3}$/, "Invalid UID"),
    contactPerson: z.string().min(3).max(50),
    phoneNumber: swissPhone,
    businessEmail: z.email(),
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

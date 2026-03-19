import { z } from "zod";

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

const optionalImage = z
  .union([z.instanceof(File), z.url()])
  .refine(
    (file) =>
      typeof file === "string" ||
      (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)),
    {
      message: "Only PNG, JPG, JPEG, or WEBP images are allowed",
    },
  )
  .optional()
  .nullable();

const optionalString = z.string().optional().or(z.literal("")).nullable();

const optionalUrl = z
  .url("Please enter a valid URL")
  .optional()
  .or(z.literal(""))
  .nullable();

export const dealerProfileSchema = z.object({
  // User fields
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.email("Invalid email address"),
  image: optionalImage,

  // Dealer fields
  companyName: z
    .string()
    .min(3, "Company name must be at least 3 characters")
    .max(50, "Company name must be at most 50 characters"),
  description: optionalString,
  website: optionalUrl,
  logo: optionalImage,
  streetAddress: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be at most 100 characters"),
  zipCode: z
    .string()
    .min(4, "Zip code must be at least 4 characters")
    .max(10, "Zip code must be at most 10 characters"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be at most 50 characters"),
  country: z.literal("Switzerland"),
  uidNumber: z
    .string()
    .min(1, "UID is required")
    .regex(
      /^CHE[\s-]?\d{3}[\s.]?\d{3}[\s.]?\d{3}(?:\s?(MWST|TVA|IVA))?$/i,
      "Invalid UID format (e.g. CHE-123.456.789 MWST)",
    ),
  contactPerson: z
    .string()
    .min(3, "Contact person must be at least 3 characters")
    .max(50, "Contact person must be at most 50 characters"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/,
      "Invalid Swiss phone number format",
    ),
  businessEmail: z.email("Invalid business email address"),

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

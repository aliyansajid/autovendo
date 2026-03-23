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
      message: "Nur PNG, JPG, JPEG oder WEBP Bilder sind erlaubt",
    },
  )
  .optional()
  .nullable();

const optionalString = z.string().optional().or(z.literal("")).nullable();

const optionalUrl = z
  .url("Bitte geben Sie eine gültige URL ein")
  .optional()
  .or(z.literal(""))
  .nullable();

export const dealerProfileSchema = z.object({
  // User fields
  name: z
    .string()
    .min(3, "Name muss mindestens 3 Zeichen lang sein")
    .max(50, "Name darf maximal 50 Zeichen lang sein"),
  email: z.email("Ungültige E-Mail-Adresse"),
  image: optionalImage,

  // Dealer fields
  companyName: z
    .string()
    .min(3, "Firmenname muss mindestens 3 Zeichen lang sein")
    .max(50, "Firmenname darf maximal 50 Zeichen lang sein"),
  description: optionalString,
  website: optionalUrl,
  logo: optionalImage,
  coverImage: optionalImage,
  streetAddress: z
    .string()
    .min(5, "Adresse muss mindestens 5 Zeichen lang sein")
    .max(100, "Adresse darf maximal 100 Zeichen lang sein"),
  zipCode: z
    .string()
    .min(4, "Postleitzahl muss mindestens 4 Zeichen lang sein")
    .max(10, "Postleitzahl darf maximal 10 Zeichen lang sein"),
  city: z
    .string()
    .min(2, "Stadt muss mindestens 2 Zeichen lang sein")
    .max(50, "Stadt darf maximal 50 Zeichen lang sein"),
  country: z.literal("Switzerland"),
  uidNumber: z
    .string()
    .min(1, "UID ist erforderlich")
    .regex(
      /^CHE[\s-]?\d{3}[\s.]?\d{3}[\s.]?\d{3}(?:\s?(MWST|TVA|IVA))?$/i,
      "Ungültiges UID-Format (z.B. CHE-123.456.789 MWST)",
    ),
  contactPerson: z
    .string()
    .min(3, "Kontaktperson muss mindestens 3 Zeichen lang sein")
    .max(50, "Kontaktperson darf maximal 50 Zeichen lang sein"),
  phoneNumber: z
    .string()
    .min(1, "Telefonnummer ist erforderlich")
    .regex(
      /^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/,
      "Ungültiges Schweizer Telefonnummer-Format",
    ),
  businessEmail: z.email("Ungültige geschäftliche E-Mail-Adresse"),

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

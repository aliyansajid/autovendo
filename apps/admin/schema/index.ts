import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const dealerSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),
  email: z.email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  companyName: z
    .string()
    .min(3, "Company name must be at least 3 characters")
    .max(50, "Company name must be at most 50 characters"),
  streetAddress: z
    .string()
    .min(5, "Address is required")
    .max(100, "Address must be at most 100 characters"),
  zipCode: z
    .string()
    .min(4, "Zip code is required")
    .max(10, "Zip code must be at most 10 characters"),
  city: z
    .string()
    .min(2, "City is required")
    .max(50, "City must be at most 50 characters"),
  uidNumber: z
    .string()
    .min(1, "UID is required")
    .regex(
      /^CHE[\s-]?\d{3}[\s.]?\d{3}[\s.]?\d{3}(?:\s?(MWST|TVA|IVA))?$/i,
      "Invalid UID format (e.g. CHE-123.456.789 MWST)"
    ),
  contactPerson: z
    .string()
    .min(3, "Contact person is required")
    .max(50, "Contact person must be at most 50 characters"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(
      /^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/,
      "Invalid Swiss phone number format"
    ),
  businessEmail: z.email("Please enter a valid email"),
});

export const updateDealerSchema = dealerSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
});


export const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  priceId: z.string().min(1, "Price ID is required"),
  vehicles: z.coerce.number().min(1, "At least 1 vehicle required"),
  popular: z.boolean().default(false),
});

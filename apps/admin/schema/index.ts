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
  address: z
    .string()
    .min(5, "Address is required")
    .max(50, "Address must be at most 50 characters"),
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
    .min(5, "UID Number is required")
    .max(50, "UID Number must be at most 50 characters"),
  contactPerson: z
    .string()
    .min(3, "Contact person is required")
    .max(50, "Contact person must be at most 50 characters"),
  phoneNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(/^(\+41|0041|0)[0-9\s.-]{8,}$/, "Invalid phone number"),
  businessEmail: z.email("Please enter a valid email"),
});

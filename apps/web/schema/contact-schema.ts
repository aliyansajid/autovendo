import { z } from "zod";

export const contactFormSchema = z.object({
    name: z
      .string()
      .min(3, "Name muss mindestens 3 Zeichen lang sein")
      .max(50, "Name darf maximal 50 Zeichen lang sein"),
    email: z.email("Ungültige E-Mail-Adresse"),
    phone: z
      .string()
      .min(1, "Telefonnummer ist erforderlich")
      .regex(/^(\+41|0041|0)[0-9\s.-]{8,}$/, "Ungültige Schweizer Telefonnummer"),
    subject: z
      .string()
      .max(100, "Betreff darf maximal 100 Zeichen lang sein")
      .optional(),
    message: z
      .string()
      .max(1000, "Nachricht darf maximal 1000 Zeichen lang sein")
      .optional(),
  });
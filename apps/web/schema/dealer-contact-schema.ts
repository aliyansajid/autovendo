import { z } from "zod";

export const dealerContactSchema = z.object({
  name: z
    .string()
    .min(3, "Name ist erforderlich")
    .max(50, "Name darf maximal 50 Zeichen lang sein"),
  phone: z
    .string()
    .min(1, "Telefon ist erforderlich")
    .regex(/^(\+41|0041|0)[0-9\s.-]{8,}$/, "Ungültige Schweizer Telefonnummer"),
  email: z.email("Ungültige E-Mail-Adresse"),
  message: z
    .string()
    .max(1000, "Nachricht darf maximal 1000 Zeichen lang sein")
    .optional(),
});

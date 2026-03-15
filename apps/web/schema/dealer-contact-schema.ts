import { z } from "zod";

export const dealerContactSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  phone: z.string().min(1, "Telefon ist erforderlich"),
  email: z.email("Ungültige E-Mail-Adresse"),
  message: z.string().min(1, "Nachricht ist erforderlich"),
});

export type DealerContactFormValues = z.infer<typeof dealerContactSchema>;


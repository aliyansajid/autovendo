import { z } from "zod";

type TFn = (key: string) => string;

export const createDealerContactSchema = (t: TFn) =>
  z.object({
    name: z.string().min(3, t("nameMinLength")).max(50, t("nameMaxLength")),
    phone: z.string().min(1, t("phoneRequired")),
    email: z.email(t("invalidEmail")),
    message: z.string().max(1000, t("messageMaxLength")).optional(),
  });

// Static fallback for non-i18n contexts
export const dealerContactSchema = createDealerContactSchema((key) => {
  const defaults: Record<string, string> = {
    nameMinLength: "Name ist erforderlich",
    nameMaxLength: "Name darf maximal 50 Zeichen lang sein",
    phoneRequired: "Telefon ist erforderlich",
    invalidPhoneFormat: "Ungültige Schweizer Telefonnummer",
    invalidEmail: "Ungültige E-Mail-Adresse",
    messageMaxLength: "Nachricht darf maximal 1000 Zeichen lang sein",
  };
  return defaults[key] || "Invalid value";
});

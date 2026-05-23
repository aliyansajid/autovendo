"use server";

import sendEmail from "@repo/transactional";
import ContactMessage from "@repo/transactional/emails/contact-message";
import React from "react";
import { z } from "zod";
import { createContactFormSchema } from "@/schema/contact-schema";
import { getTranslations } from "next-intl/server";

const CONTACT_EMAIL = "info@autosolo.ch";

export async function sendContactMessage(input: any) {
  const t = await getTranslations("ContactSchema");
  const schema = createContactFormSchema(t);
  const validatedInput = schema.parse(input);
  const { name, email, phone, subject, message } = validatedInput;

  const result = await sendEmail({
    to: CONTACT_EMAIL,
    subject: subject?.trim()
      ? `Kontaktanfrage: ${subject.trim()}`
      : "Kontaktanfrage von autosolo.ch",
    template: React.createElement(ContactMessage, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject?.trim() || undefined,
      message: message?.trim() || undefined,
      appName: "AutoSolo",
      appUrl: "https://autosolo.ch",
    }),
  });

  if (!result.success) {
    console.error("Contact form email failed:", result.error);
    return {
      ok: false,
      error:
        "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut.",
    };
  }

  return { ok: true, message: "Nachricht erfolgreich gesendet" };
}

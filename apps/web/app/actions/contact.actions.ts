"use server";

import sendEmail from "@repo/transactional";
import ContactMessage from "@repo/transactional/emails/contact-message";
import React from "react";
import { z } from "zod";
import { contactFormSchema } from "@/schema/contact-schema";

const CONTACT_EMAIL = "info@autovendo.ch";

export async function sendContactMessage(
  input: z.infer<typeof contactFormSchema>,
) {
  const { name, email, phone, subject, message } = input;

  const result = await sendEmail({
    to: CONTACT_EMAIL,
    subject: subject?.trim()
      ? `Kontaktanfrage: ${subject.trim()}`
      : "Kontaktanfrage von autovendo.ch",
    template: React.createElement(ContactMessage, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      subject: subject?.trim() || undefined,
      message: message?.trim() || undefined,
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

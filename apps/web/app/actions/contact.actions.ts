"use server";

import sendEmail from "@repo/transactional";
import ContactMessage from "@repo/transactional/emails/contact-message";
import React from "react";

const CONTACT_EMAIL = "info@autovendo.ch";

export type SendContactMessageInput = {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message?: string;
};

export async function sendContactMessage(input: SendContactMessageInput) {
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

  return { ok: true };
}

import { Hono } from "hono";
import { z } from "zod";
import React from "react";

const contactSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[0-9\s\-().]{7,20}$/),
  subject: z.string().max(100).optional(),
  message: z.string().max(500).optional(),
});

const CONTACT_EMAIL = "info@autovendo.ch";

const contact = new Hono();

contact.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body) return c.json({ error: "Invalid JSON" }, 400);

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  }

  const { name, email, phone, subject, message } = parsed.data;

  const { default: sendEmail } = await import("@repo/transactional");
  const { default: ContactMessage } = await import("@repo/transactional/emails/contact-message");

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
    return c.json(
      { error: "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut." },
      500,
    );
  }

  return c.json({ ok: true, message: "Nachricht erfolgreich gesendet" });
});

export default contact;

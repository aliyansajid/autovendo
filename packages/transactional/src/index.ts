import nodemailer from "nodemailer";
import { render } from "@react-email/components";
import React from "react";

/**
 * Transporter configuration using environment variables
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === "true", // true for 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  template: React.ReactElement;
  replyTo?: string;
}

/**
 * Render React Email template and send email
 */
export async function sendEmail({ to, subject, template, replyTo }: SendEmailOptions) {
  try {
    const html = await render(template);

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Autovendo" <info@autovendo.ch>',
      to,
      subject,
      replyTo,
      html,
      text: html.replace(/<[^>]*>?/gm, ""), // fallback plain text
    });

    console.log("✅ Email sent:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    console.error("❌ Error sending email:", error);

    return {
      success: false,
      error,
    };
  }
}

export default sendEmail;

export { ListingContactEmail } from "../emails/listing-contact";
export type { ListingContactEmailProps } from "../emails/listing-contact";

export { AccountBannedEmail } from "../emails/account-banned";
export { AccountUnbannedEmail } from "../emails/account-unbanned";
export { AccountDeletedEmail } from "../emails/account-deleted";



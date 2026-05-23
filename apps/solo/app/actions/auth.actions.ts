"use server";

import sendEmail from "@repo/transactional";
import { SellerWelcomeEmail } from "@repo/transactional/emails/seller-welcome";

export async function sendWelcomeEmail(name: string, email: string, locale: string) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autosolo.ch";
    const appName = process.env.APP_NAME ?? "AutoSolo";

    await sendEmail({
      to: email,
      subject: `Welcome to ${appName} – your account is ready`,
      template: SellerWelcomeEmail({
        sellerName: name,
        dashboardUrl: `${appUrl}/${locale}/dashboard`,
      }),
    });
  } catch {
    // non-critical — don't block signup
  }
}

"use server";

import sendEmail from "@repo/transactional";
import { SellerWelcomeEmail } from "@repo/transactional/emails/seller-welcome";
import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";

export async function onSignup(name: string, email: string, locale: string) {
  // Create seller profile
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (session?.user?.id) {
      await prisma.seller.upsert({
        where: { userId: session.user.id },
        update: {},
        create: {
          userId: session.user.id,
          phoneNumber: "",
          streetAddress: "",
          zipCode: "",
          city: "",
          country: "ch",
        },
      });
    }
  } catch {
    // non-critical
  }

  // Send welcome email
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
    // non-critical
  }
}

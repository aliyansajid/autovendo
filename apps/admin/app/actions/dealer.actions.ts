"use server";

import { z } from "zod";
import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { dealerSchema } from "@/schema";

export async function createDealer(formData: z.infer<typeof dealerSchema>) {
  try {
    const validatedData = dealerSchema.parse(formData);

    // 1. Create User via Better Auth Admin API
    const newUser = await auth.api.createUser({
      body: {
        name: validatedData.name,
        email: validatedData.email,
        password: validatedData.password,
        role: "user",
      },
    });

    if (!newUser || !newUser.user) {
      return { error: "Failed to create authentication account" };
    }

    await prisma.user.update({
      where: { id: newUser.user.id },
      data: { emailVerified: true },
    });

    // 2. Create Dealer Record
    await prisma.dealer.create({
      data: {
        userId: newUser.user.id,
        companyName: validatedData.companyName,
        streetAddress: validatedData.streetAddress,
        zipCode: validatedData.zipCode,
        city: validatedData.city,
        uidNumber: validatedData.uidNumber,
        contactPerson: validatedData.contactPerson,
        phoneNumber: validatedData.phoneNumber,
        businessEmail: validatedData.businessEmail,
      },
    });

    // 3. Send Welcome Email
    try {
      const { sendEmail } = await import("@repo/transactional");
      const { DealerWelcomeEmail } =
        await import("@repo/transactional/emails/dealer-welcome");

      await sendEmail({
        to: validatedData.email,
        subject: "Welcome to Autovendo",
        template: DealerWelcomeEmail({
          dealerName: validatedData.name,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
          locale: "de",
        }),
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // We don't return error here because the account was successfully created
    }

    revalidatePath("/dealers");

    return {
      success: true,
      message: "Dealer created successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || "Validation error" };
    }

    console.error("Dealer creation error:", error);

    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

export async function getDealer(id: string) {
  return await prisma.dealer.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
}

export async function getDealerSubscription(userId: string) {
  return await prisma.subscription.findFirst({
    where: { referenceId: userId },
    orderBy: { periodEnd: "desc" },
  });
}

export async function updateDealerSubscription(
  dealerId: string,
  planName: string,
  days: number,
) {
  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
    });

    if (!dealer) return { error: "Dealer not found" };

    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setDate(now.getDate() + days);

    // Find if subscription exists
    const existingSub = await prisma.subscription.findFirst({
      where: { referenceId: dealer.userId },
    });

    if (existingSub) {
      await prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          plan: planName.toLowerCase(),
          status: "active",
          periodStart: now,
          periodEnd: periodEnd,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          plan: planName.toLowerCase(),
          referenceId: dealer.userId,
          status: "active",
          periodStart: now,
          periodEnd: periodEnd,
        },
      });
    }

    revalidatePath(`/dealers/${dealerId}`);
    return { success: true, message: "Subscription updated successfully" };
  } catch (error) {
    console.error("Failed to update subscription:", error);
    return { error: "Failed to update subscription" };
  }
}


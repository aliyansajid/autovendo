"use server";

import { z } from "zod";
import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { dealerSchema, updateDealerSchema } from "@/schema";

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

export async function updateDealer(
  id: string,
  formData: z.infer<typeof updateDealerSchema>,
) {
  try {
    const validatedData = updateDealerSchema.parse(formData);

    const dealer = await prisma.dealer.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!dealer) {
      return { error: "Dealer not found" };
    }

    // 1. Update User via Better Auth Admin API
    await auth.api.adminUpdateUser({
      body: {
        userId: dealer.userId,
        data: {
          name: validatedData.name,
          email: validatedData.email,
        },
      },
    });

    // 2. Update password if provided via Admin API
    if (validatedData.password) {
      await auth.api.setUserPassword({
        body: {
          userId: dealer.userId,
          newPassword: validatedData.password,
        },
      });
    }

    // 3. Update Dealer Record
    await prisma.dealer.update({
      where: { id },
      data: {
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

    revalidatePath("/dealers");
    revalidatePath(`/dealers/${id}`);

    return {
      success: true,
      message: "Dealer updated successfully",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues[0]?.message || "Validation error" };
    }

    console.error("Dealer update error:", error);

    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    };
  }
}

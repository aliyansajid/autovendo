"use server";

import { z } from "zod";
import { auth } from "@repo/auth";
import { prisma } from "@repo/db";
import { revalidatePath } from "next/cache";
import { dealerSchema } from "@/schema";

export async function createDealerAction(
  formData: z.infer<typeof dealerSchema>,
) {
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

    // 2. Create Dealer Record
    await prisma.dealer.create({
      data: {
        userId: newUser.user.id,
        companyName: validatedData.companyName,
        address: validatedData.address,
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
        subject: "Welcome to Autovendo - Your Dealer Account is Ready",
        template: DealerWelcomeEmail({
          dealerName: validatedData.name,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
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
      error: "An unexpected error occurred",
    };
  }
}

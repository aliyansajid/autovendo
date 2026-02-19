"use server";

import prisma from "@/lib/prisma";
import { z } from "zod";

const emailSchema = z.object({
  email: z.email("Ungültige E-Mail-Adresse"),
});

export async function subscribeEmail(email: string) {
  try {
    // Validate the email
    const result = emailSchema.safeParse({ email });

    if (!result.success) {
      return {
        success: false,
        error: result.error.issues[0]?.message || "Ungültige E-Mail-Adresse",
      };
    }

    // Check if email already exists
    const existingSubscription = await prisma.emailSubscription.findUnique({
      where: { email: result.data.email },
    });

    if (existingSubscription) {
      return {
        success: false,
        error: "Diese E-Mail-Adresse ist bereits registriert.",
      };
    }

    // Create new subscription
    await prisma.emailSubscription.create({
      data: {
        email: result.data.email,
      },
    });

    return {
      success: true,
      message: "Vielen Dank! Wir melden uns bald.",
    };
  } catch (error) {
    console.error("Error subscribing email:", error);
    return {
      success: false,
      error:
        "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
    };
  }
}

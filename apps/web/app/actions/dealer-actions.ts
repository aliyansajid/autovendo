"use server";

import { prisma } from "@repo/db";
import { dealerProfileSchema } from "@/schema/profile-schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { DealerProfile } from "@/types";

export async function updateDealerProfile(
  userId: string,
  values: z.infer<typeof dealerProfileSchema>,
) {
  try {
    // 1. Update Dealer Table
    const dealer = await prisma.dealer.upsert({
      where: { userId },
      create: {
        userId,
        companyName: values.companyName,
        description: values.description,
        website: values.website,
        logo: typeof values.logo === "string" ? values.logo : undefined,
        address: values.address,
        zipCode: values.zipCode,
        city: values.city,
        uidNumber: values.uidNumber,
        contactPerson: values.contactPerson,
        phoneNumber: values.phoneNumber,
        businessEmail: values.businessEmail,
      },
      update: {
        companyName: values.companyName,
        description: values.description,
        website: values.website,
        logo: typeof values.logo === "string" ? values.logo : undefined,
        address: values.address,
        zipCode: values.zipCode,
        city: values.city,
        uidNumber: values.uidNumber,
        contactPerson: values.contactPerson,
        phoneNumber: values.phoneNumber,
        businessEmail: values.businessEmail,
      },
    });

    // 3. Update Opening Hours
    // Delete existing and recreate
    await prisma.openingHour.deleteMany({
      where: { dealerId: dealer.id },
    });

    if (values.openingHours && values.openingHours.length > 0) {
      await prisma.openingHour.createMany({
        data: values.openingHours.map((oh) => ({
          dealerId: dealer.id,
          day: oh.day.toUpperCase() as any, // Cast to enum
          isOpen: oh.isOpen,
          openTime: oh.openTime || null,
          closeTime: oh.closeTime || null,
        })),
      });
    }

    revalidatePath("/dashboard/settings/profile");
    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Failed to update dealer profile:", error);
    return {
      success: false,
      error: "An unexpected error occurred.",
    };
  }
}

export async function getDealerProfile(
  userId: string,
): Promise<DealerProfile | null> {
  const dealer = await prisma.dealer.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      companyName: true,
      description: true,
      website: true,
      logo: true,
      address: true,
      zipCode: true,
      city: true,
      uidNumber: true,
      contactPerson: true,
      phoneNumber: true,
      businessEmail: true,
      openingHours: {
        select: {
          day: true,
          isOpen: true,
          openTime: true,
          closeTime: true,
        },
      },
    },
  });

  if (!dealer) return null;

  // Transform Prisma Time type (Date) to "HH:mm" string
  return {
    ...dealer,
    openingHours: dealer.openingHours.map((oh) => ({
      ...oh,
      openTime: oh.openTime
        ? new Date(oh.openTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      closeTime: oh.closeTime
        ? new Date(oh.closeTime).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
    })),
  } as DealerProfile;
}

"use server";

import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { createSellerProfileSchema } from "@/schema/profile-schema";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { storage } from "@/lib/helpers/storage";
import type { SellerProfile } from "@/types/seller";

// -----------------------------------------------------------------------------
// Dashboard: update seller profile
// -----------------------------------------------------------------------------

export async function updateSellerProfile(values: any) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  const tSchema = await getTranslations("ProfileSchema");
  const schema = createSellerProfileSchema(tSchema);

  try {
    const validatedValues = schema.parse(values);

    // Check for old profile image to delete
    const existingData = await prisma.seller.findUnique({
      where: { userId },
      select: { user: { select: { image: true } } },
    });

    if (
      existingData?.user?.image &&
      values.image !== existingData.user.image &&
      (typeof values.image === "string" || values.image === null)
    ) {
      try {
        const urlObj = new URL(existingData.user.image);
        const key = urlObj.pathname.startsWith("/")
          ? urlObj.pathname.substring(1)
          : urlObj.pathname;
        await storage.deleteFile(key);
      } catch (e) {
        console.error("Failed to delete old seller image:", e);
      }
    }

    await prisma.seller.upsert({
      where: { userId },
      create: {
        userId,
        firstName: validatedValues.firstName,
        lastName: validatedValues.lastName,
        phoneNumber: validatedValues.phoneNumber,
        email: validatedValues.sellerEmail,
        streetAddress: validatedValues.streetAddress,
        zipCode: validatedValues.zipCode,
        city: validatedValues.city,
        country: validatedValues.country,
      },
      update: {
        firstName: validatedValues.firstName,
        lastName: validatedValues.lastName,
        phoneNumber: validatedValues.phoneNumber,
        email: validatedValues.sellerEmail,
        streetAddress: validatedValues.streetAddress,
        zipCode: validatedValues.zipCode,
        city: validatedValues.city,
        country: validatedValues.country,
      },
    });

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: validatedValues.name,
        image:
          typeof validatedValues.image === "string"
            ? validatedValues.image
            : validatedValues.image === null
              ? null
              : undefined,
      },
    });

    revalidatePath("/dashboard/settings/profile");
    return { success: true };
  } catch (error) {
    console.error("Failed to update seller profile:", error);
    return { success: false, error: "errorDefault" };
  }
}

// -----------------------------------------------------------------------------
// Dashboard: get seller profile
// -----------------------------------------------------------------------------

export async function getSellerProfile(): Promise<SellerProfile | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const userId = session.user.id;

  const seller = await prisma.seller.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      user: {
        select: { id: true, name: true, email: true, image: true },
      },
      firstName: true,
      lastName: true,
      phoneNumber: true,
      email: true,
      image: true,
      streetAddress: true,
      zipCode: true,
      city: true,
      country: true,
    },
  });

  if (!seller) return null;
  return seller as SellerProfile;
}

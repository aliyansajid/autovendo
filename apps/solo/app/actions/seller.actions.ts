"use server";

import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

// -----------------------------------------------------------------------------
// Seller Profile
// -----------------------------------------------------------------------------

export type SellerProfile = {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; image: string | null };
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  streetAddress: string;
  zipCode: string;
  city: string;
  country: string;
};

export async function getSellerProfile(): Promise<SellerProfile | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
    select: {
      id: true,
      userId: true,
      user: { select: { id: true, name: true, email: true, image: true } },
      firstName: true,
      lastName: true,
      phoneNumber: true,
      email: true,
      streetAddress: true,
      zipCode: true,
      city: true,
      country: true,
    },
  });

  return seller as SellerProfile | null;
}

export async function updateSellerProfile(values: {
  name: string;
  email: string;
  phoneNumber: string;
  streetAddress: string;
  zipCode: string;
  city: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Unauthorized" };

  try {
    const nameParts = values.name.trim().split(" ");
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    await prisma.seller.update({
      where: { userId: session.user.id },
      data: {
        firstName,
        lastName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        streetAddress: values.streetAddress,
        zipCode: values.zipCode,
        city: values.city,
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update seller profile:", error);
    return { success: false, error: "errorDefault" };
  }
}

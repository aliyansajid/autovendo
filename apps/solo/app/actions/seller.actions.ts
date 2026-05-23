"use server";

import { z } from "zod";
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

// Server-side schema for seller-only fields.
// name, email, image are Better Auth's responsibility (user table)
// and are updated via authClient.updateUser() / authClient.changeEmail().
const sellerFieldsSchema = z.object({
  phoneNumber: z
    .string()
    .min(1)
    .regex(/^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/),
  streetAddress: z.string().min(5).max(100),
  zipCode: z.string().min(4).max(10),
  city: z.string().min(2).max(50),
});

export async function updateSellerProfile(values: {
  phoneNumber: string;
  streetAddress: string;
  zipCode: string;
  city: string;
}): Promise<{ success: boolean; error?: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false, error: "Unauthorized" };

  const parsed = sellerFieldsSchema.safeParse(values);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors[0]?.message ?? "Invalid input",
    };
  }

  try {
    await prisma.seller.update({
      where: { userId: session.user.id },
      data: {
        phoneNumber: parsed.data.phoneNumber,
        streetAddress: parsed.data.streetAddress,
        zipCode: parsed.data.zipCode,
        city: parsed.data.city,
      },
    });

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update seller profile:", error);
    return { success: false, error: "errorDefault" };
  }
}

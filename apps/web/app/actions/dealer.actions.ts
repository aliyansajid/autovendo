"use server";

import { prisma } from "@repo/db";
import { dealerProfileSchema } from "@/schema/profile-schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import {
  DealerProfile,
  DealerListResult,
  DealerDetail,
  VehicleSummary,
} from "@/types";

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

/**
 * List dealers for the public dealers directory page.
 * Uses offset-based pagination (page, pageSize).
 *
 * Search: simple OR across companyName, city and address (case-insensitive).
 */
export async function getDealers({
  searchQuery = "",
  page = 1,
  pageSize = 5,
}: {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}): Promise<DealerListResult> {
  try {
    const skip = (page - 1) * pageSize;

    const where = searchQuery
      ? {
          OR: [
            { companyName: { contains: searchQuery, mode: "insensitive" as const } },
            { city: { contains: searchQuery, mode: "insensitive" as const } },
            { address: { contains: searchQuery, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [dealers, totalCount] = await Promise.all([
      prisma.dealer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          companyName: true,
          city: true,
          address: true,
          logo: true,
        },
      }),
      prisma.dealer.count({ where }),
    ]);

    return {
      dealers,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  } catch (error) {
    console.error("Failed to fetch dealers:", error);
    return {
      dealers: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

/**
 * Get a single dealer with a small number of recent vehicles for the dealer detail page.
 * Returns a view model shaped for the UI (DealerDetail).
 */
export async function getDealerById(id: string): Promise<DealerDetail | null> {
  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id },
      include: {
        openingHours: true,
        vehicles: {
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            make: true,
            model: true,
            version: true,
            price: true,
            kilometer: true,
            registrationMonth: true,
            registrationYear: true,
            kw: true,
            hp: true,
            fuelType: true,
            vehicleCondition: true,
            images: true,
            equipment: true,
            dealer: {
              select: {
                id: true,
                companyName: true,
                city: true,
                zipCode: true,
                phoneNumber: true,
              },
            },
          },
        },
      },
    });

    if (!dealer) return null;

    const vehicles = dealer.vehicles as VehicleSummary[];

    return {
      id: dealer.id,
      name: dealer.companyName,
      description: dealer.description,
      website: dealer.website,
      logo: dealer.logo,
      address: `${dealer.zipCode} ${dealer.city}, ${dealer.address}`,
      city: dealer.city,
      zipCode: dealer.zipCode,
      phoneNumber: dealer.phoneNumber,
      email: dealer.businessEmail,
      openingHours: dealer.openingHours.map((oh) => ({
        day: oh.day,
        isOpen: oh.isOpen,
        hours:
          oh.isOpen && oh.openTime && oh.closeTime
            ? `${new Date(oh.openTime).toLocaleTimeString("de-CH", {
                hour: "2-digit",
                minute: "2-digit",
              })} - ${new Date(oh.closeTime).toLocaleTimeString("de-CH", {
                hour: "2-digit",
                minute: "2-digit",
              })}`
            : "Geschlossen",
      })),
      vehicles,
      rating: 4.8,
      reviewCount: 120,
      isVerified: true,
      established: "2015",
      coverImage:
        "https://images.pexels.com/photos/3752194/pexels-photo-3752194.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    };
  } catch (error) {
    console.error("Failed to fetch dealer by id:", error);
    return null;
  }
}

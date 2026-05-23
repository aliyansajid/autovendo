"use server";

import { prisma, DayOfWeek } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { createDealerProfileSchema } from "@/schema/profile-schema";
import { getTranslations } from "next-intl/server";
import { createDealerContactSchema } from "@/schema/dealer-contact-schema";
import { revalidatePath } from "next/cache";
import { sendEmail, DealerContactEmail } from "@repo/transactional";
import {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
} from "@/lib/cache";
import type {
  DealerProfile,
  DealerListResult,
  DealerDetail,
  DealerVehiclesResult,
  GooglePlaceData,
} from "@/types/dealer";
import { DAY_ORDER } from "@/lib/helpers/format";
import type { VehicleSearchParams } from "@/schema/vehicle-search-schema";
import { buildWhereClause } from "./vehicles.actions";
import { storage } from "@/lib/helpers/storage";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function toTimeString(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function parseTimeString(time: string | null | undefined): Date | null {
  if (!time || !time.includes(":")) return null;
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return date;
}

// -----------------------------------------------------------------------------
// Dashboard: update dealer profile
// -----------------------------------------------------------------------------

export async function updateDealerProfile(values: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return { success: false, error: "Unauthorized" };
  const userId = session.user.id;

  const tSchema = await getTranslations("ProfileSchema");
  const schema = createDealerProfileSchema(tSchema);

  try {
    const validatedValues = schema.parse(values);

    // 1. Fetch current data to check for image changes
    const existingData = await prisma.dealer.findUnique({
      where: { userId },
      select: {
        id: true,
        logo: true,
        coverImage: true,
        user: {
          select: {
            image: true,
          },
        },
      },
    });

    const imagesToDelete: string[] = [];

    // Check logo
    if (
      existingData?.logo &&
      values.logo !== existingData.logo &&
      (typeof values.logo === "string" || values.logo === null)
    ) {
      imagesToDelete.push(existingData.logo);
    }

    // Check coverImage
    if (
      existingData?.coverImage &&
      values.coverImage !== existingData.coverImage &&
      (typeof values.coverImage === "string" || values.coverImage === null)
    ) {
      imagesToDelete.push(existingData.coverImage);
    }

    // Check user profile image
    if (
      existingData?.user?.image &&
      values.image !== existingData.user.image &&
      (typeof values.image === "string" || values.image === null)
    ) {
      imagesToDelete.push(existingData.user.image);
    }

    // 2. Delete old files from storage
    if (imagesToDelete.length > 0) {
      await Promise.all(
        imagesToDelete.map(async (url) => {
          try {
            const urlObj = new URL(url);
            const key = urlObj.pathname.startsWith("/")
              ? urlObj.pathname.substring(1)
              : urlObj.pathname;
            await storage.deleteFile(key);
          } catch (e) {
            console.error(`Failed to delete old dealer image: ${url}`, e);
          }
        }),
      );
    }

    const dealer = await prisma.dealer.upsert({
      where: { userId },
      create: {
        userId,
        companyName: validatedValues.companyName || session.user.name || "Private Seller",
        description: validatedValues.description,
        website: validatedValues.website,
        logo:
          typeof validatedValues.logo === "string"
            ? validatedValues.logo
            : undefined,
        streetAddress: validatedValues.streetAddress || "",
        zipCode: validatedValues.zipCode || "",
        city: validatedValues.city || "",
        country: validatedValues.country || "Switzerland",
        uidNumber: validatedValues.uidNumber || `IND-${userId.substring(0, 8)}`,
        contactPerson: validatedValues.contactPerson || session.user.name || "Private Seller",
        phoneNumber: validatedValues.phoneNumber || "",
        businessEmail: validatedValues.businessEmail || session.user.email || "",
        coverImage:
          typeof validatedValues.coverImage === "string"
            ? validatedValues.coverImage
            : undefined,
      },
      update: {
        companyName: validatedValues.companyName || session.user.name || "Private Seller",
        description: validatedValues.description,
        website: validatedValues.website,
        logo:
          typeof validatedValues.logo === "string"
            ? validatedValues.logo
            : validatedValues.logo === null
              ? null
              : undefined,
        coverImage:
          typeof validatedValues.coverImage === "string"
            ? validatedValues.coverImage
            : validatedValues.coverImage === null
              ? null
              : undefined,
        streetAddress: validatedValues.streetAddress || "",
        zipCode: validatedValues.zipCode || "",
        city: validatedValues.city || "",
        country: validatedValues.country || "Switzerland",
        uidNumber: validatedValues.uidNumber || `IND-${userId.substring(0, 8)}`,
        contactPerson: validatedValues.contactPerson || session.user.name || "Private Seller",
        phoneNumber: validatedValues.phoneNumber || "",
        businessEmail: validatedValues.businessEmail || session.user.email || "",
      },
    });

    await prisma.openingHour.deleteMany({ where: { dealerId: dealer.id } });

    if (validatedValues.openingHours?.length) {
      await prisma.openingHour.createMany({
        data: validatedValues.openingHours.map((oh) => ({
          dealerId: dealer.id,
          day: oh.day as DayOfWeek,
          isOpen: oh.isOpen,
          openTime: parseTimeString(oh.openTime),
          closeTime: parseTimeString(oh.closeTime),
        })),
      });
    }

    await Promise.all([
      cacheDelete(`dealer:${dealer.id}`),
      cacheDeletePattern("dealers:list:*"),
      cacheDeletePattern(`dealer:vehicles:${dealer.id}:*`),
    ]);

    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Failed to update dealer profile:", error);
    return { success: false, error: "errorDefault" };
  }
}

export async function getDealerProfile(): Promise<DealerProfile | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const userId = session.user.id;
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
      streetAddress: true,
      zipCode: true,
      city: true,
      country: true,
      uidNumber: true,
      contactPerson: true,
      phoneNumber: true,
      businessEmail: true,
      coverImage: true,
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

  return {
    ...dealer,
    openingHours: dealer.openingHours.map((oh) => ({
      ...oh,
      openTime: toTimeString(oh.openTime),
      closeTime: toTimeString(oh.closeTime),
    })),
  } as DealerProfile;
}

export async function getDealers({
  searchQuery = "",
  page = 1,
  pageSize = 12,
}: {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}): Promise<DealerListResult> {
  const cacheKey = `dealers:list:${searchQuery}:${page}:${pageSize}`;
  const cached = await cacheGet<DealerListResult>(cacheKey);
  if (cached) return cached;

  try {
    const skip = (page - 1) * pageSize;

    const where: any = searchQuery
      ? {
          OR: [
            { companyName: { contains: searchQuery, mode: "insensitive" } },
            { streetAddress: { contains: searchQuery, mode: "insensitive" } },
            { city: { contains: searchQuery, mode: "insensitive" } },
            { zipCode: { contains: searchQuery, mode: "insensitive" } },
          ],
        }
      : {};

    where.user = { banned: { not: true } };

    const [dealers, totalCount] = await Promise.all([
      prisma.dealer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { companyName: "asc" },
        select: {
          id: true,
          companyName: true,
          streetAddress: true,
          city: true,
          zipCode: true,
          logo: true,
          coverImage: true,
          googleRating: true,
          googleReviewCount: true,
        },
      }),
      prisma.dealer.count({ where }),
    ]);

    const result = {
      dealers,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
    await cacheSet(cacheKey, result, 60);
    return result;
  } catch (error) {
    console.error("Failed to fetch dealers:", error);
    return { dealers: [], totalCount: 0, totalPages: 0, currentPage: page };
  }
}

export async function getDealerById(id: string): Promise<DealerDetail | null> {
  const cacheKey = `dealer:${id}`;
  const cached = await cacheGet<DealerDetail>(cacheKey);
  if (cached) return cached;

  try {
    const dealer = await prisma.dealer.findFirst({
      where: {
        id,
        user: {
          banned: { not: true },
        },
      },
      select: {
        id: true,
        companyName: true,
        description: true,
        website: true,
        logo: true,
        coverImage: true,
        streetAddress: true,
        zipCode: true,
        city: true,
        country: true,
        phoneNumber: true,
        businessEmail: true,
        googlePlaceId: true,
        googleRating: true,
        googleReviewCount: true,
        user: { select: { emailVerified: true } },
        openingHours: {
          select: { day: true, isOpen: true, openTime: true, closeTime: true },
        },
      },
    });

    if (!dealer) return null;

    const result = {
      id: dealer.id,
      companyName: dealer.companyName,
      description: dealer.description ?? null,
      website: dealer.website || null,
      logo: dealer.logo ?? null,
      coverImage: dealer.coverImage ?? null,
      streetAddress: dealer.streetAddress,
      city: dealer.city,
      zipCode: dealer.zipCode,
      country: dealer.country,
      phoneNumber: dealer.phoneNumber,
      email: dealer.businessEmail,
      isVerified: dealer.user.emailVerified,
      googlePlaceId: dealer.googlePlaceId ?? null,
      googleRating: dealer.googleRating ?? null,
      googleReviewCount: dealer.googleReviewCount ?? null,
      openingHours: [...dealer.openingHours]
        .sort(
          (a, b) =>
            DAY_ORDER.indexOf(a.day as (typeof DAY_ORDER)[number]) -
            DAY_ORDER.indexOf(b.day as (typeof DAY_ORDER)[number]),
        )
        .map((oh) => ({
          day: oh.day,
          isOpen: oh.isOpen,
          hours:
            oh.isOpen && oh.openTime && oh.closeTime
              ? `${toTimeString(new Date(oh.openTime))} – ${toTimeString(new Date(oh.closeTime))}`
              : null,
        })),
    };
    await cacheSet(cacheKey, result, 300);
    return result;
  } catch (error) {
    console.error("Failed to fetch dealer by id:", error);
    return null;
  }
}

export async function getDealerVehicles(
  dealerId: string,
  page: number = 1,
  pageSize: number = 12,
  filters: Partial<VehicleSearchParams> = {},
  sortBy: string = "newest",
): Promise<DealerVehiclesResult> {
  const cacheKey = `dealer:vehicles:${dealerId}:${page}:${pageSize}:${sortBy}:${JSON.stringify(filters)}`;
  const cached = await cacheGet<DealerVehiclesResult>(cacheKey);
  if (cached) return cached;

  try {
    const skip = (page - 1) * pageSize;

    const where = {
      AND: [
        await buildWhereClause(filters as VehicleSearchParams),
        { dealerId },
      ],
    };

    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "price_asc") orderBy = { price: "asc" };
    if (sortBy === "price_desc") orderBy = { price: "desc" };
    if (sortBy === "kilometer") orderBy = { kilometer: "asc" };

    const [vehicles, totalCount] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
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
      }),
      prisma.vehicle.count({ where }),
    ]);

    const result = {
      vehicles: vehicles as any,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      hasMore: skip + vehicles.length < totalCount,
    };
    await cacheSet(cacheKey, result, 60);
    return result;
  } catch (error) {
    console.error("Failed to fetch dealer vehicles:", error);
    return {
      vehicles: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      hasMore: false,
    };
  }
}

// -----------------------------------------------------------------------------
// Solo Seller Profile
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

export async function sendDealerContactEmail(
  dealerId: string,
  data: any,
): Promise<{ success: boolean; error?: string }> {
  try {
    const tSchema = await getTranslations("ContactSchema");
    const schema = createDealerContactSchema(tSchema);
    const validatedData = schema.parse(data);
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { businessEmail: true, companyName: true },
    });

    if (!dealer) return { success: false, error: "dealerNotFound" };

    const result = await sendEmail({
      to: dealer.businessEmail,
      subject: `New contact request from ${validatedData.name} – autovendo.ch`,
      replyTo: validatedData.email,
      template: DealerContactEmail({
        dealerName: dealer.companyName,
        senderName: validatedData.name,
        senderEmail: validatedData.email,
        senderPhone: validatedData.phone,
        message: validatedData.message || "",
      }),
    });

    if (!result.success) {
      return { success: false, error: "emailSendError" };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send dealer contact email:", error);
    return { success: false, error: "errorDefault" };
  }
}

const REVIEW_CACHE_TTL = 60 * 60 * 24 * 30;

export async function getDealerGoogleReviews(
  dealerId: string,
): Promise<GooglePlaceData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const redisFreshKey = `dealer:reviews:fresh:${dealerId}`;

  const isFresh = await cacheGet<boolean>(redisFreshKey);

  if (isFresh) {
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { googleRating: true, googleReviewCount: true, googleReviews: true },
    });
    if (dealer?.googleRating != null) {
      return {
        rating: dealer.googleRating,
        reviewCount: dealer.googleReviewCount ?? null,
        reviews: (dealer.googleReviews as any[]) ?? [],
      };
    }
  }

  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    select: {
      googlePlaceId: true,
      googleRating: true,
      googleReviewCount: true,
      googleReviews: true,
    },
  });

  if (!dealer?.googlePlaceId) return null;

  if (!apiKey) {
    if (dealer.googleRating != null) {
      return {
        rating: dealer.googleRating,
        reviewCount: dealer.googleReviewCount ?? null,
        reviews: (dealer.googleReviews as any[]) ?? [],
      };
    }
    return null;
  }

  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json",
    );
    url.searchParams.set("place_id", dealer.googlePlaceId);
    url.searchParams.set("fields", "rating,user_ratings_total,reviews");
    url.searchParams.set("language", "de");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== "OK" || !data.result) return null;

    const { result } = data;
    const reviews = (result.reviews ?? []).map((r: any) => ({
      authorName: r.author_name,
      rating: r.rating,
      text: r.text,
      relativeTimeDescription: r.relative_time_description,
      profilePhotoUrl: r.profile_photo_url ?? null,
    }));

    await Promise.all([
      prisma.dealer.update({
        where: { id: dealerId },
        data: {
          googleRating: result.rating ?? null,
          googleReviewCount: result.user_ratings_total ?? null,
          googleReviews: reviews,
        },
      }),
      cacheSet(redisFreshKey, true, REVIEW_CACHE_TTL),
      cacheDelete(`dealer:${dealerId}`),
    ]);

    return {
      rating: result.rating ?? null,
      reviewCount: result.user_ratings_total ?? null,
      reviews,
    };
  } catch (error) {
    console.error("Failed to fetch Google reviews:", error);
    return null;
  }
}

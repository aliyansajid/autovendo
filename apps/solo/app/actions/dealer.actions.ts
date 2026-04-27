"use server";

import { prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import { createDealerContactSchema } from "@/schema/dealer-contact-schema";
import { sendEmail, DealerContactEmail } from "@repo/transactional";
import { cacheGet, cacheSet } from "@/lib/cache";
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

// -----------------------------------------------------------------------------
// Dashboard: get dealer profile
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Public: list dealers with search + offset pagination
// Only fetches the 5 fields the card needs.
// -----------------------------------------------------------------------------

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

    const where = searchQuery
      ? {
          OR: [
            {
              companyName: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              streetAddress: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            { city: { contains: searchQuery, mode: "insensitive" as const } },
            {
              zipCode: { contains: searchQuery, mode: "insensitive" as const },
            },
          ],
        }
      : {};

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

// -----------------------------------------------------------------------------
// Public: dealer detail — no vehicles (fetched separately)
// -----------------------------------------------------------------------------

export async function getDealerById(id: string): Promise<DealerDetail | null> {
  const cacheKey = `dealer:${id}`;
  const cached = await cacheGet<DealerDetail>(cacheKey);
  if (cached) return cached;

  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id },
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
        user: { select: { emailVerified: true } },
        openingHours: {
          select: { day: true, isOpen: true, openTime: true, closeTime: true },
        },
      },
    });

    if (!dealer) return null;

    return {
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

// -----------------------------------------------------------------------------
// Public: dealer vehicles — offset pagination, 12 per page
// -----------------------------------------------------------------------------

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
// Public: send contact enquiry to dealer via email
// From:    our SMTP (EMAIL_FROM)
// To:      dealer.businessEmail
// ReplyTo: enquirer's email
// -----------------------------------------------------------------------------

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
      subject: `New contact request from ${validatedData.name} – autosolo.ch`,
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

// -----------------------------------------------------------------------------
// Public: fetch Google Place reviews
// Requires GOOGLE_PLACES_API_KEY env var + dealer.googlePlaceId to be set.
// Returns null if unconfigured — UI handles gracefully.
// -----------------------------------------------------------------------------

export async function getDealerGoogleReviews(
  placeId: string,
): Promise<GooglePlaceData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return null;

  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json",
    );
    url.searchParams.set("place_id", placeId);
    url.searchParams.set("fields", "rating,user_ratings_total,reviews");
    url.searchParams.set("language", "de");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.status !== "OK" || !data.result) return null;

    const { result } = data;

    return {
      rating: result.rating ?? null,
      reviewCount: result.user_ratings_total ?? null,
      reviews: (result.reviews ?? []).map((r: any) => ({
        authorName: r.author_name,
        rating: r.rating,
        text: r.text,
        relativeTimeDescription: r.relative_time_description,
        profilePhotoUrl: r.profile_photo_url ?? null,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch Google reviews:", error);
    return null;
  }
}

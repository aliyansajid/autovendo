"use server";

import { prisma } from "@repo/db";
import { dealerProfileSchema } from "@/schema/profile-schema";
import { dealerContactSchema } from "@/schema/dealer-contact-schema";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { sendEmail, DealerContactEmail } from "@repo/transactional";
import type {
  DealerProfile,
  DealerListResult,
  DealerDetail,
  DealerVehiclesResult,
  GooglePlaceData,
} from "@/types";
import type { VehicleListItem } from "@/types";
import { DAY_LABELS } from "@/lib/helpers/format";
import type { VehicleSearchParams } from "@/lib/schemas/vehicle.schema";
import { buildWhereClause } from "./vehicles.actions";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

const REVERSE_DAY_LABELS: Record<string, string> = Object.entries(
  DAY_LABELS,
).reduce((acc, [key, value]) => ({ ...acc, [value]: key }), {});

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

export async function updateDealerProfile(
  userId: string,
  values: z.infer<typeof dealerProfileSchema>,
) {
  try {
    const dealer = await prisma.dealer.upsert({
      where: { userId },
      create: {
        userId,
        companyName: values.companyName,
        description: values.description,
        website: values.website,
        logo: typeof values.logo === "string" ? values.logo : undefined,
        streetAddress: values.streetAddress,
        zipCode: values.zipCode,
        city: values.city,
        country: values.country,
        uidNumber: values.uidNumber,
        contactPerson: values.contactPerson,
        phoneNumber: values.phoneNumber,
        businessEmail: values.businessEmail,
        coverImage:
          typeof values.coverImage === "string" ? values.coverImage : undefined,
      },
      update: {
        companyName: values.companyName,
        description: values.description,
        website: values.website,
        logo:
          typeof values.logo === "string"
            ? values.logo
            : values.logo === null
              ? null
              : undefined,
        coverImage:
          typeof values.coverImage === "string"
            ? values.coverImage
            : values.coverImage === null
              ? null
              : undefined,
        streetAddress: values.streetAddress,
        zipCode: values.zipCode,
        city: values.city,
        country: values.country,
        uidNumber: values.uidNumber,
        contactPerson: values.contactPerson,
        phoneNumber: values.phoneNumber,
        businessEmail: values.businessEmail,
      },
    });

    await prisma.openingHour.deleteMany({ where: { dealerId: dealer.id } });

    if (values.openingHours?.length) {
      await prisma.openingHour.createMany({
        data: values.openingHours.map((oh) => ({
          dealerId: dealer.id,
          day: REVERSE_DAY_LABELS[oh.day] as any,
          isOpen: oh.isOpen,
          openTime: parseTimeString(oh.openTime),
          closeTime: parseTimeString(oh.closeTime),
        })),
      });
    }

    revalidatePath("/dashboard/settings/profile");
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Failed to update dealer profile:", error);
    return { success: false, error: "An unexpected error occurred." };
  }
}

// -----------------------------------------------------------------------------
// Dashboard: get dealer profile
// -----------------------------------------------------------------------------

export async function getDealerProfile(
  userId: string,
): Promise<DealerProfile | null> {
  const dealer = await prisma.dealer.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      user: { select: { id: true, name: true, email: true, image: true } },
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
        select: { day: true, isOpen: true, openTime: true, closeTime: true },
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
  try {
    const skip = (page - 1) * pageSize;

    const where = searchQuery
      ? {
          OR: [
            { companyName: { contains: searchQuery, mode: "insensitive" as const } },
            { streetAddress: { contains: searchQuery, mode: "insensitive" as const } },
            { city: { contains: searchQuery, mode: "insensitive" as const } },
            { zipCode: { contains: searchQuery, mode: "insensitive" as const } },
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
    return { dealers: [], totalCount: 0, totalPages: 0, currentPage: page };
  }
}

// -----------------------------------------------------------------------------
// Public: dealer detail — no vehicles (fetched separately)
// -----------------------------------------------------------------------------

export async function getDealerById(id: string): Promise<DealerDetail | null> {
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
          day: DAY_LABELS[oh.day] ?? oh.day,
          isOpen: oh.isOpen,
          hours:
            oh.isOpen && oh.openTime && oh.closeTime
              ? `${toTimeString(new Date(oh.openTime))} – ${toTimeString(new Date(oh.closeTime))}`
              : "Geschlossen",
        })),
    };
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
): Promise<DealerVehiclesResult> {
  try {
    const skip = (page - 1) * pageSize;

    const where = {
      AND: [await buildWhereClause(filters as VehicleSearchParams), { dealerId }],
    };

    const [vehicles, totalCount] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
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

    return {
      vehicles: vehicles as unknown as VehicleListItem[],
      totalCount,
      hasMore: skip + vehicles.length < totalCount,
    };
  } catch (error) {
    console.error("Failed to fetch dealer vehicles:", error);
    return { vehicles: [], totalCount: 0, hasMore: false };
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
  data: z.infer<typeof dealerContactSchema>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
      select: { businessEmail: true, companyName: true },
    });

    if (!dealer) return { success: false, error: "Händler nicht gefunden." };

    const result = await sendEmail({
      to: dealer.businessEmail,
      subject: `Neue Kontaktanfrage von ${data.name} – autovendo.ch`,
      replyTo: data.email,
      template: DealerContactEmail({
        dealerName: dealer.companyName,
        senderName: data.name,
        senderEmail: data.email,
        senderPhone: data.phone,
        message: data.message || "",
      }),
    });

    if (!result.success) {
      return { success: false, error: "E-Mail konnte nicht gesendet werden." };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send dealer contact email:", error);
    return { success: false, error: "Ein Fehler ist aufgetreten." };
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

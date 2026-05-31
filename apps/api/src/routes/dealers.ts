import { Hono } from "hono";
import type { Context } from "hono";
import { prisma } from "@repo/db";
import { z } from "zod";
import { cacheGet, cacheSet, cacheDelete } from "../lib/cache.js";
import { buildWhereClause } from "../lib/vehicle-query.js";

type Variables = {
  user: { id: string; email: string; role?: string | null } | null;
  session: unknown | null;
};

const router = new Hono<{ Variables: Variables }>();

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

function qi(c: Context, key: string): number | undefined {
  const v = c.req.query(key);
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return isNaN(n) ? undefined : n;
}

function qf(c: Context, key: string): number | undefined {
  const v = c.req.query(key);
  if (!v) return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
}

function qa(c: Context, key: string): string[] {
  const arr = c.req.queries(key);
  if (arr && arr.length > 0) {
    return arr
      .flatMap((v) => v.split(",").map((s) => s.trim()))
      .filter(Boolean);
  }
  return [];
}

function qb(c: Context, key: string): boolean | undefined {
  const v = c.req.query(key);
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

const DAY_ORDER = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

const REVIEW_CACHE_TTL = 60 * 60 * 24 * 30; // 30 days in seconds

// ─── GET / — list dealers ─────────────────────────────────────────────────────

router.get("/", async (c) => {
  const q = c.req.query("q") || "";
  const page = qi(c, "page") ?? 1;
  const pageSize = qi(c, "pageSize") ?? 12;

  const cacheKey = `dealers:list:${q}:${page}:${pageSize}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return c.json(cached);

  try {
    const skip = (page - 1) * pageSize;

    const where: any = q
      ? {
          OR: [
            { companyName: { contains: q, mode: "insensitive" as const } },
            { streetAddress: { contains: q, mode: "insensitive" as const } },
            { city: { contains: q, mode: "insensitive" as const } },
            { zipCode: { contains: q, mode: "insensitive" as const } },
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
    return c.json(result);
  } catch (error) {
    console.error("Failed to fetch dealers:", error);
    return c.json({
      dealers: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    });
  }
});

// ─── GET /:id/vehicles ────────────────────────────────────────────────────────

router.get("/:id/vehicles", async (c) => {
  const { id } = c.req.param();
  const page = qi(c, "page") ?? 1;
  const pageSize = qi(c, "pageSize") ?? 12;
  const sortBy = c.req.query("sortBy") || "newest";

  const parsedFilters = {
    search: c.req.query("search"),
    make: qa(c, "make"),
    model: qa(c, "model"),
    excludeMake: qa(c, "excludeMake"),
    excludeModel: qa(c, "excludeModel"),
    priceFrom: qi(c, "priceFrom"),
    priceTo: qi(c, "priceTo"),
    registrationFrom: qi(c, "registrationFrom"),
    registrationTo: qi(c, "registrationTo"),
    kilometerFrom: qi(c, "kilometerFrom"),
    kilometerTo: qi(c, "kilometerTo"),
    powerFrom: qi(c, "powerFrom"),
    powerTo: qi(c, "powerTo"),
    kwFrom: qf(c, "kwFrom"),
    kwTo: qf(c, "kwTo"),
    evs: c.req.query("evs"),
    fuel: qa(c, "fuel"),
    transmission: qa(c, "transmission"),
    condition: qa(c, "condition"),
    vehicleType: qa(c, "vehicleType"),
    bodyType: qa(c, "bodyType"),
    color: qa(c, "color"),
    metallic: qb(c, "metallic"),
    driveType: qa(c, "driveType"),
    cubicCapacityFrom: qi(c, "cubicCapacityFrom"),
    cubicCapacityTo: qi(c, "cubicCapacityTo"),
    cylindersFrom: qi(c, "cylindersFrom"),
    cylindersTo: qi(c, "cylindersTo"),
    consumptionFrom: qf(c, "consumptionFrom"),
    consumptionTo: qf(c, "consumptionTo"),
    co2From: qf(c, "co2From"),
    co2To: qf(c, "co2To"),
    energyLabels: qa(c, "energyLabels"),
    emissionStandards: qa(c, "emissionStandards"),
    inspectionPassed: qb(c, "inspectionPassed"),
    hasWarranty: qb(c, "hasWarranty"),
    interiorColor: qa(c, "interiorColor"),
    daysListed: qi(c, "daysListed"),
    equipment: qa(c, "equipment"),
  };

  const cacheKey = `dealer:vehicles:${id}:${page}:${pageSize}:${sortBy}:${JSON.stringify(parsedFilters)}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return c.json(cached);

  try {
    const skip = (page - 1) * pageSize;
    const where = buildWhereClause({ ...parsedFilters, dealerId: id });

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
      vehicles,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      hasMore: skip + vehicles.length < totalCount,
    };

    await cacheSet(cacheKey, result, 60);
    return c.json(result);
  } catch (error) {
    console.error("Failed to fetch dealer vehicles:", error);
    return c.json({
      vehicles: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
      hasMore: false,
    });
  }
});

// ─── POST /:id/contact ────────────────────────────────────────────────────────

router.post("/:id/contact", async (c) => {
  const { id } = c.req.param();

  const contactSchema = z.object({
    name: z.string().min(3).max(50),
    phone: z.string().min(1),
    email: z.string().email(),
    message: z.string().max(1000).optional(),
  });

  try {
    const body = await c.req.json();
    const validatedData = contactSchema.parse(body);

    const dealer = await prisma.dealer.findUnique({
      where: { id },
      select: { businessEmail: true, companyName: true },
    });

    if (!dealer)
      return c.json({ success: false, error: "dealerNotFound" }, 404);

    const { sendEmail, ListingContactEmail } =
      await import("@repo/transactional");

    const result = await sendEmail({
      to: dealer.businessEmail,
      subject: `New contact request from ${validatedData.name} – autovendo.ch`,
      replyTo: validatedData.email,
      template: ListingContactEmail({
        recipientName: dealer.companyName,
        senderName: validatedData.name,
        senderEmail: validatedData.email,
        senderPhone: validatedData.phone,
        message: validatedData.message || "",
      }),
    });

    if (!result.success) {
      return c.json({ success: false, error: "emailSendError" });
    }

    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to send dealer contact email:", error);
    return c.json({ success: false, error: "errorDefault" });
  }
});

// ─── GET /:id/reviews ─────────────────────────────────────────────────────────

router.get("/:id/reviews", async (c) => {
  const { id } = c.req.param();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const redisFreshKey = `dealer:reviews:fresh:${id}`;

  // 1. Check if Redis says cache is still fresh
  const isFresh = await cacheGet<boolean>(redisFreshKey);

  if (isFresh) {
    const dealer = await prisma.dealer.findUnique({
      where: { id },
      select: {
        googleRating: true,
        googleReviewCount: true,
        googleReviews: true,
      },
    });
    if (dealer?.googleRating != null) {
      return c.json({
        rating: dealer.googleRating,
        reviewCount: dealer.googleReviewCount ?? null,
        reviews: (dealer.googleReviews as any[]) ?? [],
      });
    }
  }

  // 2. Redis key expired (or never set) — check if dealer has a Place ID
  const dealer = await prisma.dealer.findUnique({
    where: { id },
    select: {
      googlePlaceId: true,
      googleRating: true,
      googleReviewCount: true,
      googleReviews: true,
    },
  });

  if (!dealer?.googlePlaceId) return c.json(null);

  // 3. No API key — return whatever is in DB
  if (!apiKey) {
    if (dealer.googleRating != null) {
      return c.json({
        rating: dealer.googleRating,
        reviewCount: dealer.googleReviewCount ?? null,
        reviews: (dealer.googleReviews as any[]) ?? [],
      });
    }
    return c.json(null);
  }

  // 4. Call Google API
  try {
    const url = new URL(
      "https://maps.googleapis.com/maps/api/place/details/json",
    );
    url.searchParams.set("place_id", dealer.googlePlaceId);
    url.searchParams.set("fields", "rating,user_ratings_total,reviews");
    url.searchParams.set("language", "de");
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) return c.json(null);

    const data = await res.json();
    if (data.status !== "OK" || !data.result) return c.json(null);

    const { result } = data;
    const reviews = (result.reviews ?? []).map((r: any) => ({
      authorName: r.author_name,
      rating: r.rating,
      text: r.text,
      relativeTimeDescription: r.relative_time_description,
      profilePhotoUrl: r.profile_photo_url ?? null,
    }));

    // 5. Persist to DB + mark fresh in Redis for 30 days
    await Promise.all([
      prisma.dealer.update({
        where: { id },
        data: {
          googleRating: result.rating ?? null,
          googleReviewCount: result.user_ratings_total ?? null,
          googleReviews: reviews,
        },
      }),
      cacheSet(redisFreshKey, true, REVIEW_CACHE_TTL),
      cacheDelete(`dealer:${id}`),
    ]);

    return c.json({
      rating: result.rating ?? null,
      reviewCount: result.user_ratings_total ?? null,
      reviews,
    });
  } catch (error) {
    console.error("Failed to fetch Google reviews:", error);
    return c.json(null);
  }
});

// ─── GET /:id — dealer detail (must be last) ──────────────────────────────────

router.get("/:id", async (c) => {
  const { id } = c.req.param();

  const cacheKey = `dealer:${id}`;
  const cached = await cacheGet<any>(cacheKey);
  if (cached) return c.json(cached);

  try {
    const dealer = await prisma.dealer.findFirst({
      where: {
        id,
        user: { banned: { not: true } },
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

    if (!dealer) return c.json(null, 404);

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
            DAY_ORDER.indexOf(a.day as string) -
            DAY_ORDER.indexOf(b.day as string),
        )
        .map((oh) => ({
          day: oh.day,
          isOpen: oh.isOpen,
          hours:
            oh.isOpen && oh.openTime && oh.closeTime
              ? `${toTimeString(oh.openTime)} – ${toTimeString(oh.closeTime)}`
              : null,
        })),
    };

    await cacheSet(cacheKey, result, 300);
    return c.json(result);
  } catch (error) {
    console.error("Failed to fetch dealer by id:", error);
    return c.json(null, 500);
  }
});

export default router;

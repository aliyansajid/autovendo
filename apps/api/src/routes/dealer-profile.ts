import { Hono } from "hono";
import { prisma, DayOfWeek } from "@repo/db";
import { z } from "zod";
import { storage } from "../lib/storage.js";
import { cacheDelete, cacheDeletePattern } from "../lib/cache.js";

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

function parseTimeString(time: string | null | undefined): Date | null {
  if (!time || !time.includes(":")) return null;
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours ?? 0, minutes ?? 0, 0, 0);
  return date;
}

// ─── Validation schema ────────────────────────────────────────────────────────

const updateSchema = z.object({
  name: z.string().min(3).max(50),
  email: z.email(),
  image: z.url().optional().nullable(),
  companyName: z.string().min(3).max(50),
  description: z.string().optional().nullable(),
  website: z.string().optional().or(z.literal("")).nullable(),
  logo: z.url().optional().nullable(),
  coverImage: z.url().optional().nullable(),
  streetAddress: z.string().min(5).max(100),
  zipCode: z.string().min(4).max(10),
  city: z.string().min(2).max(50),
  country: z.literal("Switzerland"),
  uidNumber: z.string().regex(/^CHE-\d{3}\.\d{3}\.\d{3}$/),
  contactPerson: z.string().min(3).max(50),
  phoneNumber: z.string().min(1),
  businessEmail: z.email(),
  openingHours: z
    .array(
      z.object({
        day: z.string(),
        isOpen: z.boolean(),
        openTime: z.string().optional().nullable(),
        closeTime: z.string().optional().nullable(),
      }),
    )
    .optional(),
});

// ─── Auth guard ───────────────────────────────────────────────────────────────

router.use("*", async (c, next) => {
  if (!c.get("user")) return c.json({ error: "Unauthorized" }, 401);
  await next();
});

// ─── GET / ────────────────────────────────────────────────────────────────────

router.get("/", async (c) => {
  const user = c.get("user")!;

  const dealer = await prisma.dealer.findUnique({
    where: { userId: user.id },
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

  if (!dealer) return c.json(null);

  return c.json({
    ...dealer,
    openingHours: dealer.openingHours.map((oh) => ({
      ...oh,
      openTime: toTimeString(oh.openTime),
      closeTime: toTimeString(oh.closeTime),
    })),
  });
});

// ─── PUT / ────────────────────────────────────────────────────────────────────

router.put("/", async (c) => {
  const user = c.get("user")!;

  try {
    const body = await c.req.json();
    const validatedValues = updateSchema.parse(body);

    // 1. Fetch current data to check for image changes
    const existingData = await prisma.dealer.findUnique({
      where: { userId: user.id },
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
      validatedValues.logo !== existingData.logo &&
      (typeof validatedValues.logo === "string" ||
        validatedValues.logo === null)
    ) {
      imagesToDelete.push(existingData.logo);
    }

    // Check coverImage
    if (
      existingData?.coverImage &&
      validatedValues.coverImage !== existingData.coverImage &&
      (typeof validatedValues.coverImage === "string" ||
        validatedValues.coverImage === null)
    ) {
      imagesToDelete.push(existingData.coverImage);
    }

    // Check user profile image
    if (
      existingData?.user?.image &&
      validatedValues.image !== existingData.user.image &&
      (typeof validatedValues.image === "string" ||
        validatedValues.image === null)
    ) {
      imagesToDelete.push(existingData.user.image);
    }

    // 2. Delete old files from storage
    if (imagesToDelete.length > 0) {
      await Promise.allSettled(
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

    // 3. Upsert dealer
    const dealer = await prisma.dealer.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        companyName: validatedValues.companyName,
        description: validatedValues.description,
        website: validatedValues.website,
        logo:
          typeof validatedValues.logo === "string"
            ? validatedValues.logo
            : undefined,
        streetAddress: validatedValues.streetAddress,
        zipCode: validatedValues.zipCode,
        city: validatedValues.city,
        country: validatedValues.country,
        uidNumber: validatedValues.uidNumber,
        contactPerson: validatedValues.contactPerson,
        phoneNumber: validatedValues.phoneNumber,
        businessEmail: validatedValues.businessEmail,
        coverImage:
          typeof validatedValues.coverImage === "string"
            ? validatedValues.coverImage
            : undefined,
      },
      update: {
        companyName: validatedValues.companyName,
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
        streetAddress: validatedValues.streetAddress,
        zipCode: validatedValues.zipCode,
        city: validatedValues.city,
        country: validatedValues.country,
        uidNumber: validatedValues.uidNumber,
        contactPerson: validatedValues.contactPerson,
        phoneNumber: validatedValues.phoneNumber,
        businessEmail: validatedValues.businessEmail,
      },
    });

    // 4. Recreate opening hours
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

    // 5. Invalidate cache
    await Promise.all([
      cacheDelete(`dealer:${dealer.id}`),
      cacheDeletePattern("dealers:list:*"),
      cacheDeletePattern(`dealer:vehicles:${dealer.id}:*`),
    ]);

    return c.json({ success: true });
  } catch (error) {
    console.error("Failed to update dealer profile:", error);
    return c.json({ success: false, error: "errorDefault" });
  }
});

export default router;

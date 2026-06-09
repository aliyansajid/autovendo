import { Hono } from "hono";
import { prisma } from "@repo/db";
import { auth } from "../lib/auth";
import { stripeClient } from "@repo/auth";
import { StorageService } from "@repo/storage";
import { z } from "zod";

type Variables = {
  user: { id: string; email: string; role?: string | null } | null;
  session: unknown | null;
};

const router = new Hono<{ Variables: Variables }>();

// ─── Admin guard ──────────────────────────────────────────────────────────────

router.use("*", async (c, next) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  if (user.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  await next();
});

// ─── GET / — list all dealers ─────────────────────────────────────────────────

router.get("/", async (c) => {
  const dealers = await prisma.dealer.findMany({
    include: {
      user: {
        select: {
          id: true,
          role: true,
          banned: true,
          stripeCustomerId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const stripeCustomerIds = dealers
    .map((d) => d.user?.stripeCustomerId)
    .filter((id): id is string => !!id);

  const subscriptions = await prisma.subscription.findMany({
    where: {
      stripeCustomerId: { in: stripeCustomerIds },
      status: "active",
    },
  });

  const activeCustomerIds = new Set(
    subscriptions.map((s) => s.stripeCustomerId),
  );

  const result = dealers.map((dealer) => ({
    ...dealer,
    hasActiveSubscription:
      !!dealer.user?.stripeCustomerId &&
      activeCustomerIds.has(dealer.user.stripeCustomerId),
  }));

  return c.json(result);
});

// ─── GET /:id — get single dealer ────────────────────────────────────────────

router.get("/:id", async (c) => {
  const { id } = c.req.param();

  const dealer = await prisma.dealer.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!dealer) return c.json({ error: "Not found" }, 404);
  return c.json(dealer);
});

// ─── POST / — create dealer ───────────────────────────────────────────────────

const createDealerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  companyName: z.string().min(1),
  streetAddress: z.string().min(1),
  zipCode: z.string().min(1),
  city: z.string().min(1),
  uidNumber: z.string().min(1),
  contactPerson: z.string().min(1),
  phoneNumber: z.string().min(1),
  businessEmail: z.string().email(),
});

router.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = createDealerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", issues: parsed.error.issues },
      400,
    );
  }

  const data = parsed.data;

  const newUser = await auth.api.createUser({
    body: {
      name: data.name,
      email: data.email,
      password: data.password,
      role: "dealer",
    },
  });

  if (!newUser?.user) {
    return c.json({ error: "Failed to create authentication account" }, 500);
  }

  await prisma.user.update({
    where: { id: newUser.user.id },
    data: { emailVerified: true },
  });

  await prisma.dealer.create({
    data: {
      userId: newUser.user.id,
      companyName: data.companyName,
      streetAddress: data.streetAddress,
      zipCode: data.zipCode,
      city: data.city,
      uidNumber: data.uidNumber,
      contactPerson: data.contactPerson,
      phoneNumber: data.phoneNumber,
      businessEmail: data.businessEmail,
    },
  });

  try {
    const { sendEmail } = await import("@repo/transactional");
    const { DealerWelcomeEmail } =
      await import("@repo/transactional/emails/dealer-welcome");
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autovendo.ch";
    void sendEmail({
      to: data.email,
      subject: "Welcome to Autovendo",
      template: DealerWelcomeEmail({
        dealerName: data.name,
        loginUrl: `${appUrl}/login`,
        locale: "de",
      }),
    });
  } catch (e) {
    console.error("Failed to send welcome email:", e);
  }

  return c.json({ success: true });
});

// ─── PUT /:id — update dealer ─────────────────────────────────────────────────

const updateDealerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().optional(),
  companyName: z.string().min(1),
  streetAddress: z.string().min(1),
  zipCode: z.string().min(1),
  city: z.string().min(1),
  uidNumber: z.string().min(1),
  contactPerson: z.string().min(1),
  phoneNumber: z.string().min(1),
  businessEmail: z.string().email(),
});

router.put("/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json().catch(() => null);
  const parsed = updateDealerSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: "Validation failed", issues: parsed.error.issues },
      400,
    );
  }

  const data = parsed.data;

  const dealer = await prisma.dealer.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!dealer) return c.json({ error: "Dealer not found" }, 404);

  await auth.api.adminUpdateUser({
    body: {
      userId: dealer.userId,
      data: { name: data.name, email: data.email },
    },
  });

  if (data.password) {
    await auth.api.setUserPassword({
      body: { userId: dealer.userId, newPassword: data.password },
    });
  }

  await prisma.dealer.update({
    where: { id },
    data: {
      companyName: data.companyName,
      streetAddress: data.streetAddress,
      zipCode: data.zipCode,
      city: data.city,
      uidNumber: data.uidNumber,
      contactPerson: data.contactPerson,
      phoneNumber: data.phoneNumber,
      businessEmail: data.businessEmail,
    },
  });

  return c.json({ success: true });
});

// ─── POST /:id/ban ────────────────────────────────────────────────────────────

router.post("/:id/ban", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json().catch(() => ({}));
  const { reason, expiresIn }: { reason?: string; expiresIn?: number } = body;

  const dealer = await prisma.dealer.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });
  if (!dealer) return c.json({ error: "Dealer not found" }, 404);

  await auth.api.banUser({
    body: {
      userId: dealer.userId,
      banReason: reason,
      banExpiresIn: expiresIn,
    },
    headers: c.req.raw.headers,
  });

  await prisma.vehicle.updateMany({
    where: { dealerId: id, status: "PUBLISHED" },
    data: { status: "PAUSED" },
  });

  if (dealer.user?.email) {
    try {
      const { sendEmail, AccountBannedEmail } =
        await import("@repo/transactional");
      let durationText = "Permanent";
      if (expiresIn === 3600) durationText = "1 Hour";
      else if (expiresIn === 86400) durationText = "24 Hours";
      else if (expiresIn === 604800) durationText = "7 Days";
      else if (expiresIn === 2592000) durationText = "30 Days";
      const isPermanent = !expiresIn;
      void sendEmail({
        to: dealer.user.email,
        subject: isPermanent
          ? "Important: Your account has been permanently banned"
          : "Notice: Your account has been temporarily suspended",
        template: AccountBannedEmail({
          userName: dealer.contactPerson || dealer.user.name || "Dealer",
          reason: reason || "Violation of platform policies",
          duration: durationText,
          isPermanent,
        }),
      });
    } catch (e) {
      console.error("Failed to send ban email:", e);
    }
  }

  return c.json({ success: true });
});

// ─── POST /:id/unban ──────────────────────────────────────────────────────────

router.post("/:id/unban", async (c) => {
  const { id } = c.req.param();

  const dealer = await prisma.dealer.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });
  if (!dealer) return c.json({ error: "Dealer not found" }, 404);

  await auth.api.unbanUser({
    body: { userId: dealer.userId },
    headers: c.req.raw.headers,
  });

  await prisma.vehicle.updateMany({
    where: { dealerId: id, status: "PAUSED" },
    data: { status: "PUBLISHED" },
  });

  if (dealer.user?.email) {
    try {
      const { sendEmail, AccountUnbannedEmail } =
        await import("@repo/transactional");
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autovendo.ch";
      void sendEmail({
        to: dealer.user.email,
        subject: "Your Autovendo account access has been restored",
        template: AccountUnbannedEmail({
          userName: dealer.contactPerson || dealer.user.name || "Dealer",
          loginUrl: `${appUrl}/de/dashboard`,
        }),
      });
    } catch (e) {
      console.error("Failed to send unban email:", e);
    }
  }

  return c.json({ success: true });
});

// ─── POST /:id/set-role ───────────────────────────────────────────────────────

router.post("/:id/set-role", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json().catch(() => ({}));
  const { role }: { role: "user" | "admin" } = body;

  const dealer = await prisma.dealer.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!dealer) return c.json({ error: "Dealer not found" }, 404);

  await auth.api.setRole({
    body: { userId: dealer.userId, role },
    headers: c.req.raw.headers,
  });

  return c.json({ success: true });
});

// ─── POST /:id/set-password ───────────────────────────────────────────────────

router.post("/:id/set-password", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json().catch(() => ({}));
  const { userId, newPassword }: { userId: string; newPassword: string } = body;

  await auth.api.setUserPassword({
    body: { userId, newPassword },
  });

  return c.json({ success: true });
});

// ─── GET /:id/sessions ────────────────────────────────────────────────────────

router.get("/:id/sessions", async (c) => {
  const { id } = c.req.param();

  const dealer = await prisma.dealer.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!dealer) return c.json({ error: "Dealer not found" }, 404);

  const sessions = await prisma.session.findMany({
    where: {
      userId: dealer.userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  return c.json(sessions);
});

// ─── DELETE /sessions/:token — revoke single session ─────────────────────────

router.delete("/sessions/:token", async (c) => {
  const { token } = c.req.param();

  await auth.api.revokeUserSession({
    body: { sessionToken: token },
    headers: c.req.raw.headers,
  });

  return c.json({ success: true });
});

// ─── DELETE /:id/sessions — revoke all sessions ───────────────────────────────

router.delete("/:id/sessions", async (c) => {
  const { id } = c.req.param();

  const dealer = await prisma.dealer.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!dealer) return c.json({ error: "Dealer not found" }, 404);

  await auth.api.revokeUserSessions({
    body: { userId: dealer.userId },
    headers: c.req.raw.headers,
  });

  return c.json({ success: true });
});

// ─── DELETE /:id — remove dealer + user ──────────────────────────────────────

router.delete("/:id", async (c) => {
  const { id } = c.req.param();

  const dealer = await prisma.dealer.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          stripeCustomerId: true,
        },
      },
      vehicles: { select: { id: true, images: true } },
    },
  });
  if (!dealer) return c.json({ error: "Dealer not found" }, 404);

  const userId = dealer.userId;

  const storage = new StorageService({
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    accountId: process.env.R2_ACCOUNT_ID || "",
    bucket: process.env.R2_BUCKET_NAME || "autovendo",
    publicDomain: process.env.R2_PUBLIC_DOMAIN,
  });

  // Delete vehicle images from storage
  for (const vehicle of dealer.vehicles) {
    if (vehicle.images?.length) {
      await Promise.all(
        vehicle.images.map(async (key) => {
          try {
            await storage.deleteFile(key);
          } catch {}
        }),
      );
    }
  }

  // Delete dealer media from storage
  if (dealer.logo) {
    try {
      await storage.deleteFile(dealer.logo);
    } catch {}
  }
  if (dealer.coverImage) {
    try {
      await storage.deleteFile(dealer.coverImage);
    } catch {}
  }
  if (dealer.user?.image) {
    try {
      await storage.deleteFile(dealer.user.image);
    } catch {}
  }

  // Delete vehicles and dealer from DB
  await prisma.vehicle.deleteMany({ where: { dealerId: id } });
  await prisma.dealer.delete({ where: { id } });

  // Cancel Stripe subscriptions
  const uniqueSubsMap = new Map<
    string,
    { stripeSubscriptionId: string; status: string }
  >();
  if (dealer.user?.stripeCustomerId) {
    const subsByCustomer = await prisma.subscription.findMany({
      where: { stripeCustomerId: dealer.user.stripeCustomerId },
    });
    subsByCustomer.forEach((s) => {
      if (s.stripeSubscriptionId)
        uniqueSubsMap.set(s.stripeSubscriptionId, s as any);
    });
  }
  const subsByRef = await prisma.subscription.findMany({
    where: { referenceId: userId },
  });
  subsByRef.forEach((s) => {
    if (s.stripeSubscriptionId)
      uniqueSubsMap.set(s.stripeSubscriptionId, s as any);
  });

  for (const sub of uniqueSubsMap.values()) {
    if (sub.stripeSubscriptionId && sub.status !== "canceled") {
      try {
        await stripeClient.subscriptions.cancel(sub.stripeSubscriptionId);
      } catch {}
    }
  }

  // Remove user from Better Auth (cascades Account, Session, etc.)
  await auth.api.removeUser({
    body: { userId },
    headers: c.req.raw.headers,
  });

  // Send deletion notification
  if (dealer.user?.email) {
    try {
      const { sendEmail, AccountDeletedEmail } =
        await import("@repo/transactional");
      void sendEmail({
        to: dealer.user.email,
        subject: "Your Autovendo account has been closed",
        template: AccountDeletedEmail({
          userName: dealer.contactPerson || dealer.user.name || "Dealer",
        }),
      });
    } catch (e) {
      console.error("Failed to send deletion email:", e);
    }
  }

  return c.json({ success: true });
});

export default router;

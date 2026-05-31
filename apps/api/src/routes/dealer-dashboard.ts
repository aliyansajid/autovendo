import { Hono } from "hono";
import { prisma } from "@repo/db";
import { createAuth } from "@repo/auth";
import { expo } from "@better-auth/expo";

const auth = createAuth([expo()]);

type Variables = {
  user: { id: string; email: string; role?: string | null } | null;
  session: unknown | null;
};

const router = new Hono<{ Variables: Variables }>();

// ─── Auth guard ───────────────────────────────────────────────────────────────

router.use("*", async (c, next) => {
  if (!c.get("user")) return c.json({ error: "Unauthorized" }, 401);
  await next();
});

// ─── GET /summary ─────────────────────────────────────────────────────────────

router.get("/summary", async (c) => {
  const user = c.get("user")!;

  const dealer = await prisma.dealer.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!dealer) {
    return c.json({
      totalCount: 0,
      publishedCount: 0,
      draftCount: 0,
      soldCount: 0,
      recentVehicles: [],
    });
  }

  const [counts, recentVehicles] = await Promise.all([
    prisma.vehicle.groupBy({
      by: ["status"],
      where: { dealerId: dealer.id },
      _count: { _all: true },
    }),
    prisma.vehicle.findMany({
      where: { dealerId: dealer.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        make: true,
        model: true,
        price: true,
        status: true,
        images: true,
        createdAt: true,
      },
    }),
  ]);

  const totalCount = counts.reduce((acc, curr) => acc + curr._count._all, 0);
  const publishedCount =
    counts.find((c) => c.status === "PUBLISHED")?._count._all || 0;
  const draftCount = counts.find((c) => c.status === "DRAFT")?._count._all || 0;
  const soldCount = counts.find((c) => c.status === "SOLD")?._count._all || 0;

  return c.json({
    totalCount,
    publishedCount,
    draftCount,
    soldCount,
    recentVehicles,
  });
});

// ─── GET /subscription ────────────────────────────────────────────────────────

router.get("/subscription", async (c) => {
  const user = c.get("user")!;

  const [dealer, subscriptionsResponse] = await Promise.all([
    prisma.dealer.findUnique({
      where: { userId: user.id },
      select: { id: true },
    }),
    (auth.api as any).listActiveSubscriptions({ headers: c.req.raw.headers }),
  ]);

  const currentCount = dealer
    ? await prisma.vehicle.count({ where: { dealerId: dealer.id } })
    : 0;

  const subscriptions = Array.isArray(subscriptionsResponse)
    ? subscriptionsResponse
    : (subscriptionsResponse as any)?.data || [];
  const limits = (subscriptionsResponse as any)?.limits;

  const activeSub = subscriptions.find(
    (s: any) =>
      s.status === "active" ||
      s.status === "trialing" ||
      s.status === "incomplete",
  );
  const pastDueSub = subscriptions.find(
    (s: any) => s.status === "past_due" || s.status === "unpaid",
  );
  const mainSub = activeSub || pastDueSub;

  if (!mainSub) {
    return c.json({
      type: "no_subscription",
      plan: "",
      maxVehicles: 0,
      currentCount,
      remainingQuota: 0,
    });
  }

  let maxVehicles = limits?.vehicles || 0;

  if (maxVehicles === 0 && mainSub.plan) {
    const plan = await prisma.plan.findFirst({
      where: { name: { contains: mainSub.plan, mode: "insensitive" } },
      select: { limits: true },
    });
    if (plan && (plan.limits as any)?.vehicles) {
      maxVehicles = (plan.limits as any).vehicles;
    }
  }

  const remainingQuota = Math.max(0, maxVehicles - currentCount);

  if (mainSub.status === "past_due" || mainSub.status === "unpaid") {
    return c.json({
      type: "past_due",
      plan: mainSub.plan,
      maxVehicles,
      currentCount,
      remainingQuota,
    });
  }

  if (remainingQuota === 0 && maxVehicles > 0) {
    return c.json({
      type: "quota_exhausted",
      plan: mainSub.plan,
      maxVehicles,
      currentCount,
      remainingQuota: 0,
    });
  }

  return c.json({
    type: "active",
    plan: mainSub.plan,
    maxVehicles,
    currentCount,
    remainingQuota,
  });
});

// ─── POST /prepare-listing ────────────────────────────────────────────────────

router.post("/prepare-listing", async (c) => {
  const user = c.get("user")!;

  const dealer = await prisma.dealer.findUnique({ where: { userId: user.id } });
  if (!dealer) return c.json({ error: "Dealer profile not found" }, 404);

  // Get subscription status inline
  const [subscriptionsResponse] = await Promise.all([
    (auth.api as any).listActiveSubscriptions({ headers: c.req.raw.headers }),
  ]);

  const subscriptions = Array.isArray(subscriptionsResponse)
    ? subscriptionsResponse
    : (subscriptionsResponse as any)?.data || [];
  const limits = (subscriptionsResponse as any)?.limits;

  const activeSub = subscriptions.find(
    (s: any) =>
      s.status === "active" ||
      s.status === "trialing" ||
      s.status === "incomplete",
  );
  const pastDueSub = subscriptions.find(
    (s: any) => s.status === "past_due" || s.status === "unpaid",
  );
  const mainSub = activeSub || pastDueSub;

  const currentCount = await prisma.vehicle.count({
    where: { dealerId: dealer.id },
  });

  let maxVehicles = limits?.vehicles || 0;
  if (maxVehicles === 0 && mainSub?.plan) {
    const plan = await prisma.plan.findFirst({
      where: { name: { contains: mainSub.plan, mode: "insensitive" } },
      select: { limits: true },
    });
    if (plan && (plan.limits as any)?.vehicles) {
      maxVehicles = (plan.limits as any).vehicles;
    }
  }

  const remainingQuota = Math.max(0, maxVehicles - currentCount);

  let statusType: string;
  if (!mainSub) {
    statusType = "no_subscription";
  } else if (mainSub.status === "past_due" || mainSub.status === "unpaid") {
    statusType = "past_due";
  } else if (remainingQuota === 0 && maxVehicles > 0) {
    statusType = "quota_exhausted";
  } else {
    statusType = "active";
  }

  const body = await c.req.json().catch(() => ({}));
  const existingVehicleId: string | undefined = body.existingVehicleId;

  if (!existingVehicleId) {
    if (statusType !== "active") {
      return c.json({ error: statusType }, 403);
    }
  } else {
    if (statusType === "no_subscription" || statusType === "expired") {
      return c.json({ error: "subscription_ended" }, 403);
    }
  }

  const listingId = existingVehicleId || crypto.randomUUID();

  return c.json({ listingId, country: "ch", dealerId: dealer.id });
});

export default router;

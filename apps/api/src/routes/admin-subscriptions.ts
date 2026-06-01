import { Hono } from "hono";
import { prisma } from "@repo/db";

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

// ─── GET / — list all subscriptions with user/dealer info ────────────────────

router.get("/", async (c) => {
  const subscriptions = await prisma.subscription.findMany({
    orderBy: { periodStart: "desc" },
  });

  const stripeCustomerIds = subscriptions
    .map((s) => s.stripeCustomerId)
    .filter((id): id is string => !!id);

  const users = await prisma.user.findMany({
    where: { stripeCustomerId: { in: stripeCustomerIds } },
    include: { dealer: { select: { companyName: true } } },
  });

  const userMap = new Map(users.map((u) => [u.stripeCustomerId, u]));

  const result = subscriptions.map((sub) => {
    const user = sub.stripeCustomerId ? userMap.get(sub.stripeCustomerId) : null;
    return {
      ...sub,
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            companyName: user.dealer?.companyName ?? null,
          }
        : null,
    };
  });

  return c.json(result);
});

export default router;

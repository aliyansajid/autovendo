import { Hono } from "hono";
import { prisma } from "@repo/db";
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

// ─── GET / — list all plans ───────────────────────────────────────────────────

router.get("/", async (c) => {
  const plans = await prisma.plan.findMany({
    orderBy: { price: "asc" },
  });
  return c.json(plans);
});

// ─── Plan schema ──────────────────────────────────────────────────────────────

const planSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number(),
  priceId: z.string().min(1),
  vehicles: z.number().int().min(0),
  popular: z.boolean().default(false),
  hasTrial: z.boolean().default(false),
  trialDays: z.number().int().min(0).optional(),
});

// ─── POST / — create plan ─────────────────────────────────────────────────────

router.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  }

  const data = parsed.data;

  await prisma.plan.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      priceId: data.priceId,
      limits: { vehicles: data.vehicles },
      popular: data.popular,
      hasTrial: data.hasTrial,
      trialDays: data.hasTrial ? data.trialDays : null,
    },
  });

  return c.json({ success: true });
});

// ─── PUT /:id — update plan ───────────────────────────────────────────────────

router.put("/:id", async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json().catch(() => null);
  const parsed = planSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);
  }

  const data = parsed.data;

  await prisma.plan.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      priceId: data.priceId,
      limits: { vehicles: data.vehicles },
      popular: data.popular,
      hasTrial: data.hasTrial,
      trialDays: data.hasTrial ? data.trialDays : null,
    },
  });

  return c.json({ success: true });
});

// ─── DELETE /:id — delete plan ────────────────────────────────────────────────

router.delete("/:id", async (c) => {
  const { id } = c.req.param();

  await prisma.plan.delete({ where: { id } });

  return c.json({ success: true });
});

export default router;

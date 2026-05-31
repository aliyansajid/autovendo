import { Hono } from "hono";
import { prisma } from "@repo/db";

const router = new Hono();

router.get("/", async (c) => {
  const plans = await prisma.plan.findMany({
    orderBy: { price: "asc" },
    select: {
      name: true,
      price: true,
      description: true,
      limits: true,
      popular: true,
      hasTrial: true,
      trialDays: true,
    },
  });
  return c.json(plans);
});

export default router;

import { Hono } from "hono";
import { prisma } from "@repo/db";

const router = new Hono();

router.get("/", async (c) => {
  const [vehicles, dealers] = await Promise.all([
    prisma.vehicle.findMany({ select: { id: true, updatedAt: true } }),
    prisma.dealer.findMany({ select: { id: true, updatedAt: true } }),
  ]);
  return c.json({ vehicles, dealers });
});

export default router;

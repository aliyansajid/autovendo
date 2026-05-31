import { Hono } from "hono";
import { prisma } from "@repo/db";

const router = new Hono();

router.get("/", async (c) => {
  const sellerOnly = c.req.query("sellerOnly") === "true";

  const [vehicles, dealers] = await Promise.all([
    prisma.vehicle.findMany({
      where: sellerOnly ? { sellerId: { not: null } } : undefined,
      select: { id: true, updatedAt: true },
    }),
    sellerOnly
      ? Promise.resolve([])
      : prisma.dealer.findMany({ select: { id: true, updatedAt: true } }),
  ]);

  return c.json({ vehicles, dealers });
});

export default router;

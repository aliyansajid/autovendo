import { Hono } from "hono";
import { prisma } from "@repo/db";
import { stripeClient } from "@repo/auth";
import { z } from "zod";

type Variables = {
  user: { id: string; email: string } | null;
  session: unknown | null;
};

const router = new Hono<{ Variables: Variables }>();

// ─── Auth guard ───────────────────────────────────────────────────────────────

router.use("*", async (c, next) => {
  if (!c.get("user")) return c.json({ error: "Unauthorized" }, 401);
  await next();
});

// ─── POST /checkout — create Stripe checkout session for a listing ────────────

const checkoutSchema = z.object({
  vehicleId: z.string(),
  planId: z.enum(["standard", "best_value"]),
  locale: z.string(),
});

const PRICE_MAP = {
  standard: { amount: 1900, name: "Standard Listing (30 Days)" },
  best_value: { amount: 4900, name: "Best Value Listing (Until Sold)" },
} as const;

router.post("/checkout", async (c) => {
  const user = c.get("user")!;

  const body = await c.req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "Invalid request" }, 400);
  }

  const { vehicleId, planId, locale } = parsed.data;

  const seller = await prisma.seller.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });
  if (!seller) return c.json({ error: "Seller not found" }, 404);

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId, sellerId: seller.id },
  });
  if (!vehicle) return c.json({ error: "Vehicle not found" }, 404);

  const selectedPlan = PRICE_MAP[planId];
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autosolo.ch";

  const stripeSession = await stripeClient.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "chf",
          product_data: {
            name: selectedPlan.name,
            description: `Listing for ${vehicle.make} ${vehicle.model} (VIN: ${vehicle.vin})`,
          },
          unit_amount: selectedPlan.amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${appUrl}/${locale}/dashboard/vehicles?success=true&vehicleId=${vehicleId}`,
    cancel_url: `${appUrl}/${locale}/dashboard/vehicles/${vehicleId}?canceled=true`,
    metadata: {
      vehicleId,
      planId,
      sellerId: seller.id,
    },
  });

  if (!stripeSession.url) {
    return c.json({ error: "Failed to create checkout session" }, 500);
  }

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { listingPlan: planId, stripeSessionId: stripeSession.id },
  });

  return c.json({ url: stripeSession.url });
});

export default router;

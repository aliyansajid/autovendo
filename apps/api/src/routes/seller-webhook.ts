import { Hono } from "hono";
import { prisma } from "@repo/db";
import { stripeClient } from "@repo/auth";

const router = new Hono();

router.post("/", async (c) => {
  const body = await c.req.raw.text();
  const sig = c.req.header("stripe-signature");

  if (!sig) return c.json({ error: "Missing signature" }, 400);

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return c.json({ error: "Invalid signature" }, 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { vehicleId, planId } = session.metadata ?? {};

    if (!vehicleId || !planId) {
      return c.json({ error: "Missing metadata" }, 400);
    }

    // Idempotency — skip if already processed
    const existing = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { listingPaidAt: true },
    });

    if (existing?.listingPaidAt) {
      return c.json({ received: true });
    }

    const now = new Date();
    const expiresAt =
      planId === "standard"
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        : null; // best_value — no expiry

    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        status: "PUBLISHED",
        listingPlan: planId,
        listingPaidAt: now,
        listingExpiresAt: expiresAt,
        stripeSessionId: session.id,
      },
    });
  }

  return c.json({ received: true });
});

export default router;

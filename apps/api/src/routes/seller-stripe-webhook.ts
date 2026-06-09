import { Hono } from "hono";
import { prisma } from "@repo/db";
import { stripeClient } from "@repo/auth";
import type Stripe from "stripe";
import { cacheDeletePattern } from "../lib/cache";

const router = new Hono();

router.post("/", async (c) => {
  const secret = process.env.STRIPE_LISTING_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[ListingWebhook] STRIPE_LISTING_WEBHOOK_SECRET not set");
    return c.json({ error: "Webhook secret not configured" }, 500);
  }

  const sig = c.req.header("stripe-signature");
  if (!sig) return c.json({ error: "Missing signature" }, 400);

  const rawBody = await c.req.arrayBuffer();

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(
      Buffer.from(rawBody),
      sig,
      secret,
    );
  } catch (err: any) {
    console.error("[ListingWebhook] Signature verification failed:", err.message);
    return c.json({ error: "Invalid signature" }, 400);
  }

  if (event.type !== "checkout.session.completed") {
    return c.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;

  if (session.mode !== "payment") return c.json({ received: true });
  if (!session.metadata?.vehicleId) return c.json({ received: true });

  const { vehicleId, planId } = session.metadata;
  const paidAt = new Date();
  const expiresAt =
    planId === "standard"
      ? new Date(paidAt.getTime() + 30 * 24 * 60 * 60 * 1000)
      : null;

  await prisma.vehicle.updateMany({
    where: {
      id: vehicleId,
      stripeSessionId: session.id,
    },
    data: {
      status: "PUBLISHED",
      listingPlan: planId,
      listingPaidAt: paidAt,
      listingExpiresAt: expiresAt,
    },
  });

  await cacheDeletePattern("api:seller:vehicles:*");

  console.log(`[ListingWebhook] Vehicle ${vehicleId} published (plan: ${planId})`);
  return c.json({ received: true });
});

export default router;

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@repo/db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const { vehicleId, planId } = session.metadata ?? {};

    if (!vehicleId || !planId) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const now = new Date();
    const expiresAt =
      planId === "standard"
        ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        : null; // best_value has no expiry

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

  return NextResponse.json({ received: true });
}

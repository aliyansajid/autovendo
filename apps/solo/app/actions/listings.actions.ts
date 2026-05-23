"use server";

import { auth, stripeClient } from "@repo/auth";
import { prisma } from "@repo/db";
import { headers } from "next/headers";

export async function createListingCheckoutSession(vehicleId: string, planId: "standard" | "best_value", locale: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId, sellerId: (await prisma.seller.findUnique({ where: { userId: session.user.id } }))?.id },
  });

  if (!vehicle) throw new Error("Vehicle not found");

  const priceMap = {
    standard: {
      amount: 1900, // CHF 19.00
      name: "Standard Listing (30 Days)",
    },
    best_value: {
      amount: 4900, // CHF 49.00
      name: "Best Value Listing (Until Sold)",
    },
  };

  const selectedPlan = priceMap[planId];

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
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/vehicles?success=true&vehicleId=${vehicleId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/vehicles/${vehicleId}?canceled=true`,
    metadata: {
      vehicleId,
      planId,
      sellerId: vehicle.sellerId,
    },
  });

  if (!stripeSession.url) throw new Error("Failed to create checkout session");

  // Save the plan and session ID so we can resume payment later if user backs out
  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { listingPlan: planId, stripeSessionId: stripeSession.id },
  });

  return stripeSession.url;
}

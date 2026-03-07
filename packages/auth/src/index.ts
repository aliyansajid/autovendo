import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import { prisma } from "@repo/db";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },

  plugins: [
    admin(),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "bronze",
            priceId: process.env.STRIPE_BRONZE_PRICE_ID!,
            limits: { vehicles: 5 },
          },
          {
            name: "silver",
            priceId: process.env.STRIPE_SILVER_PRICE_ID!,
            limits: { vehicles: 10 },
          },
          {
            name: "gold",
            priceId: process.env.STRIPE_GOLD_PRICE_ID!,
            limits: { vehicles: 15 },
          },
          {
            name: "diamond",
            priceId: process.env.STRIPE_DIAMOND_PRICE_ID!,
            limits: { vehicles: 25 },
          },
        ],
      },
    }),
  ],
});

export { toNextJsHandler } from "better-auth/next-js";

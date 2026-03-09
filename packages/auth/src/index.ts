import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@repo/db";
import { admin } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
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
    sendResetPassword: async ({ user, url }) => {
      const { sendEmail } = await import("@repo/transactional");
      const { ResetPasswordEmail } =
        await import("@repo/transactional/emails/reset-password");
      await sendEmail({
        to: user.email,
        subject: "Reset your Autovendo password",
        template: ResetPasswordEmail({
          userEmail: user.email,
          resetPasswordUrl: url,
        }),
      });
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { sendEmail } = await import("@repo/transactional");
      const { VerifyEmail } =
        await import("@repo/transactional/emails/verify-email");
      await sendEmail({
        to: user.email,
        subject: "Verify your Autovendo email address",
        template: VerifyEmail({
          userEmail: user.email,
          verificationUrl: url,
        }),
      });
    },
  },

  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        const { sendEmail } = await import("@repo/transactional");
        const { ConfirmEmailChangeEmail } =
          await import("@repo/transactional/emails/confirm-email-change");
        await sendEmail({
          to: user.email,
          subject: "Approve your Autovendo email change",
          template: ConfirmEmailChangeEmail({
            currentEmail: user.email,
            newEmail: newEmail,
            confirmUrl: url,
          }),
        });
      },
    },
  },

  trustedOrigins: [
    "https://autovendo.ch",
    "https://www.autovendo.ch",
    "http://localhost:3000",
  ],

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

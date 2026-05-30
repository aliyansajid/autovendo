import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@repo/db";
import { admin } from "better-auth/plugins";
import { ac, admin as adminRole, dealer, user } from "./permissions";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

async function handleListingPayment(event: Stripe.Event) {
  if (event.type !== "checkout.session.completed") return;

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.mode !== "payment") return;
  if (!session.metadata?.vehicleId) return;

  const { vehicleId, planId } = session.metadata;
  const paidAt = new Date();
  const expiresAt =
    planId === "standard"
      ? new Date(paidAt.getTime() + 30 * 24 * 60 * 60 * 1000)
      : null;

  await prisma.vehicle.updateMany({
    where: {
      id: vehicleId,
      stripeSessionId: null,
    },
    data: {
      status: "PUBLISHED",
      listingPlan: planId,
      listingPaidAt: paidAt,
      listingExpiresAt: expiresAt,
      stripeSessionId: session.id,
    },
  });
}

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autovendo.ch";
const appName = process.env.APP_NAME ?? "Autovendo";

const SELF_ASSIGNABLE_ROLES = ["user", "dealer"] as const;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const requested = (user as any).accountType;
          return {
            data: {
              ...user,
              role: SELF_ASSIGNABLE_ROLES.includes(requested)
                ? requested
                : "user",
            },
          };
        },
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      const { sendEmail } = await import("@repo/transactional");
      const { ResetPasswordEmail } =
        await import("@repo/transactional/emails/reset-password");
      await sendEmail({
        to: user.email,
        subject: `Reset your ${appName} password`,
        template: ResetPasswordEmail({
          userEmail: user.email,
          resetPasswordUrl: url,
          appName,
          appUrl,
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
        subject: `Verify your ${appName} email address`,
        template: VerifyEmail({
          userEmail: user.email,
          verificationUrl: url,
          appName,
          appUrl,
        }),
      });
    },
  },

  user: {
    additionalFields: {
      accountType: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: true,
      },
    },
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, url }) => {
        const { sendEmail } = await import("@repo/transactional");
        const { ConfirmEmailChangeEmail } =
          await import("@repo/transactional/emails/confirm-email-change");
        await sendEmail({
          to: user.email,
          subject: `Approve your ${appName} email change`,
          template: ConfirmEmailChangeEmail({
            currentEmail: user.email,
            newEmail: newEmail,
            confirmUrl: url,
            appName,
            appUrl,
          }),
        });
      },
    },
  },

  trustedOrigins: [
    "https://autovendo.ch",
    "https://www.autovendo.ch",
    "https://autosolo.ch",
    "https://www.autosolo.ch",
    "https://admin.autovendo.ch",
    // Mobile app
    "autovendo://",
    "autovendo://*",
    ...(process.env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],

  plugins: [
    admin({
      ac,
      roles: { admin: adminRole, dealer, user },
      defaultRole: "user",
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      onEvent: handleListingPayment,
      subscription: {
        enabled: true,
        plans: async () => {
          const plans = await prisma.plan.findMany();
          return plans.map((plan) => ({
            name: plan.name,
            priceId: plan.priceId,
            limits: plan.limits as Record<string, any>,
            freeTrial:
              plan.hasTrial && plan.trialDays
                ? {
                    days: plan.trialDays,
                  }
                : undefined,
          }));
        },
      },
    }),
  ],
});

export { toNextJsHandler } from "better-auth/next-js";
export { stripeClient };

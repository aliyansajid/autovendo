import { betterAuth, type BetterAuthPlugin } from "better-auth";
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

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_placeholder", {
  apiVersion: "2026-04-22.dahlia",
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autovendo.ch";
const appName = process.env.APP_NAME ?? "AutoVendo";

export function createAuth(additionalPlugins: BetterAuthPlugin[] = []) {
  return betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "https://api.autovendo.ch",

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: ".autovendo.ch",
    },
  },

  socialProviders: {
    google: {
      clientId: [
        process.env.GOOGLE_WEB_CLIENT_ID!,
        process.env.GOOGLE_IOS_CLIENT_ID!,
        process.env.GOOGLE_ANDROID_CLIENT_ID!,
      ],
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
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
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
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
    "https://api.autovendo.ch",
    "https://autovendo.ch",
    "https://www.autovendo.ch",
    "https://autosolo.ch",
    "https://www.autosolo.ch",
    "https://admin.autovendo.ch",
    "autovendo://",
    "autovendo://*",
    "exp://",
    "exp://**",
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
          return plans.map((plan: typeof plans[number]) => ({
            name: plan.name,
            priceId: plan.priceId,
            limits: plan.limits as Record<string, any>,
            freeTrial:
              plan.hasTrial && plan.trialDays
                ? { days: plan.trialDays }
                : undefined,
          }));
        },
      },
    }),
    ...additionalPlugins,
  ],
  });
}

export const auth = createAuth();

export { stripeClient };

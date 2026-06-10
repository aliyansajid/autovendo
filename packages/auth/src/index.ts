import { betterAuth } from "better-auth/minimal";
import React from "react";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";
import { admin } from "better-auth/plugins";
import { ac, admin as adminRole, dealer, user } from "./permissions";
import { Redis } from "ioredis";
import { redisStorage } from "@better-auth/redis-storage";
import {
  sendEmail,
  VerifyEmail,
  ResetPasswordEmail,
  ConfirmEmailChangeEmail,
} from "@repo/transactional";
import { i18n } from "@better-auth/i18n";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

const redis = new Redis(
  process.env.REDIS_AUTH_URL ?? "redis://autovendo-redis:6379",
);

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL ?? "https://api.autovendo.ch",

  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  secondaryStorage: redisStorage({
    client: redis,
    keyPrefix: "better-auth:",
  }),

  experimental: {
    joins: true,
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
      domain: "autovendo.ch",
    },
  },

  session: {
    storeSessionInDatabase: true,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  rateLimit: {
    storage: "secondary-storage",
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
    sendResetPassword: async ({ user, url }, request) => {
      void sendEmail({
        to: user.email,
        subject: "Reset your password",
        template: React.createElement(ResetPasswordEmail, {
          userEmail: user.email,
          resetPasswordUrl: url,
        }),
      });
    },
  },

  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmail({
        to: user.email,
        subject: "Verify your email address",
        template: React.createElement(VerifyEmail, {
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
        void sendEmail({
          to: user.email,
          subject: "Approve your email change",
          template: React.createElement(ConfirmEmailChangeEmail, {
            currentEmail: user.email,
            newEmail,
            confirmUrl: url,
          }),
        });
      },
    },
  },

  // socialProviders: {
  //   apple: {
  //     clientId: process.env.APPLE_CLIENT_ID as string,
  //     clientSecret: await generateAppleClientSecret(
  //       process.env.APPLE_CLIENT_ID!,
  //       process.env.APPLE_TEAM_ID!,
  //       process.env.APPLE_KEY_ID!,
  //       process.env.APPLE_PRIVATE_KEY!,
  //     ),
  //     appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
  //     mapProfileToUser: (profile) => ({
  //       email: profile.email ?? `${profile.sub}@apple.placeholder.local`,
  //     }),
  //   },
  //   google: {
  //     clientId: [
  //       process.env.GOOGLE_WEB_CLIENT_ID as string,
  //       process.env.GOOGLE_IOS_CLIENT_ID as string,
  //       process.env.GOOGLE_ANDROID_CLIENT_ID as string,
  //     ],
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  //   },
  // },

  trustedOrigins: [
    "https://autovendo.ch",
    "https://www.autovendo.ch",
    "https://api.autovendo.ch",
    "https://admin.autovendo.ch",
    "https://appleid.apple.com",
  ],

  plugins: [
    i18n({
      defaultLocale: "de",
      detection: ["cookie", "header"],
      localeCookie: "NEXT_LOCALE",
      translations: {
        de: {
          USER_NOT_FOUND: "Benutzer nicht gefunden",
          INVALID_EMAIL_OR_PASSWORD: "Ungültige E-Mail-Adresse oder Passwort",
          INVALID_PASSWORD: "Ungültiges Passwort",
          EMAIL_NOT_VERIFIED: "E-Mail-Adresse nicht verifiziert",
          SESSION_EXPIRED: "Sitzung abgelaufen",
          CREDENTIAL_ACCOUNT_NOT_FOUND: "Konto nicht gefunden",
        },
        fr: {
          USER_NOT_FOUND: "Utilisateur non trouvé",
          INVALID_EMAIL_OR_PASSWORD: "Email ou mot de passe invalide",
          INVALID_PASSWORD: "Mot de passe invalide",
          EMAIL_NOT_VERIFIED: "Email non vérifié",
          SESSION_EXPIRED: "Session expirée",
          CREDENTIAL_ACCOUNT_NOT_FOUND: "Compte non trouvé",
        },
        it: {
          USER_NOT_FOUND: "Utente non trovato",
          INVALID_EMAIL_OR_PASSWORD: "Email o password non validi",
          INVALID_PASSWORD: "Password non valida",
          EMAIL_NOT_VERIFIED: "Email non verificata",
          SESSION_EXPIRED: "Sessione scaduta",
          CREDENTIAL_ACCOUNT_NOT_FOUND: "Account non trovato",
        },
      },
    }),
    admin({
      ac,
      roles: { admin: adminRole, dealer, user },
      defaultRole: "user",
    }),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: async () => {
          const plans = await prisma.plan.findMany();
          return plans.map((plan: (typeof plans)[number]) => ({
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
  ],
});

import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@repo/db";
import { admin } from "better-auth/plugins";
import { ac, admin as adminRole, dealer, user } from "./permissions";
import { stripe } from "@better-auth/stripe";
import { i18n } from "@better-auth/i18n";
import Stripe from "stripe";
import { importPKCS8, SignJWT } from "jose";
import { Redis } from "ioredis";
import { redisStorage } from "@better-auth/redis-storage";

const redis = new Redis(process.env.REDIS_AUTH_URL ?? "redis://localhost:6379");

async function generateAppleClientSecret() {
  const privateKey = process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const key = await importPKCS8(privateKey, "ES256");
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: process.env.APPLE_KEY_ID! })
    .setIssuer(process.env.APPLE_TEAM_ID!)
    .setSubject(process.env.APPLE_CLIENT_ID!)
    .setAudience("https://appleid.apple.com")
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60)
    .sign(key);
}

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
const appName = process.env.APP_NAME ?? "AutoVendo";

export async function createAuth(additionalPlugins: BetterAuthPlugin[] = []) {
  const hasAppleCredentials =
    !!process.env.APPLE_PRIVATE_KEY &&
    !!process.env.APPLE_KEY_ID &&
    !!process.env.APPLE_TEAM_ID &&
    !!process.env.APPLE_CLIENT_ID;

  const appleClientSecret = hasAppleCredentials
    ? await generateAppleClientSecret()
    : null;

  return betterAuth({
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
        domain: ".autovendo.ch",
      },
    },

    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
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
      ...(hasAppleCredentials && appleClientSecret
        ? {
            apple: {
              clientId: process.env.APPLE_CLIENT_ID!,
              clientSecret: appleClientSecret,
              appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER!,
              mapProfileToUser: (profile: { email?: string; sub: string }) => ({
                email:
                  profile.email ?? `${profile.sub}@apple.placeholder.local`,
              }),
            },
          }
        : {}),
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
        void sendEmail({
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
      sendOnSignUp: true,
      sendOnSignIn: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        const { sendEmail } = await import("@repo/transactional");
        const { VerifyEmail } =
          await import("@repo/transactional/emails/verify-email");
        void sendEmail({
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
          void sendEmail({
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
      "https://appleid.apple.com",
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
      i18n({
        detection: ["cookie", "header"],
        localeCookie: "NEXT_LOCALE",
        translations: {
          de: {
            INVALID_EMAIL_OR_PASSWORD: "E-Mail oder Passwort ungültig",
            INVALID_PASSWORD: "Ungültiges Passwort",
            CREDENTIAL_ACCOUNT_NOT_FOUND: "Kein Passwort-Konto gefunden",
            USER_NOT_FOUND: "Benutzer nicht gefunden",
            EMAIL_NOT_VERIFIED: "E-Mail nicht verifiziert",
            TOO_MANY_REQUESTS:
              "Zu viele Anfragen. Bitte versuchen Sie es später erneut.",
            INVALID_TOKEN: "Ungültiger oder abgelaufener Token",
            SESSION_EXPIRED:
              "Sitzung abgelaufen. Bitte melden Sie sich erneut an.",
            BANNED_USER:
              "Ihr Konto wurde gesperrt. Bitte kontaktieren Sie den Support.",
            UNKNOWN_ERROR:
              "Ein unbekannter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
          },
          fr: {
            INVALID_EMAIL_OR_PASSWORD: "E-mail ou mot de passe invalide",
            INVALID_PASSWORD: "Mot de passe invalide",
            CREDENTIAL_ACCOUNT_NOT_FOUND:
              "Aucun compte avec mot de passe trouvé",
            USER_NOT_FOUND: "Utilisateur non trouvé",
            EMAIL_NOT_VERIFIED: "E-mail non vérifié",
            TOO_MANY_REQUESTS:
              "Trop de requêtes. Veuillez réessayer plus tard.",
            INVALID_TOKEN: "Jeton invalide ou expiré",
            SESSION_EXPIRED: "Session expirée. Veuillez vous reconnecter.",
            BANNED_USER:
              "Votre compte a été banni. Veuillez contacter le support.",
            UNKNOWN_ERROR:
              "Une erreur inconnue s'est produite. Veuillez réessayer.",
          },
          it: {
            INVALID_EMAIL_OR_PASSWORD: "E-mail o password non validi",
            INVALID_PASSWORD: "Password non valida",
            CREDENTIAL_ACCOUNT_NOT_FOUND: "Nessun account con password trovato",
            USER_NOT_FOUND: "Utente non trovato",
            EMAIL_NOT_VERIFIED: "E-mail non verificata",
            TOO_MANY_REQUESTS:
              "Troppe richieste. Per favore riprova più tardi.",
            INVALID_TOKEN: "Token non valido o scaduto",
            SESSION_EXPIRED:
              "Sessione scaduta. Per favore effettua di nuovo il login.",
            BANNED_USER:
              "Il tuo account è stato bandito. Si prega di contattare il supporto.",
            UNKNOWN_ERROR:
              "Si è verificato un errore sconosciuto. Per favore riprova.",
          },
        },
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
      ...additionalPlugins,
    ],

    hooks: {
      after: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/sign-up/email") return;

        const body = ctx.body as { email?: string; name?: string } | undefined;
        if (!body?.email) return;

        const user = await prisma.user.findUnique({
          where: { email: body.email },
        });
        if (!user) return;

        // Create seller profile (non-critical)
        try {
          await prisma.seller.upsert({
            where: { userId: user.id },
            update: {},
            create: {
              userId: user.id,
              phoneNumber: "",
              streetAddress: "",
              zipCode: "",
              city: "",
              country: "ch",
            },
          });
        } catch {}

        // Send welcome email (fire-and-forget)
        void (async () => {
          try {
            const { sendEmail } = await import("@repo/transactional");
            const { SellerWelcomeEmail } = await import(
              "@repo/transactional/emails/seller-welcome"
            );
            const soloUrl =
              process.env.NEXT_PUBLIC_SOLO_URL ?? "https://autosolo.ch";
            await sendEmail({
              to: user.email,
              subject: `Welcome to AutoSolo – your account is ready`,
              template: SellerWelcomeEmail({
                sellerName: user.name,
                dashboardUrl: `${soloUrl}/dashboard`,
              }),
            });
          } catch {}
        })();
      }),
    },
  });
}

export const auth = await createAuth();
export { stripeClient };

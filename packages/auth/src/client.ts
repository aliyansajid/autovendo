import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";

// Cast to any to avoid TS2742 — internal stripe/better-auth types can't be named in declaration files
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [
    adminClient(),
    stripeClient({
      subscription: true,
    }),
  ],
}) as any;

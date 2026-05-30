import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { stripeClient } from "@better-auth/stripe/client";
import { ac, admin, dealer, user } from "./permissions";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authClient: any = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_URL ?? "https://api.autovendo.ch",
  plugins: [
    adminClient({ ac, roles: { admin, dealer, user } }),
    stripeClient({
      subscription: true,
    }),
  ],
});

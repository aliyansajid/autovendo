import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

// Better Auth runs inside the NestJS API (apps/api) at `${API}/api/auth`, so the
// client base URL is the API origin — the same host the data layer uses.
// Dev: http://<LAN-IP>:4000   Prod: https://api.autovendo.ch
const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: "autovendo",
      storagePrefix: "autovendo",
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

import { createAuthClient } from 'better-auth/react';
import { expoClient } from '@better-auth/expo/client';
import * as SecureStore from 'expo-secure-store';

// Set EXPO_PUBLIC_AUTH_URL in .env.local
// Development: http://YOUR_LOCAL_IP:3000
// Production:  https://autovendo.ch
const baseURL = process.env.EXPO_PUBLIC_AUTH_URL ?? 'http://localhost:3000';

export const authClient = createAuthClient({
  baseURL,
  plugins: [
    expoClient({
      scheme: 'autovendo',
      storagePrefix: 'autovendo',
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

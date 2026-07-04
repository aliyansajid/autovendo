// ─────────────────────────────────────────────────────────────────────────────
// Native Google Sign-In → Better Auth.
//
// Instead of the browser redirect flow, we use Google's native account picker
// (@react-native-google-signin) and forward the returned ID token to the API.
// Better Auth verifies the token's `aud` against the clientId array configured
// in apps/api/src/auth.ts (web + ios + android) and signs the user in directly —
// no browser, no redirect. Requires a custom dev build (not Expo Go).
// ─────────────────────────────────────────────────────────────────────────────

import {
  GoogleSignin,
  isSuccessResponse,
  isErrorWithCode,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { authClient } from "./auth-client";

// webClientId is what the returned ID token is minted for (its `aud`), so it must
// be the Web client — the first entry of the API's Google clientId array.
GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
});

/** Signals the user dismissed the native picker — callers should stay silent. */
export class GoogleSignInCancelled extends Error {}

export async function signInWithGoogle(): Promise<void> {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

  let response;
  try {
    response = await GoogleSignin.signIn();
  } catch (err) {
    if (
      isErrorWithCode(err) &&
      (err.code === statusCodes.SIGN_IN_CANCELLED ||
        err.code === statusCodes.IN_PROGRESS)
    ) {
      throw new GoogleSignInCancelled();
    }
    throw err;
  }

  if (!isSuccessResponse(response)) {
    // User dismissed the picker.
    throw new GoogleSignInCancelled();
  }

  const idToken = response.data.idToken;
  if (!idToken) throw new Error("google_no_id_token");

  const { error } = await authClient.signIn.social({
    provider: "google",
    idToken: { token: idToken },
  });
  if (error) throw new Error(error.message ?? "google_sign_in_failed");
}

/**
 * Generates an Apple client secret JWT (valid 6 months).
 * Run: npx tsx packages/auth/scripts/generate-apple-secret.ts
 *
 * Required env vars:
 *   APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY
 */
import { importPKCS8, SignJWT } from "jose";

const { APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY } =
  process.env;

if (!APPLE_CLIENT_ID || !APPLE_TEAM_ID || !APPLE_KEY_ID || !APPLE_PRIVATE_KEY) {
  console.error(
    "Missing required env vars: APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY",
  );
  process.exit(1);
}

const key = await importPKCS8(APPLE_PRIVATE_KEY, "ES256");
const now = Math.floor(Date.now() / 1000);

const secret = await new SignJWT({})
  .setProtectedHeader({ alg: "ES256", kid: APPLE_KEY_ID })
  .setIssuer(APPLE_TEAM_ID)
  .setSubject(APPLE_CLIENT_ID)
  .setAudience("https://appleid.apple.com")
  .setIssuedAt(now)
  .setExpirationTime(now + 180 * 24 * 60 * 60)
  .sign(key);

console.log("\nAPPLE_CLIENT_SECRET=" + secret);
console.log(
  "\nAdd this to your .env. Rotate before",
  new Date((now + 180 * 24 * 60 * 60) * 1000).toDateString(),
);

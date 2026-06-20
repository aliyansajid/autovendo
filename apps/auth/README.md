# apps/auth

Standalone authentication portal for AutoVendo. Handles sign-up, login, password reset, and social sign-in for all AutoVendo apps. Runs at `https://auth.autovendo.ch`.

---

## Getting Started

### Prerequisites

Copy `.env.local` and fill in the required values:

```bash
NEXT_PUBLIC_API_URL=https://api.autovendo.ch     # Better Auth API base URL
NEXT_PUBLIC_APP_URL=https://seller.autovendo.ch  # Post-auth redirect destination
NEXT_PUBLIC_AUTH_URL=https://auth.autovendo.ch   # This app's own URL
```

### Development

```bash
npm run dev          # http://localhost:3000
npm run build
npm run start
npm run lint
npm run check-types
```

---

## Pages

| Route | Description |
|---|---|
| `/[locale]/login` | Sign in with email/password or social provider |
| `/[locale]/signup` | Create a new account |
| `/[locale]/forgot-password` | Request a password reset email |
| `/[locale]/reset-password` | Set a new password via token from email |

Supported locales: `de` (default), `en`, `fr`, `it`. The locale is always present as a URL prefix.

---

## How It Works

This app is a thin Next.js frontend — it holds no auth logic. All auth state is owned by `apps/api` (Better Auth). Session cookies are set by the API with `domain: autovendo.ch` so they are shared across all subdomains automatically.

### Redirecting users here

Any app can redirect unauthenticated users to this portal with a `callbackUrl` parameter:

```
https://auth.autovendo.ch/de/login?callbackUrl=https://seller.autovendo.ch/de/dashboard
```

After authentication completes, the user is sent to that URL. If no `callbackUrl` is provided, the user is sent to `NEXT_PUBLIC_APP_URL/[locale]/dashboard`.

---

## Auth Flows

### Sign Up

1. User submits name, email, and password.
2. `POST /api/auth/sign-up/email` — API creates the user. No session is issued yet because email verification is required.
3. Better Auth sends a verification email to the user.
4. Portal shows a "Check your email" screen. User can request a resend.
5. User clicks the link in the email → Better Auth verifies the token, creates a session, and redirects the browser to `callbackUrl`.

### Login

1. User submits email and password.
2. `POST /api/auth/sign-in/email` — API verifies credentials.
3. On failure, an error toast is shown. A 403 means the email is not yet verified.
4. On success, the session cookie is set and the portal redirects to `callbackUrl`.

### Forgot Password

1. User submits their email address.
2. `POST /api/auth/forget-password` — API sends a reset email containing a short-lived token.
3. A success response is always shown regardless of whether the email exists, to prevent user enumeration.

### Reset Password

1. User arrives at `/reset-password?token=...` from the email link.
2. If the token is missing, an invalid link screen is shown with a link back to Forgot Password.
3. User submits a new password.
4. `POST /api/auth/reset-password` — API resets the password and revokes all existing sessions.
5. On success, the user is redirected to `/login`.

### Social Sign-In (Google & Apple)

1. User clicks a social provider button.
2. `POST /api/auth/sign-in/social` — API returns the provider's OAuth authorization URL.
3. Portal redirects the browser to that URL (Google or Apple consent screen).
4. After the user authenticates, the provider redirects back to the API callback endpoint.
5. Better Auth processes the callback, sets the session cookie, and redirects to `callbackUrl`.

---

## OAuth Setup

The following redirect URIs must be registered with each provider. The portal itself has no callback routes — all OAuth callbacks are handled by the API.

| Provider | Redirect URI |
|---|---|
| Google | `https://api.autovendo.ch/api/auth/callback/google` |
| Apple | `https://api.autovendo.ch/api/auth/callback/apple` |

**Google:** Google Cloud Console → APIs & Services → Credentials → OAuth Client → Authorized Redirect URIs.

**Apple:** Developer Portal → Certificates, Identifiers & Profiles → Service ID → Sign In with Apple → Configure → Return URLs.

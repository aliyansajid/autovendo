# AutoVendo — Auth

Standalone authentication portal for AutoVendo. Handles sign-up, login, and password reset for all AutoVendo apps.

## Routes

| Route | Description |
|---|---|
| `/[locale]` | Redirects to `/[locale]/login` |
| `/[locale]/login` | Sign in with email and password |
| `/[locale]/signup` | Create a new account |
| `/[locale]/forgot-password` | Request a password reset email |
| `/[locale]/reset-password` | Set a new password via reset token |

## Locales

Supports `de` (default), `en`, `fr`, `it`. Locale is always prefixed in the URL. Message files live in `messages/`.

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the auth API (e.g. `https://api.autovendo.ch`) |
| `NEXT_PUBLIC_APP_URL` | Seller app URL — used as the post-auth redirect destination |
| `NEXT_PUBLIC_AUTH_URL` | This app's own URL — used to build absolute links in reset emails |

## Stack

- **Framework**: Next.js 16 (App Router)
- **i18n**: next-intl
- **Validation**: Zod + React Hook Form
- **UI**: `@repo/ui`

## Development

```bash
npm run dev       # starts on port 3000
npm run lint
npm run check-types
npm run build
```

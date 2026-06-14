import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? "https://auth.autovendo.ch";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

export async function proxy(request: NextRequest) {
  const cookie = request.headers.get("cookie") ?? "";
  let session: { user?: { role?: string } } | null = null;

  try {
    const res = await fetch(`${API_URL}/api/auth/get-session`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (res.ok) session = await res.json();
  } catch { /* no-op */ }

  if (!session?.user) {
    const loginUrl = new URL(AUTH_URL);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;
  const pathname = request.nextUrl.pathname;

  // Strip locale prefix to get the bare path (e.g. /de/dealer/dashboard → /dealer/dashboard)
  const locale = pathname.split("/")[1] ?? "de";
  const pathWithoutLocale = pathname.slice(locale.length + 1) || "/";

  if (role === "dealer" && !pathWithoutLocale.startsWith("/dealer")) {
    return NextResponse.redirect(new URL(`/${locale}/dealer/dashboard`, request.url));
  }

  if (role === "user" && pathWithoutLocale.startsWith("/dealer")) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};

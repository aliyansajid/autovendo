import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Run next-intl middleware
  const response = intlMiddleware(request);

  // Check if it's a dashboard route
  const isDashboardRoute = pathname.match(
    /^\/(de|en|fr|it)\/dashboard(\/.*)?$/,
  );

  if (isDashboardRoute) {
    const cookie = request.headers.get("cookie") ?? "";
    let session: { user?: unknown } | null = null;

    try {
      const res = await fetch(`${API_BASE}/api/auth/get-session`, {
        headers: { cookie },
        cache: "no-store",
      });
      if (res.ok) session = await res.json();
    } catch {}

    if (!session?.user) {
      const locale = pathname.split("/")[1] || routing.defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: ["/", "/(de|en|fr|it)/:path*"],
};

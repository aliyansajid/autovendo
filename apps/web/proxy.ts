import { auth } from "@repo/auth";
import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Run next-intl middleware
  const response = intlMiddleware(request);

  // Check if it's a dashboard route
  const isDashboardRoute = pathname.match(
    /^\/(de|en|fr|it)\/dashboard(\/.*)?$/,
  );

  if (isDashboardRoute) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      // Extract locale from pathname
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

import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { auth } from "@repo/auth";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // 1. Run internationalization middleware
  const response = intlMiddleware(request);

  // 2. Add authentication check for dashboard routes
  // Note: Better Auth expects headers to be passed correctly
  if (request.nextUrl.pathname.includes("/dashboard")) {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  // Match both internationalized paths and fixed paths like /dashboard
  matcher: [
    "/",
    "/(de|en|fr|it)/:path*",
    "/dashboard/:path*",
    // Skip all internal paths (_next, favicon, etc.)
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ],
};

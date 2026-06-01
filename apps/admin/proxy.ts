import { type NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith("/login");
  const isApiRoute = pathname.startsWith("/api");

  if (isAuthRoute || isApiRoute) {
    return NextResponse.next();
  }

  const cookie = request.headers.get("cookie") ?? "";

  let session: { user?: { role?: string } } | null = null;

  try {
    const res = await fetch(`${API_BASE}/api/auth/get-session`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (res.ok) {
      session = await res.json();
    }
  } catch {}

  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

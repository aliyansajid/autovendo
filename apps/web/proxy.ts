import { NextResponse, type NextRequest } from "next/server";

export default function middleware(request: NextRequest) {
  // Navigation to /dashboard is handled by Server Components
  // using the `unauthorized()` function for access control.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

import { type NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const targetUrl = `${API_BASE}/api/auth${url.pathname.replace(/^\/api\/auth/, "")}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set("x-forwarded-host", url.host);
  headers.set("x-forwarded-proto", url.protocol.replace(":", ""));

  const body =
    request.method !== "GET" && request.method !== "HEAD"
      ? await request.arrayBuffer()
      : undefined;

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body,
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  // Rewrite Set-Cookie domain from .autovendo.ch to autosolo.ch
  const setCookies = response.headers.getSetCookie?.() ?? [];
  if (setCookies.length > 0) {
    responseHeaders.delete("set-cookie");
    for (const cookie of setCookies) {
      const rewritten = cookie
        .replace(/;\s*domain=[^;]*/gi, "")
        .concat("; Domain=autosolo.ch");
      responseHeaders.append("set-cookie", rewritten);
    }
  }

  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

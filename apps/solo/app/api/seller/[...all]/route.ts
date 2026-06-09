import { type NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

async function handler(request: NextRequest) {
  const url = new URL(request.url);
  const targetUrl = `${API_BASE}/api/seller${url.pathname.replace(/^\/api\/seller/, "")}${url.search}`;

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

  return new NextResponse(response.body, {
    status: response.status,
    headers: response.headers,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

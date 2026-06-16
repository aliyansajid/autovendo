/**
 * Billing API client for private sellers.
 * Server-side helpers forward the session cookie from the incoming request.
 * Client-side helpers use credentials: include.
 */

import type { BillingData } from "@/lib/api/vehicles";

export type SellerBillingData = BillingData & { hasStripeCustomer: boolean };

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Server-side helper ───────────────────────────────────────────────────────

async function serverFetch(path: string, init?: RequestInit) {
  const { headers } = await import("next/headers");
  const cookie = (await headers()).get("cookie") ?? "";
  return fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      cookie,
      ...(init?.headers ?? {}),
    },
  });
}

// ─── Client-side helper ───────────────────────────────────────────────────────

function clientFetch(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function getBillingDataFromApi(): Promise<SellerBillingData> {
  try {
    const res = await serverFetch("/seller/billing");
    if (!res.ok) return { hasStripeCustomer: false, paymentMethod: null, invoices: [] };
    const json = await res.json();
    const d = json.data ?? json;
    return {
      hasStripeCustomer: d.hasStripeCustomer ?? false,
      paymentMethod: d.paymentMethod ?? null,
      invoices: d.invoices ?? [],
    };
  } catch {
    return { hasStripeCustomer: false, paymentMethod: null, invoices: [] };
  }
}

export async function apiBillingPortal(
  returnUrl: string,
): Promise<{ url: string } | null> {
  try {
    const res = await clientFetch("/seller/billing/portal", {
      method: "POST",
      body: JSON.stringify({ returnUrl }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

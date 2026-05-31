/**
 * API client for public vehicle search and dealer dashboard.
 * Server-side helpers forward the session cookie from the incoming request.
 */

import type { PaginatedVehicles, VehicleListItem, VehicleFacets } from "@/types/vehicle";

export type SubscriptionStatus = {
  type: "active" | "no_subscription" | "quota_exhausted" | "expired" | "past_due";
  plan: string;
  maxVehicles: number;
  currentCount: number;
  remainingQuota: number;
};

export type PaymentMethod = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

export type Invoice = {
  id: string;
  number: string | null;
  date: number;
  amount: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
};

export type BillingData = {
  paymentMethod: PaymentMethod | null;
  invoices: Invoice[];
};

export type DashboardSummary = {
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  soldCount: number;
  recentVehicles: any[];
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

// ─── Public vehicle search ────────────────────────────────────────────────────

export async function getVehiclesFromApi(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<PaginatedVehicles> {
  const qs = buildQueryString(rawParams);
  const res = await fetch(`${API_BASE}/api/vehicles?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  return res.json();
}

export async function getVehiclesWithFacetsFromApi(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<PaginatedVehicles> {
  const qs = buildQueryString({ ...rawParams, facets: "true" });
  const res = await fetch(`${API_BASE}/api/vehicles?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  return res.json();
}

export async function getVehicleFacetsFromApi(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<{ total: number; facets: VehicleFacets }> {
  const qs = buildQueryString(rawParams);
  const res = await fetch(`${API_BASE}/api/vehicles/facets?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch facets");
  return res.json();
}

export async function getVehicleFromApi(id: string): Promise<any | null> {
  const res = await fetch(`${API_BASE}/api/vehicles/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch vehicle");
  return res.json();
}

export async function getSimilarVehiclesFromApi(
  vehicleId: string,
): Promise<{ vehicles: VehicleListItem[] }> {
  const res = await fetch(`${API_BASE}/api/vehicles/${vehicleId}/similar`, { cache: "no-store" });
  if (!res.ok) return { vehicles: [] };
  return res.json();
}

// ─── Dealer dashboard (authenticated) ────────────────────────────────────────

export async function getDashboardSummaryFromApi(): Promise<DashboardSummary> {
  const res = await serverFetch("/api/dealer/dashboard/summary");
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
}

export async function getSubscriptionStatusFromApi(): Promise<SubscriptionStatus> {
  const res = await serverFetch("/api/dealer/dashboard/subscription");
  if (!res.ok) throw new Error("Failed to fetch subscription status");
  return res.json();
}

export async function getBillingDataFromApi(): Promise<BillingData> {
  const res = await serverFetch("/api/dealer/billing/data");
  if (!res.ok) throw new Error("Failed to fetch billing data");
  return res.json();
}

export async function prepareVehicleListingFromApi(
  existingVehicleId?: string,
): Promise<{ listingId: string; country: string; dealerId: string }> {
  const res = await serverFetch("/api/dealer/dashboard/prepare-listing", {
    method: "POST",
    body: JSON.stringify({ existingVehicleId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to prepare listing");
  }
  return res.json();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildQueryString(params: Record<string, string | string[] | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) qs.append(key, v);
    } else {
      qs.set(key, value);
    }
  }
  return qs.toString();
}

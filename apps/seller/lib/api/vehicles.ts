/**
 * API client for public vehicle search and dealer dashboard.
 * Server-side helpers forward the session cookie from the incoming request.
 */

import type { PaginatedVehicles, VehicleListItem, VehicleFacets, VehicleDetails } from "@/types/vehicle";

export type SubscriptionStatus = {
  type: "active" | "trialing" | "no_subscription" | "quota_exhausted" | "expired" | "past_due";
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

export type Plan = {
  name: string;
  price: number;
  description: string;
  limits: unknown;
  popular: boolean;
  hasTrial: boolean;
  trialDays: number | null;
};

export type CurrentUser = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role?: string;
    [key: string]: unknown;
  };
  session?: unknown;
};

export type SellerProfile = {
  id: string;
  phoneNumber: string | null;
  streetAddress: string | null;
  zipCode: string | null;
  city: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type DashboardSummary = {
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  soldCount: number;
  recentVehicles: VehicleListItem[];
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
  const res = await fetch(`${API_BASE}/vehicles?${qs}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  const json = await res.json();
  return { vehicles: json.data, total: json.total, page: json.page, pageSize: json.pageSize, totalPages: json.totalPages, facets: json.facets };
}

export async function getVehiclesWithFacetsFromApi(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<PaginatedVehicles> {
  return getVehiclesFromApi(rawParams);
}

export async function getVehicleFacetsFromApi(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<{ total: number; facets: VehicleFacets } | null> {
  try {
    const result = await getVehiclesFromApi({ ...rawParams, pageSize: "1" });
    if (!result.facets) return null;
    return { total: result.total, facets: result.facets };
  } catch {
    return null;
  }
}

export async function getVehicleFromApi(id: string): Promise<unknown | null> {
  const res = await fetch(`${API_BASE}/vehicles/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch vehicle");
  const json = await res.json();
  return json.data ?? null;
}

export async function getSimilarVehiclesFromApi(
  _vehicleId: string,
): Promise<{ vehicles: VehicleListItem[] }> {
  return { vehicles: [] };
}

// ─── Dealer dashboard (authenticated) ────────────────────────────────────────

export async function getDashboardSummaryFromApi(): Promise<DashboardSummary> {
  try {
    const res = await serverFetch("/dealer/vehicles?pageSize=100");
    if (!res.ok) return { totalCount: 0, publishedCount: 0, draftCount: 0, soldCount: 0, recentVehicles: [] };
    const json = await res.json();
    const vehicles: VehicleListItem[] = json.data ?? [];
    return {
      totalCount: json.total ?? vehicles.length,
      publishedCount: vehicles.filter((v) => v.status === "PUBLISHED").length,
      draftCount: vehicles.filter((v) => v.status === "DRAFT").length,
      soldCount: vehicles.filter((v) => v.status === "SOLD").length,
      recentVehicles: vehicles.slice(0, 5),
    };
  } catch {
    return { totalCount: 0, publishedCount: 0, draftCount: 0, soldCount: 0, recentVehicles: [] };
  }
}

export async function getSubscriptionStatusFromApi(): Promise<SubscriptionStatus> {
  try {
    const res = await serverFetch("/dealer/subscription");
    if (!res.ok) throw new Error("Failed to fetch subscription");
    const json = await res.json();
    const ACTIVE_STATUSES = ["active", "trialing", "past_due", "unpaid", "incomplete"];
    const sub =
      json.data?.subscriptions?.find((s: any) => ACTIVE_STATUSES.includes(s.status)) ??
      json.data?.subscriptions?.[0];
    const plan = sub?.plan
      ? json.data?.plans?.find((p: any) => p.name.toLowerCase() === sub.plan.toLowerCase())
      : null;
    return {
      type: sub?.status ?? "no_subscription",
      plan: plan?.name ?? "none",
      maxVehicles: (plan?.limits as any)?.vehicles ?? 0,
      currentCount: json.data?.vehicleCount ?? 0,
      remainingQuota: Math.max(0, ((plan?.limits as any)?.vehicles ?? 0) - (json.data?.vehicleCount ?? 0)),
    };
  } catch {
    return { type: "no_subscription", plan: "none", maxVehicles: 0, currentCount: 0, remainingQuota: 0 };
  }
}

export async function getBillingDataFromApi(): Promise<BillingData> {
  try {
    const res = await serverFetch("/dealer/subscription");
    if (!res.ok) return { paymentMethod: null, invoices: [] };
    const json = await res.json();
    return { paymentMethod: json.data?.paymentMethod ?? null, invoices: json.data?.invoices ?? [] };
  } catch {
    return { paymentMethod: null, invoices: [] };
  }
}

export async function prepareVehicleListingFromApi(
  _existingVehicleId?: string,
): Promise<{ listingId: string; country: string; dealerId: string }> {
  // No longer needed — vehicle creation goes directly to POST /dealer/vehicles
  throw new Error("Use createDealerVehicle from client.ts instead");
}

export async function getPlansFromApi(): Promise<Plan[]> {
  const res = await fetch(`${API_BASE}/plans`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export async function getCurrentUserFromApi(): Promise<CurrentUser | null> {
  try {
    const res = await serverFetch("/me");
    if (!res.ok) return null;
    const json = await res.json();
    // /me returns { data: { id, name, email, role, emailVerified } }
    return json.data ? { user: json.data } : json;
  } catch {
    return null;
  }
}

export type SubscriptionData = {
  id: string;
  plan: string;
  status: string;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  cancelAt?: string | null;
  trialEnd?: string | null;
  billingInterval?: string | null;
  stripeSubscriptionId?: string | null;
};

export async function getActiveSubscriptionsFromApi(): Promise<SubscriptionData[]> {
  try {
    const res = await serverFetch("/dealer/subscription");
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.subscriptions ?? [];
  } catch {
    return [];
  }
}

export async function submitContactForm(data: {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message?: string;
}): Promise<{ ok: boolean; message?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, ...body };
}

export async function getSitemapData(): Promise<{
  vehicles: { id: string; updatedAt: string }[];
  dealers: { id: string; updatedAt: string }[];
}> {
  const res = await fetch(`${API_BASE}/sitemap`, { cache: "no-store" });
  if (!res.ok) return { vehicles: [], dealers: [] };
  return res.json();
}

// ─── Seller dashboard (authenticated) ────────────────────────────────────────

export async function getSellerProfileFromApi(): Promise<SellerProfile | null> {
  try {
    const res = await serverFetch("/seller/profile");
    if (!res.ok) return null;
    const json = await res.json();
    const data = json.data;
    if (!data) return null;
    // New shape: { id: sellerId, phoneNumber, ..., user: { id, name, email, image } }
    if ("user" in data) return data as SellerProfile;
    // Old shape: { id: userId, name, email, image, seller: { phoneNumber, ... } }
    return {
      id: data.seller?.id ?? null,
      phoneNumber: data.seller?.phoneNumber ?? null,
      streetAddress: data.seller?.streetAddress ?? null,
      zipCode: data.seller?.zipCode ?? null,
      city: data.seller?.city ?? null,
      user: {
        id: data.id,
        name: data.name,
        email: data.email,
        image: data.image ?? null,
      },
    };
  } catch {
    return null;
  }
}

export async function getMyVehiclesFromApi(): Promise<unknown[]> {
  try {
    const res = await serverFetch("/seller/vehicles");
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function getMyVehicleByIdFromApi(id: string): Promise<VehicleDetails | null> {
  try {
    const res = await serverFetch(`/seller/vehicles/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function getSessionFromApi(): Promise<{
  user: { name: string; email: string; image?: string | null; role?: string };
} | null> {
  try {
    const res = await serverFetch("/me");
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ? { user: json.data } : null;
  } catch {
    return null;
  }
}

export async function getSellerBillingFromApi(): Promise<BillingData> {
  try {
    const res = await serverFetch("/seller/billing");
    if (!res.ok) return { paymentMethod: null, invoices: [] };
    const json = await res.json();
    return json.data ?? { paymentMethod: null, invoices: [] };
  } catch {
    return { paymentMethod: null, invoices: [] };
  }
}

export async function getSellerDashboardSummaryFromApi(): Promise<DashboardSummary> {
  try {
    const res = await serverFetch("/seller/vehicles?pageSize=100");
    if (!res.ok) return { totalCount: 0, publishedCount: 0, draftCount: 0, soldCount: 0, recentVehicles: [] };
    const json = await res.json();
    const vehicles: VehicleListItem[] = json.data ?? [];
    return {
      totalCount: json.total ?? vehicles.length,
      publishedCount: vehicles.filter((v) => v.status === "PUBLISHED").length,
      draftCount: vehicles.filter((v) => v.status === "DRAFT").length,
      soldCount: vehicles.filter((v) => v.status === "SOLD").length,
      recentVehicles: vehicles.slice(0, 5),
    };
  } catch {
    return { totalCount: 0, publishedCount: 0, draftCount: 0, soldCount: 0, recentVehicles: [] };
  }
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

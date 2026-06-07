import { serverFetch, buildQueryString, API_BASE } from "./fetch-helpers";
import type { VehicleListItem, VehicleFacets } from "@/types/vehicle";

type PaginatedVehicles = {
  vehicles: VehicleListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets?: VehicleFacets;
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type DashboardSummary = {
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  soldCount: number;
  recentVehicles: any[];
};

export type SellerProfile = {
  id: string;
  userId: string;
  user: { id: string; name: string; email: string; image: string | null };
  phoneNumber: string;
  streetAddress: string;
  zipCode: string;
  city: string;
  country: string;
};

// ─── Public vehicle search (no auth) ─────────────────────────────────────────

export async function getSellerVehiclesFromApi(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<any> {
  const qs = buildQueryString(rawParams);
  const res = await fetch(`${API_BASE}/api/seller/vehicles?${qs}`, {
    cache: "no-store",
  });
  if (!res.ok)
    return { vehicles: [], total: 0, page: 1, pageSize: 12, totalPages: 0 };
  return res.json();
}

export async function getSellerVehiclesWithFacetsFromApi(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<PaginatedVehicles> {
  const qs = buildQueryString({ ...rawParams, facets: "true" });
  const res = await fetch(`${API_BASE}/api/seller/vehicles?${qs}`, {
    cache: "no-store",
  });
  if (!res.ok)
    return {
      vehicles: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 0,
      facets: undefined,
    };
  return res.json();
}

export async function getSellerVehicleFacetsFromApi(
  rawParams: Record<string, string | string[] | undefined>,
): Promise<{ total: number; facets: any }> {
  const qs = buildQueryString(rawParams);
  const res = await fetch(`${API_BASE}/api/seller/vehicles/facets?${qs}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch facets");
  return res.json();
}

export async function getSellerVehicleFromApi(id: string): Promise<any | null> {
  const res = await fetch(`${API_BASE}/api/seller/vehicles/${id}`, {
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export async function getSimilarSellerVehiclesFromApi(
  vehicleId: string,
): Promise<{ vehicles: any[] }> {
  const res = await fetch(
    `${API_BASE}/api/seller/vehicles/${vehicleId}/similar`,
    { cache: "no-store" },
  );
  if (!res.ok) return { vehicles: [] };
  return res.json();
}

// ─── Seller dashboard (authenticated, server-side) ────────────────────────────

export async function getDashboardSummaryFromApi(): Promise<DashboardSummary> {
  const res = await serverFetch("/api/seller/vehicles/my/summary");
  if (!res.ok)
    return {
      totalCount: 0,
      publishedCount: 0,
      draftCount: 0,
      soldCount: 0,
      recentVehicles: [],
    };
  return res.json();
}

export async function getMyVehiclesFromApi(): Promise<any[]> {
  const res = await serverFetch("/api/seller/vehicles/my");
  if (!res.ok) return [];
  return res.json();
}

export async function getMyVehicleByIdFromApi(id: string): Promise<any | null> {
  const res = await serverFetch(`/api/seller/vehicles/my/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return res.json();
}

export async function getSellerProfileFromApi(): Promise<SellerProfile | null> {
  const res = await serverFetch("/api/seller/profile");
  if (!res.ok) return null;
  return res.json();
}

// ─── Auth (server-side session) ───────────────────────────────────────────────

export async function getSessionFromApi(): Promise<{
  user?: { name: string; email: string; image?: string | null };
} | null> {
  const res = await serverFetch("/api/auth/get-session");
  if (!res.ok) return null;
  return res.json();
}

// ─── Sitemap ──────────────────────────────────────────────────────────────────

export async function getVehiclesForSitemapFromApi(): Promise<
  { id: string; updatedAt: string }[]
> {
  const res = await fetch(
    `${API_BASE}/api/sitemap?sellerOnly=true`,
    { cache: "no-store" },
  );
  if (!res.ok) return [];
  const { vehicles } = await res.json();
  return vehicles ?? [];
}

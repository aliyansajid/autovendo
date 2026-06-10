import type { PaginatedVehicles, VehicleListItem } from "@/types/vehicle";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

function buildQs(
  params: Record<string, string | string[] | undefined>,
): string {
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

export async function getVehiclesFromApi(
  params: Record<string, string | string[] | undefined>,
): Promise<PaginatedVehicles> {
  const qs = buildQs(params);
  const res = await fetch(`${API}/vehicles${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch vehicles");
  const json = await res.json();
  return {
    vehicles: json.data,
    total: json.total,
    page: json.page,
    pageSize: json.pageSize,
    totalPages: json.totalPages,
    facets: json.facets,
  };
}

// Alias — facets are always included in the list response
export const getVehiclesWithFacetsFromApi = getVehiclesFromApi;

export async function getVehicleFacetsFromApi(
  params: Record<string, string | string[] | undefined>,
) {
  try {
    const result = await getVehiclesFromApi({ ...params, pageSize: "1" });
    return { total: result.total, facets: result.facets };
  } catch {
    return null;
  }
}

export async function getSimilarVehiclesFromApi(
  _vehicleId: string,
): Promise<{ vehicles: VehicleListItem[] }> {
  // TODO: implement similar vehicles endpoint in API
  return { vehicles: [] };
}

export async function getFeaturedVehiclesFromApi(): Promise<VehicleListItem[]> {
  const res = await fetch(`${API}/vehicles/featured`, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data ?? [];
}

export async function getVehicleFromApi(id: string): Promise<any | null> {
  const res = await fetch(`${API}/vehicles/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch vehicle");
  const json = await res.json();
  return json.data ?? null;
}

export async function getSitemapData(): Promise<{
  vehicles: { id: string; updatedAt: string }[];
  dealers: { id: string; updatedAt: string }[];
}> {
  try {
    const [vehiclesRes, dealersRes] = await Promise.all([
      fetch(`${API}/vehicles?pageSize=10000`, { cache: "no-store" }),
      fetch(`${API}/dealers?pageSize=10000`, { cache: "no-store" }),
    ]);
    const vehicles = vehiclesRes.ok
      ? ((await vehiclesRes.json()).data ?? [])
      : [];
    const dealers = dealersRes.ok ? ((await dealersRes.json()).data ?? []) : [];
    return { vehicles, dealers };
  } catch {
    return { vehicles: [], dealers: [] };
  }
}

export async function getPlansFromApi(): Promise<any[]> {
  try {
    const res = await fetch(`${API}/plans`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
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
  const res = await fetch(`${API}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, ...body };
}

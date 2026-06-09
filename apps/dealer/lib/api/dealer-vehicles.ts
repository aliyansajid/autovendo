/**
 * API client for dealer vehicle CRUD.
 * Server-side helpers forward the session cookie from the incoming request.
 * Client-side calls rely on the browser sending cookies automatically (credentials: include).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Server-side helpers (RSC / Server Actions) ───────────────────────────────

async function serverFetch(path: string, init?: RequestInit) {
  const { headers } = await import("next/headers");
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      cookie,
      ...(init?.headers ?? {}),
    },
  });
  return res;
}

export async function getDealerVehiclesList() {
  const res = await serverFetch("/api/dealer/vehicles");
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(`Failed to fetch vehicles: ${res.status} ${JSON.stringify(body)}`);
  }
  const json = await res.json();
  return json.data as DealerVehicleListItem[];
}

export async function getDealerVehicleById(id: string) {
  const res = await serverFetch(`/api/dealer/vehicles/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch vehicle");
  return res.json();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DealerVehicleListItem {
  id: string;
  make: string;
  model: string | null;
  version: string | null;
  vehicleType: string;
  bodyType: string;
  price: number;
  kilometer: number;
  registrationMonth: number;
  registrationYear: number;
  color: string;
  fuelType: string | null;
  status: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

// ─── Client-side helpers (Client Components) ─────────────────────────────────

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

export async function apiCreateVehicle(
  data: Record<string, any>,
  imageKeys: string[],
) {
  const res = await clientFetch("/api/dealer/vehicles", {
    method: "POST",
    body: JSON.stringify({
      ...data,
      images: imageKeys,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to create vehicle");
  }
  return res.json();
}

export async function apiUpdateVehicle(
  id: string,
  data: Record<string, any>,
  imageKeys: string[],
) {
  const res = await clientFetch(`/api/dealer/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      ...data,
      images: imageKeys,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update vehicle");
  }
  return res.json();
}

export async function apiDeleteVehicle(id: string) {
  const res = await clientFetch(`/api/dealer/vehicles/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to delete vehicle");
  }
}

export async function apiGetPresignedUrls(
  listingId: string,
  files: { name: string; type: string }[],
): Promise<{ url: string; key: string }[]> {
  const res = await clientFetch("/api/dealer/storage/presign", {
    method: "POST",
    body: JSON.stringify({ listingId, files }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to get presigned URLs");
  }
  return res.json();
}

export async function apiCleanupImages(keys: string[]): Promise<void> {
  if (!keys.length) return;
  await clientFetch("/api/dealer/storage/cleanup", {
    method: "DELETE",
    body: JSON.stringify({ keys }),
  });
}

export async function apiUpdateVehicleStatus(id: string, status: string) {
  const res = await clientFetch(`/api/dealer/vehicles/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update status");
  }
  return res.json();
}

/**
 * Dealer vehicle API helpers — thin wrappers around client.ts.
 */

export type { } from "@/lib/api/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Server-side helpers ──────────────────────────────────────────────────────

async function serverFetch(path: string, init?: RequestInit) {
  const { headers } = await import("next/headers");
  const cookie = (await headers()).get("cookie") ?? "";
  return fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: { "Content-Type": "application/json", cookie, ...(init?.headers ?? {}) },
  });
}

export async function getDealerVehiclesList() {
  const res = await serverFetch("/dealer/vehicles");
  if (!res.ok) throw new Error(`Failed to fetch vehicles: ${res.status}`);
  const json = await res.json();
  return (json.data ?? []) as DealerVehicleListItem[];
}

export async function getDealerVehicleById(id: string) {
  const res = await serverFetch(`/dealer/vehicles/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch vehicle");
  const json = await res.json();
  return json.data ?? null;
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

// ─── Client-side helpers ──────────────────────────────────────────────────────

function clientFetch(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

export async function apiCreateVehicle(data: Record<string, unknown>, imageKeys: string[]) {
  const res = await clientFetch("/dealer/vehicles", {
    method: "POST",
    body: JSON.stringify({ ...data, images: imageKeys }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to create vehicle");
  }
  return res.json();
}

export async function apiUpdateVehicle(id: string, data: Record<string, unknown>, imageKeys: string[]) {
  const res = await clientFetch(`/dealer/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...data, images: imageKeys }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to update vehicle");
  }
  return res.json();
}

export async function apiDeleteVehicle(id: string) {
  const res = await clientFetch(`/dealer/vehicles/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to delete vehicle");
  }
}

export async function apiUpdateVehicleStatus(id: string, status: string) {
  const res = await clientFetch(`/dealer/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to update status");
  }
  return res.json();
}

export async function apiGetPresignedUrls(
  _listingId: string,
  files: { name: string; type: string }[],
): Promise<{ url: string; key: string }[]> {
  const res = await clientFetch("/upload/presign", {
    method: "POST",
    body: JSON.stringify({ files }),
  });
  if (!res.ok) throw new Error("Failed to get upload URLs");
  return res.json();
}

export async function apiCleanupImages(_keys: string[]): Promise<void> {
  // TODO: implement when storage cleanup endpoint is added
}

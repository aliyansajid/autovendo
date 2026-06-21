/**
 * Dealer vehicle API helpers.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.autovendo.ch";

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

export async function apiUploadImages(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));
  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload images");
  const data: { key: string }[] = await res.json();
  return data.map((d) => d.key);
}

export function apiUploadImagesWithProgress(
  files: File[],
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/upload`);
    xhr.withCredentials = true;

    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new Error("Upload aborted"));
      });
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress((e.loaded / e.total) * 100);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data: { key: string }[] = JSON.parse(xhr.responseText);
          resolve(data.map((d) => d.key));
        } catch {
          reject(new Error("Failed to parse upload response"));
        }
      } else {
        reject(new Error("Failed to upload images"));
      }
    };

    xhr.onerror = () => reject(new Error("Failed to upload images"));
    xhr.send(formData);
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function apiCleanupImages(_keys: string[]): Promise<void> {
  // No-op: storage cleanup is handled server-side on vehicle delete/update
}

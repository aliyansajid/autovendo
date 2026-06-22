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

type VehicleImage = File | string;

// One multipart call carries the vehicle data (JSON `data`) plus any newly picked
// image files; existing images stay as keys in `existingImages`. The API uploads
// new files, deletes removed ones, and writes the row. XHR keeps the progress bar.
function submitVehicle(
  path: string,
  method: "POST" | "PUT",
  data: Record<string, unknown>,
  images: VehicleImage[],
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
): Promise<{ data?: { id?: string } } & Record<string, unknown>> {
  const existingImages = images.filter(
    (i): i is string => typeof i === "string",
  );
  const files = images.filter((i): i is File => i instanceof File);

  const form = new FormData();
  form.append("data", JSON.stringify({ ...data, existingImages }));
  files.forEach((f) => form.append("images", f));

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, `${API_BASE}${path}`);
    xhr.withCredentials = true;

    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new DOMException("Aborted", "AbortError"));
      });
    }

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress((e.loaded / e.total) * 100);
      }
    };

    xhr.onload = () => {
      const body = (() => {
        try {
          return JSON.parse(xhr.responseText || "{}");
        } catch {
          return {};
        }
      })();
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(body);
      } else {
        reject(new Error(body.error || body.message || "Failed to save vehicle"));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(form);
  });
}

export async function apiCreateVehicle(
  data: Record<string, unknown>,
  images: VehicleImage[],
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
) {
  return submitVehicle("/dealer/vehicles", "POST", data, images, onProgress, signal);
}

export async function apiUpdateVehicle(
  id: string,
  data: Record<string, unknown>,
  images: VehicleImage[],
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
) {
  return submitVehicle(
    `/dealer/vehicles/${id}`,
    "PUT",
    data,
    images,
    onProgress,
    signal,
  );
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

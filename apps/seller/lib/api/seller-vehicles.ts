/**
 * Private seller vehicle API helpers.
 * Client-side calls rely on credentials: include (browser sends cookies).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.autovendo.ch";

function clientFetch(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

// ─── Vehicle CRUD ─────────────────────────────────────────────────────────────

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
  return submitVehicle("/seller/vehicles", "POST", data, images, onProgress, signal);
}

export async function apiUpdateVehicle(
  id: string,
  data: Record<string, unknown>,
  images: VehicleImage[],
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
) {
  return submitVehicle(
    `/seller/vehicles/${id}`,
    "PUT",
    data,
    images,
    onProgress,
    signal,
  );
}

export async function apiDeleteVehicle(id: string) {
  const res = await clientFetch(`/seller/vehicles/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error || "Failed to delete vehicle",
    );
  }
}

export async function apiUpdateVehicleStatus(
  id: string,
  status: "DRAFT" | "SOLD" | "PUBLISHED",
) {
  const res = await clientFetch(`/seller/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error || "Failed to update status",
    );
  }
  return res.json();
}

// ─── Seller Profile ───────────────────────────────────────────────────────────

// Single call: name/email go to the User table via Better Auth (server-side) and
// the contact fields to the Seller table — all handled by the API in one request.
export async function updateSellerProfile(values: {
  name?: string;
  email?: string;
  phoneNumber?: string;
  streetAddress?: string;
  zipCode?: string;
  city?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await clientFetch("/seller/profile", {
      method: "PUT",
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: (data as { error?: string }).error };
    }
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function apiCreateListingCheckout(
  vehicleId: string,
  planId: string,
  locale: string,
): Promise<string> {
  const res = await clientFetch("/seller/listing/checkout", {
    method: "POST",
    body: JSON.stringify({ vehicleId, planId, locale }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { error?: string }).error || "Failed to create checkout",
    );
  }
  const json = await res.json();
  return json.data?.url ?? json.url ?? json.checkoutUrl ?? "";
}

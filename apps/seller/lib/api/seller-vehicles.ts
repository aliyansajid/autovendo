/**
 * Private seller vehicle API helpers.
 * Client-side calls rely on credentials: include (browser sends cookies).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function clientFetch(path: string, init?: RequestInit) {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
}

// ─── Vehicle CRUD ─────────────────────────────────────────────────────────────

export async function apiCreateVehicle(
  _listingId: string,
  data: Record<string, unknown>,
  imageKeys: string[],
) {
  const res = await clientFetch("/seller/vehicles", {
    method: "POST",
    body: JSON.stringify({ ...data, images: imageKeys }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to create vehicle");
  }
  return res.json();
}

export async function apiUpdateVehicle(
  id: string,
  data: Record<string, unknown>,
  imageKeys: string[],
) {
  const res = await clientFetch(`/seller/vehicles/${id}`, {
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
  const res = await clientFetch(`/seller/vehicles/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to delete vehicle");
  }
}

export async function apiUpdateVehicleStatus(id: string, status: "DRAFT" | "SOLD") {
  const res = await clientFetch(`/seller/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || "Failed to update status");
  }
  return res.json();
}

// ─── Seller Profile ───────────────────────────────────────────────────────────

export async function apiUpdateSellerProfile(
  values: { phoneNumber?: string; streetAddress?: string; zipCode?: string; city?: string },
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await clientFetch("/seller/profile", {
      method: "PUT",
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: (data as { error?: string }).error || "errorDefault" };
    }
    return { success: true };
  } catch {
    return { success: false, error: "errorDefault" };
  }
}

// ─── Billing Portal ───────────────────────────────────────────────────────────

export async function apiBillingPortal(
  _returnUrl: string,
): Promise<{ url: string } | null> {
  try {
    const res = await clientFetch("/seller/billing/portal", { method: "POST" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function apiPrepareListing(_existingVehicleId?: string): Promise<{ listingId: string }> {
  return { listingId: "" };
}

export async function apiGetPresignedUrls(
  _listingId: string,
  _files: { name: string; type: string }[],
): Promise<{ url: string; key: string }[]> {
  return [];
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

export async function apiPublishOrPay(
  _vehicleId: string,
  _locale: string,
): Promise<{ published: true } | { checkoutUrl: string }> {
  // TODO: implement publish/pay flow
  return { published: true };
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
    throw new Error((err as { error?: string }).error || "Failed to create checkout");
  }
  const json = await res.json();
  return json.url ?? json.checkoutUrl ?? "";
}

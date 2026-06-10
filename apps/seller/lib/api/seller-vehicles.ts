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
  data: Record<string, any>,
  imageKeys: string[],
) {
  const res = await clientFetch("/seller/vehicles", {
    method: "POST",
    body: JSON.stringify({ ...data, images: imageKeys }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to create vehicle");
  }
  return res.json();
}

export async function apiUpdateVehicle(
  id: string,
  data: Record<string, any>,
  imageKeys: string[],
) {
  const res = await clientFetch(`/seller/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...data, images: imageKeys }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to update vehicle");
  }
  return res.json();
}

export async function apiDeleteVehicle(id: string) {
  const res = await clientFetch(`/seller/vehicles/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to delete vehicle");
  }
}

export async function apiUpdateVehicleStatus(id: string, status: "DRAFT" | "SOLD") {
  const res = await clientFetch(`/seller/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to update status");
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
      return { success: false, error: (data as any).error || "errorDefault" };
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

// Image upload stubs — implement when storage is configured
export async function apiPrepareListing(_existingVehicleId?: string): Promise<{ listingId: string }> {
  // TODO: implement when listing preparation is needed
  return { listingId: "" };
}

export async function apiGetPresignedUrls(
  _listingId: string,
  _files: { name: string; type: string }[],
): Promise<{ url: string; key: string }[]> {
  // TODO: implement when POST /upload is wired to real storage
  return [];
}

export async function apiPublishOrPay(
  _vehicleId: string,
  _locale: string,
): Promise<{ published: true } | { checkoutUrl: string }> {
  // TODO: implement publish/pay flow
  return { published: true };
}

export async function apiCreateListingCheckout(
  _vehicleId: string,
  _planId: string,
  _locale: string,
): Promise<string> {
  // TODO: implement checkout
  return "";
}

import { clientFetch } from "./fetch-helpers";

// ─── Listing preparation ──────────────────────────────────────────────────────

export async function apiPrepareListing(
  vehicleId?: string,
): Promise<{ listingId: string; sellerId: string; country: string }> {
  const res = await clientFetch("/api/seller/vehicles/my/prepare", {
    method: "POST",
    body: JSON.stringify({ vehicleId }),
  });
  if (!res.ok) throw new Error("Failed to prepare listing");
  return res.json();
}

export async function apiGetPresignedUrls(
  listingId: string,
  files: { name: string; type: string }[],
): Promise<{ url: string; key: string }[]> {
  const res = await clientFetch("/api/seller/vehicles/my/presign", {
    method: "POST",
    body: JSON.stringify({ listingId, files }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to get presigned URLs");
  }
  return res.json();
}

// ─── Vehicle CRUD ─────────────────────────────────────────────────────────────

export async function apiCreateVehicle(
  listingId: string,
  data: Record<string, any>,
  imageKeys: string[],
) {
  const res = await clientFetch("/api/seller/vehicles/my", {
    method: "POST",
    body: JSON.stringify({ listingId, imageKeys, ...data }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error((json as any).error || "Failed to create vehicle");
  return json;
}

export async function apiUpdateVehicle(
  id: string,
  data: Record<string, any>,
  imageKeys: string[],
) {
  const res = await clientFetch(`/api/seller/vehicles/my/${id}`, {
    method: "PUT",
    body: JSON.stringify({ imageKeys, ...data }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error((json as any).error || "Failed to update vehicle");
  return json;
}

export async function apiDeleteVehicle(id: string) {
  const res = await clientFetch(`/api/seller/vehicles/my/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to delete vehicle");
  }
}

export async function apiUpdateVehicleStatus(id: string, status: "DRAFT" | "SOLD") {
  const res = await clientFetch(`/api/seller/vehicles/my/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || "Failed to update status");
  }
  return res.json();
}

export async function apiPublishOrPay(
  id: string,
  locale: string,
): Promise<{ checkoutUrl: string } | { published: true }> {
  const res = await clientFetch(`/api/seller/vehicles/my/${id}/publish`, {
    method: "POST",
    body: JSON.stringify({ locale }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error((json as any).error || "Failed to publish vehicle");
  return json;
}

// ─── Listing checkout ─────────────────────────────────────────────────────────

export async function apiCreateListingCheckout(
  vehicleId: string,
  planId: "standard" | "best_value",
  locale: string,
): Promise<string> {
  const res = await clientFetch("/api/seller/listings/checkout", {
    method: "POST",
    body: JSON.stringify({ vehicleId, planId, locale }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !(data as any).url)
    throw new Error((data as any).error ?? "Failed to create checkout session");
  return (data as any).url;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function apiUpdateSellerProfile(data: {
  phoneNumber: string;
  streetAddress: string;
  zipCode: string;
  city: string;
}): Promise<{ success: boolean; error?: string }> {
  const res = await clientFetch("/api/seller/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}

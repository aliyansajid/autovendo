// ─────────────────────────────────────────────────────────────────────────────
// Authenticated data layer (seller / dealer / me / upload).
//
// Per the Better Auth Expo guide, session-protected requests attach the cookie
// from secure storage manually via `authClient.getCookie()` and use
// `credentials: "omit"` so the manual header isn't clobbered.
// ─────────────────────────────────────────────────────────────────────────────

import { authClient } from "./auth-client";

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function authedRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const cookie = authClient.getCookie();
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "omit",
      headers: {
        Accept: "application/json",
        Cookie: cookie,
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiError(0, "network_error");
  }
  if (!res.ok) throw new ApiError(res.status, `request_failed_${res.status}`);
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

function jsonBody(body: unknown): RequestInit {
  return {
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

// ─── Me ───────────────────────────────────────────────────────────────────────

export type Me = {
  id: string;
  name: string;
  email: string;
  role: string | null;
  emailVerified: boolean;
};

export async function fetchMe(): Promise<Me> {
  const json = await authedRequest<{ data: Me }>("/me");
  return json.data;
}

export function isDealer(me: Me | null | undefined): boolean {
  return me?.role === "dealer";
}

// ─── Owned listing shape (seller & dealer share these fields) ──────────────────

export type OwnedVehicle = {
  id: string;
  make: string;
  model: string | null;
  version: string | null;
  price: number;
  kilometer: number;
  registrationMonth: number | null;
  registrationYear: number;
  kw: number | null;
  hp: number | null;
  fuelType: string | null;
  vehicleCondition: string | null;
  bodyType: string;
  color: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  listingPaidAt?: string | null;
  listingPlan?: string | null;
};

export type OwnedVehiclesResponse = {
  data: OwnedVehicle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

// ─── Seller ─────────────────────────────────────────────────────────────────--

export type SellerProfile = {
  id: string | null;
  phoneNumber: string | null;
  streetAddress: string | null;
  zipCode: string | null;
  city: string | null;
  user: { id: string; name: string; email: string; image: string | null };
};

export async function fetchSellerProfile(): Promise<SellerProfile> {
  const json = await authedRequest<{ data: SellerProfile }>("/seller/profile");
  return json.data;
}

export async function updateSellerProfile(body: {
  phoneNumber?: string;
  streetAddress?: string;
  zipCode?: string;
  city?: string;
}): Promise<SellerProfile> {
  const json = await authedRequest<{ data: SellerProfile }>("/seller/profile", {
    method: "PUT",
    ...jsonBody(body),
  });
  return json.data;
}

// Change account password (works for both seller and dealer). Better Auth
// requires email/password account; OAuth-only users have no password to change.
export function changePassword(body: { currentPassword: string; newPassword: string }): Promise<unknown> {
  return authedRequest("/me/password", { method: "POST", ...jsonBody(body) });
}

export function fetchSellerVehicles(
  query: { page?: number; pageSize?: number; sort?: string } = {},
): Promise<OwnedVehiclesResponse> {
  const qs = new URLSearchParams();
  if (query.page) qs.set("page", String(query.page));
  if (query.pageSize) qs.set("pageSize", String(query.pageSize));
  if (query.sort) qs.set("sort", query.sort);
  const q = qs.toString();
  return authedRequest<OwnedVehiclesResponse>(`/seller/vehicles${q ? `?${q}` : ""}`);
}

// The full owned vehicle (all columns) used to prefill the edit form.
export type VehicleRecord = Record<string, unknown>;

export async function getSellerVehicle(id: string): Promise<VehicleRecord> {
  const json = await authedRequest<{ data: VehicleRecord }>(`/seller/vehicles/${id}`);
  return json.data;
}

export async function createSellerVehicle(body: Record<string, unknown>): Promise<{ id: string }> {
  const json = await authedRequest<{ data: { id: string } }>("/seller/vehicles", {
    method: "POST",
    ...jsonBody(body),
  });
  return json.data;
}

export async function updateSellerVehicle(
  id: string,
  body: Record<string, unknown>,
): Promise<OwnedVehicle> {
  const json = await authedRequest<{ data: OwnedVehicle }>(
    `/seller/vehicles/${id}`,
    { method: "PUT", ...jsonBody(body) },
  );
  return json.data;
}

export function deleteSellerVehicle(id: string): Promise<unknown> {
  return authedRequest(`/seller/vehicles/${id}`, { method: "DELETE" });
}

export async function createSellerListingCheckout(body: {
  vehicleId: string;
  planId: "standard" | "best_value";
  locale: string;
}): Promise<string | null> {
  const json = await authedRequest<{ data: { url: string | null } }>(
    "/seller/listing/checkout",
    { method: "POST", ...jsonBody(body) },
  );
  return json.data.url;
}

export type Invoice = {
  id: string;
  number: string | null;
  date: number;
  amount: number;
  status: string | null;
  hostedUrl: string | null;
  pdfUrl: string | null;
};

export type BillingInfo = {
  hasStripeCustomer: boolean;
  paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number } | null;
  invoices: Invoice[];
};

export async function fetchSellerBilling(): Promise<BillingInfo> {
  const json = await authedRequest<{ data: BillingInfo }>("/seller/billing");
  return json.data;
}

export async function createSellerBillingPortal(): Promise<string | null> {
  const json = await authedRequest<{ data: { url: string | null } }>(
    "/seller/billing/portal",
    { method: "POST" },
  );
  return json.data.url;
}

// ─── Dealer ─────────────────────────────────────────────────────────────────--

export type DealerOpeningHour = {
  id: string;
  day: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type DealerProfile = {
  id: string;
  companyName: string;
  description: string | null;
  website: string | null;
  logo: string | null;
  coverImage: string | null;
  streetAddress: string;
  zipCode: string;
  city: string;
  country: string;
  contactPerson: string;
  phoneNumber: string;
  businessEmail: string;
  googleRating: number | null;
  googleReviewCount: number | null;
  openingHours: DealerOpeningHour[];
  user: { id: string; name: string; email: string; role: string | null; emailVerified: boolean };
};

export async function fetchDealerProfile(): Promise<DealerProfile> {
  const json = await authedRequest<{ data: DealerProfile }>("/dealer/profile");
  return json.data;
}

export type DealerProfileUpdate = {
  companyName?: string;
  description?: string | null;
  website?: string | null;
  streetAddress?: string;
  zipCode?: string;
  city?: string;
  uidNumber?: string;
  contactPerson?: string;
  phoneNumber?: string;
  businessEmail?: string;
  openingHours?: { day: string; isOpen: boolean; openTime: string | null; closeTime: string | null }[];
};

export async function updateDealerProfile(body: DealerProfileUpdate): Promise<DealerProfile> {
  const json = await authedRequest<{ data: DealerProfile }>("/dealer/profile", {
    method: "PUT",
    ...jsonBody(body),
  });
  return json.data;
}

export function fetchDealerVehicles(
  query: { page?: number; pageSize?: number; sort?: string } = {},
): Promise<OwnedVehiclesResponse> {
  const qs = new URLSearchParams();
  if (query.page) qs.set("page", String(query.page));
  if (query.pageSize) qs.set("pageSize", String(query.pageSize));
  if (query.sort) qs.set("sort", query.sort);
  const q = qs.toString();
  return authedRequest<OwnedVehiclesResponse>(`/dealer/vehicles${q ? `?${q}` : ""}`);
}

export async function getDealerVehicle(id: string): Promise<VehicleRecord> {
  const json = await authedRequest<{ data: VehicleRecord }>(`/dealer/vehicles/${id}`);
  return json.data;
}

export async function createDealerVehicle(body: Record<string, unknown>): Promise<{ id: string }> {
  const json = await authedRequest<{ data: { id: string } }>("/dealer/vehicles", {
    method: "POST",
    ...jsonBody(body),
  });
  return json.data;
}

export async function updateDealerVehicle(
  id: string,
  body: Record<string, unknown>,
): Promise<OwnedVehicle> {
  const json = await authedRequest<{ data: OwnedVehicle }>(
    `/dealer/vehicles/${id}`,
    { method: "PUT", ...jsonBody(body) },
  );
  return json.data;
}

export function deleteDealerVehicle(id: string): Promise<unknown> {
  return authedRequest(`/dealer/vehicles/${id}`, { method: "DELETE" });
}

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  priceId: string;
  limits: { vehicles?: number } & Record<string, unknown>;
  popular: boolean;
};

export type DealerSubscriptionRecord = {
  id: string;
  plan: string;
  status: string;
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean | null;
};

export type DealerSubscriptionInfo = {
  subscriptions: DealerSubscriptionRecord[];
  plans: Plan[];
  vehicleCount: number;
  paymentMethod: { brand: string; last4: string; expMonth: number; expYear: number } | null;
  invoices: Invoice[];
};

export async function fetchDealerSubscription(): Promise<DealerSubscriptionInfo> {
  const json = await authedRequest<{ data: DealerSubscriptionInfo }>("/dealer/subscription");
  return json.data;
}

export async function createDealerCheckout(planId: string): Promise<string | null> {
  const json = await authedRequest<{ data: { url: string | null } }>(
    "/dealer/subscription",
    { method: "POST", ...jsonBody({ planId }) },
  );
  return json.data.url;
}

export async function createDealerBillingPortal(): Promise<string | null> {
  const json = await authedRequest<{ data: { url: string | null } }>(
    "/dealer/subscription/portal",
    { method: "POST" },
  );
  return json.data.url;
}

// ─── Upload ─────────────────────────────────────────────────────────────────--

type UploadResult = { key: string; publicUrl: string };

// Uploads local image URIs (from the image picker) to R2 via the API and
// returns the public CDN URLs to store on a listing.
export async function uploadVehicleImages(
  uris: { uri: string; name?: string; mime?: string }[],
): Promise<string[]> {
  const form = new FormData();
  uris.forEach((img, i) => {
    form.append("files", {
      // React Native FormData file shape
      uri: img.uri,
      name: img.name ?? `image_${i}.jpg`,
      type: img.mime ?? "image/jpeg",
    } as unknown as Blob);
  });

  const cookie = authClient.getCookie();
  const res = await fetch(`${API_URL}/upload`, {
    method: "POST",
    credentials: "omit",
    headers: { Cookie: cookie },
    body: form,
  });
  if (!res.ok) throw new ApiError(res.status, `upload_failed_${res.status}`);
  const results = (await res.json()) as UploadResult[];
  return results.map((r) => r.publicUrl);
}

export { ApiError };

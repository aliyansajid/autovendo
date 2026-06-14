const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const json = await res.json().catch(() => ({})) as Record<string, string>;
  if (!res.ok) throw new Error(json.message ?? json.error ?? "API error");
  return json as T;
}

// ─── ME ───────────────────────────────────────────────────────────────────────

export const getMe = () => apiFetch<unknown>("/me");

// ─── DEALER ───────────────────────────────────────────────────────────────────

export const getDealerProfile = () => apiFetch<unknown>("/dealer/profile");
export const updateDealerProfile = (data: Record<string, unknown>) =>
  apiFetch<unknown>("/dealer/profile", { method: "PUT", body: JSON.stringify(data) });
export const getDealerVehicles = (params?: Record<string, string>) =>
  apiFetch<unknown>(`/dealer/vehicles${params ? "?" + new URLSearchParams(params) : ""}`);
export const getDealerVehicle = (id: string) =>
  apiFetch<unknown>(`/dealer/vehicles/${id}`);
export const createDealerVehicle = (data: Record<string, unknown>) =>
  apiFetch<unknown>("/dealer/vehicles", { method: "POST", body: JSON.stringify(data) });
export const updateDealerVehicle = (id: string, data: Record<string, unknown>) =>
  apiFetch<unknown>(`/dealer/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteDealerVehicle = (id: string) =>
  apiFetch<unknown>(`/dealer/vehicles/${id}`, { method: "DELETE" });
export const getDealerSubscription = () => apiFetch<unknown>("/dealer/subscriptions");
export const createCheckoutSession = (planId: string) =>
  apiFetch<unknown>("/dealer/subscription", { method: "POST", body: JSON.stringify({ planId }) });
export const createDealerBillingPortal = () =>
  apiFetch<unknown>("/dealer/subscription/portal", { method: "POST" });

// ─── SELLER ───────────────────────────────────────────────────────────────────

export const getSellerProfile = () => apiFetch<unknown>("/seller/profile");
export const updateSellerProfile = (data: Record<string, unknown>) =>
  apiFetch<unknown>("/seller/profile", { method: "PUT", body: JSON.stringify(data) });
export const getSellerVehicles = (params?: Record<string, string>) =>
  apiFetch<unknown>(`/seller/vehicles${params ? "?" + new URLSearchParams(params) : ""}`);
export const getSellerVehicle = (id: string) =>
  apiFetch<unknown>(`/seller/vehicles/${id}`);
export const createSellerVehicle = (data: Record<string, unknown>) =>
  apiFetch<unknown>("/seller/vehicles", { method: "POST", body: JSON.stringify(data) });
export const updateSellerVehicle = (id: string, data: Record<string, unknown>) =>
  apiFetch<unknown>(`/seller/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteSellerVehicle = (id: string) =>
  apiFetch<unknown>(`/seller/vehicles/${id}`, { method: "DELETE" });
export const getSellerBilling = () => apiFetch<unknown>("/seller/billing");
export const createSellerBillingPortal = () =>
  apiFetch<unknown>("/seller/billing/portal", { method: "POST" });

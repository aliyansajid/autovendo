/**
 * REST API client for the seller app.
 * Used in client components — cookies are sent automatically by the browser.
 */

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as any).message ?? (json as any).error ?? "API error");
  return json as T;
}

// ─── ME ───────────────────────────────────────────────────────────────────────

export const getMe = () => apiFetch<any>("/me");

// ─── DEALER ───────────────────────────────────────────────────────────────────

export const getDealerProfile = () => apiFetch<any>("/dealer/profile");
export const updateDealerProfile = (data: any) =>
  apiFetch<any>("/dealer/profile", { method: "PUT", body: JSON.stringify(data) });
export const getDealerVehicles = (params?: Record<string, string>) =>
  apiFetch<any>(`/dealer/vehicles${params ? "?" + new URLSearchParams(params) : ""}`);
export const getDealerVehicle = (id: string) =>
  apiFetch<any>(`/dealer/vehicles/${id}`);
export const createDealerVehicle = (data: any) =>
  apiFetch<any>("/dealer/vehicles", { method: "POST", body: JSON.stringify(data) });
export const updateDealerVehicle = (id: string, data: any) =>
  apiFetch<any>(`/dealer/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteDealerVehicle = (id: string) =>
  apiFetch<any>(`/dealer/vehicles/${id}`, { method: "DELETE" });
export const getDealerSubscription = () => apiFetch<any>("/dealer/subscriptions");
export const createCheckoutSession = (planId: string) =>
  apiFetch<any>("/dealer/subscription", { method: "POST", body: JSON.stringify({ planId }) });
export const createDealerBillingPortal = () =>
  apiFetch<any>("/dealer/subscription/portal", { method: "POST" });

// ─── SELLER ───────────────────────────────────────────────────────────────────

export const getSellerProfile = () => apiFetch<any>("/seller/profile");
export const updateSellerProfile = (data: any) =>
  apiFetch<any>("/seller/profile", { method: "PUT", body: JSON.stringify(data) });
export const getSellerVehicles = (params?: Record<string, string>) =>
  apiFetch<any>(`/seller/vehicles${params ? "?" + new URLSearchParams(params) : ""}`);
export const getSellerVehicle = (id: string) =>
  apiFetch<any>(`/seller/vehicles/${id}`);
export const createSellerVehicle = (data: any) =>
  apiFetch<any>("/seller/vehicles", { method: "POST", body: JSON.stringify(data) });
export const updateSellerVehicle = (id: string, data: any) =>
  apiFetch<any>(`/seller/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteSellerVehicle = (id: string) =>
  apiFetch<any>(`/seller/vehicles/${id}`, { method: "DELETE" });
export const getSellerBilling = () => apiFetch<any>("/seller/billing");
export const createSellerBillingPortal = () =>
  apiFetch<any>("/seller/billing/portal", { method: "POST" });

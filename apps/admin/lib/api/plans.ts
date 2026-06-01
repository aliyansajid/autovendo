"use client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) return { success: false, error: (data as any)?.error ?? res.statusText };
  return { success: true, data };
}

export async function createPlan(data: Record<string, unknown>) {
  return apiFetch("/api/admin/plans", { method: "POST", body: JSON.stringify(data) });
}

export async function updatePlan(planId: string, data: Record<string, unknown>) {
  return apiFetch(`/api/admin/plans/${planId}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function deletePlan(planId: string) {
  return apiFetch(`/api/admin/plans/${planId}`, { method: "DELETE" });
}

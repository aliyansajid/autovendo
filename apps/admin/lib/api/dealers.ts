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

export async function getDealer(dealerId: string) {
  const res = await fetch(`${API_BASE}/api/admin/dealers/${dealerId}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function createDealer(data: Record<string, unknown>) {
  return apiFetch("/api/admin/dealers", { method: "POST", body: JSON.stringify(data) });
}

export async function updateDealer(dealerId: string, data: Record<string, unknown>) {
  return apiFetch(`/api/admin/dealers/${dealerId}`, { method: "PUT", body: JSON.stringify(data) });
}

export async function removeUser(dealerId: string) {
  return apiFetch(`/api/admin/dealers/${dealerId}`, { method: "DELETE" });
}

export async function banUser(params: { dealerId: string; reason?: string; expiresIn?: number }) {
  return apiFetch(`/api/admin/dealers/${params.dealerId}/ban`, {
    method: "POST",
    body: JSON.stringify({ reason: params.reason, expiresIn: params.expiresIn }),
  });
}

export async function unbanUser(dealerId: string) {
  return apiFetch(`/api/admin/dealers/${dealerId}/unban`, { method: "POST", body: JSON.stringify({}) });
}

export async function setRole(params: { dealerId: string; role: string }) {
  return apiFetch(`/api/admin/dealers/${params.dealerId}/set-role`, {
    method: "POST",
    body: JSON.stringify({ role: params.role }),
  });
}

export async function setUserPasswordAdmin(params: { dealerId: string; userId: string; newPassword: string }) {
  return apiFetch(`/api/admin/dealers/${params.dealerId}/set-password`, {
    method: "POST",
    body: JSON.stringify({ newPassword: params.newPassword }),
  });
}

export async function revokeSession(token: string) {
  return apiFetch(`/api/admin/sessions/${token}`, { method: "DELETE" });
}

export async function revokeAllSessions(dealerId: string) {
  return apiFetch(`/api/admin/dealers/${dealerId}/sessions`, { method: "DELETE" });
}

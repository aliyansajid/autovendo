import type {
  DealerProfile,
  DealerListResult,
  DealerDetail,
  DealerVehiclesResult,
  GooglePlaceData,
} from "@/types/dealer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// serverFetch — for server-side authenticated calls (forwards cookie)
async function serverFetch(path: string, init?: RequestInit) {
  const { headers } = await import("next/headers");
  const cookie = (await headers()).get("cookie") ?? "";
  return fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      cookie,
      ...(init?.headers ?? {}),
    },
  });
}

// buildQueryString — serializes params including arrays
function buildQueryString(params: Record<string, any>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) qs.append(key, String(v));
    } else {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

// ─── Server-side (authenticated) ─────────────────────────────────────────────

export async function getDealerProfileFromApi(): Promise<DealerProfile | null> {
  try {
    const res = await serverFetch("/api/dealer/profile");
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function updateDealerProfileFromApi(
  values: any,
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/dealer/profile`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: (data as any).error || "errorDefault" };
    }
    return res.json();
  } catch {
    return { success: false, error: "errorDefault" };
  }
}

// ─── Public (usable from both server and client) ──────────────────────────────

export async function getDealersFromApi(params: {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}): Promise<DealerListResult> {
  try {
    const qs = buildQueryString({
      q: params.searchQuery,
      page: params.page,
      pageSize: params.pageSize,
    });
    const res = await fetch(
      `${API_BASE}/api/dealers${qs ? `?${qs}` : ""}`,
      { cache: "no-store" },
    );
    if (!res.ok) return { dealers: [], totalCount: 0, totalPages: 0, currentPage: params.page ?? 1 };
    return res.json();
  } catch {
    return { dealers: [], totalCount: 0, totalPages: 0, currentPage: params.page ?? 1 };
  }
}

export async function getDealerByIdFromApi(id: string): Promise<DealerDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/api/dealers/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getDealerVehiclesFromApi(
  dealerId: string,
  page?: number,
  pageSize?: number,
  filters?: Record<string, any>,
  sortBy?: string,
): Promise<DealerVehiclesResult> {
  try {
    const params: Record<string, any> = {
      page,
      pageSize,
      sortBy,
      ...filters,
    };

    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        for (const v of value) qs.append(key, String(v));
      } else {
        qs.set(key, String(value));
      }
    }

    const url = `${API_BASE}/api/dealers/${dealerId}/vehicles${qs.toString() ? `?${qs.toString()}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return { vehicles: [], totalCount: 0, totalPages: 0, currentPage: page ?? 1, hasMore: false };
    }
    return res.json();
  } catch {
    return { vehicles: [], totalCount: 0, totalPages: 0, currentPage: page ?? 1, hasMore: false };
  }
}

export async function sendDealerContactEmailFromApi(
  dealerId: string,
  data: { name: string; phone: string; email: string; message?: string },
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/api/dealers/${dealerId}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { success: false, error: (body as any).error || "errorDefault" };
    }
    return res.json();
  } catch {
    return { success: false, error: "errorDefault" };
  }
}

export async function presignProfileUpload(data: {
  type: "branding" | "profiles";
  filename: string;
  contentType: string;
}): Promise<{ success: boolean; uploadUrl?: string; publicUrl?: string; error?: string }> {
  const res = await fetch(`${API_BASE}/api/dealer/storage/presign-profile`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: (body as any).error };
  return body;
}

export async function getDealerGoogleReviewsFromApi(
  dealerId: string,
): Promise<GooglePlaceData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/dealers/${dealerId}/reviews`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

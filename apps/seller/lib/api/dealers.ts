import type {
  DealerProfile,
  DealerListResult,
  DealerDetail,
  DealerVehiclesResult,
  GooglePlaceData,
} from "@/types/dealer";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.autovendo.ch";

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
function buildQueryString(params: Record<string, unknown>): string {
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
    const res = await serverFetch("/dealer/profile");
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export type DealerProfileUpdate = {
  // Account identity — the API writes these to the User table / Better Auth.
  name?: string;
  email?: string;
  avatar?: File | string | null; // new file, or existing URL (left untouched)
  // Dealer business fields.
  companyName?: string;
  description?: string | null;
  website?: string | null;
  logo?: File | string | null; // new file or existing URL
  coverImage?: File | string | null;
  streetAddress?: string;
  zipCode?: string;
  city?: string;
  country?: string;
  uidNumber?: string;
  contactPerson?: string;
  phoneNumber?: string;
  businessEmail?: string;
  openingHours?: {
    day: string;
    isOpen: boolean;
    openTime?: string | null;
    closeTime?: string | null;
  }[];
};

// Single multipart call: the client sends the data plus any new image files and
// the API does the whole job — uploads logo/cover/avatar to R2, writes the
// Dealer + User rows, and proxies the email change to Better Auth. No
// client-side upload-then-save round-trip.
export async function updateDealerProfile(
  body: DealerProfileUpdate,
): Promise<{ success: boolean; error?: string }> {
  try {
    const form = new FormData();
    for (const [key, value] of Object.entries(body)) {
      if (value == null) continue;
      if (key === "avatar") {
        // Only a newly picked file is sent; an unchanged URL is left as-is.
        if (value instanceof File) form.append("avatar", value);
      } else if (key === "logo" || key === "coverImage") {
        form.append(key, value instanceof File ? value : String(value));
      } else if (key === "openingHours") {
        form.append("openingHours", JSON.stringify(value));
      } else if (!(value instanceof File)) {
        form.append(key, String(value));
      }
    }

    // No Content-Type header — the browser sets the multipart boundary.
    const res = await fetch(`${API_BASE}/dealer/profile`, {
      method: "PUT",
      credentials: "include",
      body: form,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return {
        success: false,
        error: (data as { error?: string }).error || "errorDefault",
      };
    }
    return { success: true };
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
    const res = await fetch(`${API_BASE}/dealers${qs ? `?${qs}` : ""}`, {
      cache: "no-store",
    });
    if (!res.ok)
      return {
        dealers: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: params.page ?? 1,
      };
    return res.json();
  } catch {
    return {
      dealers: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: params.page ?? 1,
    };
  }
}

export async function getDealerByIdFromApi(
  id: string,
): Promise<DealerDetail | null> {
  try {
    const res = await fetch(`${API_BASE}/dealers/${id}`, { cache: "no-store" });
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
  filters?: Record<string, unknown>,
  sortBy?: string,
): Promise<DealerVehiclesResult> {
  try {
    const params: Record<string, unknown> = {
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

    const url = `${API_BASE}/dealers/${dealerId}/vehicles${qs.toString() ? `?${qs.toString()}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return {
        vehicles: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page ?? 1,
        hasMore: false,
      };
    }
    return res.json();
  } catch {
    return {
      vehicles: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page ?? 1,
      hasMore: false,
    };
  }
}

export async function sendDealerContactEmailFromApi(
  dealerId: string,
  data: { name: string; phone: string; email: string; message?: string },
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/dealers/${dealerId}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        success: false,
        error: (body as { error?: string }).error || "errorDefault",
      };
    }
    return res.json();
  } catch {
    return { success: false, error: "errorDefault" };
  }
}

export async function getDealerGoogleReviewsFromApi(
  dealerId: string,
): Promise<GooglePlaceData | null> {
  try {
    const res = await fetch(`${API_BASE}/dealers/${dealerId}/reviews`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

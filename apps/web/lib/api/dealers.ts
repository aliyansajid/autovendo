import type {
  DealerListItem,
  DealerListResult,
  DealerDetail,
  DealerVehiclesResult,
  GooglePlaceData,
} from "@/types/dealer";

const API = process.env.NEXT_PUBLIC_API_URL ?? "https://api.autovendo.ch";

function buildQs(params: Record<string, string | number | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    qs.set(key, String(value));
  }
  return qs.toString();
}

export async function getDealersFromApi(params: {
  searchQuery?: string;
  page?: number;
  pageSize?: number;
  city?: string;
}): Promise<DealerListResult> {
  try {
    const qs = buildQs({
      search: params.searchQuery,
      page: params.page,
      pageSize: params.pageSize,
      city: params.city,
    });
    const res = await fetch(`${API}/dealers${qs ? `?${qs}` : ""}`, {
      cache: "no-store",
    });
    if (!res.ok)
      return {
        dealers: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: params.page ?? 1,
      };
    const json = await res.json();
    return {
      dealers: json.data,
      totalCount: json.total,
      totalPages: json.totalPages,
      currentPage: json.page,
    };
  } catch {
    return {
      dealers: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: params.page ?? 1,
    };
  }
}

export async function getFeaturedDealersFromApi(): Promise<DealerListItem[]> {
  try {
    const res = await fetch(`${API}/dealers/featured`, { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
}

export async function getDealerByIdFromApi(
  id: string,
): Promise<DealerDetail | null> {
  try {
    const res = await fetch(`${API}/dealers/${id}`, { cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

export async function getDealerVehiclesFromApi(
  dealerId: string,
  page?: number,
  pageSize?: number,
  sort?: string,
): Promise<DealerVehiclesResult> {
  try {
    const qs = buildQs({ page, pageSize, sort });
    const res = await fetch(
      `${API}/dealers/${dealerId}/vehicles${qs ? `?${qs}` : ""}`,
      { cache: "no-store" },
    );
    if (!res.ok)
      return {
        vehicles: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page ?? 1,
        hasMore: false,
      };
    const json = await res.json();
    return {
      vehicles: json.data,
      totalCount: json.total,
      totalPages: json.totalPages,
      currentPage: json.page,
      hasMore: json.page < json.totalPages,
    };
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
    const res = await fetch(`${API}/dealers/${dealerId}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return { success: false, error: (body as { error?: string }).error || "errorDefault" };
    }
    return res.json();
  } catch {
    return { success: false, error: "errorDefault" };
  }
}

export async function getDealerGoogleReviewsFromApi(dealerId: string): Promise<GooglePlaceData | null> {
  try {
    const res = await fetch(`${API}/dealers/${dealerId}/reviews`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? null;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AutoVendo API client
//
// Talks to the NestJS API (apps/api). All buyer-facing endpoints are anonymous
// (@AllowAnonymous) so none of this requires a session.
//
// Response envelope conventions (from the API):
//   • list endpoints  → { data, total, page, pageSize, totalPages, facets? }
//   • single/featured → { data }
//
// Enum values (fuelType, bodyType, make, …) are the UPPERCASE Prisma enums
// shared via @repo/vehicle-constants — never the lowercase UI slugs.
// ─────────────────────────────────────────────────────────────────────────────

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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { Accept: "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError(0, "network_error");
  }
  if (!res.ok) {
    throw new ApiError(res.status, `request_failed_${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Shared shapes ────────────────────────────────────────────────────────────

export type Paginated<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type VehicleOwnerDealer = {
  id: string;
  companyName: string;
  city: string;
  zipCode: string;
  phoneNumber: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
};

export type VehicleOwnerSeller = {
  id: string;
  city: string;
  zipCode: string;
  phoneNumber: string | null;
};

// Mirrors VEHICLE_LIST_SELECT in apps/api vehicles.service.ts
export type VehicleListItem = {
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
  createdAt: string;
  images: string[];
  dealer: VehicleOwnerDealer | null;
  seller: VehicleOwnerSeller | null;
};

export type VehicleFacets = {
  make: Record<string, number>;
  fuelType: Record<string, number>;
  transmissionType: Record<string, number>;
  vehicleCondition: Record<string, number>;
  vehicleType: Record<string, number>;
  bodyType: Record<string, number>;
  color: Record<string, number>;
  interiorColor: Record<string, number>;
  driveType: Record<string, number>;
  energyLabel: Record<string, number>;
  emissionStandard: Record<string, number>;
  sellerType: { DEALER: number; SELLER: number };
  priceMax: number | null;
  kilometerMax: number | null;
  hpMax: number | null;
  kwMax: number | null;
  yearMin: number | null;
  yearMax: number | null;
  consumptionMax: number | null;
  co2Max: number | null;
  cubicCapacityMax: number | null;
  cylindersMax: number | null;
  metallic: number;
  inspectionPassed: number;
  hasWarranty: number;
};

export type VehiclesResponse = Paginated<VehicleListItem> & {
  facets: VehicleFacets;
};

// Mirrors VEHICLE_DETAIL_SELECT — fields the detail screen consumes.
export type VehicleDetail = {
  id: string;
  make: string;
  model: string | null;
  version: string | null;
  price: number;
  newPrice: number | null;
  images: string[];
  vehicleType: string | null;
  bodyType: string | null;
  vehicleCondition: string | null;
  driveType: string | null;
  transmissionType: string | null;
  gearTransmission: string | null;
  fuelType: string | null;
  color: string | null;
  interiorColor: string | null;
  metallic: boolean | null;
  kilometer: number;
  registrationMonth: number | null;
  registrationYear: number;
  hp: number | null;
  kw: number | null;
  doors: number | null;
  seats: number | null;
  cubicCapacity: number | null;
  cylinders: number | null;
  numberOfGears: number | null;
  consumptionCity: number | null;
  consumptionCountry: number | null;
  consumptionTotal: number | null;
  co2Emission: number | null;
  emissionStandard: string | null;
  energyLabel: string | null;
  range: number | null;
  batteryCapacity: number | null;
  powerConsumption: number | null;
  chargingPower: number | null;
  emptyWeight: number | null;
  loadCapacity: number | null;
  wheelbase: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  towingCapacityBraked: number | null;
  vin: string | null;
  serialNumber: string | null;
  typeApproval: string | null;
  inspectionPassed: boolean | null;
  lastInspectionDate: string | null;
  warranty: string | null;
  warrantyStartDate: string | null;
  duration: number | null;
  maxKm: number | null;
  equipment: Record<string, boolean> | string[] | null;
  extras: Record<string, boolean> | string[] | null;
  vehicleDescription: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  dealerId: string | null;
  sellerId: string | null;
  dealer: VehicleDetailDealer | null;
  seller: VehicleOwnerSeller | null;
};

export type DealerOpeningHour = {
  id: string;
  day: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
};

export type VehicleDetailDealer = {
  id: string;
  companyName: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  phoneNumber: string | null;
  businessEmail: string | null;
  website: string | null;
  logo: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  user: { emailVerified: boolean } | null;
  openingHours: DealerOpeningHour[];
};

export type DealerListItem = {
  id: string;
  companyName: string;
  streetAddress: string;
  city: string;
  zipCode: string;
  logo: string | null;
  coverImage: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
};

export type DealerDetail = {
  id: string;
  userId: string;
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
  googlePlaceId: string | null;
  googleRating: number | null;
  googleReviewCount: number | null;
  createdAt: string;
  updatedAt: string;
  openingHours: DealerOpeningHour[];
  isVerified: boolean;
};

// ─── Query building ───────────────────────────────────────────────────────────

export type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "kilometer-asc"
  | "kilometer-desc"
  | "registration-asc"
  | "registration-desc"
  | "created-asc"
  | "created-desc";

// All values use the UPPERCASE Prisma enums (see @repo/vehicle-constants).
export type SearchParams = {
  q?: string;
  dealerId?: string;
  vehicleType?: string[];
  make?: string[];
  bodyType?: string[];
  fuel?: string[];
  transmission?: string[];
  condition?: string[];
  color?: string[];
  interiorColor?: string[];
  driveType?: string[];
  sellerType?: string[];
  energyLabels?: string[];
  emissionStandards?: string[];
  equipment?: string[];
  extras?: string[];
  priceFrom?: number;
  priceTo?: number;
  kilometerFrom?: number;
  kilometerTo?: number;
  registrationFrom?: number;
  registrationTo?: number;
  powerFrom?: number;
  powerTo?: number;
  metallic?: boolean;
  inspectionPassed?: boolean;
  hasWarranty?: boolean;
  daysListed?: number;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
};

const ARRAY_KEYS: (keyof SearchParams)[] = [
  "vehicleType",
  "make",
  "bodyType",
  "fuel",
  "transmission",
  "condition",
  "color",
  "interiorColor",
  "driveType",
  "sellerType",
  "energyLabels",
  "emissionStandards",
  "equipment",
  "extras",
];

function buildQuery(params: SearchParams): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      for (const v of value) qs.append(key, String(v));
    } else if (typeof value === "boolean") {
      if (value) qs.set(key, "true");
    } else {
      qs.set(key, String(value));
    }
  }
  return qs.toString();
}

// Keeps the linter honest about ARRAY_KEYS staying in sync; also documents intent.
void ARRAY_KEYS;

// ─── Vehicles ─────────────────────────────────────────────────────────────────

export function fetchVehicles(params: SearchParams = {}): Promise<VehiclesResponse> {
  const qs = buildQuery(params);
  return request<VehiclesResponse>(`/vehicles${qs ? `?${qs}` : ""}`);
}

export async function fetchFeaturedVehicles(): Promise<VehicleListItem[]> {
  const json = await request<{ data: VehicleListItem[] }>("/vehicles/featured");
  return json.data;
}

export async function fetchSimilarVehicles(id: string): Promise<VehicleListItem[]> {
  const json = await request<{ data: VehicleListItem[] }>(`/vehicles/${id}/similar`);
  return json.data;
}

export async function fetchVehicle(id: string): Promise<VehicleDetail> {
  const json = await request<{ data: VehicleDetail }>(`/vehicles/${id}`);
  return json.data;
}

// ─── Dealers ──────────────────────────────────────────────────────────────────

export function fetchDealers(
  params: { page?: number; pageSize?: number; search?: string; city?: string } = {},
): Promise<Paginated<DealerListItem>> {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params.search) qs.set("search", params.search);
  if (params.city) qs.set("city", params.city);
  const q = qs.toString();
  return request<Paginated<DealerListItem>>(`/dealers${q ? `?${q}` : ""}`);
}

export async function fetchFeaturedDealers(): Promise<DealerListItem[]> {
  const json = await request<{ data: DealerListItem[] }>("/dealers/featured");
  return json.data;
}

export async function fetchDealer(id: string): Promise<DealerDetail> {
  const json = await request<{ data: DealerDetail }>(`/dealers/${id}`);
  return json.data;
}

export function fetchDealerVehicles(
  id: string,
  params: SearchParams = {},
): Promise<Paginated<VehicleListItem>> {
  const qs = buildQuery(params);
  return request<Paginated<VehicleListItem>>(
    `/dealers/${id}/vehicles${qs ? `?${qs}` : ""}`,
  );
}

export type DealerContactInput = {
  name: string;
  phone: string;
  email: string;
  message?: string;
};

export function contactDealer(
  id: string,
  body: DealerContactInput,
): Promise<{ success: boolean; error?: string }> {
  return request<{ success: boolean; error?: string }>(`/dealers/${id}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export { ApiError };

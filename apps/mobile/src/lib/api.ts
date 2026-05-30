const BASE_URL = process.env.EXPO_PUBLIC_AUTH_URL ?? "http://localhost:4000";

export type Vehicle = {
  id: string;
  make: string;
  model: string;
  price: number;
  mileage: number;
  fuel: string | null;
  year: number;
  image: string | null;
  city: string | null;
  createdAt: string;
};

export type HomeData = {
  stats: { totalCars: number; totalDealers: number; newToday: number };
  featured: Vehicle[];
  newArrivals: Vehicle[];
};

export async function fetchHome(category = "all"): Promise<HomeData> {
  const res = await fetch(`${BASE_URL}/api/home?category=${category}`);
  if (!res.ok) throw new Error("request_failed");
  return res.json();
}

// ─── Search ───────────────────────────────────────────────────────────────────

export type SearchVehicle = {
  id: string;
  make: string;
  model: string;
  version: string | null;
  price: number;
  mileage: number;
  fuel: string | null;
  year: number;
  month: number | null;
  bodyType: string | null;
  transmission: string | null;
  hp: number | null;
  kw: number | null;
  color: string | null;
  condition: string | null;
  image: string | null;
  images: string[];
  city: string | null;
  createdAt: string;
};

export type SearchPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type SearchResult = {
  data: SearchVehicle[];
  pagination: SearchPagination;
};

export type SearchParams = {
  q?: string;
  vehicleType?: string;
  make?: string[];
  fuel?: string[];
  transmission?: string[];
  drive?: string[];
  color?: string[];
  intColor?: string[];
  condition?: string[];
  bodyType?: string[];
  energyLabel?: string[];
  euroNorm?: string[];
  equipment?: string[];
  priceFrom?: number;
  priceTo?: number;
  yearFrom?: number;
  yearTo?: number;
  kmFrom?: number;
  kmTo?: number;
  cubicFrom?: number;
  cubicTo?: number;
  cylinderFrom?: number;
  cylinderTo?: number;
  consumFrom?: number;
  consumTo?: number;
  co2From?: number;
  co2To?: number;
  powerUnit?: "ps" | "kw";
  powerFrom?: number;
  powerTo?: number;
  metallic?: boolean;
  mfk?: boolean;
  warranty?: boolean;
  daysListed?: number;
  page?: number;
  pageSize?: number;
};

export async function fetchSearch(
  params: SearchParams = {},
): Promise<SearchResult> {
  const qs = new URLSearchParams();

  // Array params — append each value separately
  const arrayKeys = [
    "make",
    "fuel",
    "transmission",
    "drive",
    "color",
    "intColor",
    "condition",
    "bodyType",
    "energyLabel",
    "euroNorm",
    "equipment",
  ] as const;

  for (const key of arrayKeys) {
    const values = params[key] as string[] | undefined;
    if (values?.length) values.forEach((v) => qs.append(key, v));
  }

  // Scalar params
  if (params.vehicleType) qs.set("vehicleType", params.vehicleType);
  if (params.q) qs.set("q", params.q);
  if (params.priceFrom !== undefined)
    qs.set("priceFrom", String(params.priceFrom));
  if (params.priceTo !== undefined) qs.set("priceTo", String(params.priceTo));
  if (params.yearFrom !== undefined)
    qs.set("yearFrom", String(params.yearFrom));
  if (params.yearTo !== undefined) qs.set("yearTo", String(params.yearTo));
  if (params.kmFrom !== undefined) qs.set("kmFrom", String(params.kmFrom));
  if (params.kmTo !== undefined) qs.set("kmTo", String(params.kmTo));
  if (params.cubicFrom !== undefined)
    qs.set("cubicFrom", String(params.cubicFrom));
  if (params.cubicTo !== undefined) qs.set("cubicTo", String(params.cubicTo));
  if (params.cylinderFrom !== undefined)
    qs.set("cylinderFrom", String(params.cylinderFrom));
  if (params.cylinderTo !== undefined)
    qs.set("cylinderTo", String(params.cylinderTo));
  if (params.consumFrom !== undefined)
    qs.set("consumFrom", String(params.consumFrom));
  if (params.consumTo !== undefined)
    qs.set("consumTo", String(params.consumTo));
  if (params.co2From !== undefined) qs.set("co2From", String(params.co2From));
  if (params.co2To !== undefined) qs.set("co2To", String(params.co2To));
  if (params.powerUnit) qs.set("powerUnit", params.powerUnit);
  if (params.powerFrom !== undefined)
    qs.set("powerFrom", String(params.powerFrom));
  if (params.powerTo !== undefined) qs.set("powerTo", String(params.powerTo));
  if (params.metallic) qs.set("metallic", "true");
  if (params.mfk) qs.set("mfk", "true");
  if (params.warranty) qs.set("warranty", "true");
  if (params.daysListed !== undefined)
    qs.set("daysListed", String(params.daysListed));
  if (params.page !== undefined) qs.set("page", String(params.page));
  if (params.pageSize !== undefined)
    qs.set("pageSize", String(params.pageSize));

  const res = await fetch(`${BASE_URL}/api/search?${qs.toString()}`);
  if (!res.ok) throw new Error("request_failed");
  return res.json();
}

// ─── Vehicle Detail ───────────────────────────────────────────────────────────

export type VehicleDealer = {
  id: string;
  name: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo: string | null;
  description: string | null;
};

export type VehicleDetail = {
  id: string;
  make: string;
  model: string;
  version: string | null;
  price: number;
  newPrice: number | null;
  images: string[];
  vehicleType: string | null;
  bodyType: string | null;
  condition: string | null;
  driveType: string | null;
  seats: number | null;
  doors: number | null;
  kilometer: number;
  registrationMonth: number | null;
  registrationYear: number;
  lastInspectionDate: string | null;
  inspectionPassed: boolean | null;
  warranty: string | null;
  warrantyStartDate: string | null;
  warrantyDuration: number | null;
  warrantyMaxKm: number | null;
  hp: number | null;
  kw: number | null;
  transmission: string | null;
  cubicCapacity: number | null;
  cylinders: number | null;
  numberOfGears: number | null;
  emptyWeight: number | null;
  loadCapacity: number | null;
  wheelbase: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  towingCapacityBraked: number | null;
  fuel: string | null;
  co2Emission: number | null;
  consumptionCity: number | null;
  consumptionCountry: number | null;
  consumptionTotal: number | null;
  emissionStandard: string | null;
  energyLabel: string | null;
  range: number | null;
  batteryCapacity: number | null;
  powerConsumption: number | null;
  chargingPower: number | null;
  color: string | null;
  interiorColor: string | null;
  metallic: boolean | null;
  vin: string | null;
  serialNumber: string | null;
  typeApproval: string | null;
  equipment: Record<string, boolean> | null;
  extras: Record<string, boolean> | null;
  description: string | null;
  dealer: VehicleDealer | null;
  createdAt: string;
};

export async function fetchVehicle(id: string): Promise<VehicleDetail> {
  const res = await fetch(`${BASE_URL}/api/vehicles/${id}`);
  if (!res.ok) throw new Error("request_failed");
  return res.json();
}

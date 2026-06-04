import { Hono } from "hono";
import type { Context } from "hono";
import { prisma } from "@repo/db";
import type {
  Prisma,
  FuelType,
  TransmissionType,
  DriveType,
  Color,
  VehicleCondition,
  VehicleType,
  EnergyLabel,
  EmissionStandard,
  BodyType,
  GearTransmission,
  Warranty,
  BatteryOwnership,
  ChargingPlugTypeStandard,
  ChargingPlugTypeFast,
} from "@repo/db";
import {
  VALID_MAKES_BY_TYPE,
  VALID_EQUIPMENT_KEYS,
  VALID_EXTRAS_KEYS_BY_TYPE,
  VehicleTypeEnum,
  GearTransmissionEnum,
  TransmissionTypeEnum,
  DriveTypeEnum,
  ColorEnum,
  VehicleConditionEnum,
  WarrantyEnum,
  EnergyLabelEnum,
  BatteryOwnershipEnum,
  ChargingPlugTypeStandardEnum,
  ChargingPlugTypeFastEnum,
  EmissionStandardEnum,
} from "@repo/vehicle-constants";
import {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
} from "../lib/cache";
import { storage } from "../lib/storage";
import { StorageService } from "@repo/storage";
import { createId } from "@paralleldrive/cuid2";

type Variables = {
  user: { id: string; email: string; role?: string | null } | null;
  session: unknown | null;
};

const router = new Hono<{ Variables: Variables }>();

// ─── Enum sets ────────────────────────────────────────────────────────────────

const VALID_VEHICLE_TYPES = new Set(VehicleTypeEnum.map((v) => v.value));
const VALID_GEAR_TRANSMISSIONS = new Set(
  GearTransmissionEnum.map((v) => v.value),
);
const VALID_TRANSMISSION_TYPES = new Set(
  TransmissionTypeEnum.map((v) => v.value),
);
const VALID_DRIVE_TYPES = new Set(DriveTypeEnum.map((v) => v.value));
const VALID_COLORS = new Set(ColorEnum.map((v) => v.value));
const VALID_CONDITIONS = new Set(VehicleConditionEnum.map((v) => v.value));
const VALID_WARRANTIES = new Set(WarrantyEnum.map((v) => v.value));
const VALID_ENERGY_LABELS = new Set(EnergyLabelEnum.map((v) => v.value));
const VALID_BATTERY_OWNERSHIPS = new Set(
  BatteryOwnershipEnum.map((v) => v.value),
);
const VALID_CHARGING_AC = new Set(
  ChargingPlugTypeStandardEnum.map((v) => v.value),
);
const VALID_CHARGING_DC = new Set(ChargingPlugTypeFastEnum.map((v) => v.value));
const VALID_EMISSION_STANDARDS = new Set(
  EmissionStandardEnum.map((v) => v.value),
);
const VALID_STATUSES = new Set([
  "DRAFT",
  "PUBLISHED",
  "PAUSED",
  "SOLD",
  "ARCHIVED",
]);

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

// ─── Shared SELECT for public vehicle lists ───────────────────────────────────

const PUBLIC_LIST_SELECT = {
  id: true,
  make: true,
  model: true,
  version: true,
  price: true,
  kilometer: true,
  registrationMonth: true,
  registrationYear: true,
  kw: true,
  hp: true,
  fuelType: true,
  vehicleCondition: true,
  bodyType: true,
  color: true,
  createdAt: true,
  images: true,
  status: true,
  equipment: true,
  listingPaidAt: true,
  listingPlan: true,
  seller: {
    select: {
      id: true,
      user: { select: { name: true } },
      city: true,
      zipCode: true,
      phoneNumber: true,
    },
  },
} satisfies Prisma.VehicleSelect;

// ─── Query param helpers ──────────────────────────────────────────────────────

function qi(c: Context, key: string): number | undefined {
  const v = c.req.query(key);
  if (!v) return undefined;
  const n = parseInt(v, 10);
  return isNaN(n) ? undefined : n;
}

function qf(c: Context, key: string): number | undefined {
  const v = c.req.query(key);
  if (!v) return undefined;
  const n = parseFloat(v);
  return isNaN(n) ? undefined : n;
}

function qa(c: Context, key: string): string[] {
  const arr = c.req.queries(key);
  if (arr && arr.length > 0) {
    return arr
      .flatMap((v) => v.split(",").map((s) => s.trim()))
      .filter(Boolean);
  }
  return [];
}

function qb(c: Context, key: string): boolean | undefined {
  const v = c.req.query(key);
  if (v === "true") return true;
  if (v === "false") return false;
  return undefined;
}

function toDbEnum(value: string): string {
  return value.toUpperCase().replace(/-/g, "_");
}

// ─── Param parser ─────────────────────────────────────────────────────────────

function parseParams(c: Context) {
  return {
    page: Math.max(1, qi(c, "page") ?? 1),
    pageSize: Math.min(100, Math.max(1, qi(c, "pageSize") ?? 12)),
    sort: c.req.query("sort"),
    search: c.req.query("search")?.trim() ?? "",
    make: qa(c, "make"),
    model: qa(c, "model"),
    excludeMake: qa(c, "excludeMake"),
    excludeModel: qa(c, "excludeModel"),
    fuel: qa(c, "fuel"),
    transmission: qa(c, "transmission"),
    condition: qa(c, "condition"),
    vehicleType: qa(c, "vehicleType"),
    bodyType: qa(c, "bodyType"),
    color: qa(c, "color"),
    interiorColor: qa(c, "interiorColor"),
    driveType: qa(c, "driveType"),
    energyLabels: qa(c, "energyLabels"),
    emissionStandards: qa(c, "emissionStandards"),
    equipment: qa(c, "equipment"),
    evs: c.req.query("evs") as "only_ev" | "no_ev" | undefined,
    metallic: qb(c, "metallic"),
    inspectionPassed: qb(c, "inspectionPassed"),
    hasWarranty: qb(c, "hasWarranty"),
    priceFrom: qi(c, "priceFrom"),
    priceTo: qi(c, "priceTo"),
    registrationFrom: qi(c, "registrationFrom"),
    registrationTo: qi(c, "registrationTo"),
    kilometerFrom: qi(c, "kilometerFrom"),
    kilometerTo: qi(c, "kilometerTo"),
    powerFrom: qi(c, "powerFrom"),
    powerTo: qi(c, "powerTo"),
    kwFrom: qi(c, "kwFrom"),
    kwTo: qi(c, "kwTo"),
    cubicCapacityFrom: qi(c, "cubicCapacityFrom"),
    cubicCapacityTo: qi(c, "cubicCapacityTo"),
    cylindersFrom: qi(c, "cylindersFrom"),
    cylindersTo: qi(c, "cylindersTo"),
    consumptionFrom: qf(c, "consumptionFrom"),
    consumptionTo: qf(c, "consumptionTo"),
    co2From: qi(c, "co2From"),
    co2To: qi(c, "co2To"),
    daysListed: qi(c, "daysListed"),
  };
}

// ─── WHERE clause builder (seller vehicles, published only) ──────────────────

function buildPublicWhere(
  params: ReturnType<typeof parseParams>,
  omit: Partial<Record<string, boolean>> = {},
): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {
    sellerId: { not: null },
    status: "PUBLISHED",
    seller: { user: { banned: { not: true } } },
    OR: [{ listingExpiresAt: null }, { listingExpiresAt: { gte: new Date() } }],
  };

  if (!omit.search && params.search) {
    where.OR = [
      { make: { contains: params.search, mode: "insensitive" } },
      { model: { contains: params.search, mode: "insensitive" } },
      { version: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (!omit.make && params.make.length > 0) {
    const makeOr = params.make.map((m) => ({
      make: { equals: m, mode: "insensitive" as const },
    }));
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { OR: makeOr },
    ];
  }

  if (!omit.model && params.model.length > 0) {
    const modelOr = params.model.map((m) => ({
      model: { equals: m, mode: "insensitive" as const },
    }));
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { OR: modelOr },
    ];
  }

  if (params.excludeMake.length > 0) {
    where.NOT = [
      ...(Array.isArray(where.NOT) ? where.NOT : where.NOT ? [where.NOT] : []),
      { make: { in: params.excludeMake, mode: "insensitive" as const } },
    ];
  }

  if (params.excludeModel.length > 0) {
    where.NOT = [
      ...(Array.isArray(where.NOT) ? where.NOT : where.NOT ? [where.NOT] : []),
      { model: { in: params.excludeModel, mode: "insensitive" as const } },
    ];
  }

  if (
    !omit.priceFrom &&
    (params.priceFrom !== undefined || params.priceTo !== undefined)
  ) {
    where.price = {
      ...(params.priceFrom ? { gte: params.priceFrom } : {}),
      ...(params.priceTo ? { lte: params.priceTo } : {}),
    };
  }

  if (
    !omit.registrationFrom &&
    (params.registrationFrom !== undefined ||
      params.registrationTo !== undefined)
  ) {
    where.registrationYear = {
      ...(params.registrationFrom ? { gte: params.registrationFrom } : {}),
      ...(params.registrationTo ? { lte: params.registrationTo } : {}),
    };
  }

  if (
    !omit.kilometerFrom &&
    (params.kilometerFrom !== undefined || params.kilometerTo !== undefined)
  ) {
    where.kilometer = {
      ...(params.kilometerFrom ? { gte: params.kilometerFrom } : {}),
      ...(params.kilometerTo ? { lte: params.kilometerTo } : {}),
    };
  }

  if (params.powerFrom !== undefined || params.powerTo !== undefined) {
    where.hp = {
      ...(params.powerFrom ? { gte: params.powerFrom } : {}),
      ...(params.powerTo ? { lte: params.powerTo } : {}),
    };
  }

  if (params.kwFrom !== undefined || params.kwTo !== undefined) {
    where.kw = {
      ...(params.kwFrom ? { gte: params.kwFrom } : {}),
      ...(params.kwTo ? { lte: params.kwTo } : {}),
    };
  }

  if (
    params.cubicCapacityFrom !== undefined ||
    params.cubicCapacityTo !== undefined
  ) {
    where.cubicCapacity = {
      ...(params.cubicCapacityFrom ? { gte: params.cubicCapacityFrom } : {}),
      ...(params.cubicCapacityTo ? { lte: params.cubicCapacityTo } : {}),
    };
  }

  if (params.cylindersFrom !== undefined || params.cylindersTo !== undefined) {
    where.cylinders = {
      ...(params.cylindersFrom ? { gte: params.cylindersFrom } : {}),
      ...(params.cylindersTo ? { lte: params.cylindersTo } : {}),
    };
  }

  if (
    params.consumptionFrom !== undefined ||
    params.consumptionTo !== undefined
  ) {
    where.consumptionTotal = {
      ...(params.consumptionFrom ? { gte: params.consumptionFrom } : {}),
      ...(params.consumptionTo ? { lte: params.consumptionTo } : {}),
    };
  }

  if (params.co2From !== undefined || params.co2To !== undefined) {
    where.co2Emission = {
      ...(params.co2From ? { gte: params.co2From } : {}),
      ...(params.co2To ? { lte: params.co2To } : {}),
    };
  }

  if (!omit.evs && params.evs) {
    if (params.evs === "only_ev") where.fuelType = "ELECTRIC";
    else if (params.evs === "no_ev") where.fuelType = { not: "ELECTRIC" };
  }

  if (!omit.fuel && params.fuel.length > 0) {
    where.fuelType = { in: params.fuel.map(toDbEnum) as FuelType[] };
  }

  if (!omit.transmission && params.transmission.length > 0) {
    where.transmissionType = {
      in: params.transmission.map(toDbEnum) as TransmissionType[],
    };
  }

  if (!omit.condition && params.condition.length > 0) {
    where.vehicleCondition = {
      in: params.condition.map(toDbEnum) as VehicleCondition[],
    };
  }

  if (!omit.vehicleType && params.vehicleType.length > 0) {
    where.vehicleType = {
      in: params.vehicleType.map(toDbEnum) as VehicleType[],
    };
  }

  if (!omit.bodyType && params.bodyType.length > 0) {
    const bodyTypeOr = params.bodyType.map((b) => ({
      bodyType: { equals: b, mode: "insensitive" as const },
    }));
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { OR: bodyTypeOr },
    ];
  }

  if (!omit.color && params.color.length > 0) {
    where.color = { in: params.color.map(toDbEnum) as Color[] };
  }

  if (!omit.interiorColor && params.interiorColor.length > 0) {
    where.interiorColor = { in: params.interiorColor.map(toDbEnum) as Color[] };
  }

  if (!omit.driveType && params.driveType.length > 0) {
    where.driveType = { in: params.driveType.map(toDbEnum) as DriveType[] };
  }

  if (!omit.energyLabels && params.energyLabels.length > 0) {
    where.energyLabel = {
      in: params.energyLabels.map(toDbEnum) as EnergyLabel[],
    };
  }

  if (!omit.emissionStandards && params.emissionStandards.length > 0) {
    where.emissionStandard = {
      in: params.emissionStandards.map(toDbEnum) as EmissionStandard[],
    };
  }

  if (!omit.metallic && params.metallic !== undefined)
    where.metallic = params.metallic;
  if (!omit.inspectionPassed && params.inspectionPassed === true)
    where.inspectionPassed = true;
  if (!omit.hasWarranty && params.hasWarranty === true)
    where.warranty = { not: null };

  if (!omit.daysListed && params.daysListed != null) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - params.daysListed);
    where.createdAt = { gte: cutoff };
  }

  if (!omit.equipment && params.equipment.length > 0) {
    const equipmentClauses = params.equipment.map((item) => ({
      equipment: { path: [item], equals: true },
    }));
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      ...equipmentClauses,
    ];
  }

  return where;
}

// ─── Order by builder ─────────────────────────────────────────────────────────

function buildOrderBy(
  sort: string | undefined,
): Prisma.VehicleOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "kilometer-asc":
      return { kilometer: "asc" };
    case "kilometer-desc":
      return { kilometer: "desc" };
    case "registration-asc":
      return { registrationYear: "asc" };
    case "registration-desc":
      return { registrationYear: "desc" };
    case "created-asc":
      return { createdAt: "asc" };
    case "created-desc":
      return { createdAt: "desc" };
    default:
      return { createdAt: "desc" };
  }
}

// ─── Facet helpers ────────────────────────────────────────────────────────────

function toFacetCounts<T extends string>(
  rows: Array<{ [K in T]: string | null } & { _count: { _all: number } }>,
  field: T,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const value = row[field];
    if (value) counts[value] = row._count._all;
  }
  return counts;
}

function toFrontendFacetKeys(
  counts: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, count] of Object.entries(counts)) {
    const normalized = key.toLowerCase().replace(/_/g, "-");
    out[normalized] = (out[normalized] ?? 0) + count;
  }
  return out;
}

function toLowerFacetKeys(
  counts: Record<string, number>,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [key, count] of Object.entries(counts)) {
    const k = key.toLowerCase();
    out[k] = (out[k] ?? 0) + count;
  }
  return out;
}

// ─── Price rating ─────────────────────────────────────────────────────────────

async function fetchAvgPriceMap(): Promise<Map<string, number>> {
  const rows = await prisma.vehicle.groupBy({
    by: ["make", "model"],
    _avg: { price: true },
  });
  const map = new Map<string, number>();
  for (const row of rows) {
    if (row._avg.price != null)
      map.set(`${row.make}::${row.model ?? ""}`, row._avg.price);
  }
  return map;
}

function computePriceRating(price: number, avgPrice: number) {
  const pct = (price - avgPrice) / avgPrice;
  if (pct > 0.2) return { label: "overpriced", bars: 1, sentiment: "red" };
  if (pct > 0.05) return { label: "fair", bars: 2, sentiment: "yellow" };
  if (pct > -0.05) return { label: "good", bars: 3, sentiment: "green" };
  if (pct > -0.2) return { label: "veryGood", bars: 4, sentiment: "green" };
  return { label: "excellent", bars: 5, sentiment: "green" };
}

function attachPriceRatings(
  vehicles: any[],
  avgMap: Map<string, number>,
): any[] {
  return vehicles.map((v) => {
    const avg = avgMap.get(`${v.make}::${v.model ?? ""}`);
    return {
      ...v,
      priceRating: avg != null ? computePriceRating(v.price, avg) : undefined,
    };
  });
}

// ─── Body validation ──────────────────────────────────────────────────────────

function validateBody(body: Record<string, any>): string | null {
  if (!VALID_VEHICLE_TYPES.has(body.vehicleType))
    return `Invalid vehicleType: ${body.vehicleType}`;
  const validMakes = VALID_MAKES_BY_TYPE[body.vehicleType as string];
  if (!validMakes?.includes(body.make))
    return `Invalid make for vehicleType ${body.vehicleType}: ${body.make}`;
  if (!VALID_COLORS.has(body.color)) return `Invalid color: ${body.color}`;
  if (
    body.gearTransmission &&
    !VALID_GEAR_TRANSMISSIONS.has(body.gearTransmission)
  )
    return `Invalid gearTransmission: ${body.gearTransmission}`;
  if (
    body.transmissionType &&
    !VALID_TRANSMISSION_TYPES.has(body.transmissionType)
  )
    return `Invalid transmissionType: ${body.transmissionType}`;
  if (body.driveType && !VALID_DRIVE_TYPES.has(body.driveType))
    return `Invalid driveType: ${body.driveType}`;
  if (body.interiorColor && !VALID_COLORS.has(body.interiorColor))
    return `Invalid interiorColor: ${body.interiorColor}`;
  if (body.vehicleCondition && !VALID_CONDITIONS.has(body.vehicleCondition))
    return `Invalid vehicleCondition: ${body.vehicleCondition}`;
  if (body.warranty && !VALID_WARRANTIES.has(body.warranty))
    return `Invalid warranty: ${body.warranty}`;
  if (body.energyLabel && !VALID_ENERGY_LABELS.has(body.energyLabel))
    return `Invalid energyLabel: ${body.energyLabel}`;
  if (
    body.batteryOwnership &&
    !VALID_BATTERY_OWNERSHIPS.has(body.batteryOwnership)
  )
    return `Invalid batteryOwnership: ${body.batteryOwnership}`;
  if (
    body.chargingPlugTypeStandard &&
    !VALID_CHARGING_AC.has(body.chargingPlugTypeStandard)
  )
    return `Invalid chargingPlugTypeStandard`;
  if (
    body.chargingPlugTypeFast &&
    !VALID_CHARGING_DC.has(body.chargingPlugTypeFast)
  )
    return `Invalid chargingPlugTypeFast`;
  if (
    body.emissionStandard &&
    !VALID_EMISSION_STANDARDS.has(body.emissionStandard)
  )
    return `Invalid emissionStandard`;
  if (body.equipment && typeof body.equipment === "object") {
    const invalid = Object.keys(body.equipment).filter(
      (k) => !(VALID_EQUIPMENT_KEYS as string[]).includes(k),
    );
    if (invalid.length) return `Invalid equipment keys: ${invalid.join(", ")}`;
  }
  if (body.extras && typeof body.extras === "object") {
    const validExtras =
      VALID_EXTRAS_KEYS_BY_TYPE[body.vehicleType as string] ?? [];
    const invalid = Object.keys(body.extras).filter(
      (k) => !validExtras.includes(k),
    );
    if (invalid.length) return `Invalid extras keys: ${invalid.join(", ")}`;
  }
  if (body.vin != null && !VIN_REGEX.test(body.vin))
    return "vin must be exactly 17 alphanumeric characters";
  if (Number(body.kilometer) < 0) return "kilometer must be >= 0";
  if (Number(body.price) < 0) return "price must be >= 0";
  return null;
}

// ─── Seller helper ────────────────────────────────────────────────────────────

async function getOrCreateSeller(userId: string) {
  return prisma.seller.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      phoneNumber: "",
      streetAddress: "",
      zipCode: "",
      city: "",
      country: "ch",
    },
    select: { id: true },
  });
}

// ─── Vehicle data mapper (shared by create and update) ────────────────────────

function mapBodyToVehicleData(body: Record<string, any>, isCreate: boolean) {
  const n = (v: any) =>
    v != null && v !== "" ? Number(v) : isCreate ? undefined : null;
  const s = (v: any) =>
    v != null && v !== "" ? String(v) : isCreate ? undefined : null;

  return {
    vehicleType: body.vehicleType as VehicleType,
    make: body.make,
    model: s(body.model),
    version: s(body.version),
    bodyType: body.bodyType as BodyType,
    fuelType: (body.fuelType as FuelType) ?? (isCreate ? undefined : null),
    color: body.color as Color,
    interiorColor:
      (body.interiorColor as Color) ?? (isCreate ? undefined : null),
    metallic: body.metallic ?? false,
    vehicleCondition:
      (body.vehicleCondition as VehicleCondition) ??
      (isCreate ? undefined : null),
    gearTransmission:
      (body.gearTransmission as GearTransmission) ??
      (isCreate ? undefined : null),
    transmissionType:
      (body.transmissionType as TransmissionType) ??
      (isCreate ? undefined : null),
    driveType: (body.driveType as DriveType) ?? (isCreate ? undefined : null),
    registrationMonth: Number(body.registrationMonth),
    registrationYear: Number(body.registrationYear),
    kilometer: Number(body.kilometer),
    price: Number(body.price),
    newPrice: n(body.newPrice),
    seats: n(body.seats),
    doors: n(body.doors),
    lastInspectionDate: body.lastInspectionDate
      ? new Date(body.lastInspectionDate)
      : isCreate
        ? undefined
        : null,
    inspectionPassed: body.inspectionPassed ?? false,
    warranty: (body.warranty as Warranty) ?? (isCreate ? undefined : null),
    warrantyStartDate: body.warrantyStartDate
      ? new Date(body.warrantyStartDate)
      : isCreate
        ? undefined
        : null,
    duration: n(body.duration),
    maxKm: n(body.maxKm),
    hp: n(body.hp),
    kw: n(body.kw),
    cubicCapacity: n(body.cubicCapacity),
    cylinders: n(body.cylinders),
    numberOfGears: n(body.numberOfGears),
    emptyWeight: n(body.emptyWeight),
    loadCapacity: n(body.loadCapacity),
    wheelbase: n(body.wheelbase),
    length: n(body.length),
    width: n(body.width),
    height: n(body.height),
    towingCapacityBraked: n(body.towingCapacityBraked),
    typeApproval: s(body.typeApproval),
    vin: s(body.vin),
    serialNumber: s(body.serialNumber),
    co2Emission: n(body.co2Emission),
    consumptionCity: n(body.consumptionCity),
    consumptionCountry: n(body.consumptionCountry),
    consumptionTotal: n(body.consumptionTotal),
    emissionStandard:
      (body.emissionStandard as EmissionStandard) ??
      (isCreate ? undefined : null),
    energyLabel:
      (body.energyLabel as EnergyLabel) ?? (isCreate ? undefined : null),
    range: n(body.range),
    batteryCapacity: n(body.batteryCapacity),
    powerConsumption: n(body.powerConsumption),
    chargingPower: n(body.chargingPower),
    batteryOwnership:
      (body.batteryOwnership as BatteryOwnership) ??
      (isCreate ? undefined : null),
    chargingPlugTypeStandard:
      (body.chargingPlugTypeStandard as ChargingPlugTypeStandard) ??
      (isCreate ? undefined : null),
    chargingPlugTypeFast:
      (body.chargingPlugTypeFast as ChargingPlugTypeFast) ??
      (isCreate ? undefined : null),
    combustionEnginePowerHp: n(body.combustionEnginePowerHp),
    electricMotorPowerHp: n(body.electricMotorPowerHp),
    vehicleDescription: s(body.vehicleDescription),
    equipment: body.equipment ?? {},
    extras: body.extras ?? {},
    images: Array.isArray(body.imageKeys) ? body.imageKeys : [],
  };
}

// ─── GET / — public list with optional facets ─────────────────────────────────

router.get("/", async (c) => {
  const params = parseParams(c);
  const includeFacets = c.req.query("facets") === "true";
  const cacheKey = `api:seller:vehicles:${includeFacets ? "facets" : "list"}:${JSON.stringify(params)}`;

  const cached = await cacheGet<any>(cacheKey);
  if (cached) return c.json(cached);

  const skip = (params.page - 1) * params.pageSize;
  const where = buildPublicWhere(params);
  const orderBy = buildOrderBy(params.sort);

  if (!includeFacets) {
    const [total, vehicles, avgMap] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
        where,
        orderBy,
        skip,
        take: params.pageSize,
        select: PUBLIC_LIST_SELECT,
      }),
      fetchAvgPriceMap(),
    ]);

    const result = {
      vehicles: attachPriceRatings(vehicles, avgMap),
      total,
      page: params.page,
      pageSize: params.pageSize,
      totalPages: Math.ceil(total / params.pageSize),
    };

    await cacheSet(cacheKey, result, 60);
    return c.json(result);
  }

  const facetBase = buildPublicWhere(params, { make: true, model: true });

  const [
    total,
    vehicles,
    avgMap,
    makeRows,
    fuelRows,
    transmissionRows,
    conditionRows,
    typeRows,
    bodyTypeRows,
    colorRows,
    interiorColorRows,
    driveTypeRows,
    energyLabelRows,
    emissionStandardRows,
    metallicCount,
    inspectionPassedCount,
    hasWarrantyCount,
  ] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip,
      take: params.pageSize,
      select: PUBLIC_LIST_SELECT,
    }),
    fetchAvgPriceMap(),
    prisma.vehicle.groupBy({
      by: ["make"],
      where: facetBase,
      _count: { _all: true },
      orderBy: { make: "asc" },
    }),
    prisma.vehicle.groupBy({
      by: ["fuelType"],
      where: buildPublicWhere(params, { fuel: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["transmissionType"],
      where: buildPublicWhere(params, { transmission: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleCondition"],
      where: buildPublicWhere(params, { condition: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleType"],
      where: buildPublicWhere(params, { vehicleType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["bodyType"],
      where: buildPublicWhere(params, { bodyType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["color"],
      where: buildPublicWhere(params, { color: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["interiorColor"],
      where: buildPublicWhere(params, { interiorColor: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["driveType"],
      where: buildPublicWhere(params, { driveType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["energyLabel"],
      where: buildPublicWhere(params, { energyLabels: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["emissionStandard"],
      where: buildPublicWhere(params, { emissionStandards: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.count({
      where: {
        ...buildPublicWhere(params, { metallic: true }),
        metallic: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...buildPublicWhere(params, { inspectionPassed: true }),
        inspectionPassed: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...buildPublicWhere(params, { hasWarranty: true }),
        warranty: { not: null },
      },
    }),
  ]);

  const facets = {
    make: toLowerFacetKeys(toFacetCounts(makeRows, "make")),
    fuelType: toFrontendFacetKeys(toFacetCounts(fuelRows, "fuelType")),
    transmissionType: toFrontendFacetKeys(
      toFacetCounts(transmissionRows, "transmissionType"),
    ),
    vehicleCondition: toFrontendFacetKeys(
      toFacetCounts(conditionRows, "vehicleCondition"),
    ),
    vehicleType: toFrontendFacetKeys(toFacetCounts(typeRows, "vehicleType")),
    bodyType: toFrontendFacetKeys(toFacetCounts(bodyTypeRows, "bodyType")),
    color: toFrontendFacetKeys(toFacetCounts(colorRows, "color")),
    interiorColor: toFrontendFacetKeys(
      toFacetCounts(interiorColorRows, "interiorColor"),
    ),
    driveType: toFrontendFacetKeys(toFacetCounts(driveTypeRows, "driveType")),
    energyLabel: toFrontendFacetKeys(
      toFacetCounts(energyLabelRows, "energyLabel"),
    ),
    emissionStandard: toFrontendFacetKeys(
      toFacetCounts(emissionStandardRows, "emissionStandard"),
    ),
    metallic: metallicCount,
    inspectionPassed: inspectionPassedCount,
    hasWarranty: hasWarrantyCount,
  };

  const result = {
    vehicles: attachPriceRatings(vehicles, avgMap),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
    facets,
  };

  await cacheSet(cacheKey, result, 60);
  return c.json(result);
});

// ─── GET /facets — count + full facets + histograms (advanced search) ─────────

router.get("/facets", async (c) => {
  const params = parseParams(c);
  const cacheKey = `api:seller:vehicles:count-facets:${JSON.stringify(params)}`;

  const cached = await cacheGet<any>(cacheKey);
  if (cached) return c.json(cached);

  const where = buildPublicWhere(params);
  const facetBase = buildPublicWhere(params, { make: true, model: true });
  const yearBase = buildPublicWhere(params, {
    registrationFrom: true,
    make: true,
    model: true,
  });
  const kmBase = buildPublicWhere(params, {
    kilometerFrom: true,
    make: true,
    model: true,
  });
  const priceBase = buildPublicWhere(params, {
    priceFrom: true,
    make: true,
    model: true,
  });

  const [
    total,
    makeRows,
    fuelRows,
    transmissionRows,
    conditionRows,
    typeRows,
    bodyTypeRows,
    colorRows,
    interiorColorRows,
    driveTypeRows,
    energyLabelRows,
    emissionStandardRows,
    metallicCount,
    inspectionPassedCount,
    hasWarrantyCount,
    hpAgg,
    kwAgg,
    priceAgg,
    kilometerAgg,
    yearAgg,
    consumptionAgg,
    co2Agg,
    cubicCapacityAgg,
    cylindersAgg,
    yearRows,
  ] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.groupBy({
      by: ["make"],
      where: facetBase,
      _count: { _all: true },
      orderBy: { make: "asc" },
    }),
    prisma.vehicle.groupBy({
      by: ["fuelType"],
      where: buildPublicWhere(params, { fuel: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["transmissionType"],
      where: buildPublicWhere(params, { transmission: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleCondition"],
      where: buildPublicWhere(params, { condition: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleType"],
      where: buildPublicWhere(params, { vehicleType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["bodyType"],
      where: buildPublicWhere(params, { bodyType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["color"],
      where: buildPublicWhere(params, { color: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["interiorColor"],
      where: buildPublicWhere(params, { interiorColor: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["driveType"],
      where: buildPublicWhere(params, { driveType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["energyLabel"],
      where: buildPublicWhere(params, { energyLabels: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["emissionStandard"],
      where: buildPublicWhere(params, { emissionStandards: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.count({
      where: {
        ...buildPublicWhere(params, { metallic: true }),
        metallic: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...buildPublicWhere(params, { inspectionPassed: true }),
        inspectionPassed: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...buildPublicWhere(params, { hasWarranty: true }),
        warranty: { not: null },
      },
    }),
    prisma.vehicle.aggregate({ _max: { hp: true }, where: facetBase }),
    prisma.vehicle.aggregate({ _max: { kw: true }, where: facetBase }),
    prisma.vehicle.aggregate({ _max: { price: true }, where: priceBase }),
    prisma.vehicle.aggregate({ _max: { kilometer: true }, where: kmBase }),
    prisma.vehicle.aggregate({
      _min: { registrationYear: true },
      _max: { registrationYear: true },
      where: yearBase,
    }),
    prisma.vehicle.aggregate({
      _max: { consumptionTotal: true },
      where: facetBase,
    }),
    prisma.vehicle.aggregate({ _max: { co2Emission: true }, where: facetBase }),
    prisma.vehicle.aggregate({
      _max: { cubicCapacity: true },
      where: facetBase,
    }),
    prisma.vehicle.aggregate({ _max: { cylinders: true }, where: facetBase }),
    prisma.vehicle.groupBy({
      by: ["registrationYear"],
      where: yearBase,
      _count: { _all: true },
      orderBy: { registrationYear: "asc" },
    }),
  ]);

  const kmLimit = kilometerAgg._max.kilometer ?? 400000;
  const kmStep = Math.max(1000, Math.ceil(kmLimit / 20 / 1000) * 1000);
  const priceLimit = priceAgg._max.price ?? 200000;
  const priceStep = Math.max(1000, Math.ceil(priceLimit / 20 / 1000) * 1000);

  const [kmCounts, priceCounts] = await Promise.all([
    Promise.all(
      Array.from({ length: 20 }).map((_, i) =>
        prisma.vehicle.count({
          where: {
            ...kmBase,
            kilometer: { gte: i * kmStep, lt: (i + 1) * kmStep },
          },
        }),
      ),
    ),
    Promise.all(
      Array.from({ length: 20 }).map((_, i) =>
        prisma.vehicle.count({
          where: {
            ...priceBase,
            price: { gte: i * priceStep, lt: (i + 1) * priceStep },
          },
        }),
      ),
    ),
  ]);

  const maxKmCount = Math.max(...kmCounts, 1);
  const maxPriceCount = Math.max(...priceCounts, 1);
  const maxYearCount = Math.max(
    ...(yearRows as any[]).map((r) => r._count._all),
    1,
  );

  const facets = {
    make: toLowerFacetKeys(toFacetCounts(makeRows, "make")),
    fuelType: toFrontendFacetKeys(toFacetCounts(fuelRows, "fuelType")),
    transmissionType: toFrontendFacetKeys(
      toFacetCounts(transmissionRows, "transmissionType"),
    ),
    vehicleCondition: toFrontendFacetKeys(
      toFacetCounts(conditionRows, "vehicleCondition"),
    ),
    vehicleType: toFrontendFacetKeys(toFacetCounts(typeRows, "vehicleType")),
    bodyType: toFrontendFacetKeys(toFacetCounts(bodyTypeRows, "bodyType")),
    color: toFrontendFacetKeys(toFacetCounts(colorRows, "color")),
    interiorColor: toFrontendFacetKeys(
      toFacetCounts(interiorColorRows, "interiorColor"),
    ),
    driveType: toFrontendFacetKeys(toFacetCounts(driveTypeRows, "driveType")),
    energyLabel: toFrontendFacetKeys(
      toFacetCounts(energyLabelRows, "energyLabel"),
    ),
    emissionStandard: toFrontendFacetKeys(
      toFacetCounts(emissionStandardRows, "emissionStandard"),
    ),
    metallic: metallicCount,
    inspectionPassed: inspectionPassedCount,
    hasWarranty: hasWarrantyCount,
    hpMax: hpAgg._max.hp ?? undefined,
    kwMax: kwAgg._max.kw ?? undefined,
    priceMax: priceAgg._max.price ?? undefined,
    kilometerMax: kilometerAgg._max.kilometer ?? undefined,
    yearMin: yearAgg._min.registrationYear ?? undefined,
    yearMax: yearAgg._max.registrationYear ?? undefined,
    consumptionMax: consumptionAgg._max.consumptionTotal ?? undefined,
    co2Max: co2Agg._max.co2Emission ?? undefined,
    cubicCapacityMax: cubicCapacityAgg._max.cubicCapacity ?? undefined,
    cylindersMax: cylindersAgg._max.cylinders ?? undefined,
    yearHistogram: yearRows
      .filter((r) => r.registrationYear != null)
      .map((r) => ({
        year: (r as any).registrationYear!,
        h: Math.round(((r as any)._count._all / maxYearCount) * 100),
      })),
    kilometerHistogram: kmCounts.map((count, i) => ({
      value: i * kmStep,
      h: Math.round((count / maxKmCount) * 100),
    })),
    priceHistogram: priceCounts.map((count, i) => ({
      value: i * priceStep,
      h: Math.round((count / maxPriceCount) * 100),
    })),
  };

  const result = { total, facets };
  await cacheSet(cacheKey, result, 60);
  return c.json(result);
});

// ─── GET /my/summary — dashboard summary (authenticated) ─────────────────────

router.get("/my/summary", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const seller = await getOrCreateSeller(user.id);

  const [counts, recentVehicles] = await Promise.all([
    prisma.vehicle.groupBy({
      by: ["status"],
      where: { sellerId: seller.id },
      _count: { _all: true },
    }),
    prisma.vehicle.findMany({
      where: { sellerId: seller.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        make: true,
        model: true,
        price: true,
        status: true,
        images: true,
        createdAt: true,
      },
    }),
  ]);

  const totalCount = counts.reduce((acc, curr) => acc + curr._count._all, 0);
  const publishedCount =
    counts.find((c) => c.status === "PUBLISHED")?._count._all || 0;
  const draftCount = counts.find((c) => c.status === "DRAFT")?._count._all || 0;
  const soldCount = counts.find((c) => c.status === "SOLD")?._count._all || 0;

  return c.json({
    totalCount,
    publishedCount,
    draftCount,
    soldCount,
    recentVehicles,
  });
});

// ─── GET /my — seller's vehicles (authenticated) ──────────────────────────────

router.get("/my", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const seller = await getOrCreateSeller(user.id);

  const vehicles = await prisma.vehicle.findMany({
    where: { sellerId: seller.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      make: true,
      model: true,
      version: true,
      price: true,
      kilometer: true,
      registrationMonth: true,
      registrationYear: true,
      kw: true,
      hp: true,
      fuelType: true,
      vehicleCondition: true,
      bodyType: true,
      color: true,
      createdAt: true,
      images: true,
      status: true,
      equipment: true,
      listingPaidAt: true,
      listingPlan: true,
      seller: {
        select: {
          id: true,
          user: { select: { name: true } },
          city: true,
          zipCode: true,
          phoneNumber: true,
        },
      },
    },
  });

  return c.json(vehicles);
});

// ─── GET /my/:id — get single seller vehicle (authenticated) ──────────────────

router.get("/my/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const seller = await getOrCreateSeller(user.id);

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: c.req.param("id"), sellerId: seller.id },
  });

  if (!vehicle) return c.json({ error: "Vehicle not found" }, 404);
  return c.json(vehicle);
});

// ─── POST /my/prepare — prepare listing (authenticated) ──────────────────────

router.post("/my/prepare", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const seller = await getOrCreateSeller(user.id);

  const body = await c.req.json().catch(() => ({}));
  const existingVehicleId = body?.vehicleId as string | undefined;

  return c.json({
    listingId: existingVehicleId || createId(),
    country: "ch",
    sellerId: seller.id,
  });
});

// ─── POST /my/presign — presigned upload URLs (authenticated) ─────────────────

router.post("/my/presign", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const seller = await getOrCreateSeller(user.id);

  const body = await c.req.json().catch(() => null);
  if (!body?.listingId || !Array.isArray(body?.files)) {
    return c.json({ error: "listingId and files[] are required" }, 400);
  }

  const { listingId, files } = body as {
    listingId: string;
    files: { name: string; type: string }[];
  };

  const urls = await Promise.all(
    files.map(async (file) => {
      const safeFilename = file.name
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .slice(0, 200);
      const key = StorageService.formatPath(
        seller.id,
        "listing",
        safeFilename,
        listingId,
      );
      const url = await storage.getUploadUrl(key, file.type);
      return { url, key };
    }),
  );

  return c.json(urls);
});

// ─── POST /my — create vehicle (authenticated) ────────────────────────────────

router.post("/my", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const seller = await getOrCreateSeller(user.id);

  let body: Record<string, any>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const required = [
    "vehicleType",
    "make",
    "bodyType",
    "color",
    "registrationMonth",
    "registrationYear",
    "kilometer",
    "price",
  ];
  const missing = required.filter((f) => body[f] == null || body[f] === "");
  if (missing.length)
    return c.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      400,
    );

  const validationError = validateBody(body);
  if (validationError) return c.json({ error: validationError }, 400);

  const listingId = body.listingId as string | undefined;

  try {
    const vehicle = await prisma.vehicle.create({
      data: {
        ...(listingId ? { id: listingId } : {}),
        sellerId: seller.id,
        status: "DRAFT",
        ...mapBodyToVehicleData(body, true),
      },
    });

    await Promise.all([cacheDeletePattern("api:seller:vehicles:*")]);

    return c.json({ id: vehicle.id }, 201);
  } catch (e: any) {
    if (e?.code === "P2002") return c.json({ error: "Duplicate entry" }, 409);
    if (e?.name === "PrismaClientValidationError")
      return c.json({ error: "Invalid field value", detail: e.message }, 400);
    throw e;
  }
});

// ─── PUT /my/:id — update vehicle (authenticated) ────────────────────────────

router.put("/my/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const seller = await getOrCreateSeller(user.id);
  const vehicleId = c.req.param("id");

  const existing = await prisma.vehicle.findFirst({
    where: { id: vehicleId, sellerId: seller.id },
    select: { id: true, images: true, listingPaidAt: true, vin: true },
  });
  if (!existing) return c.json({ error: "Vehicle not found" }, 404);

  let body: Record<string, any>;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }

  const required = [
    "vehicleType",
    "make",
    "bodyType",
    "color",
    "registrationMonth",
    "registrationYear",
    "kilometer",
    "price",
  ];
  const missing = required.filter((f) => body[f] == null || body[f] === "");
  if (missing.length)
    return c.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      400,
    );

  const validationError = validateBody(body);
  if (validationError) return c.json({ error: validationError }, 400);

  // Security: block PUBLISHED status without payment
  if (body.status === "PUBLISHED" && !existing.listingPaidAt) {
    return c.json({ error: "Payment required before publishing" }, 403);
  }

  // Security: VIN lock after payment
  if (
    existing.listingPaidAt &&
    existing.vin &&
    body.vin &&
    existing.vin !== body.vin
  ) {
    return c.json({ error: "VIN cannot be changed after payment" }, 403);
  }

  // Delete old images that were removed
  const newImageKeys = Array.isArray(body.imageKeys) ? body.imageKeys : [];
  const imagesToDelete = existing.images.filter(
    (img) => !newImageKeys.includes(img),
  );
  if (imagesToDelete.length > 0) {
    await Promise.allSettled(
      imagesToDelete.map((key) => storage.deleteFile(key).catch(() => {})),
    );
  }

  try {
    await prisma.vehicle.update({
      where: { id: vehicleId, sellerId: seller.id },
      data: {
        status: body.status ?? undefined,
        ...mapBodyToVehicleData(body, false),
      },
    });

    await Promise.all([
      cacheDeletePattern("api:seller:vehicles:*"),
      cacheDelete(`seller:vehicle:${vehicleId}`),
    ]);

    return c.json({ success: true });
  } catch (e: any) {
    if (e?.name === "PrismaClientValidationError")
      return c.json({ error: "Invalid field value", detail: e.message }, 400);
    throw e;
  }
});

// ─── PATCH /my/:id/status — update status (authenticated) ────────────────────

router.patch("/my/:id/status", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const seller = await getOrCreateSeller(user.id);
  const vehicleId = c.req.param("id");

  const body = await c.req.json().catch(() => null);
  const ALLOWED_STATUSES = ["DRAFT", "SOLD"] as const;

  if (!body?.status || !ALLOWED_STATUSES.includes(body.status)) {
    return c.json(
      { error: `status must be one of: ${ALLOWED_STATUSES.join(", ")}` },
      400,
    );
  }

  const existing = await prisma.vehicle.findFirst({
    where: { id: vehicleId, sellerId: seller.id },
    select: { id: true },
  });
  if (!existing) return c.json({ error: "Vehicle not found" }, 404);

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { status: body.status },
  });

  await cacheDeletePattern("api:seller:vehicles:*");
  return c.json({ success: true });
});

// ─── POST /my/:id/publish — publish or create checkout (authenticated) ────────

router.post("/my/:id/publish", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const seller = await getOrCreateSeller(user.id);
  const vehicleId = c.req.param("id");

  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, sellerId: seller.id },
    select: { id: true, listingPaidAt: true, listingPlan: true },
  });
  if (!vehicle) return c.json({ error: "Vehicle not found" }, 404);

  if (vehicle.listingPaidAt) {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: "PUBLISHED" },
    });
    await cacheDeletePattern("api:seller:vehicles:*");
    return c.json({ published: true });
  }

  if (!vehicle.listingPlan) {
    return c.json(
      { error: "No plan selected. Please edit the listing and select a plan." },
      400,
    );
  }

  const body = await c.req.json().catch(() => ({}));
  const locale = (body?.locale as string) || "de";

  // Forward to seller-listings checkout
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://autosolo.ch";
  const { stripeClient } = await import("@repo/auth");
  const PRICE_MAP = {
    standard: { amount: 1900, name: "Standard Listing (30 Days)" },
    best_value: { amount: 4900, name: "Best Value Listing (Until Sold)" },
  };

  const selectedPlan =
    PRICE_MAP[vehicle.listingPlan as "standard" | "best_value"];
  if (!selectedPlan) return c.json({ error: "Invalid plan" }, 400);

  const vehicleData = await prisma.vehicle.findFirst({
    where: { id: vehicleId },
    select: { make: true, model: true, vin: true },
  });

  const stripeSession = await stripeClient.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "chf",
          product_data: {
            name: selectedPlan.name,
            description: `Listing for ${vehicleData?.make} ${vehicleData?.model}`,
          },
          unit_amount: selectedPlan.amount,
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${appUrl}/${locale}/dashboard/vehicles?success=true&vehicleId=${vehicleId}`,
    cancel_url: `${appUrl}/${locale}/dashboard/vehicles/${vehicleId}?canceled=true`,
    metadata: { vehicleId, planId: vehicle.listingPlan, sellerId: seller.id },
  });

  if (!stripeSession.url)
    return c.json({ error: "Failed to create checkout session" }, 500);

  await prisma.vehicle.update({
    where: { id: vehicleId },
    data: { stripeSessionId: stripeSession.id },
  });

  return c.json({ checkoutUrl: stripeSession.url });
});

// ─── DELETE /my/:id — delete vehicle (authenticated) ─────────────────────────

router.delete("/my/:id", async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: "Unauthorized" }, 401);

  const seller = await getOrCreateSeller(user.id);
  const vehicleId = c.req.param("id");

  const existing = await prisma.vehicle.findFirst({
    where: { id: vehicleId, sellerId: seller.id },
    select: { id: true, images: true, listingPaidAt: true },
  });
  if (!existing) return c.json({ error: "Vehicle not found" }, 404);

  if (existing.listingPaidAt) {
    return c.json(
      { error: "Paid listings cannot be deleted. Mark as sold instead." },
      403,
    );
  }

  if (existing.images.length > 0) {
    await Promise.allSettled(
      existing.images.map((key) => storage.deleteFile(key).catch(() => {})),
    );
  }

  await prisma.vehicle.delete({ where: { id: vehicleId } });
  await cacheDeletePattern("api:seller:vehicles:*");

  return c.body(null, 204);
});

// ─── GET /:id/similar — similar vehicles from same seller (public) ────────────

router.get("/:id/similar", async (c) => {
  const id = c.req.param("id");

  const v = await prisma.vehicle.findFirst({
    where: { id },
    select: { sellerId: true },
  });
  if (!v?.sellerId) return c.json({ vehicles: [] });

  const vehicles = await prisma.vehicle.findMany({
    where: {
      sellerId: v.sellerId,
      NOT: { id },
      status: "PUBLISHED",
      OR: [
        { listingExpiresAt: null },
        { listingExpiresAt: { gte: new Date() } },
      ],
    },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: PUBLIC_LIST_SELECT,
  });

  return c.json({ vehicles });
});

// ─── GET /:id — single vehicle detail (public) ───────────────────────────────

router.get("/:id", async (c) => {
  const id = c.req.param("id");
  const cacheKey = `api:seller:vehicle:${id}`;

  const cached = await cacheGet<any>(cacheKey);
  if (cached) return c.json(cached);

  const v = await prisma.vehicle.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      sellerId: { not: null },
      seller: { user: { banned: { not: true } } },
      OR: [
        { listingExpiresAt: null },
        { listingExpiresAt: { gte: new Date() } },
      ],
    },
    select: {
      id: true,
      make: true,
      model: true,
      version: true,
      price: true,
      newPrice: true,
      images: true,
      vehicleType: true,
      bodyType: true,
      vehicleCondition: true,
      driveType: true,
      seats: true,
      doors: true,
      kilometer: true,
      registrationMonth: true,
      registrationYear: true,
      lastInspectionDate: true,
      inspectionPassed: true,
      warranty: true,
      warrantyStartDate: true,
      duration: true,
      maxKm: true,
      hp: true,
      kw: true,
      transmissionType: true,
      gearTransmission: true,
      cubicCapacity: true,
      cylinders: true,
      numberOfGears: true,
      emptyWeight: true,
      loadCapacity: true,
      wheelbase: true,
      length: true,
      width: true,
      height: true,
      towingCapacityBraked: true,
      fuelType: true,
      co2Emission: true,
      consumptionCity: true,
      consumptionCountry: true,
      consumptionTotal: true,
      emissionStandard: true,
      energyLabel: true,
      range: true,
      batteryCapacity: true,
      powerConsumption: true,
      chargingPower: true,
      batteryOwnership: true,
      chargingPlugTypeStandard: true,
      chargingPlugTypeFast: true,
      combustionEnginePowerHp: true,
      electricMotorPowerHp: true,
      color: true,
      interiorColor: true,
      metallic: true,
      vin: true,
      serialNumber: true,
      typeApproval: true,
      equipment: true,
      extras: true,
      vehicleDescription: true,
      createdAt: true,
      listingPaidAt: true,
      listingPlan: true,
      seller: {
        select: {
          id: true,
          city: true,
          zipCode: true,
          streetAddress: true,
          phoneNumber: true,
          user: {
            select: {
              name: true,
              email: true,
              image: true,
              emailVerified: true,
            },
          },
        },
      },
    },
  });

  if (!v) return c.body(null, 404);

  const result = {
    ...v,
    sellerId: v.seller?.id ?? null,
  };

  await cacheSet(cacheKey, result, 300);
  return c.json(result);
});

export default router;

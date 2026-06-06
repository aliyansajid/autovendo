import { Hono } from "hono";
import type { Context } from "hono";
import { prisma } from "@repo/db";
import type {
  Prisma,
  BodyType,
  FuelType,
  TransmissionType,
  DriveType,
  Color,
  VehicleCondition,
  VehicleType,
  EnergyLabel,
  EmissionStandard,
} from "@repo/db";
import { cacheGet, cacheSet } from "../lib/cache";

const vehicle = new Hono();

const R2_DOMAIN = process.env.R2_PUBLIC_DOMAIN ?? "";

function getImageUrl(key: string | undefined | null): string | null {
  if (!key) return null;
  if (key.startsWith("http")) return key;
  const cleanKey = key.startsWith("/") ? key.slice(1) : key;
  return R2_DOMAIN ? `${R2_DOMAIN}/${cleanKey}` : null;
}

const FUEL_LABELS: Record<string, string> = {
  PETROL: "Benzin",
  DIESEL: "Diesel",
  ELECTRIC: "Elektro",
  MHEV_PETROL: "Mild-Hybrid Benzin/Elektro",
  MHEV_DIESEL: "Mild-Hybrid Diesel/Elektro",
  PHEV_PETROL: "Plug-in Hybrid Benzin/Elektro",
  PHEV_DIESEL: "Plug-in Hybrid Diesel/Elektro",
  HEV_PETROL: "Voll-Hybrid Benzin/Elektro",
  HEV_DIESEL: "Voll-Hybrid Diesel/Elektro",
  ETHANOL_PETROL: "Bioethanol",
  CNG_PETROL: "Erdgas (CNG) / Benzin",
  LPG_PETROL: "Flüssiggas (LPG) / Benzin",
  HYDROGEN: "Wasserstoff",
};

// ─── Query param helpers ───────────────────────────────────────────────────────

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

function clamp(
  value: number | undefined,
  min: number,
  max: number,
): number | undefined {
  if (value === undefined) return undefined;
  return Math.min(max, Math.max(min, value));
}

// ─── Shared SELECT for vehicle lists ──────────────────────────────────────────

const VEHICLE_LIST_SELECT = {
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
  dealer: {
    select: {
      id: true,
      companyName: true,
      city: true,
      zipCode: true,
      phoneNumber: true,
      googleRating: true,
      googleReviewCount: true,
    },
  },
} satisfies Prisma.VehicleSelect;

// ─── WHERE clause builder (mirrors vehicles.actions.ts buildWhereClause) ──────

function buildWhereClause(
  params: ReturnType<typeof parseParams>,
  omit: Partial<Record<string, boolean>> = {},
): Prisma.VehicleWhereInput {
  const where: Prisma.VehicleWhereInput = {};

  if (!omit.search && params.search) {
    where.OR = [
      { make: { contains: params.search, mode: "insensitive" } },
      { model: { contains: params.search, mode: "insensitive" } },
      { version: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Multi-select make
  if (!omit.make && params.make.length > 0) {
    const makeOr = params.make.map((m) => ({
      make: { equals: m, mode: "insensitive" as const },
    }));
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { OR: makeOr },
    ];
  }

  // Multi-select model
  if (!omit.model && params.model.length > 0) {
    const modelOr = params.model.map((m) => ({
      model: { equals: m, mode: "insensitive" as const },
    }));
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { OR: modelOr },
    ];
  }

  // Exclude make
  if (params.excludeMake.length > 0) {
    where.NOT = [
      ...(Array.isArray(where.NOT) ? where.NOT : where.NOT ? [where.NOT] : []),
      { make: { in: params.excludeMake, mode: "insensitive" as const } },
    ];
  }

  // Exclude model
  if (params.excludeModel.length > 0) {
    where.NOT = [
      ...(Array.isArray(where.NOT) ? where.NOT : where.NOT ? [where.NOT] : []),
      { model: { in: params.excludeModel, mode: "insensitive" as const } },
    ];
  }

  // Range filters
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

  // EV filter
  if (!omit.evs && params.evs) {
    if (params.evs === "only_ev") where.fuelType = "ELECTRIC";
    else if (params.evs === "no_ev") where.fuelType = { not: "ELECTRIC" };
  }

  // Multi-select enum filters
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
    where.bodyType = { in: params.bodyType.map(toDbEnum) as BodyType[] };
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
  if (!omit.dealerId && params.dealerId) where.dealerId = params.dealerId;

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
  if (!omit.extras && params.extras.length > 0) {
    const extrasClauses = params.extras.map((item) => ({
      extras: { path: [item], equals: true },
    }));
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      ...extrasClauses,
    ];
  }

  where.status = "PUBLISHED";
  where.dealer = { user: { banned: { not: true } } };
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
  return counts;
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

// ─── Param parser ─────────────────────────────────────────────────────────────

function parseParams(c: Context) {
  return {
    page: Math.max(1, qi(c, "page") ?? 1),
    pageSize: Math.min(100, Math.max(1, qi(c, "pageSize") ?? 12)),
    sort: c.req.query("sort"),
    search: c.req.query("q")?.trim() ?? "",
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
    extras: qa(c, "extras"),
    evs: c.req.query("evs") as "only_ev" | "no_ev" | undefined,
    metallic: qb(c, "metallic"),
    inspectionPassed: qb(c, "inspectionPassed"),
    hasWarranty: qb(c, "hasWarranty"),
    priceFrom: clamp(qi(c, "priceFrom"), 0, Number.MAX_SAFE_INTEGER),
    priceTo: clamp(qi(c, "priceTo"), 0, Number.MAX_SAFE_INTEGER),
    registrationFrom: clamp(
      qi(c, "registrationFrom"),
      1900,
      new Date().getFullYear(),
    ),
    registrationTo: clamp(
      qi(c, "registrationTo"),
      1900,
      new Date().getFullYear(),
    ),
    kilometerFrom: clamp(qi(c, "kilometerFrom"), 0, Number.MAX_SAFE_INTEGER),
    kilometerTo: clamp(qi(c, "kilometerTo"), 0, Number.MAX_SAFE_INTEGER),
    powerFrom: clamp(qi(c, "powerFrom"), 0, 4000),
    powerTo: clamp(qi(c, "powerTo"), 0, 4000),
    kwFrom: clamp(qi(c, "kwFrom"), 0, 3000),
    kwTo: clamp(qi(c, "kwTo"), 0, 3000),
    cubicCapacityFrom: clamp(qi(c, "cubicCapacityFrom"), 0, 30000),
    cubicCapacityTo: clamp(qi(c, "cubicCapacityTo"), 0, 30000),
    cylindersFrom: clamp(qi(c, "cylindersFrom"), 0, 16),
    cylindersTo: clamp(qi(c, "cylindersTo"), 0, 16),
    consumptionFrom: clamp(qf(c, "consumptionFrom"), 0, 100),
    consumptionTo: clamp(qf(c, "consumptionTo"), 0, 100),
    co2From: clamp(qi(c, "co2From"), 0, 1000),
    co2To: clamp(qi(c, "co2To"), 0, 1000),
    daysListed: qi(c, "daysListed"),
    dealerId: c.req.query("dealerId"),
    rangeFrom: clamp(qi(c, "rangeFrom"), 1, 1500),
    rangeTo: clamp(qi(c, "rangeTo"), 1, 1500),
    batteryOwnership: qa(c, "batteryOwnership"),
    chargingPlugTypeStandard: qa(c, "chargingPlugTypeStandard"),
    chargingPlugTypeFast: qa(c, "chargingPlugTypeFast"),
    doorsFrom: clamp(qi(c, "doorsFrom"), 1, 20),
    doorsTo: clamp(qi(c, "doorsTo"), 1, 20),
    seatsFrom: clamp(qi(c, "seatsFrom"), 1, 150),
    seatsTo: clamp(qi(c, "seatsTo"), 1, 150),
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// GET /api/vehicles — list with optional facets (?facets=true)
vehicle.get("/", async (c) => {
  try {
  const params = parseParams(c);
  const includeFacets = c.req.query("facets") === "true";
  const cacheKey = `api:vehicles:${includeFacets ? "facets" : "list"}:${JSON.stringify(params)}`;

  const cached = await cacheGet<any>(cacheKey);
  if (cached) return c.json(cached);

  const skip = (params.page - 1) * params.pageSize;
  const where = buildWhereClause(params);
  const orderBy = buildOrderBy(params.sort);

  if (!includeFacets) {
    const [total, vehicles, avgMap] = await Promise.all([
      prisma.vehicle.count({ where }),
      prisma.vehicle.findMany({
        where,
        orderBy,
        skip,
        take: params.pageSize,
        select: VEHICLE_LIST_SELECT,
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

  // With facets — each facet query omits its own filter
  const facetBase = buildWhereClause(params, { make: true, model: true });

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
      select: VEHICLE_LIST_SELECT,
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
      where: buildWhereClause(params, { fuel: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["transmissionType"],
      where: buildWhereClause(params, { transmission: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleCondition"],
      where: buildWhereClause(params, { condition: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleType"],
      where: buildWhereClause(params, { vehicleType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["bodyType"],
      where: buildWhereClause(params, { bodyType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["color"],
      where: buildWhereClause(params, { color: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["interiorColor"],
      where: buildWhereClause(params, { interiorColor: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["driveType"],
      where: buildWhereClause(params, { driveType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["energyLabel"],
      where: buildWhereClause(params, { energyLabels: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["emissionStandard"],
      where: buildWhereClause(params, { emissionStandards: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.count({
      where: {
        ...buildWhereClause(params, { metallic: true }),
        metallic: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...buildWhereClause(params, { inspectionPassed: true }),
        inspectionPassed: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...buildWhereClause(params, { hasWarranty: true }),
        warranty: { not: null },
      },
    }),
  ]);

  const facets = {
    make: toFrontendFacetKeys(toFacetCounts(makeRows, "make")),
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
  } catch (e: any) {
    console.error("[GET /api/vehicles] error:", e?.message ?? e);
    return c.json({ vehicles: [], total: 0, page: 1, pageSize: 12, totalPages: 0 });
  }
});

// GET /api/vehicles/facets — count + full facets + histograms (for advanced search UI)
vehicle.get("/facets", async (c) => {
  try {
  const params = parseParams(c);
  const cacheKey = `api:vehicles:count-facets:${JSON.stringify(params)}`;

  const cached = await cacheGet<any>(cacheKey);
  if (cached) return c.json(cached);

  const where = buildWhereClause(params);
  const facetBase = buildWhereClause(params, { make: true, model: true });
  const yearBase = buildWhereClause(params, {
    registrationFrom: true,
    make: true,
    model: true,
  });
  const kmBase = buildWhereClause(params, {
    kilometerFrom: true,
    make: true,
    model: true,
  });
  const priceBase = buildWhereClause(params, {
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
      where: buildWhereClause(params, { fuel: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["transmissionType"],
      where: buildWhereClause(params, { transmission: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleCondition"],
      where: buildWhereClause(params, { condition: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleType"],
      where: buildWhereClause(params, { vehicleType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["bodyType"],
      where: buildWhereClause(params, { bodyType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["color"],
      where: buildWhereClause(params, { color: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["interiorColor"],
      where: buildWhereClause(params, { interiorColor: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["driveType"],
      where: buildWhereClause(params, { driveType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["energyLabel"],
      where: buildWhereClause(params, { energyLabels: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["emissionStandard"],
      where: buildWhereClause(params, { emissionStandards: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.count({
      where: {
        ...buildWhereClause(params, { metallic: true }),
        metallic: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...buildWhereClause(params, { inspectionPassed: true }),
        inspectionPassed: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...buildWhereClause(params, { hasWarranty: true }),
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

  // Dynamic histograms
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
    make: toFrontendFacetKeys(toFacetCounts(makeRows, "make")),
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
  } catch (e: any) {
    console.error("[/facets] error:", e?.message ?? e);
    return c.json({ total: 0, facets: {} });
  }
});

// GET /api/vehicles/:id/similar — similar vehicles from same dealer
vehicle.get("/:id/similar", async (c) => {
  const id = c.req.param("id");

  const v = await prisma.vehicle.findFirst({
    where: { id },
    select: { dealerId: true },
  });
  if (!v?.dealerId) return c.json({ vehicles: [] });

  const vehicles = await prisma.vehicle.findMany({
    where: { dealerId: v.dealerId, NOT: { id } },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: VEHICLE_LIST_SELECT,
  });

  return c.json({ vehicles });
});

// GET /api/vehicles/:id — single vehicle detail
vehicle.get("/:id", async (c) => {
  const id = c.req.param("id");

  let v: Awaited<ReturnType<typeof prisma.vehicle.findFirst>> | undefined;
  try {
    v = await prisma.vehicle.findFirst({
    where: { id, status: "PUBLISHED" },
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
      batteryRentalMonth: true,
      batteryOwnership: true,
      powerConsumption: true,
      chargingPower: true,
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
      dealer: {
        select: {
          id: true,
          companyName: true,
          streetAddress: true,
          zipCode: true,
          city: true,
          phoneNumber: true,
          businessEmail: true,
          website: true,
          logo: true,
          description: true,
          googleRating: true,
          googleReviewCount: true,
          user: { select: { emailVerified: true } },
          openingHours: {
            select: {
              day: true,
              openTime: true,
              closeTime: true,
              isOpen: true,
            },
          },
        },
      },
      seller: {
        select: {
          id: true,
          city: true,
          phoneNumber: true,
          user: { select: { name: true, email: true } },
        },
      },
    },
    });
  } catch (e: any) {
    console.error("[GET /api/vehicles/:id] error:", e?.message ?? e);
    return c.body(null, 500);
  }

  if (!v) return c.body(null, 404);

  return c.json({
    id: v.id,
    make: v.make,
    model: v.model ?? "",
    version: v.version ?? null,
    price: v.price,
    newPrice: v.newPrice ?? null,
    images: v.images.map(getImageUrl).filter(Boolean) as string[],
    vehicleType: v.vehicleType ?? null,
    bodyType: v.bodyType ?? null,
    vehicleCondition: v.vehicleCondition ?? null,
    driveType: v.driveType ?? null,
    seats: v.seats ?? null,
    doors: v.doors ?? null,
    kilometer: v.kilometer,
    registrationMonth: v.registrationMonth ?? null,
    registrationYear: v.registrationYear,
    lastInspectionDate: v.lastInspectionDate?.toISOString() ?? null,
    inspectionPassed: v.inspectionPassed ?? null,
    warranty: v.warranty ?? null,
    warrantyStartDate: v.warrantyStartDate?.toISOString() ?? null,
    duration: v.duration ?? null,
    maxKm: v.maxKm ?? null,
    hp: v.hp ?? null,
    kw: v.kw ?? null,
    transmissionType: v.transmissionType ?? null,
    gearTransmission: v.gearTransmission ?? null,
    cubicCapacity: v.cubicCapacity ?? null,
    cylinders: v.cylinders ?? null,
    numberOfGears: v.numberOfGears ?? null,
    emptyWeight: v.emptyWeight ?? null,
    loadCapacity: v.loadCapacity ?? null,
    wheelbase: v.wheelbase ?? null,
    length: v.length ?? null,
    width: v.width ?? null,
    height: v.height ?? null,
    towingCapacityBraked: v.towingCapacityBraked ?? null,
    fuelType: v.fuelType ?? null,
    co2Emission: v.co2Emission ?? null,
    consumptionCity: v.consumptionCity ? Number(v.consumptionCity) : null,
    consumptionCountry: v.consumptionCountry
      ? Number(v.consumptionCountry)
      : null,
    consumptionTotal: v.consumptionTotal ? Number(v.consumptionTotal) : null,
    emissionStandard: v.emissionStandard ?? null,
    energyLabel: v.energyLabel ?? null,
    range: v.range ?? null,
    batteryCapacity: v.batteryCapacity ? Number(v.batteryCapacity) : null,
    batteryRentalMonth: v.batteryRentalMonth ?? null,
    batteryOwnership: v.batteryOwnership ?? null,
    powerConsumption: v.powerConsumption ? Number(v.powerConsumption) : null,
    chargingPower: v.chargingPower ? Number(v.chargingPower) : null,
    chargingPlugTypeStandard: v.chargingPlugTypeStandard ?? null,
    chargingPlugTypeFast: v.chargingPlugTypeFast ?? null,
    combustionEnginePowerHp: v.combustionEnginePowerHp ?? null,
    electricMotorPowerHp: v.electricMotorPowerHp ?? null,
    color: v.color ?? null,
    interiorColor: v.interiorColor ?? null,
    metallic: v.metallic ?? null,
    vin: v.vin ?? null,
    serialNumber: v.serialNumber ?? null,
    typeApproval: v.typeApproval ?? null,
    equipment: (v.equipment as Record<string, boolean> | null) ?? null,
    extras: (v.extras as Record<string, boolean> | null) ?? null,
    description: v.vehicleDescription ?? null,
    dealer: v.dealer
      ? {
          id: v.dealer.id,
          companyName: v.dealer.companyName,
          streetAddress: v.dealer.streetAddress ?? null,
          zipCode: v.dealer.zipCode ?? null,
          city: v.dealer.city ?? null,
          phoneNumber: v.dealer.phoneNumber ?? null,
          businessEmail: v.dealer.businessEmail ?? null,
          website: v.dealer.website ?? null,
          logo: v.dealer.logo ? getImageUrl(v.dealer.logo) : null,
          description: v.dealer.description ?? null,
          googleRating: v.dealer.googleRating ?? null,
          googleReviewCount: v.dealer.googleReviewCount ?? null,
          user: v.dealer.user ?? null,
          openingHours: v.dealer.openingHours ?? [],
        }
      : v.seller
        ? {
            id: v.seller.id,
            name: v.seller.user?.name ?? null,
            address: v.seller.city ?? null,
            city: v.seller.city ?? null,
            phone: v.seller.phoneNumber ?? null,
            email: v.seller.user?.email ?? null,
            website: null,
            logo: null,
            description: null,
          }
        : null,
    createdAt: v.createdAt.toISOString(),
  });
});

export default vehicle;

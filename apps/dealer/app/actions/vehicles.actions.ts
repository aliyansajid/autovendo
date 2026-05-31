"use server";

/**
 * ============================================================================
 * VEHICLE ACTIONS - Production Grade
 * ============================================================================
 * ALL vehicle backend logic consolidated in ONE file
 * Optimized for thousands of vehicles with proper indexing and caching
 */

import { revalidatePath } from "next/cache";
import { cacheGet, cacheSet, cacheDeletePattern } from "@/lib/cache";
import { prisma } from "@repo/db";
import type {
  Prisma,
  VehicleType,
  FuelType,
  TransmissionType,
  DriveType,
  Color,
  VehicleCondition,
  EnergyLabel,
  EmissionStandard,
} from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { createId } from "@paralleldrive/cuid2";
import { storage } from "@/lib/helpers/storage";
import { StorageService } from "@repo/storage";
import { getTranslations } from "next-intl/server";
import {
  type VehicleListItem,
  type VehicleDetails,
  type PaginatedVehicles,
  type VehicleFacets,
  type PriceRating,
} from "@/types/vehicle";
import {
  createVehicleSearchSchema,
  type VehicleSearchParams,
} from "@/schema/vehicle-search-schema";

import { parseSearchParams } from "@/lib/helpers/vehicle";

// PLAN_LIMITS removed - now dynamic from DB via auth plugin

export type SubscriptionStatus = {
  type:
    | "active"
    | "no_subscription"
    | "quota_exhausted"
    | "expired"
    | "past_due";
  plan: string;
  maxVehicles: number;
  currentCount: number;
  remainingQuota: number;
};

export type DashboardSummary = {
  totalCount: number;
  publishedCount: number;
  draftCount: number;
  soldCount: number;
  recentVehicles: any[];
};

// =============================================================================
// DATABASE QUERY OPTIMIZATION
// =============================================================================

/**
 * Optimized SELECT for vehicle lists - ONLY necessary fields
 * This prevents fetching large JSON fields and improves query performance
 */
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
  equipment: true, // Only if needed for listing
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

/**
 * Map frontend filter values to database enum values
 * Frontend: "mhev-diesel" -> Database: "MHEV_DIESEL"
 */
function toDbEnum(value: string): string {
  return value.toUpperCase().replace(/-/g, "_");
}

/**
 * Build optimized WHERE clause for vehicle queries
 * Uses database indexes for optimal performance
 */
export async function buildWhereClause(
  params: VehicleSearchParams,
  omitFilters: Partial<Record<keyof VehicleSearchParams, boolean>> = {},
): Promise<Prisma.VehicleWhereInput> {
  const where: Prisma.VehicleWhereInput = {};

  // Text search - assumes full-text index on make, model, version
  // For production: Use PostgreSQL full-text search or Elasticsearch
  if (!omitFilters.search && params.search) {
    where.OR = [
      { make: { contains: params.search, mode: "insensitive" } },
      { model: { contains: params.search, mode: "insensitive" } },
      { version: { contains: params.search, mode: "insensitive" } },
    ];
  }

  // Multi-select make (OR across selected makes)
  if (
    !omitFilters.make &&
    params.make &&
    Array.isArray(params.make) &&
    params.make.length > 0
  ) {
    const makeOr = params.make
      .filter((m) => m && m !== "any")
      .map((m) => ({ make: { equals: m, mode: "insensitive" as const } }));
    if (makeOr.length > 0) {
      where.AND = [
        ...(Array.isArray(where.AND)
          ? where.AND
          : where.AND
            ? [where.AND]
            : []),
        { OR: makeOr },
      ];
    }
  }

  // Multi-select model (OR across selected models)
  if (
    !omitFilters.model &&
    params.model &&
    Array.isArray(params.model) &&
    params.model.length > 0
  ) {
    const modelOr = params.model
      .filter((m) => m && m !== "any")
      .map((m) => ({ model: { equals: m, mode: "insensitive" as const } }));
    if (modelOr.length > 0) {
      where.AND = [
        ...(Array.isArray(where.AND)
          ? where.AND
          : where.AND
            ? [where.AND]
            : []),
        { OR: modelOr },
      ];
    }
  }

  // Exclude Make (NOT IN)
  if (
    params.excludeMake &&
    Array.isArray(params.excludeMake) &&
    params.excludeMake.length > 0
  ) {
    where.NOT = [
      ...(Array.isArray(where.NOT) ? where.NOT : where.NOT ? [where.NOT] : []),
      { make: { in: params.excludeMake, mode: "insensitive" as const } },
    ];
  }

  // Exclude Model (NOT IN)
  if (
    params.excludeModel &&
    Array.isArray(params.excludeModel) &&
    params.excludeModel.length > 0
  ) {
    where.NOT = [
      ...(Array.isArray(where.NOT) ? where.NOT : where.NOT ? [where.NOT] : []),
      { model: { in: params.excludeModel, mode: "insensitive" as const } },
    ];
  }

  // Range filters - indexed columns for optimal performance
  if (
    !omitFilters.priceFrom &&
    (params.priceFrom !== undefined || params.priceTo !== undefined)
  ) {
    where.price = {
      ...(params.priceFrom && { gte: params.priceFrom }),
      ...(params.priceTo && { lte: params.priceTo }),
    };
  }

  if (
    !omitFilters.registrationFrom &&
    (params.registrationFrom !== undefined ||
      params.registrationTo !== undefined)
  ) {
    where.registrationYear = {
      ...(params.registrationFrom && { gte: params.registrationFrom }),
      ...(params.registrationTo && { lte: params.registrationTo }),
    };
  }

  if (
    !omitFilters.kilometerFrom &&
    (params.kilometerFrom !== undefined || params.kilometerTo !== undefined)
  ) {
    where.kilometer = {
      ...(params.kilometerFrom && { gte: params.kilometerFrom }),
      ...(params.kilometerTo && { lte: params.kilometerTo }),
    };
  }

  if (params.powerFrom !== undefined || params.powerTo !== undefined) {
    where.hp = {
      ...(params.powerFrom && { gte: params.powerFrom }),
      ...(params.powerTo && { lte: params.powerTo }),
    };
  }

  if (params.kwFrom !== undefined || params.kwTo !== undefined) {
    where.kw = {
      ...(params.kwFrom ? { gte: params.kwFrom } : {}),
      ...(params.kwTo ? { lte: params.kwTo } : {}),
    };
  }

  // EV filter
  if (!omitFilters.evs && params.evs) {
    if (params.evs === "only_ev") {
      where.fuelType = "ELECTRIC";
    } else if (params.evs === "no_ev") {
      where.fuelType = { not: "ELECTRIC" };
    }
  }

  // Multi-select filters - uses IN operator with index
  if (!omitFilters.fuel && params.fuel && params.fuel.length > 0) {
    where.fuelType = { in: params.fuel.map(toDbEnum) as FuelType[] };
  }

  if (
    !omitFilters.transmission &&
    params.transmission &&
    params.transmission.length > 0
  ) {
    where.transmissionType = {
      in: params.transmission.map(toDbEnum) as TransmissionType[],
    };
  }

  if (
    !omitFilters.condition &&
    params.condition &&
    params.condition.length > 0
  ) {
    where.vehicleCondition = {
      in: params.condition.map(toDbEnum) as VehicleCondition[],
    };
  }

  if (
    !omitFilters.vehicleType &&
    params.vehicleType &&
    params.vehicleType.length > 0
  ) {
    where.vehicleType = {
      in: params.vehicleType.map(toDbEnum) as VehicleType[],
    };
  }

  // Body type (Karosserie) - string field; match case-insensitively for DB uppercase/lowercase
  if (!omitFilters.bodyType && params.bodyType && params.bodyType.length > 0) {
    const bodyTypeOr = params.bodyType.map((b) => ({
      bodyType: { equals: b, mode: "insensitive" as const },
    }));
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { OR: bodyTypeOr },
    ];
  }

  if (!omitFilters.color && params.color && params.color.length > 0) {
    where.color = { in: params.color.map(toDbEnum) as Color[] };
  }

  // Boolean filter
  if (!omitFilters.metallic && params.metallic !== undefined) {
    where.metallic = params.metallic;
  }

  // Drive type
  if (
    !omitFilters.driveType &&
    params.driveType &&
    params.driveType.length > 0
  ) {
    where.driveType = { in: params.driveType.map(toDbEnum) as DriveType[] };
  }

  // Cubic capacity (Hubraum)
  if (
    params.cubicCapacityFrom !== undefined ||
    params.cubicCapacityTo !== undefined
  ) {
    where.cubicCapacity = {
      ...(params.cubicCapacityFrom ? { gte: params.cubicCapacityFrom } : {}),
      ...(params.cubicCapacityTo ? { lte: params.cubicCapacityTo } : {}),
    };
  }

  // Cylinders
  if (params.cylindersFrom !== undefined || params.cylindersTo !== undefined) {
    where.cylinders = {
      ...(params.cylindersFrom ? { gte: params.cylindersFrom } : {}),
      ...(params.cylindersTo ? { lte: params.cylindersTo } : {}),
    };
  }

  // Consumption (consumptionTotal)
  if (
    params.consumptionFrom !== undefined ||
    params.consumptionTo !== undefined
  ) {
    where.consumptionTotal = {
      ...(params.consumptionFrom ? { gte: params.consumptionFrom } : {}),
      ...(params.consumptionTo ? { lte: params.consumptionTo } : {}),
    };
  }

  // CO2 emissions
  if (params.co2From !== undefined || params.co2To !== undefined) {
    where.co2Emission = {
      ...(params.co2From ? { gte: params.co2From } : {}),
      ...(params.co2To ? { lte: params.co2To } : {}),
    };
  }

  // Energy efficiency label
  if (
    !omitFilters.energyLabels &&
    params.energyLabels &&
    params.energyLabels.length > 0
  ) {
    where.energyLabel = {
      in: params.energyLabels.map(toDbEnum) as EnergyLabel[],
    };
  }

  // Emission standard (Euronorm)
  if (
    !omitFilters.emissionStandards &&
    params.emissionStandards &&
    params.emissionStandards.length > 0
  ) {
    where.emissionStandard = {
      in: params.emissionStandards.map(toDbEnum) as EmissionStandard[],
    };
  }

  // Inspection passed (MFK)
  if (!omitFilters.inspectionPassed && params.inspectionPassed === true) {
    where.inspectionPassed = true;
  }

  // Has warranty
  if (!omitFilters.hasWarranty && params.hasWarranty === true) {
    where.warranty = { not: null };
  }

  // Dealer filter
  if (!omitFilters.dealerId && params.dealerId) {
    where.dealerId = params.dealerId;
  }

  // Interior color
  if (
    !omitFilters.interiorColor &&
    params.interiorColor &&
    params.interiorColor.length > 0
  ) {
    where.interiorColor = { in: params.interiorColor.map(toDbEnum) as Color[] };
  }

  // Days listed (createdAt >= now - N days)
  if (!omitFilters.daysListed && params.daysListed != null) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - params.daysListed);
    where.createdAt = { gte: cutoff };
  }

  // JSON equipment filter - uses JSON path operators
  if (
    !omitFilters.equipment &&
    params.equipment &&
    params.equipment.length > 0
  ) {
    const equipmentClauses = params.equipment.map((item) => ({
      equipment: { path: [item], equals: true },
    }));
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      ...equipmentClauses,
    ];
  }

  where.status = "PUBLISHED";
  where.dealer = {
    user: {
      banned: { not: true },
    },
  };
  return where;
}

/**
 * Build ORDER BY clause
 */
function buildOrderBy(
  sort: VehicleSearchParams["sort"],
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
    case "relevance":
    default:
      return { createdAt: "desc" };
  }
}

/**
 * Helper to convert groupBy results to facet counts
 */
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

/**
 * Normalize facet keys to frontend format (lowercase, hyphen) so filter UI can look up by option value.
 * DB stores enums as UPPER_SNAKE; frontend uses lower-kebab.
 */
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

/** Normalize string facet keys to lowercase (e.g. make) for consistent UI lookup */
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

// =============================================================================
// PRICE RATING
// =============================================================================

/** Fetch average price per make+model across the whole catalogue (no filters). */
async function fetchAvgPriceMap(): Promise<Map<string, number>> {
  const rows = await prisma.vehicle.groupBy({
    by: ["make", "model"],
    _avg: { price: true },
  });
  const map = new Map<string, number>();
  for (const row of rows) {
    if (row._avg.price != null) {
      map.set(`${row.make}::${row.model ?? ""}`, row._avg.price);
    }
  }
  return map;
}

/** Compare vehicle price against market average for same make+model. */
function computePriceRating(price: number, avgPrice: number): PriceRating {
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
): VehicleListItem[] {
  return vehicles.map((v) => {
    const avg = avgMap.get(`${v.make}::${v.model ?? ""}`);
    return {
      ...v,
      priceRating: avg != null ? computePriceRating(v.price, avg) : undefined,
    };
  });
}

// =============================================================================
// PUBLIC ACTIONS
// =============================================================================

/**
 * Get vehicles with pagination and filtering
 * Optimized for production with caching and parallel queries
 */
/**
 * Internal core logic for vehicle fetching (Pure, no getTranslations)
 * This is the function that is actually cached
 */
async function _getVehicles(params: VehicleSearchParams) {
  const cacheKey = `vehicles:list:${JSON.stringify(params)}`;
  const cached = await cacheGet<PaginatedVehicles>(cacheKey);
  if (cached) return cached;

  // Calculate pagination
  const skip = (params.page - 1) * params.pageSize;
  const take = params.pageSize;

  // Build query
  const [where, orderBy] = await Promise.all([
    buildWhereClause(params),
    Promise.resolve(buildOrderBy(params.sort)),
  ]);

  // Execute queries in parallel for optimal performance
  const [total, vehicles, avgMap] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip,
      take,
      select: VEHICLE_LIST_SELECT,
    }),
    fetchAvgPriceMap(),
  ]);

  const totalPages = Math.ceil(total / params.pageSize);

  const result: PaginatedVehicles = {
    vehicles: attachPriceRatings(vehicles, avgMap),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages,
  };

  await cacheSet(cacheKey, result, 60);
  return result;
}

/**
 * Public action for fetching vehicles
 * Handles validation and calls the cached logic
 */
export async function getVehicles(rawParams: {
  [key: string]: string | string[] | undefined;
}): Promise<PaginatedVehicles> {
  const parsed = parseSearchParams(rawParams);
  const t = await getTranslations("VehicleSearchSchema");
  const schema = createVehicleSearchSchema(t);
  const params = schema.parse(parsed);

  return _getVehicles(params);
}

/**
 * Get vehicles with facet counts for filter UI
 * Optimized facet queries that exclude their own filter
 */
/**
 * Internal core logic for fetching vehicles with facets (Pure)
 */
async function _getVehiclesWithFacets(params: VehicleSearchParams) {
  const cacheKey = `vehicles:facets:${JSON.stringify(params)}`;
  const cached = await cacheGet<PaginatedVehicles>(cacheKey);
  if (cached) return cached;

  const skip = (params.page - 1) * params.pageSize;
  const take = params.pageSize;

  const [where, orderBy, facetBase] = await Promise.all([
    buildWhereClause(params),
    Promise.resolve(buildOrderBy(params.sort)),
    buildWhereClause(params, { make: true, model: true }),
  ]);

  // Execute ALL queries in parallel for maximum performance
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
      take,
      select: VEHICLE_LIST_SELECT,
    }),
    fetchAvgPriceMap(),
    // Facet aggregations - each excludes its own filter
    prisma.vehicle.groupBy({
      by: ["make"],
      where: facetBase,
      _count: { _all: true },
      orderBy: { make: "asc" },
    }),
    prisma.vehicle.groupBy({
      by: ["fuelType"],
      where: await buildWhereClause(params, { fuel: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["transmissionType"],
      where: await buildWhereClause(params, { transmission: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleCondition"],
      where: await buildWhereClause(params, { condition: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleType"],
      where: await buildWhereClause(params, { vehicleType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["bodyType"],
      where: await buildWhereClause(params, { bodyType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["color"],
      where: await buildWhereClause(params, { color: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["interiorColor"],
      where: await buildWhereClause(params, { interiorColor: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["driveType"],
      where: await buildWhereClause(params, { driveType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["energyLabel"],
      where: await buildWhereClause(params, { energyLabels: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["emissionStandard"],
      where: await buildWhereClause(params, { emissionStandards: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.count({
      where: {
        ...(await buildWhereClause(params, { metallic: true })),
        metallic: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...(await buildWhereClause(params, { inspectionPassed: true })),
        inspectionPassed: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...(await buildWhereClause(params, { hasWarranty: true })),
        warranty: { not: null },
      },
    }),
  ]);

  const totalPages = Math.ceil(total / params.pageSize);

  // Normalize enum/body facet keys to frontend format (lowercase, hyphen) so filter UI matches
  const facets: VehicleFacets = {
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

  const result: PaginatedVehicles = {
    vehicles: attachPriceRatings(vehicles, avgMap),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages,
    facets,
  };

  await cacheSet(cacheKey, result, 60);
  return result;
}

/**
 * Public action for fetching vehicles with facets
 */
export async function getVehiclesWithFacets(rawParams: {
  [key: string]: string | string[] | undefined;
}): Promise<PaginatedVehicles> {
  const parsed = parseSearchParams(rawParams);
  const t = await getTranslations("VehicleSearchSchema");
  const schema = createVehicleSearchSchema(t);
  const params = schema.parse(parsed);

  return _getVehiclesWithFacets(params);
}

/**
 * Get total count and facet counts only (no vehicle list). For advanced search / filter UI.
 */
export async function getVehicleCountAndFacets(rawParams: {
  [key: string]: string | string[] | undefined;
}): Promise<{ total: number; facets: VehicleFacets }> {
  const parsed = parseSearchParams(rawParams);
  const t = await getTranslations("VehicleSearchSchema");
  const schema = createVehicleSearchSchema(t);
  const params = schema.parse(parsed);

  const where = await buildWhereClause(params);
  const facetBase = await buildWhereClause(params, { make: true, model: true });
  // Pro histogram bases: ignore the specific range filter to keep chart stable
  const yearBase = await buildWhereClause(params, {
    registrationFrom: true,
    make: true,
    model: true,
  });
  const kmBase = await buildWhereClause(params, {
    kilometerFrom: true,
    make: true,
    model: true,
  });
  const priceBase = await buildWhereClause(params, {
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
      where: await buildWhereClause(params, { fuel: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["transmissionType"],
      where: await buildWhereClause(params, { transmission: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleCondition"],
      where: await buildWhereClause(params, { condition: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["vehicleType"],
      where: await buildWhereClause(params, { vehicleType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["bodyType"],
      where: await buildWhereClause(params, { bodyType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["color"],
      where: await buildWhereClause(params, { color: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["interiorColor"],
      where: await buildWhereClause(params, { interiorColor: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["driveType"],
      where: await buildWhereClause(params, { driveType: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["energyLabel"],
      where: await buildWhereClause(params, { energyLabels: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.groupBy({
      by: ["emissionStandard"],
      where: await buildWhereClause(params, { emissionStandards: true }),
      _count: { _all: true },
    }),
    prisma.vehicle.count({
      where: {
        ...(await buildWhereClause(params, { metallic: true })),
        metallic: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...(await buildWhereClause(params, { inspectionPassed: true })),
        inspectionPassed: true,
      },
    }),
    prisma.vehicle.count({
      where: {
        ...(await buildWhereClause(params, { hasWarranty: true })),
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
    // Year distribution for histogram - use yearBase to show full range
    prisma.vehicle.groupBy({
      by: ["registrationYear"],
      where: yearBase,
      _count: { _all: true },
      orderBy: { registrationYear: "asc" },
    }),
  ]);
  // Dynamic Kilometer Histogram (20 buckets up to max)
  const kmLimit = kilometerAgg._max.kilometer ?? 400000;
  const kmStep = Math.max(1000, Math.ceil(kmLimit / 20 / 1000) * 1000);
  const kmBucketCount = 20;

  // Dynamic Price Histogram (20 buckets up to max)
  const priceLimit = priceAgg._max.price ?? 200000;
  const priceStep = Math.max(1000, Math.ceil(priceLimit / 20 / 1000) * 1000);
  const priceBucketCount = 20;

  const [kmCounts, priceCounts] = await Promise.all([
    Promise.all(
      Array.from({ length: kmBucketCount }).map((_, i) =>
        prisma.vehicle.count({
          where: {
            ...kmBase,
            kilometer: { gte: i * kmStep, lt: (i + 1) * kmStep },
          },
        }),
      ),
    ),
    Promise.all(
      Array.from({ length: priceBucketCount }).map((_, i) =>
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

  const facets: VehicleFacets = {
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

  return { total, facets };
}

/**
 * Get single vehicle by ID
 * Cached for 5 minutes
 */
export async function getVehicle(id: string): Promise<VehicleDetails | null> {
  if (!id) return null;

  return (await prisma.vehicle.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      dealer: {
        user: {
          banned: { not: true },
        },
      },
    },
    select: {
      id: true,
      price: true,
      kilometer: true,
      registrationMonth: true,
      registrationYear: true,
      make: true,
      model: true,
      version: true,
      fuelType: true,
      transmissionType: true,
      gearTransmission: true,
      bodyType: true,
      color: true,
      interiorColor: true,
      metallic: true,
      vehicleCondition: true,
      lastInspectionDate: true,
      inspectionPassed: true,
      warranty: true,
      warrantyStartDate: true,
      duration: true,
      maxKm: true,
      doors: true,
      seats: true,
      hp: true,
      kw: true,
      energyLabel: true,
      typeApproval: true,
      wheelbase: true,
      vin: true,
      emptyWeight: true,
      loadCapacity: true,
      serialNumber: true,
      height: true,
      width: true,
      length: true,
      towingCapacityBraked: true,
      cubicCapacity: true,
      co2Emission: true,
      cylinders: true,
      numberOfGears: true,
      emissionStandard: true,
      consumptionCity: true,
      consumptionCountry: true,
      consumptionTotal: true,
      range: true,
      batteryCapacity: true,
      batteryRentalMonth: true,
      powerConsumption: true,
      batteryOwnership: true,
      chargingPlugTypeStandard: true,
      chargingPlugTypeFast: true,
      chargingPower: true,
      combustionEnginePowerHp: true,
      electricMotorPowerHp: true,
      vehicleDescription: true,
      equipment: true,
      extras: true,
      images: true,
      createdAt: true,
      dealer: {
        select: {
          id: true,
          companyName: true,
          description: true,
          website: true,
          logo: true,
          streetAddress: true,
          zipCode: true,
          city: true,
          phoneNumber: true,
          businessEmail: true,
          googlePlaceId: true,
          user: { select: { emailVerified: true } },
          openingHours: {
            select: {
              day: true,
              isOpen: true,
              openTime: true,
              closeTime: true,
            },
            orderBy: { day: "asc" },
          },
        },
      },
    },
  })) as unknown as VehicleDetails;
}

/**
 * Cached version for RSC (React Server Components)
 * Automatically cached with Next.js for optimal performance
 */
export async function getVehiclesWithFacetsCached(rawParams: {
  [key: string]: string | string[] | undefined;
}) {
  return getVehiclesWithFacets(rawParams);
}

/**
 * Cached single vehicle for RSC
 */
export async function getVehicleCached(id: string) {
  const cacheKey = `vehicle:${id}`;
  const cached =
    await cacheGet<Awaited<ReturnType<typeof getVehicle>>>(cacheKey);
  if (cached) return cached;

  const result = await getVehicle(id);
  if (result) await cacheSet(cacheKey, result, 300);
  return result;
}

/**
 * Get similar vehicles from the same dealer (excluding current vehicle)
 */
export async function getSimilarVehicles(
  dealerId: string,
  excludeId: string,
): Promise<VehicleListItem[]> {
  if (!dealerId) return [];

  const vehicles = await prisma.vehicle.findMany({
    where: {
      dealerId,
      NOT: { id: excludeId },
    },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: VEHICLE_LIST_SELECT,
  });

  return vehicles as VehicleListItem[];
}

// =============================================================================
// DASHBOARD / ADMIN ACTIONS
// =============================================================================

export async function getVehicleSubscriptionStatus(): Promise<SubscriptionStatus> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Parallel fetch: Dealer count from DB, Sub status from Plugin
  const [dealer, subscriptionsResponse] = await Promise.all([
    prisma.dealer.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    }),
    (auth.api as any).listActiveSubscriptions({
      headers: await headers(),
    }),
  ]);

  const currentCount = dealer
    ? await prisma.vehicle.count({ where: { dealerId: dealer.id } })
    : 0;

  const subscriptions = Array.isArray(subscriptionsResponse)
    ? subscriptionsResponse
    : (subscriptionsResponse as any)?.data || [];
  const limits = (subscriptionsResponse as any)?.limits;

  // Find priority subscription (active/trialing first)
  const activeSub = subscriptions.find(
    (s: any) =>
      s.status === "active" ||
      s.status === "trialing" ||
      s.status === "incomplete",
  );
  const pastDueSub = subscriptions.find(
    (s: any) => s.status === "past_due" || s.status === "unpaid",
  );

  const mainSub = activeSub || pastDueSub;

  if (!mainSub) {
    return {
      type: "no_subscription",
      plan: "",
      maxVehicles: 0,
      currentCount,
      remainingQuota: 0,
    };
  }

  let maxVehicles = limits?.vehicles || 0;

  // Fallback: If limits are missing from API, fetch from DB using plan name
  if (maxVehicles === 0 && mainSub.plan) {
    const plan = await prisma.plan.findFirst({
      where: {
        name: {
          contains: mainSub.plan,
          mode: "insensitive",
        },
      },
      select: { limits: true },
    });
    if (plan && (plan.limits as any)?.vehicles) {
      maxVehicles = (plan.limits as any).vehicles;
    }
  }

  const remainingQuota = Math.max(0, maxVehicles - currentCount);

  // Status mapping
  if (mainSub.status === "past_due" || mainSub.status === "unpaid") {
    return {
      type: "past_due",
      plan: mainSub.plan,
      maxVehicles,
      currentCount,
      remainingQuota,
    };
  }

  if (remainingQuota === 0 && maxVehicles > 0) {
    return {
      type: "quota_exhausted",
      plan: mainSub.plan,
      maxVehicles,
      currentCount,
      remainingQuota: 0,
    };
  }

  return {
    type: "active",
    plan: mainSub.plan,
    maxVehicles,
    currentCount,
    remainingQuota,
  };
}

/**
 * Get dashboard overview summary data
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  const dealer = await prisma.dealer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!dealer) {
    return {
      totalCount: 0,
      publishedCount: 0,
      draftCount: 0,
      soldCount: 0,
      recentVehicles: [],
    };
  }

  const [counts, recentVehicles] = await Promise.all([
    prisma.vehicle.groupBy({
      by: ["status"],
      where: { dealerId: dealer.id },
      _count: { _all: true },
    }),
    prisma.vehicle.findMany({
      where: { dealerId: dealer.id },
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

  return {
    totalCount,
    publishedCount,
    draftCount,
    soldCount,
    recentVehicles,
  };
}

export async function prepareVehicleListing(existingVehicleId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dealer = await prisma.dealer.findUnique({
    where: { userId: session.user.id },
  });

  if (!dealer) {
    throw new Error("Dealer profile not found");
  }

  // Subscription security check
  const status = await getVehicleSubscriptionStatus();

  if (!existingVehicleId) {
    // Blocking new creations for past_due, quota_exhausted, or expired
    if (status.type !== "active") {
      throw new Error(status.type);
    }
  } else {
    // Blocking edits only if subscription is completely dead
    if (status.type === "no_subscription" || status.type === "expired") {
      throw new Error("subscription_ended");
    }
  }

  return {
    listingId: existingVehicleId || createId(),
    country: "ch",
    dealerId: dealer.id,
  };
}

export async function getPresignedUrls(
  listingId: string,
  files: { name: string; type: string }[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const dealer = await prisma.dealer.findUnique({
    where: { userId: session.user.id },
  });

  if (!dealer) {
    throw new Error("Dealer profile not found");
  }

  const country = "ch";

  const urls = await Promise.all(
    files.map(async (file) => {
      const key = StorageService.formatPath(
        dealer.id,
        "listing",
        file.name,
        listingId,
      );

      const url = await storage.getUploadUrl(key, file.type);
      return { url, key };
    }),
  );

  return urls;
}

/**
 * Delete S3 image files that are no longer referenced by a vehicle.
 * Called after API delete/update to clean up orphaned storage objects.
 */
export async function cleanupImages(keys: string[]) {
  if (!keys.length) return;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("Unauthorized");

  await Promise.all(
    keys.map(async (key) => {
      try {
        await storage.deleteFile(key);
      } catch (e) {
        console.error(`Failed to delete image: ${key}`, e);
      }
    }),
  );
}

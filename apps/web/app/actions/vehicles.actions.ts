"use server";

/**
 * ============================================================================
 * VEHICLE ACTIONS - Production Grade
 * ============================================================================
 * ALL vehicle backend logic consolidated in ONE file
 * Optimized for thousands of vehicles with proper indexing and caching
 */

import { unstable_cache, revalidatePath } from "next/cache";
import { prisma } from "@repo/db";
import type { Prisma } from "@repo/db";
import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { createId } from "@paralleldrive/cuid2";
import { storage } from "@/lib/helpers/storage";
import { StorageService } from "@repo/storage";
import { vehicleFormSchema } from "@/schema/vehicle-form-schema";
import {
  type VehicleListItem,
  type VehicleDetails,
  type PaginatedVehicles,
  type VehicleFacets,
  type PriceRating,
} from "@/types/vehicle";
import {
  VehicleSearchSchema,
  type VehicleSearchParams,
} from "@/schema/vehicle-search-schema";

import { parseSearchParams } from "@/lib/helpers/vehicle";

const PLAN_LIMITS: Record<string, number> = {
  bronze: 5,
  silver: 10,
  gold: 15,
  diamond: 25,
};

export type SubscriptionStatus = {
  type: "active" | "no_subscription" | "quota_exhausted" | "expired";
  plan: string;
  maxVehicles: number;
  currentCount: number;
  remainingQuota: number;
  graceEnd: string | null;
  isGraceExpired: boolean;
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
  images: true,
  equipment: true, // Only if needed for listing
  dealer: {
    select: {
      id: true,
      companyName: true,
      city: true,
      zipCode: true,
      phoneNumber: true,
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
    where.fuelType = { in: params.fuel.map(toDbEnum) as any };
  }

  if (
    !omitFilters.transmission &&
    params.transmission &&
    params.transmission.length > 0
  ) {
    where.transmissionType = { in: params.transmission.map(toDbEnum) as any };
  }

  if (
    !omitFilters.condition &&
    params.condition &&
    params.condition.length > 0
  ) {
    where.vehicleCondition = { in: params.condition.map(toDbEnum) as any };
  }

  if (
    !omitFilters.vehicleType &&
    params.vehicleType &&
    params.vehicleType.length > 0
  ) {
    where.vehicleType = { in: params.vehicleType.map(toDbEnum) as any };
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
    where.color = { in: params.color.map(toDbEnum) as any };
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
    where.driveType = { in: params.driveType.map(toDbEnum) as any };
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
    where.energyLabel = { in: params.energyLabels.map(toDbEnum) as any };
  }

  // Emission standard (Euronorm)
  if (
    !omitFilters.emissionStandards &&
    params.emissionStandards &&
    params.emissionStandards.length > 0
  ) {
    where.emissionStandard = {
      in: params.emissionStandards.map(toDbEnum) as any,
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
    where.interiorColor = { in: params.interiorColor.map(toDbEnum) as any };
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
  if (pct > 0.2) return { label: "Überteuert", bars: 1, sentiment: "red" };
  if (pct > 0.05)
    return { label: "Fairer Preis", bars: 2, sentiment: "yellow" };
  if (pct > -0.05) return { label: "Guter Preis", bars: 3, sentiment: "green" };
  if (pct > -0.2)
    return { label: "Sehr guter Preis", bars: 4, sentiment: "green" };
  return { label: "Ausgezeichnet", bars: 5, sentiment: "green" };
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
export async function getVehicles(rawParams: {
  [key: string]: string | string[] | undefined;
}): Promise<PaginatedVehicles> {
  // Parse and validate search params
  const parsed = parseSearchParams(rawParams);
  const params = VehicleSearchSchema.parse(parsed);

  // Calculate pagination
  const skip = (params.page - 1) * params.pageSize;
  const take = params.pageSize;

  // Build query
  const where = await buildWhereClause(params);
  const orderBy = buildOrderBy(params.sort);

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

  return {
    vehicles: attachPriceRatings(vehicles, avgMap),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages,
  };
}

/**
 * Get vehicles with facet counts for filter UI
 * Optimized facet queries that exclude their own filter
 */
export async function getVehiclesWithFacets(rawParams: {
  [key: string]: string | string[] | undefined;
}): Promise<PaginatedVehicles> {
  const parsed = parseSearchParams(rawParams);
  const params = VehicleSearchSchema.parse(parsed);

  const skip = (params.page - 1) * params.pageSize;
  const take = params.pageSize;

  const where = await buildWhereClause(params);
  const orderBy = buildOrderBy(params.sort);

  // Facet base query (excludes make/model for cascading)
  const facetBase = await buildWhereClause(params, { make: true, model: true });

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

  return {
    vehicles: attachPriceRatings(vehicles, avgMap),
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
    facets,
  };
}

/**
 * Get total count and facet counts only (no vehicle list). For advanced search / filter UI.
 */
export async function getVehicleCountAndFacets(rawParams: {
  [key: string]: string | string[] | undefined;
}): Promise<{ total: number; facets: VehicleFacets }> {
  const parsed = parseSearchParams(rawParams);
  const params = VehicleSearchSchema.parse(parsed);

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

  return await prisma.vehicle.findUnique({
    where: { id },
    include: {
      dealer: {
        include: {
          openingHours: { orderBy: { day: "asc" } },
          user: { select: { emailVerified: true } },
        },
      },
    },
  });
}

/**
 * Cached version for RSC (React Server Components)
 * Automatically cached with Next.js for optimal performance
 */
export async function getVehiclesWithFacetsCached(rawParams: {
  [key: string]: string | string[] | undefined;
}) {
  const cacheKey = `vehicles:${JSON.stringify(rawParams)}`;

  return unstable_cache(
    async () => getVehiclesWithFacets(rawParams),
    [cacheKey],
    {
      revalidate: 60, // Cache for 60 seconds
      tags: ["vehicles", "facets"],
    },
  )();
}

/**
 * Cached single vehicle for RSC
 */
export async function getVehicleCached(id: string) {
  return unstable_cache(async () => getVehicle(id), [`vehicle:${id}`], {
    revalidate: 300, // Cache for 5 minutes
    tags: ["vehicles", `vehicle:${id}`],
  })();
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

  const dealer = await prisma.dealer.findUnique({
    where: { userId: session.user.id },
  });

  const currentCount = dealer
    ? await prisma.vehicle.count({ where: { dealerId: dealer.id } })
    : 0;

  const subscription = await prisma.subscription.findFirst({
    where: { referenceId: session.user.id },
    orderBy: { periodEnd: "desc" },
  });

  if (!subscription) {
    return {
      type: "no_subscription",
      plan: "",
      maxVehicles: 0,
      currentCount,
      remainingQuota: 0,
      graceEnd: null,
      isGraceExpired: false,
    };
  }

  const planName = subscription.plan.toLowerCase();
  const maxVehicles = PLAN_LIMITS[planName] ?? 0;
  const isActive = ["active", "trialing", "past_due"].includes(
    subscription.status,
  );

  if (!isActive) {
    const expiredAt =
      subscription.periodEnd ?? subscription.endedAt ?? subscription.canceledAt;
    const graceEnd = expiredAt
      ? new Date(expiredAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
      : null;
    const isGraceExpired = graceEnd ? new Date() > new Date(graceEnd) : true;
    return {
      type: "expired",
      plan: subscription.plan,
      maxVehicles,
      currentCount,
      remainingQuota: 0,
      graceEnd,
      isGraceExpired,
    };
  }

  const remainingQuota = Math.max(0, maxVehicles - currentCount);

  if (remainingQuota === 0) {
    return {
      type: "quota_exhausted",
      plan: subscription.plan,
      maxVehicles,
      currentCount,
      remainingQuota: 0,
      graceEnd: null,
      isGraceExpired: false,
    };
  }

  return {
    type: "active",
    plan: subscription.plan,
    maxVehicles,
    currentCount,
    remainingQuota,
    graceEnd: null,
    isGraceExpired: false,
  };
}

export async function prepareVehicleListing() {
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

  return {
    listingId: createId(),
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
      const key = StorageService.formatDealerPath(
        country,
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

export async function createVehicle(
  listingId: string,
  formData: any,
  imageKeys: string[],
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

  const validatedData = vehicleFormSchema.parse(formData);

  const subscription = await prisma.subscription.findFirst({
    where: {
      referenceId: session.user.id,
      status: { in: ["active", "trialing", "past_due"] },
    },
    orderBy: { periodEnd: "desc" },
  });

  const planName = subscription?.plan?.toLowerCase() || "";
  const maxVehicles = PLAN_LIMITS[planName] || 0;

  const currentCount = await prisma.vehicle.count({
    where: { dealerId: dealer.id },
  });

  if (currentCount >= maxVehicles) {
    return {
      error: `Limit erreicht: Ihr aktuelles Abo (${subscription?.plan || "Kein Abo"}) erlaubt maximal ${maxVehicles} Fahrzeuge.`,
    };
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      id: listingId,
      dealerId: dealer.id,
      vehicleType: validatedData.vehicleType.toUpperCase() as any,
      make: validatedData.make,
      model: validatedData.model || null,
      version: validatedData.version || null,
      bodyType: validatedData.bodyType,
      fuelType: validatedData.fuelType
        ? (validatedData.fuelType.toUpperCase().replace(/-/g, "_") as any)
        : null,
      registrationMonth: validatedData.registrationMonth,
      registrationYear: validatedData.registrationYear,
      kilometer: validatedData.kilometer,
      price: validatedData.price,
      newPrice: validatedData.newPrice || null,
      color: validatedData.color.toUpperCase() as any,
      gearTransmission: validatedData.gearTransmission
        ? (validatedData.gearTransmission.toUpperCase() as any)
        : null,
      transmissionType: validatedData.transmissionType
        ? (validatedData.transmissionType
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      driveType: validatedData.driveType
        ? (validatedData.driveType.toUpperCase() as any)
        : null,
      interiorColor: validatedData.interiorColor
        ? (validatedData.interiorColor.toUpperCase() as any)
        : null,
      metallic: validatedData.metallic,
      vehicleCondition: validatedData.vehicleCondition
        ? (validatedData.vehicleCondition
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      lastInspectionDate: validatedData.lastInspectionDate || null,
      inspectionPassed: validatedData.inspectionPassed,
      warranty: validatedData.warranty
        ? (validatedData.warranty.toUpperCase().replace(/-/g, "_") as any)
        : null,
      warrantyStartDate: validatedData.warrantyStartDate || null,
      duration: validatedData.duration || null,
      maxKm: validatedData.maxKm || null,
      doors: validatedData.doors || null,
      seats: validatedData.seats || null,
      hp: validatedData.hp || null,
      kw: validatedData.kw || null,
      energyLabel: validatedData.energyLabel
        ? (validatedData.energyLabel.toUpperCase() as any)
        : null,
      typeApproval: validatedData.typeApproval || null,
      wheelbase: validatedData.wheelbase || null,
      vin: validatedData.vehicleIdentificationNumber || null,
      emptyWeight: validatedData.emptyWeight || null,
      loadCapacity: validatedData.loadCapacity || null,
      serialNumber: validatedData.serialNumber || null,
      height: validatedData.height || null,
      width: validatedData.width || null,
      length: validatedData.length || null,
      towingCapacityBraked: validatedData.towingCapacityBraked || null,
      cubicCapacity: validatedData.cubicCapacity || null,
      co2Emission: validatedData.co2Emission || null,
      cylinders: validatedData.cylinders || null,
      numberOfGears: validatedData.numberOfGears || null,
      emissionStandard: validatedData.emissionStandard
        ? (validatedData.emissionStandard
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      consumptionCity: validatedData.consumptionCity || null,
      consumptionCountry: validatedData.consumptionCountry || null,
      consumptionTotal: validatedData.consumptionTotal || null,
      range: validatedData.range || null,
      batteryCapacity: validatedData.batteryCapacity || null,
      batteryRentalMonth: validatedData.batteryRentalMonth || null,
      powerConsumption: validatedData.powerConsumption || null,
      batteryOwnership: validatedData.batteryOwnership
        ? (validatedData.batteryOwnership
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPlugTypeStandard: validatedData.chargingPlugTypeStandard
        ? (validatedData.chargingPlugTypeStandard
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPlugTypeFast: validatedData.chargingPlugTypeFast
        ? (validatedData.chargingPlugTypeFast
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPower: validatedData.chargingPower || null,
      combustionEnginePowerHp: validatedData.combustionEnginePowerHp || null,
      electricMotorPowerHp: validatedData.electricMotorPowerHp || null,
      vehicleDescription: validatedData.vehicleDescription || null,
      equipment: validatedData.equipment || {},
      extras: validatedData.extras || {},
      images: imageKeys,
    },
  });

  revalidatePath("/dashboard/vehicles");
  return listingId;
}

export async function getDealerVehicles() {
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

  const vehicles = await prisma.vehicle.findMany({
    where: { dealerId: dealer.id },
    orderBy: { createdAt: "desc" },
  });

  return vehicles;
}

export async function getVehicleById(id: string) {
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

  const vehicle = await prisma.vehicle.findUnique({
    where: {
      id,
      dealerId: dealer.id,
    },
  });

  return vehicle;
}

export async function updateVehicle(
  vehicleId: string,
  formData: any,
  imageKeys: string[],
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

  const validatedData = vehicleFormSchema.parse(formData);

  const existingVehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId, dealerId: dealer.id },
    select: { images: true },
  });

  if (existingVehicle) {
    const oldImages = existingVehicle.images;
    const imagesToDelete = oldImages.filter((img) => !imageKeys.includes(img));

    if (imagesToDelete.length > 0) {
      await Promise.all(
        imagesToDelete.map(async (key) => {
          try {
            await storage.deleteFile(key);
          } catch (e) {
            console.error(`Failed to delete image: ${key}`, e);
          }
        }),
      );
    }
  }

  await prisma.vehicle.update({
    where: {
      id: vehicleId,
      dealerId: dealer.id,
    },
    data: {
      vehicleType: validatedData.vehicleType.toUpperCase() as any,
      make: validatedData.make,
      model: validatedData.model || null,
      version: validatedData.version || null,
      bodyType: validatedData.bodyType,
      fuelType: validatedData.fuelType
        ? (validatedData.fuelType.toUpperCase().replace(/-/g, "_") as any)
        : null,
      registrationMonth: validatedData.registrationMonth,
      registrationYear: validatedData.registrationYear,
      kilometer: validatedData.kilometer,
      price: validatedData.price,
      newPrice: validatedData.newPrice || null,
      color: validatedData.color.toUpperCase() as any,
      gearTransmission: validatedData.gearTransmission
        ? (validatedData.gearTransmission.toUpperCase() as any)
        : null,
      transmissionType: validatedData.transmissionType
        ? (validatedData.transmissionType
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      driveType: validatedData.driveType
        ? (validatedData.driveType.toUpperCase() as any)
        : null,
      interiorColor: validatedData.interiorColor
        ? (validatedData.interiorColor.toUpperCase() as any)
        : null,
      metallic: validatedData.metallic,
      vehicleCondition: validatedData.vehicleCondition
        ? (validatedData.vehicleCondition
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      lastInspectionDate: validatedData.lastInspectionDate || null,
      inspectionPassed: validatedData.inspectionPassed,
      warranty: validatedData.warranty
        ? (validatedData.warranty.toUpperCase().replace("-", "_") as any)
        : null,
      warrantyStartDate: validatedData.warrantyStartDate || null,
      duration: validatedData.duration || null,
      maxKm: validatedData.maxKm || null,
      doors: validatedData.doors || null,
      seats: validatedData.seats || null,
      hp: validatedData.hp || null,
      kw: validatedData.kw || null,
      energyLabel: validatedData.energyLabel
        ? (validatedData.energyLabel.toUpperCase() as any)
        : null,
      typeApproval: validatedData.typeApproval || null,
      wheelbase: validatedData.wheelbase || null,
      vin: validatedData.vehicleIdentificationNumber || null,
      emptyWeight: validatedData.emptyWeight || null,
      loadCapacity: validatedData.loadCapacity || null,
      serialNumber: validatedData.serialNumber || null,
      height: validatedData.height || null,
      width: validatedData.width || null,
      length: validatedData.length || null,
      towingCapacityBraked: validatedData.towingCapacityBraked || null,
      cubicCapacity: validatedData.cubicCapacity || null,
      co2Emission: validatedData.co2Emission || null,
      cylinders: validatedData.cylinders || null,
      numberOfGears: validatedData.numberOfGears || null,
      emissionStandard: validatedData.emissionStandard
        ? (validatedData.emissionStandard
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      consumptionCity: validatedData.consumptionCity || null,
      consumptionCountry: validatedData.consumptionCountry || null,
      consumptionTotal: validatedData.consumptionTotal || null,
      range: validatedData.range || null,
      batteryCapacity: validatedData.batteryCapacity || null,
      batteryRentalMonth: validatedData.batteryRentalMonth || null,
      powerConsumption: validatedData.powerConsumption || null,
      batteryOwnership: validatedData.batteryOwnership
        ? (validatedData.batteryOwnership
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPlugTypeStandard: validatedData.chargingPlugTypeStandard
        ? (validatedData.chargingPlugTypeStandard
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPlugTypeFast: validatedData.chargingPlugTypeFast
        ? (validatedData.chargingPlugTypeFast
            .toUpperCase()
            .replace(/-/g, "_") as any)
        : null,
      chargingPower: validatedData.chargingPower || null,
      combustionEnginePowerHp: validatedData.combustionEnginePowerHp || null,
      electricMotorPowerHp: validatedData.electricMotorPowerHp || null,
      vehicleDescription: validatedData.vehicleDescription || null,
      equipment: validatedData.equipment || {},
      extras: validatedData.extras || {},
      images: imageKeys,
    },
  });

  revalidatePath("/dashboard/vehicles");
  return vehicleId;
}

export async function deleteVehicle(id: string) {
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

  await prisma.vehicle.delete({
    where: {
      id,
      dealerId: dealer.id,
    },
  });

  revalidatePath("/dashboard/vehicles");
  return { success: true };
}

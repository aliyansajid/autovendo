"use server";

/**
 * ============================================================================
 * VEHICLE ACTIONS - Production Grade
 * ============================================================================
 * ALL vehicle backend logic consolidated in ONE file
 * Optimized for thousands of vehicles with proper indexing and caching
 */

import { unstable_cache } from "next/cache";
import { prisma } from "@repo/db";
import type { Prisma } from "@repo/db";
import {
  VehicleSearchSchema,
  type VehicleSearchParams,
  type VehicleListItem,
  type VehicleDetails,
  type PaginatedVehicles,
  type VehicleFacets,
} from "@/lib/schemas/vehicle.schema";
import { parseSearchParams } from "@/lib/helpers/vehicle";

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
function buildWhereClause(
  params: VehicleSearchParams,
  omitFilters: Partial<Record<keyof VehicleSearchParams, boolean>> = {},
): Prisma.VehicleWhereInput {
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

  // Exact match filters - indexed columns
  if (!omitFilters.make && params.make && params.make !== "any") {
    where.make = { equals: params.make, mode: "insensitive" };
  }

  if (!omitFilters.model && params.model && params.model !== "any") {
    where.model = { equals: params.model, mode: "insensitive" };
  }

  // Range filters - indexed columns for optimal performance
  if (params.priceFrom !== undefined || params.priceTo !== undefined) {
    where.price = {
      ...(params.priceFrom && { gte: params.priceFrom }),
      ...(params.priceTo && { lte: params.priceTo }),
    };
  }

  if (
    params.registrationFrom !== undefined ||
    params.registrationTo !== undefined
  ) {
    where.registrationYear = {
      ...(params.registrationFrom && { gte: params.registrationFrom }),
      ...(params.registrationTo && { lte: params.registrationTo }),
    };
  }

  if (params.kilometerFrom !== undefined || params.kilometerTo !== undefined) {
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

  if (!omitFilters.color && params.color && params.color.length > 0) {
    where.color = { in: params.color.map(toDbEnum) as any };
  }

  // Boolean filter
  if (!omitFilters.metallic && params.metallic !== undefined) {
    where.metallic = params.metallic;
  }

  // JSON equipment filter - uses JSON path operators
  if (
    !omitFilters.equipment &&
    params.equipment &&
    params.equipment.length > 0
  ) {
    where.AND = params.equipment.map((item) => ({
      equipment: { path: [item], equals: true },
    }));
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
  const where = buildWhereClause(params);
  const orderBy = buildOrderBy(params.sort);

  // Execute queries in parallel for optimal performance
  const [total, vehicles] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip,
      take,
      select: VEHICLE_LIST_SELECT,
    }),
  ]);

  const totalPages = Math.ceil(total / params.pageSize);

  return {
    vehicles: vehicles as VehicleListItem[],
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

  const where = buildWhereClause(params);
  const orderBy = buildOrderBy(params.sort);

  // Facet base query (excludes make/model for cascading)
  const facetBase = buildWhereClause(params, { make: true, model: true });

  // Execute ALL queries in parallel for maximum performance
  const [
    total,
    vehicles,
    makeRows,
    fuelRows,
    transmissionRows,
    conditionRows,
    typeRows,
    colorRows,
  ] = await Promise.all([
    prisma.vehicle.count({ where }),
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip,
      take,
      select: VEHICLE_LIST_SELECT,
    }),
    // Facet aggregations - each excludes its own filter
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
      by: ["color"],
      where: buildWhereClause(params, { color: true }),
      _count: { _all: true },
    }),
  ]);

  const facets: VehicleFacets = {
    make: toFacetCounts(makeRows, "make"),
    fuelType: toFacetCounts(fuelRows, "fuelType"),
    transmissionType: toFacetCounts(transmissionRows, "transmissionType"),
    vehicleCondition: toFacetCounts(conditionRows, "vehicleCondition"),
    vehicleType: toFacetCounts(typeRows, "vehicleType"),
    color: toFacetCounts(colorRows, "color"),
  };

  return {
    vehicles: vehicles as VehicleListItem[],
    total,
    page: params.page,
    pageSize: params.pageSize,
    totalPages: Math.ceil(total / params.pageSize),
    facets,
  };
}

/**
 * Get single vehicle by ID
 * Cached for 5 minutes
 */
export async function getVehicle(id: string): Promise<VehicleDetails | null> {
  if (!id) return null;

  return await prisma.vehicle.findUnique({
    where: { id },
    include: { dealer: true },
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

import { z } from "zod";
import type { Prisma } from "@repo/db";

/**
 * ============================================================================
 * VEHICLE SCHEMA - Production Grade
 * ============================================================================
 * Single source of truth for vehicle types, validation, and constants
 */

// =============================================================================
// CONSTANTS
// =============================================================================

export const SORT_OPTIONS = [
  "relevance",
  "price-asc",
  "price-desc",
  "kilometer-asc",
  "kilometer-desc",
  "registration-asc",
  "registration-desc",
  "created-asc",
  "created-desc",
] as const;

export const FUEL_TYPES = [
  "petrol",
  "ethanol-petrol",
  "diesel",
  "electric",
  "cng-petrol",
  "lpg-petrol",
  "mhev-diesel",
  "mhev-petrol",
  "phev-diesel",
  "phev-petrol",
  "hev-diesel",
  "hev-petrol",
  "hydrogen",
] as const;

export const TRANSMISSION_TYPES = [
  "automatic",
  "automatic-stepless",
  "semi-automatic",
  "manual",
] as const;

export const VEHICLE_CONDITIONS = [
  "new",
  "demonstration",
  "pre-registered",
  "used",
  "oldtimer",
] as const;

export const VEHICLE_TYPES = ["car", "utility", "truck", "camper"] as const;

/** Body type (Karosserie) - used for cars listing filter; stored as string in DB */
export const BODY_TYPES = [
  "bus",
  "cabriolet",
  "coupe",
  "small-car",
  "estate",
  "minivan",
  "saloon",
  "pickup",
  "suv",
] as const;

export const COLORS = [
  "anthracite",
  "beige",
  "black",
  "blue",
  "bordeaux",
  "brown",
  "gold",
  "gray",
  "green",
  "multicoloured",
  "orange",
  "pink",
  "red",
  "silver",
  "turquoise",
  "violet",
  "white",
  "yellow",
  "other",
] as const;

// =============================================================================
// TYPESCRIPT TYPES
// =============================================================================

export type SortOption = (typeof SORT_OPTIONS)[number];
export type FuelType = (typeof FUEL_TYPES)[number];
export type TransmissionType = (typeof TRANSMISSION_TYPES)[number];
export type VehicleCondition = (typeof VEHICLE_CONDITIONS)[number];
export type VehicleType = (typeof VEHICLE_TYPES)[number];
export type BodyType = (typeof BODY_TYPES)[number];
export type Color = (typeof COLORS)[number];

/**
 * Optimized vehicle list item - ONLY fields needed for listing
 */
export interface VehicleListItem {
  id: string;
  make: string;
  model: string | null;
  version: string | null;
  price: number;
  kilometer: number;
  registrationMonth: number | null;
  registrationYear: number | null;
  kw: number | null;
  hp: number | null;
  fuelType: string | null;
  vehicleCondition: string | null;
  images: string[];
  equipment: Prisma.JsonValue | null;
  dealer: {
    id: string;
    companyName: string;
    city: string;
    zipCode: string;
    phoneNumber: string | null;
  };
}

/**
 * Full vehicle details - For single vehicle page
 */
export type VehicleDetails = Prisma.VehicleGetPayload<{
  include: { dealer: true };
}>;

/**
 * Facet counts for filtering
 */
export interface VehicleFacets {
  make: Record<string, number>;
  fuelType: Record<string, number>;
  transmissionType: Record<string, number>;
  vehicleCondition: Record<string, number>;
  vehicleType: Record<string, number>;
  bodyType: Record<string, number>;
  color: Record<string, number>;
}

/**
 * Paginated response
 */
export interface PaginatedVehicles {
  vehicles: VehicleListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets?: VehicleFacets;
}

// =============================================================================
// ZOD VALIDATION SCHEMAS
// =============================================================================

/**
 * Search parameters validation
 */
export const VehicleSearchSchema = z.object({
  // Pagination
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),

  // Sorting
  sort: z.enum(SORT_OPTIONS).default("relevance"),

  // Text search
  search: z.string().trim().default(""),

  // Filters (multi-select)
  make: z.array(z.string().trim()).optional(),
  model: z.array(z.string().trim()).optional(),

  priceFrom: z.number().int().nonnegative().optional(),
  priceTo: z.number().int().nonnegative().optional(),

  registrationFrom: z.number().int().min(1900).max(2100).optional(),
  registrationTo: z.number().int().min(1900).max(2100).optional(),

  kilometerFrom: z.number().int().nonnegative().optional(),
  kilometerTo: z.number().int().nonnegative().optional(),

  powerFrom: z.number().int().nonnegative().optional(),
  powerTo: z.number().int().nonnegative().optional(),

  // Multi-select filters
  fuel: z.array(z.enum(FUEL_TYPES)).optional(),
  transmission: z.array(z.enum(TRANSMISSION_TYPES)).optional(),
  condition: z.array(z.enum(VEHICLE_CONDITIONS)).optional(),
  vehicleType: z.array(z.enum(VEHICLE_TYPES)).optional(),
  bodyType: z.array(z.enum(BODY_TYPES)).optional(),
  color: z.array(z.enum(COLORS)).optional(),
  equipment: z.array(z.string()).optional(),

  // Special filters
  evs: z.enum(["only_ev", "no_ev"]).optional(),
  metallic: z.boolean().optional(),
});

export type VehicleSearchParams = z.infer<typeof VehicleSearchSchema>;

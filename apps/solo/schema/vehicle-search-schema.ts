import { z } from "zod";
import {
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  VEHICLE_CONDITIONS,
  VEHICLE_TYPES,
  BODY_TYPES,
  COLORS,
  SORT_OPTIONS,
} from "@repo/vehicle-constants";

type TFn = (key: string) => string;

export const createVehicleSearchSchema = (t: TFn) =>
  z.object({
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
    excludeMake: z.array(z.string().trim()).optional(),
    excludeModel: z.array(z.string().trim()).optional(),

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

    // kW-based power filter (separate from hp/powerFrom/powerTo)
    kwFrom: z.number().int().nonnegative().optional(),
    kwTo: z.number().int().nonnegative().optional(),

    // Interior color
    interiorColor: z.array(z.string()).optional(),

    // Days since listed
    daysListed: z.number().int().positive().optional(),

    // Drive type
    driveType: z.array(z.string()).optional(),

    // Engine / capacity
    cubicCapacityFrom: z.number().int().nonnegative().optional(),
    cubicCapacityTo: z.number().int().nonnegative().optional(),
    cylindersFrom: z.number().int().nonnegative().optional(),
    cylindersTo: z.number().int().nonnegative().optional(),

    // Consumption / emissions
    consumptionFrom: z.number().nonnegative().optional(),
    consumptionTo: z.number().nonnegative().optional(),
    co2From: z.number().int().nonnegative().optional(),
    co2To: z.number().int().nonnegative().optional(),

    // Energy & emission standard
    energyLabels: z.array(z.string()).optional(),
    emissionStandards: z.array(z.string()).optional(),

    // Inspection / warranty
    inspectionPassed: z.boolean().optional(),
    hasWarranty: z.boolean().optional(),

  });

export type VehicleSearchParams = z.infer<
  ReturnType<typeof createVehicleSearchSchema>
>;

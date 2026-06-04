import { z } from "zod";
import { SORT_OPTIONS } from "@repo/vehicle-constants";

type TFn = (key: string) => string;

export const createVehicleSearchSchema = (t: TFn) =>
  z.object({
    // Pagination
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(10),

    // Sorting
    sort: z.enum(SORT_OPTIONS).catch("relevance").default("relevance"),

    // Text search
    q: z.string().trim().default(""),

    // Filters (multi-select)
    make: z.array(z.string().trim()).optional(),
    model: z.array(z.string().trim()).optional(),
    excludeMake: z.array(z.string().trim()).optional(),
    excludeModel: z.array(z.string().trim()).optional(),

    priceFrom: z.number().int().optional().catch(undefined),
    priceTo: z.number().int().optional().catch(undefined),

    registrationFrom: z.number().int().optional().catch(undefined),
    registrationTo: z.number().int().optional().catch(undefined),

    kilometerFrom: z.number().int().optional().catch(undefined),
    kilometerTo: z.number().int().optional().catch(undefined),

    powerFrom: z.number().int().optional().catch(undefined),
    powerTo: z.number().int().optional().catch(undefined),

    // Multi-select filters
    fuel: z.array(z.string()).optional(),
    transmission: z.array(z.string()).optional(),
    condition: z.array(z.string()).optional(),
    vehicleType: z.array(z.string()).optional(),
    bodyType: z.array(z.string()).optional(),
    color: z.array(z.string()).optional(),
    equipment: z.array(z.string()).optional(),

    // Special filters
    evs: z.enum(["only_ev", "no_ev"]).optional().catch(undefined),
    metallic: z.boolean().optional(),

    // kW-based power filter (separate from hp/powerFrom/powerTo)
    kwFrom: z.number().int().optional().catch(undefined),
    kwTo: z.number().int().optional().catch(undefined),

    // Interior color
    interiorColor: z.array(z.string()).optional(),

    // Days since listed
    daysListed: z.number().int().optional().catch(undefined),

    // Drive type
    driveType: z.array(z.string()).optional(),

    // Engine / capacity
    cubicCapacityFrom: z.number().int().optional().catch(undefined),
    cubicCapacityTo: z.number().int().optional().catch(undefined),
    cylindersFrom: z.number().int().optional().catch(undefined),
    cylindersTo: z.number().int().optional().catch(undefined),

    // Consumption / emissions
    consumptionFrom: z.number().optional().catch(undefined),
    consumptionTo: z.number().optional().catch(undefined),
    co2From: z.number().int().optional().catch(undefined),
    co2To: z.number().int().optional().catch(undefined),

    // Energy & emission standard
    energyLabels: z.array(z.string()).optional(),
    emissionStandards: z.array(z.string()).optional(),

    // Inspection / warranty
    inspectionPassed: z.boolean().optional(),
    hasWarranty: z.boolean().optional(),

    // Dealer context (for dealer-specific advanced search)
    dealerId: z.string().optional(),
  });

export type VehicleSearchParams = z.infer<
  ReturnType<typeof createVehicleSearchSchema>
>;

import { z } from "zod";

export function createVehicleSearchSchema() {
  return z
    .object({
      // Array filters
      make: z.array(z.string()).optional().default([]),
      model: z.array(z.string()).optional().default([]),
      excludeMake: z.array(z.string()).optional().default([]),
      fuel: z.array(z.string()).optional().default([]),
      transmission: z.array(z.string()).optional().default([]),
      condition: z.array(z.string()).optional().default([]),
      vehicleType: z.array(z.string()).optional().default([]),
      bodyType: z.array(z.string()).optional().default([]),
      color: z.array(z.string()).optional().default([]),
      driveType: z.array(z.string()).optional().default([]),
      equipment: z.array(z.string()).optional().default([]),
      energyLabels: z.array(z.string()).optional().default([]),
      emissionStandards: z.array(z.string()).optional().default([]),
      interiorColor: z.array(z.string()).optional().default([]),
      batteryOwnership: z.array(z.string()).optional().default([]),
      chargingPlugTypeStandard: z.array(z.string()).optional().default([]),
      chargingPlugTypeFast: z.array(z.string()).optional().default([]),
      // Numeric range filters
      priceFrom: z.number().optional(),
      priceTo: z.number().optional(),
      registrationFrom: z.number().optional(),
      registrationTo: z.number().optional(),
      kilometerFrom: z.number().optional(),
      kilometerTo: z.number().optional(),
      powerFrom: z.number().optional(),
      powerTo: z.number().optional(),
      kwFrom: z.number().optional(),
      kwTo: z.number().optional(),
      cubicCapacityFrom: z.number().optional(),
      cubicCapacityTo: z.number().optional(),
      cylindersFrom: z.number().optional(),
      cylindersTo: z.number().optional(),
      co2From: z.number().optional(),
      co2To: z.number().optional(),
      consumptionFrom: z.number().optional(),
      consumptionTo: z.number().optional(),
      rangeFrom: z.number().optional(),
      rangeTo: z.number().optional(),
      doorsFrom: z.number().optional(),
      doorsTo: z.number().optional(),
      seatsFrom: z.number().optional(),
      seatsTo: z.number().optional(),
      daysListed: z.number().optional(),
      // Boolean filters
      metallic: z.boolean().optional(),
      inspectionPassed: z.boolean().optional(),
      hasWarranty: z.boolean().optional(),
      // Other
      evs: z.string().optional(),
      q: z.string().optional(),
      page: z.number().optional(),
      sort: z.string().optional(),
    })
    .loose();
}

export type VehicleSearchParams = z.infer<
  ReturnType<typeof createVehicleSearchSchema>
>;

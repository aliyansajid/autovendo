import { z } from "zod";

type TFn = (key: string) => string;

export const createVehicleFiltersSchema = (t: TFn) =>
  z
    .object({
      priceFrom: z.string().optional(),
      priceTo: z.string().optional(),
      registrationFrom: z.string().optional(),
      registrationTo: z.string().optional(),
      kilometerFrom: z.string().optional(),
      kilometerTo: z.string().optional(),
      condition: z.array(z.string()).optional(),
      make: z.array(z.string()).optional(),
      fuel: z.array(z.string()).optional(),
      power: z.array(z.string()).optional(),
      vehicleType: z.array(z.string()).optional(),
      bodyType: z.array(z.string()).optional(),
      evs: z.array(z.string()).optional(),
      transmission: z.array(z.string()).optional(),
      color: z.array(z.string()).optional(),
      metallic: z.boolean().optional(),
    })
    .catchall(
      z.union([z.boolean(), z.string(), z.array(z.string())]).optional(),
    );

export type VehicleFiltersValues = z.infer<
  ReturnType<typeof createVehicleFiltersSchema>
>;
// For backward compatibility until we replace all imports
export const vehicleFiltersSchema = z
  .object({
    priceFrom: z.string().optional(),
    priceTo: z.string().optional(),
    registrationFrom: z.string().optional(),
    registrationTo: z.string().optional(),
    kilometerFrom: z.string().optional(),
    kilometerTo: z.string().optional(),
    condition: z.array(z.string()).optional(),
    make: z.array(z.string()).optional(),
    fuel: z.array(z.string()).optional(),
    power: z.array(z.string()).optional(),
    vehicleType: z.array(z.string()).optional(),
    bodyType: z.array(z.string()).optional(),
    evs: z.array(z.string()).optional(),
    transmission: z.array(z.string()).optional(),
    color: z.array(z.string()).optional(),
    metallic: z.boolean().optional(),
  })
  .catchall(z.union([z.boolean(), z.string(), z.array(z.string())]).optional());

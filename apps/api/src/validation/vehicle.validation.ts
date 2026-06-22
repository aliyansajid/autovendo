/**
 * Server-side validation for vehicle listings — mirrors the client Zod schema
 * (apps/seller/schema/vehicle-form-schema.ts) so the same rules are enforced
 * whether the request comes from the UI or a direct API call.
 *
 * Enum membership is validated against the Prisma-generated enums (the DB's
 * source of truth). `status`/`planId` are validated for shape only and are NOT
 * persisted from here — the service applies them via guarded status transitions
 * and payment/quota checks; payment fields are written only by the Stripe webhook.
 */
import { z } from "zod";
import {
  VehicleType,
  VehicleStatus,
  BodyType,
  FuelType,
  Color,
  GearTransmission,
  TransmissionType,
  DriveType,
  VehicleCondition,
  Warranty,
  EnergyLabel,
  EmissionStandard,
  BatteryOwnership,
  ChargingPlugTypeStandard,
  ChargingPlugTypeFast,
} from "../generated/prisma/enums";
import { SWISS_CITY_VALUES } from "./swiss-cities";

const enumOf = (obj: Record<string, string>) =>
  z.enum(Object.values(obj) as [string, ...string[]]);

const SWISS_CITY_SET = new Set(SWISS_CITY_VALUES);
const swissZip = z.string().regex(/^\d{4}$/, "Invalid Swiss postal code");
const swissPhone = z
  .string()
  .regex(
    /^(\+41|0041|0)\s?([1-9]{2})\s?(\d{3})\s?(\d{2})\s?(\d{2})$/,
    "Invalid phone number",
  );
const swissCity = z
  .string()
  .refine((v) => SWISS_CITY_SET.has(v), "Invalid city");

const intIn = (min: number, max: number) =>
  z.coerce.number().int().min(min).max(max);
const floatIn = (min: number, max: number) =>
  z.coerce.number().min(min).max(max);

const CURRENT_YEAR = new Date().getFullYear();

// VIN: ISO 3779 — exactly 17 alphanumeric chars, excluding I/O/Q.
const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{17}$/;

// All fields optional here; `createVehicleSchema` re-requires the mandatory ones.
const vehicleBase = z.object({
  vehicleType: enumOf(VehicleType),
  make: z.string().min(1).max(50),
  model: z.string().max(50).optional(),
  version: z.string().max(50).optional(),

  bodyType: enumOf(BodyType),
  fuelType: enumOf(FuelType).optional(),
  gearTransmission: enumOf(GearTransmission).optional(),
  transmissionType: enumOf(TransmissionType).optional(),
  driveType: enumOf(DriveType).optional(),

  color: enumOf(Color),
  interiorColor: enumOf(Color).optional(),
  metallic: z.boolean().optional(),

  vehicleCondition: enumOf(VehicleCondition).optional(),
  registrationMonth: intIn(1, 12),
  registrationYear: intIn(1900, CURRENT_YEAR),
  kilometer: z.coerce.number().int().min(0),

  lastInspectionDate: z.coerce.date().optional(),
  inspectionPassed: z.boolean().optional(),

  warranty: enumOf(Warranty).optional(),
  warrantyStartDate: z.coerce.date().optional(),
  duration: intIn(1, 120).optional(),
  maxKm: intIn(0, 500000).optional(),

  price: z.coerce.number().int().min(0),
  newPrice: z.coerce.number().int().min(0).optional(),

  seats: intIn(1, 150).optional(),
  doors: intIn(1, 20).optional(),
  hp: intIn(1, 4000).optional(),
  kw: intIn(1, 3000).optional(),
  combustionEnginePowerHp: intIn(1, 2500).optional(),
  electricMotorPowerHp: intIn(1, 4000).optional(),

  cubicCapacity: intIn(1, 30000).optional(),
  cylinders: intIn(1, 16).optional(),
  numberOfGears: intIn(1, 10).optional(),

  length: intIn(1, 30000).optional(),
  width: intIn(1, 5000).optional(),
  height: intIn(1, 6000).optional(),
  wheelbase: intIn(1, 15000).optional(),

  emptyWeight: intIn(1, 100000).optional(),
  loadCapacity: intIn(0, 100000).optional(),
  towingCapacityBraked: intIn(0, 100000).optional(),

  co2Emission: intIn(0, 1000).optional(),
  emissionStandard: enumOf(EmissionStandard).optional(),
  energyLabel: enumOf(EnergyLabel).optional(),

  consumptionCity: floatIn(0, 100).optional(),
  consumptionCountry: floatIn(0, 100).optional(),
  consumptionTotal: floatIn(0, 100).optional(),

  range: intIn(1, 1500).optional(),
  batteryCapacity: floatIn(0, 500).optional(),
  powerConsumption: floatIn(0, 100).optional(),
  chargingPower: floatIn(0, 1000).optional(),
  batteryRentalMonth: intIn(1, 120).optional(),
  batteryOwnership: enumOf(BatteryOwnership).optional(),
  chargingPlugTypeStandard: enumOf(ChargingPlugTypeStandard).optional(),
  chargingPlugTypeFast: enumOf(ChargingPlugTypeFast).optional(),

  vin: z.string().regex(VIN_REGEX).optional(),
  serialNumber: z.string().max(100).optional(),
  typeApproval: z.string().max(50).optional(),
  vehicleDescription: z.string().max(1000).optional(),

  equipment: z.record(z.string(), z.boolean().optional()).optional(),
  extras: z.record(z.string(), z.boolean().optional()).optional(),

  // Image FILES arrive as multipart, not in this body. `existingImages` lists the
  // already-stored keys to keep on edit. The service enforces the 5–25 total
  // (kept + newly uploaded) since that count spans both the body and the files.
  existingImages: z.array(z.string()).max(25).optional(),

  // Contact / location (required so every listing carries usable details).
  // companyName is optional — private sellers have none.
  companyName: z.string().max(50).optional(),
  businessEmail: z.union([z.string().email(), z.literal("")]).optional(),
  phoneNumber: swissPhone,
  address: z.string().min(5).max(100),
  zipCode: swissZip,
  city: swissCity,

  // Accepted but not written from the allowlist — kept so the service can read
  // the requested status / plan. The actual status is set via validated
  // transitions and payment/quota checks; planId drives checkout.
  status: enumOf(VehicleStatus).optional(),
  planId: z.enum(["standard", "best_value"]).optional(),
});

// Create: all the listing-critical fields are required.
export const createVehicleSchema = vehicleBase;
// Update: any subset may be sent; whatever is present must still be valid.
export const updateVehicleSchema = vehicleBase.partial();

export type VehicleCreateInput = z.infer<typeof createVehicleSchema>;
export type VehicleUpdateInput = z.infer<typeof updateVehicleSchema>;

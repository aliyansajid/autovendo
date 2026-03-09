import { z } from "zod";

// Helper for optional non-negative numeric fields
const optionalNonNegativeNumber = z.preprocess(
  (val) => (val === "" || val === undefined ? undefined : Number(val)),
  z.number().min(0, "Wert darf nicht negativ sein").optional(),
);

export const vehicleFormSchema = z.object({
  // Vehicle Type (Mandatory)
  vehicleType: z.enum(["car", "utility", "truck", "camper"], {
    error: "Bitte wählen Sie einen Fahrzeugtyp.",
  }),

  // Vehicle Features (Mandatory: make, bodyType, color)
  make: z
    .string({ error: "Bitte wählen Sie eine Marke." })
    .min(1, "Bitte wählen Sie eine Marke."),
  model: z.string().optional(),
  version: z.string().optional(),
  bodyType: z.string({ error: "Bitte wählen Sie eine Karosserie." }).min(1),
  color: z.string({ error: "Bitte wählen Sie eine Farbe." }).min(1),

  // State (Mandatory: registrationMonth, registrationYear, kilometer)
  registrationMonth: z.coerce
    .number({ error: "Monat ist erforderlich" })
    .min(1)
    .max(12),
  registrationYear: z.coerce
    .number({ error: "Jahr ist erforderlich" })
    .min(1900)
    .max(new Date().getFullYear()),
  kilometer: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z
      .number({ error: "Kilometerstand ist erforderlich" })
      .min(0, "Kilometerstand darf nicht negativ sein"),
  ),

  // Price (Mandatory)
  price: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z
      .number({ error: "Preis ist erforderlich" })
      .min(0, "Preis darf nicht negativ sein"),
  ),
  newPrice: optionalNonNegativeNumber,

  // Detailed Information
  vehicleDescription: z.string().optional(),

  // Technical Data
  doors: optionalNonNegativeNumber,
  seats: optionalNonNegativeNumber,
  hp: optionalNonNegativeNumber,
  kw: optionalNonNegativeNumber,
  typeApproval: z.string().optional(),
  wheelbase: optionalNonNegativeNumber,
  vehicleIdentificationNumber: z.string().optional(),
  emptyWeight: optionalNonNegativeNumber,
  loadCapacity: optionalNonNegativeNumber,
  serialNumber: z.string().optional(),
  height: optionalNonNegativeNumber,
  width: optionalNonNegativeNumber,
  length: optionalNonNegativeNumber,
  towingCapacityBraked: optionalNonNegativeNumber,

  // Combustion / Hybrid
  consumptionCity: optionalNonNegativeNumber,
  consumptionCountry: optionalNonNegativeNumber,
  consumptionTotal: optionalNonNegativeNumber,
  cubicCapacity: optionalNonNegativeNumber,
  co2Emission: optionalNonNegativeNumber,
  cylinders: optionalNonNegativeNumber,
  numberOfGears: optionalNonNegativeNumber,

  // Electric
  range: optionalNonNegativeNumber,
  batteryCapacity: optionalNonNegativeNumber,
  batteryRentalMonth: optionalNonNegativeNumber,
  powerConsumption: optionalNonNegativeNumber,

  chargingPower: optionalNonNegativeNumber,
  chargingTime80: optionalNonNegativeNumber,
  fastChargingTime80: optionalNonNegativeNumber,
  chargingTime100: optionalNonNegativeNumber,
  fastChargingTime100: optionalNonNegativeNumber,
  electricMotorPowerHp: optionalNonNegativeNumber,
  combustionEnginePowerHp: optionalNonNegativeNumber,

  images: z.any().optional(),

  // Contact Details
  companyName: z.string().optional(),
  businessEmail: z.email().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
});

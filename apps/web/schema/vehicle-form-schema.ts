import { z } from "zod";
import {
  VehicleTypeEnum,
  GearTransmissionEnum,
  TransmissionTypeEnum,
  DriveTypeEnum,
  ColorEnum,
  VehicleConditionEnum,
  WarrantyEnum,
  EnergyLabelEnum,
  BatteryOwnershipEnum,
  ChargingPlugTypeStandardEnum,
  ChargingPlugTypeFastEnum,
  EmissionStandardEnum,
  EquipmentEnum,
} from "@/constants";
import {
  carMakes,
  carBodyTypeEnum,
  carFuelTypeEnum,
  carExtrasEnum,
} from "@/constants/cars";
import {
  utilityMakes,
  utilityBodyTypeEnum,
  utilityFuelTypeEnum,
  utilityExtrasEnum,
} from "@/constants/commercial-vehicles";
import {
  truckMakes,
  truckBodyTypeEnum,
  truckFuelTypeEnum,
  truckExtrasEnum,
} from "@/constants/truck";
import {
  camperMakes,
  camperBodyTypeEnum,
  camperFuelTypeEnum,
  camperExtrasEnum,
} from "@/constants/camper";

// --- Aggregated Constants for Validation ---

const VALID_VEHICLE_TYPES = VehicleTypeEnum.map((v) => v.value) as string[];
const VALID_GEAR_TRANSMISSIONS = GearTransmissionEnum.map(
  (v) => v.value,
) as string[];
const VALID_TRANSMISSION_TYPES = TransmissionTypeEnum.map(
  (v) => v.value,
) as string[];
const VALID_DRIVE_TYPES = DriveTypeEnum.map((v) => v.value) as string[];
const VALID_COLORS = ColorEnum.map((v) => v.value) as string[];
const VALID_CONDITIONS = VehicleConditionEnum.map((v) => v.value) as string[];
const VALID_WARRANTIES = WarrantyEnum.map((v) => v.value) as string[];
const VALID_ENERGY_LABELS = EnergyLabelEnum.map((v) => v.value) as string[];
const VALID_BATTERY_OWNERSHIPS = BatteryOwnershipEnum.map(
  (v) => v.value,
) as string[];
const VALID_CHARGING_AC = ChargingPlugTypeStandardEnum.map(
  (v) => v.value,
) as string[];
const VALID_CHARGING_DC = ChargingPlugTypeFastEnum.map(
  (v) => v.value,
) as string[];
const VALID_EMISSION_STANDARDS = EmissionStandardEnum.map(
  (v) => v.value,
) as string[];

const VALID_MAKES = Array.from(
  new Set([
    ...carMakes.flatMap((g) => g.items.map((i) => i.value)),
    ...utilityMakes.flatMap((g) => g.items.map((i) => i.value)),
    ...truckMakes.flatMap((g) => g.items.map((i) => i.value)),
    ...camperMakes.flatMap((g) => g.items.map((i) => i.value)),
  ]),
) as string[];

const VALID_BODY_TYPES = Array.from(
  new Set([
    ...carBodyTypeEnum.map((v) => v.value),
    ...utilityBodyTypeEnum.map((v) => v.value),
    ...truckBodyTypeEnum.map((v) => v.value),
    ...camperBodyTypeEnum.map((v) => v.value),
  ]),
) as string[];

const VALID_FUEL_TYPES = Array.from(
  new Set([
    ...carFuelTypeEnum.map((v) => v.value),
    ...utilityFuelTypeEnum.map((v) => v.value),
    ...truckFuelTypeEnum.map((v) => v.value),
    ...camperFuelTypeEnum.map((v) => v.value),
  ]),
) as string[];

const VALID_EQUIPMENT_KEYS = EquipmentEnum.map((v) => v.value) as string[];
const VALID_EXTRAS_KEYS = Array.from(
  new Set([
    ...carExtrasEnum.map((v) => v.value),
    ...utilityExtrasEnum.map((v) => v.value),
    ...truckExtrasEnum.map((v) => v.value),
    ...camperExtrasEnum.map((v) => v.value),
  ]),
) as string[];

const ACCEPTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
];

// --- Helpers ---

const optionalNonNegativeNumber = z.preprocess(
  (val) => (val === "" || val === undefined ? undefined : Number(val)),
  z.number().min(0, "Wert darf nicht negativ sein").optional(),
);

const enumField = (validValues: string[], errorMsg: string) =>
  z.string().refine((val) => !val || validValues.includes(val), errorMsg);

// --- Schema ---

export const vehicleFormSchema = z.object({
  // Vehicle Type (Mandatory)
  vehicleType: z
    .string({ error: "Bitte wählen Sie einen Fahrzeugtyp." })
    .refine((val) => VALID_VEHICLE_TYPES.includes(val), "Ungültiger Typ"),

  // Vehicle Features (Mandatory: make, bodyType, color)
  make: z
    .string({ error: "Bitte wählen Sie eine Marke." })
    .refine((val) => VALID_MAKES.includes(val), "Ungültige Marke"),
  model: z.string().optional(),
  version: z.string().optional(),
  gearTransmission: enumField(
    VALID_GEAR_TRANSMISSIONS,
    "Ungültiges Getriebe",
  ).optional(),
  transmissionType: enumField(
    VALID_TRANSMISSION_TYPES,
    "Ungültiger Getriebetyp",
  ).optional(),
  driveType: enumField(VALID_DRIVE_TYPES, "Ungültiger Antrieb").optional(),
  bodyType: z
    .string({ error: "Bitte wählen Sie eine Karosserie." })
    .refine((val) => VALID_BODY_TYPES.includes(val), "Ungültige Karosserie"),
  fuelType: enumField(VALID_FUEL_TYPES, "Ungültiger Treibstoff").optional(),
  color: z
    .string({ error: "Bitte wählen Sie eine Farbe." })
    .refine((val) => VALID_COLORS.includes(val), "Ungültige Farbe"),
  interiorColor: enumField(VALID_COLORS, "Ungültige Innenfarbe").optional(),
  metallic: z.boolean().default(false),

  // State (Mandatory: registrationMonth, registrationYear, kilometer)
  vehicleCondition: enumField(
    VALID_CONDITIONS,
    "Ungültiger Zustand",
  ).optional(),
  lastInspectionDate: z.date().optional(),
  registrationMonth: z.coerce
    .number({ error: "Monat ist erforderlich" })
    .min(1)
    .max(12),
  registrationYear: z.coerce
    .number({ error: "Jahr ist erforderlich" })
    .min(1900)
    .max(new Date().getFullYear()),
  inspectionPassed: z.boolean().default(false),
  kilometer: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z
      .number({ error: "Kilometerstand ist erforderlich" })
      .min(0, "Kilometerstand darf nicht negativ sein"),
  ),

  // Warranty
  warranty: enumField(VALID_WARRANTIES, "Ungültige Garantie").optional(),
  warrantyStartDate: z.date().optional(),
  duration: optionalNonNegativeNumber,
  maxKm: optionalNonNegativeNumber,

  // Price (Mandatory)
  price: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z
      .number({ error: "Preis ist erforderlich" })
      .min(0, "Preis darf nicht negativ sein"),
  ),
  newPrice: optionalNonNegativeNumber,

  // Technical Data
  doors: optionalNonNegativeNumber,
  seats: optionalNonNegativeNumber,
  hp: optionalNonNegativeNumber,
  kw: optionalNonNegativeNumber,
  energyLabel: enumField(VALID_ENERGY_LABELS, "Ungültiges Label").optional(),
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
  batteryOwnership: enumField(
    VALID_BATTERY_OWNERSHIPS,
    "Ungültiges Modell",
  ).optional(),
  chargingPlugTypeStandard: enumField(
    VALID_CHARGING_AC,
    "Ungültiger Stecker",
  ).optional(),
  chargingPlugTypeFast: enumField(
    VALID_CHARGING_DC,
    "Ungültiger Stecker",
  ).optional(),
  chargingPower: optionalNonNegativeNumber,
  combustionEnginePowerHp: optionalNonNegativeNumber,
  electricMotorPowerHp: optionalNonNegativeNumber,
  emissionStandard: enumField(
    VALID_EMISSION_STANDARDS,
    "Ungültiger Emissionsstandard",
  ).optional(),

  vehicleDescription: z.string().optional(),

  // Equipment & Extras
  equipment: z
    .record(z.string(), z.boolean().optional())
    .refine(
      (val) =>
        Object.keys(val).every((key) => VALID_EQUIPMENT_KEYS.includes(key)),
      "Ungültige Ausstattungstaste",
    )
    .optional(),
  extras: z
    .record(z.string(), z.boolean().optional())
    .refine(
      (val) => Object.keys(val).every((key) => VALID_EXTRAS_KEYS.includes(key)),
      "Ungültige Extras-Taste",
    )
    .optional(),

  // Images with MIME type validation
  images: z
    .array(
      z
        .union([z.instanceof(File), z.string()])
        .refine(
          (file) =>
            typeof file === "string" ||
            (file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type)),
          {
            message: "Nur PNG, JPG, JPEG oder WEBP Bilder sind erlaubt",
          },
        ),
    )
    .optional(),

  // Contact Details
  companyName: z.string().optional(),
  businessEmail: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  zipCode: z.string().optional(),
  city: z.string().optional(),
});

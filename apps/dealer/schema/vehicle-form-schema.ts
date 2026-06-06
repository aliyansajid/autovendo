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
} from "@repo/vehicle-constants";
import {
  carMakes,
  carBodyTypeEnum,
  carFuelTypeEnum,
  carExtrasEnum,
} from "@repo/vehicle-constants";
import {
  utilityMakes,
  utilityBodyTypeEnum,
  utilityFuelTypeEnum,
  utilityExtrasEnum,
} from "@repo/vehicle-constants";
import {
  truckMakes,
  truckBodyTypeEnum,
  truckFuelTypeEnum,
  truckExtrasEnum,
} from "@repo/vehicle-constants";
import {
  camperMakes,
  camperBodyTypeEnum,
  camperFuelTypeEnum,
  camperExtrasEnum,
} from "@repo/vehicle-constants";

type TFn = (key: string) => string;

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
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// ─── Helpers ──────────────────────────────────────────────────────────────────

const numericField = (min: number, max: number) =>
  z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(min).max(max).optional(),
  );

// Converts empty string to undefined so the DB NULL check passes (LENGTH check only applies when NOT NULL)
const optionalStringField = (max: number, maxMsg: string) =>
  z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? undefined : val),
    z.string().min(1).max(max, maxMsg).optional(),
  );

const enumField = (validValues: string[], errorMsg: string) =>
  z.string().refine((val) => !val || validValues.includes(val), errorMsg);

// ─── Schema ───────────────────────────────────────────────────────────────────

export const createVehicleFormSchema = (t: TFn) =>
  z.object({
    // ── Vehicle type ────────────────────────────────────────────────────────
    vehicleType: z
      .string({ error: t("vehicleTypeRequired") })
      .refine((val) => VALID_VEHICLE_TYPES.includes(val), t("invalidType")),
    status: z
      .enum(["DRAFT", "PUBLISHED", "PAUSED", "SOLD", "ARCHIVED"])
      .default("PUBLISHED"),

    // ── Identity ─────────────────────────────────────────────────────────────
    make: z
      .string({ error: t("makeRequired") })
      .max(50, t("makeTooLong"))
      .refine((val) => VALID_MAKES.includes(val), t("invalidMake")),
    model: optionalStringField(50, t("modelTooLong")),
    version: optionalStringField(50, t("versionTooLong")),

    // ── Body & drivetrain ────────────────────────────────────────────────────
    bodyType: z
      .string({ error: t("bodyTypeRequired") })
      .refine((val) => VALID_BODY_TYPES.includes(val), t("invalidBodyType")),
    fuelType: enumField(VALID_FUEL_TYPES, t("invalidFuelType")).optional(),
    gearTransmission: enumField(
      VALID_GEAR_TRANSMISSIONS,
      t("invalidGearTransmission"),
    ).optional(),
    transmissionType: enumField(
      VALID_TRANSMISSION_TYPES,
      t("invalidTransmissionType"),
    ).optional(),
    driveType: enumField(VALID_DRIVE_TYPES, t("invalidDriveType")).optional(),

    // ── Appearance ───────────────────────────────────────────────────────────
    color: z
      .string({ error: t("colorRequired") })
      .refine((val) => VALID_COLORS.includes(val), t("invalidColor")),
    interiorColor: enumField(
      VALID_COLORS,
      t("invalidInteriorColor"),
    ).optional(),
    metallic: z.boolean().default(false),

    // ── Condition & registration ─────────────────────────────────────────────
    vehicleCondition: enumField(
      VALID_CONDITIONS,
      t("invalidCondition"),
    ).optional(),
    registrationMonth: z.coerce
      .number({ error: t("monthRequired") })
      .min(1)
      .max(12),
    registrationYear: z.coerce
      .number({ error: t("yearRequired") })
      .min(1900)
      .max(new Date().getFullYear()),
    kilometer: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z
        .number({ error: t("kilometerRequired") })
        .min(0, t("negativeKilometerError")),
    ),

    // ── Inspection ───────────────────────────────────────────────────────────
    lastInspectionDate: z.date().optional(),
    inspectionPassed: z.boolean().default(false),

    // ── Warranty ─────────────────────────────────────────────────────────────
    warranty: enumField(VALID_WARRANTIES, t("invalidWarranty")).optional(),
    warrantyStartDate: z.date().optional(),
    duration: numericField(1, 120), // 1–120 months (max 10 years)
    maxKm: numericField(0, 500000),

    // ── Price ────────────────────────────────────────────────────────────────
    price: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number({ error: t("priceRequired") }).min(0, t("negativePriceError")),
    ),
    newPrice: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number().min(0).optional(),
    ),

    // ── Cabin ────────────────────────────────────────────────────────────────
    seats: numericField(1, 150), // buses/coaches can exceed 80
    doors: numericField(1, 20), // buses have multiple entry sets

    // ── Power ────────────────────────────────────────────────────────────────
    // Total: Yangwang U9 Xtreme 3,000 hp is production max
    hp: numericField(1, 4000),
    kw: numericField(1, 3000),
    // Combustion: Hennessey Venom F5 1,817 hp
    combustionEnginePowerHp: numericField(1, 2500),
    // Electric: Yangwang U9 Xtreme 3,000 hp
    electricMotorPowerHp: numericField(1, 4000),

    // ── Engine ───────────────────────────────────────────────────────────────
    cubicCapacity: numericField(1, 30000), // up to ~16,000cc for trucks
    cylinders: numericField(1, 16), // V16 Bugatti Tourbillon is max
    numberOfGears: numericField(1, 10), // 10-speed is production max

    // ── Dimensions (mm) ──────────────────────────────────────────────────────
    length: numericField(1, 30000),
    width: numericField(1, 5000),
    height: numericField(1, 6000),
    wheelbase: numericField(1, 15000),

    // ── Weight & capacity (kg) ───────────────────────────────────────────────
    emptyWeight: numericField(1, 100000),
    loadCapacity: numericField(0, 100000),
    towingCapacityBraked: numericField(0, 100000),

    // ── Emissions ────────────────────────────────────────────────────────────
    co2Emission: numericField(0, 1000), // Bugatti ~520 g/km is production max
    emissionStandard: enumField(
      VALID_EMISSION_STANDARDS,
      t("invalidEmissionStandard"),
    ).optional(),
    energyLabel: enumField(
      VALID_ENERGY_LABELS,
      t("invalidEnergyLabel"),
    ).optional(),

    // ── Consumption (l/100km or kWh/100km) ───────────────────────────────────
    consumptionCity: numericField(0, 100),
    consumptionCountry: numericField(0, 100),
    consumptionTotal: numericField(0, 100),

    // ── Electric ─────────────────────────────────────────────────────────────
    range: numericField(1, 1500), // BYD 1,036 km is production max
    batteryCapacity: numericField(0, 500), // current max ~200 kWh
    powerConsumption: numericField(0, 100), // kWh/100km
    chargingPower: numericField(0, 1000), // fastest current ~350 kW
    batteryRentalMonth: numericField(1, 120),
    batteryOwnership: enumField(
      VALID_BATTERY_OWNERSHIPS,
      t("invalidBatteryOwnership"),
    ).optional(),
    chargingPlugTypeStandard: enumField(
      VALID_CHARGING_AC,
      t("invalidChargingAC"),
    ).optional(),
    chargingPlugTypeFast: enumField(
      VALID_CHARGING_DC,
      t("invalidChargingDC"),
    ).optional(),

    // ── Identifiers ──────────────────────────────────────────────────────────
    // VIN: ISO 3779 — exactly 17 alphanumeric chars, no I/O/Q
    vehicleIdentificationNumber: z
      .string()
      .regex(/^[A-HJ-NPR-Z0-9]{17}$/, t("invalidVin"))
      .optional()
      .or(z.literal("")),
    serialNumber: optionalStringField(100, t("serialNumberTooLong")),
    typeApproval: optionalStringField(50, t("typeApprovalTooLong")),

    // ── Description ──────────────────────────────────────────────────────────
    vehicleDescription: z.string().optional(),

    // ── Equipment & Extras ───────────────────────────────────────────────────
    equipment: z
      .record(z.string(), z.boolean().optional())
      .refine(
        (val) =>
          Object.keys(val).every((key) => VALID_EQUIPMENT_KEYS.includes(key)),
        t("invalidEquipmentKey"),
      )
      .optional(),
    extras: z
      .record(z.string(), z.boolean().optional())
      .refine(
        (val) =>
          Object.keys(val).every((key) => VALID_EXTRAS_KEYS.includes(key)),
        t("invalidExtrasKey"),
      )
      .optional(),

    // ── Images ───────────────────────────────────────────────────────────────
    images: z
      .array(
        z
          .union([z.instanceof(File), z.string()])
          .refine(
            (file) =>
              typeof file === "string" ||
              (file instanceof File &&
                ACCEPTED_IMAGE_TYPES.includes(file.type)),
            { message: t("invalidImageType") },
          )
          .refine(
            (file) =>
              typeof file === "string" ||
              (file instanceof File && file.size <= MAX_FILE_SIZE),
            { message: t("fileTooLarge") },
          ),
      )
      .min(5, t("minImagesError"))
      .max(10, t("maxImagesError")),

    // ── Contact ──────────────────────────────────────────────────────────────
    companyName: z.string().optional(),
    businessEmail: z
      .string()
      .email(t("invalidEmail"))
      .optional()
      .or(z.literal("")),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    zipCode: z.string().optional(),
    city: z.string().optional(),
  });

export type VehicleFormValues = z.infer<
  ReturnType<typeof createVehicleFormSchema>
>;

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
  carMakes,
  carBodyTypeEnum,
  carFuelTypeEnum,
  carExtrasEnum,
  utilityMakes,
  utilityBodyTypeEnum,
  utilityFuelTypeEnum,
  utilityExtrasEnum,
  truckMakes,
  truckBodyTypeEnum,
  truckFuelTypeEnum,
  truckExtrasEnum,
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

// --- Helpers ---

const createOptionalNonNegativeNumber = (t: TFn) =>
  z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, t("negativeError")).optional(),
  );

const enumField = (validValues: string[], errorMsg: string) =>
  z.string().refine((val) => !val || validValues.includes(val), errorMsg);

// --- Schema ---

export const createVehicleFormSchema = (t: TFn) =>
  z.object({
    // Vehicle Type (Mandatory)
    vehicleType: z
      .string({ error: t("vehicleTypeRequired") })
      .refine((val) => VALID_VEHICLE_TYPES.includes(val), t("invalidType")),
    status: z
      .enum(["DRAFT", "PUBLISHED", "PAUSED", "SOLD", "ARCHIVED", "BANNED"])
      .default("PUBLISHED"),

    // Vehicle Features (Mandatory: make, bodyType, color)
    make: z
      .string({ error: t("makeRequired") })
      .refine((val) => VALID_MAKES.includes(val), t("invalidMake")),
    model: z.string().optional(),
    version: z.string().optional(),
    gearTransmission: enumField(
      VALID_GEAR_TRANSMISSIONS,
      t("invalidGearTransmission"),
    ).optional(),
    transmissionType: enumField(
      VALID_TRANSMISSION_TYPES,
      t("invalidTransmissionType"),
    ).optional(),
    driveType: enumField(VALID_DRIVE_TYPES, t("invalidDriveType")).optional(),
    bodyType: z
      .string({ error: t("bodyTypeRequired") })
      .refine((val) => VALID_BODY_TYPES.includes(val), t("invalidBodyType")),
    fuelType: enumField(VALID_FUEL_TYPES, t("invalidFuelType")).optional(),
    color: z
      .string({ error: t("colorRequired") })
      .refine((val) => VALID_COLORS.includes(val), t("invalidColor")),
    interiorColor: enumField(
      VALID_COLORS,
      t("invalidInteriorColor"),
    ).optional(),
    metallic: z.boolean().default(false),

    // State (Mandatory: registrationMonth, registrationYear, kilometer)
    vehicleCondition: enumField(
      VALID_CONDITIONS,
      t("invalidCondition"),
    ).optional(),
    lastInspectionDate: z.date().optional(),
    registrationMonth: z.coerce
      .number({ error: t("monthRequired") })
      .min(1)
      .max(12),
    registrationYear: z.coerce
      .number({ error: t("yearRequired") })
      .min(1900)
      .max(new Date().getFullYear()),
    inspectionPassed: z.boolean().default(false),
    kilometer: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z
        .number({ error: t("kilometerRequired") })
        .min(0, t("negativeKilometerError")),
    ),

    // Warranty
    warranty: enumField(VALID_WARRANTIES, t("invalidWarranty")).optional(),
    warrantyStartDate: z.date().optional(),
    duration: createOptionalNonNegativeNumber(t),
    maxKm: createOptionalNonNegativeNumber(t),

    // Price (Mandatory)
    price: z.preprocess(
      (val) => (val === "" || val === undefined ? undefined : Number(val)),
      z.number({ error: t("priceRequired") }).min(0, t("negativePriceError")),
    ),
    newPrice: createOptionalNonNegativeNumber(t),

    // Technical Data
    doors: createOptionalNonNegativeNumber(t),
    seats: createOptionalNonNegativeNumber(t),
    hp: createOptionalNonNegativeNumber(t),
    kw: createOptionalNonNegativeNumber(t),
    energyLabel: enumField(
      VALID_ENERGY_LABELS,
      t("invalidEnergyLabel"),
    ).optional(),
    typeApproval: z.string().optional(),
    wheelbase: createOptionalNonNegativeNumber(t),
    vehicleIdentificationNumber: z
      .string({ error: t("vinRequired") })
      .length(17, t("vinLength")),
    planId: z
      .enum(["standard", "best_value"], { error: t("planRequired") })
      .optional(),
    emptyWeight: createOptionalNonNegativeNumber(t),
    loadCapacity: createOptionalNonNegativeNumber(t),
    serialNumber: z.string().optional(),
    height: createOptionalNonNegativeNumber(t),
    width: createOptionalNonNegativeNumber(t),
    length: createOptionalNonNegativeNumber(t),
    towingCapacityBraked: createOptionalNonNegativeNumber(t),

    // Combustion / Hybrid
    consumptionCity: createOptionalNonNegativeNumber(t),
    consumptionCountry: createOptionalNonNegativeNumber(t),
    consumptionTotal: createOptionalNonNegativeNumber(t),
    cubicCapacity: createOptionalNonNegativeNumber(t),
    co2Emission: createOptionalNonNegativeNumber(t),
    cylinders: createOptionalNonNegativeNumber(t),
    numberOfGears: createOptionalNonNegativeNumber(t),

    // Electric
    range: createOptionalNonNegativeNumber(t),
    batteryCapacity: createOptionalNonNegativeNumber(t),
    batteryRentalMonth: createOptionalNonNegativeNumber(t),
    powerConsumption: createOptionalNonNegativeNumber(t),
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
    chargingPower: createOptionalNonNegativeNumber(t),
    combustionEnginePowerHp: createOptionalNonNegativeNumber(t),
    electricMotorPowerHp: createOptionalNonNegativeNumber(t),
    emissionStandard: enumField(
      VALID_EMISSION_STANDARDS,
      t("invalidEmissionStandard"),
    ).optional(),

    vehicleDescription: z.string().optional(),

    // Equipment & Extras
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

    // Images with MIME type validation
    images: z
      .array(
        z
          .union([z.instanceof(File), z.string()])
          .refine(
            (file) =>
              typeof file === "string" ||
              (file instanceof File &&
                ACCEPTED_IMAGE_TYPES.includes(file.type)),
            {
              message: t("invalidImageType"),
            },
          )
          .refine(
            (file) =>
              typeof file === "string" ||
              (file instanceof File && file.size <= MAX_FILE_SIZE),
            {
              message: t("fileTooLarge"),
            },
          ),
      )
      .min(5, t("minImagesError"))
      .max(10, t("maxImagesError"))
      .optional(),

    // Contact Details
    companyName: z.string().optional(),
    businessEmail: z.email(t("invalidEmail")).optional().or(z.literal("")),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    zipCode: z.string().optional(),
    city: z.string().optional(),
  });

export type VehicleFormValues = z.infer<
  ReturnType<typeof createVehicleFormSchema>
>;

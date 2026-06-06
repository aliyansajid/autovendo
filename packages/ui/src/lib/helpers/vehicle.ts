/**
 * ============================================================================
 * VEHICLE HELPERS - Production Grade
 * ============================================================================
 * Vehicle-specific business logic helpers
 */

/**
 * Build vehicle title from parts
 */
export function buildVehicleTitle(
  make: string,
  model: string | null,
  version: string | null,
): string {
  const parts = [make, model, version].filter(Boolean);
  return parts.join(" ").trim();
}

/**
 * Format vehicle name with proper capitalization
 */
export function formatVehicleName(
  parts: (string | null | undefined)[],
): string {
  const raw = parts
    .filter((p): p is string => !!p && p.trim().length > 0)
    .join(" ");

  return raw
    .split(" ")
    .filter(Boolean)
    .map((word) =>
      word
        .split("-")
        .map((segment) => {
          const firstChar = segment.charAt(0);
          if (!firstChar) return "";
          return firstChar.toUpperCase() + segment.slice(1);
        })
        .join("-"),
    )
    .join(" ");
}

/**
 * Extract equipment keys from JSON
 */
export function extractEquipment(
  equipment: Record<string, unknown> | null | undefined,
  limit?: number,
): string[] {
  if (!equipment || typeof equipment !== "object") return [];

  const entries = Object.entries(equipment)
    .filter(([_, value]) => value === true)
    .map(([key]) => key);

  return limit ? entries.slice(0, limit) : entries;
}

/**
 * Format equipment key to readable label
 * Example: "airConditioning" -> "Air Conditioning"
 */
export function formatEquipmentLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Check if vehicle is electric
 */
export function isElectric(fuelType: string | null): boolean {
  return fuelType?.toUpperCase() === "ELECTRIC";
}

/**
 * Check if vehicle is new
 */
export function isNew(condition: string | null): boolean {
  return condition?.toUpperCase() === "NEW";
}

/** Param keys that are always parsed as string[] (multi-select filters) */
const ARRAY_PARAM_KEYS = new Set([
  "make",
  "model",
  "excludeMake",
  "excludeModel",
  "fuel",
  "transmission",
  "condition",
  "vehicleType",
  "bodyType",
  "color",
  "equipment",
  "driveType",
  "energyLabels",
  "emissionStandards",
  "interiorColor",
  "batteryOwnership",
  "chargingPlugTypeStandard",
  "chargingPlugTypeFast",
]);

/**
 * Parse URL search params to validated search object
 */
export function parseSearchParams(params: {
  [key: string]: string | string[] | undefined;
}): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;

    // Handle arrays (comma-separated or multiple values)
    if (Array.isArray(value)) {
      result[key] = value;
    } else if (value.includes(",") || ARRAY_PARAM_KEYS.has(key)) {
      const raw = typeof value === "string" ? value.split(",") : [value];
      result[key] = raw
        .map((v) => (typeof v === "string" ? v.trim() : String(v)))
        .filter(Boolean);
    } else {
      // Handle single values
      const num = Number(value);
      if (!isNaN(num) && value !== "") {
        result[key] = num;
      } else if (value === "true") {
        result[key] = true;
      } else if (value === "false") {
        result[key] = false;
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * Map Prisma vehicle to Form Data
 */
export function mapVehicleToForm(vehicle: any): any {
  const mapEnum = (val: string | null | undefined) => {
    if (!val) return undefined;
    return val.toLowerCase().replace(/_/g, "-");
  };

  return {
    vehicleType: vehicle.vehicleType.toLowerCase(),
    make: vehicle.make,
    model: vehicle.model ?? undefined,
    version: vehicle.version ?? "",
    bodyType: vehicle.bodyType,
    fuelType: mapEnum(vehicle.fuelType),
    registrationMonth: vehicle.registrationMonth?.toString(),
    registrationYear: vehicle.registrationYear?.toString(),
    kilometer: vehicle.kilometer,
    price: vehicle.price,
    newPrice: vehicle.newPrice ?? undefined,
    color: mapEnum(vehicle.color) as any,
    gearTransmission: mapEnum(vehicle.gearTransmission) as any,
    transmissionType: mapEnum(vehicle.transmissionType) as any,
    driveType: mapEnum(vehicle.driveType) as any,
    interiorColor: mapEnum(vehicle.interiorColor) as any,
    metallic: vehicle.metallic,
    vehicleCondition: mapEnum(vehicle.vehicleCondition) as any,
    lastInspectionDate: vehicle.lastInspectionDate
      ? new Date(vehicle.lastInspectionDate)
      : undefined,
    inspectionPassed: vehicle.inspectionPassed,
    warranty: mapEnum(vehicle.warranty) as any,
    warrantyStartDate: vehicle.warrantyStartDate
      ? new Date(vehicle.warrantyStartDate)
      : undefined,
    duration: vehicle.duration ?? undefined,
    maxKm: vehicle.maxKm ?? undefined,
    doors: vehicle.doors ?? undefined,
    seats: vehicle.seats ?? undefined,
    hp: vehicle.hp ?? undefined,
    kw: vehicle.kw ?? undefined,
    energyLabel: vehicle.energyLabel?.toLowerCase() as any,
    typeApproval: vehicle.typeApproval ?? "",
    wheelbase: vehicle.wheelbase ?? undefined,
    vin: vehicle.vin ?? "",
    emptyWeight: vehicle.emptyWeight ?? undefined,
    loadCapacity: vehicle.loadCapacity ?? undefined,
    serialNumber: vehicle.serialNumber ?? "",
    height: vehicle.height ?? undefined,
    width: vehicle.width ?? undefined,
    length: vehicle.length ?? undefined,
    towingCapacityBraked: vehicle.towingCapacityBraked ?? undefined,
    cubicCapacity: vehicle.cubicCapacity ?? undefined,
    co2Emission: vehicle.co2Emission ?? undefined,
    cylinders: vehicle.cylinders ?? undefined,
    numberOfGears: vehicle.numberOfGears ?? undefined,
    emissionStandard: mapEnum(vehicle.emissionStandard) as any,
    consumptionCity: vehicle.consumptionCity ?? undefined,
    consumptionCountry: vehicle.consumptionCountry ?? undefined,
    consumptionTotal: vehicle.consumptionTotal ?? undefined,
    range: vehicle.range ?? undefined,
    batteryCapacity: vehicle.batteryCapacity ?? undefined,
    batteryRentalMonth: vehicle.batteryRentalMonth ?? undefined,
    powerConsumption: vehicle.powerConsumption ?? undefined,
    batteryOwnership: mapEnum(vehicle.batteryOwnership) as any,
    chargingPlugTypeStandard: mapEnum(vehicle.chargingPlugTypeStandard) as any,
    chargingPlugTypeFast: mapEnum(vehicle.chargingPlugTypeFast) as any,
    chargingPower: vehicle.chargingPower ?? undefined,
    combustionEnginePowerHp: vehicle.combustionEnginePowerHp ?? undefined,
    electricMotorPowerHp: vehicle.electricMotorPowerHp ?? undefined,
    vehicleDescription: vehicle.vehicleDescription ?? "",
    equipment: (vehicle.equipment as any) ?? {},
    extras: (vehicle.extras as any) ?? {},
    images: vehicle.images ?? [],
    status: vehicle.status,
  };
}

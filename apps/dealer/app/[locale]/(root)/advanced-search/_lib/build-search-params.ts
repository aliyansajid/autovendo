/**
 * Build /cars search params from advanced search form values and vehicle type.
 * Used for submit navigation and for fetching count/facets.
 *
 * All enum key lists are derived from @repo/vehicle-constants — the single
 * source of truth. Adding/removing a value there automatically propagates here.
 */
import {
  VehicleConditionEnum,
  TransmissionTypeEnum,
  DriveTypeEnum,
  ColorEnum,
  EnergyLabelEnum,
  BatteryOwnershipEnum,
  ChargingPlugTypeStandardEnum,
  ChargingPlugTypeFastEnum,
} from "@repo/vehicle-constants";
import {
  carBodyTypeEnum,
  utilityBodyTypeEnum,
  truckBodyTypeEnum,
  camperBodyTypeEnum,
  carFuelTypeEnum,
  utilityFuelTypeEnum,
  truckFuelTypeEnum,
  camperFuelTypeEnum,
} from "@repo/vehicle-constants";

// ─── Derived key lists (single source of truth) ───────────────────────────────

const CONDITION_KEYS = VehicleConditionEnum.map((v) => v.value);

const BODY_TYPE_KEYS = Array.from(
  new Set([
    ...carBodyTypeEnum.map((v) => v.value),
    ...utilityBodyTypeEnum.map((v) => v.value),
    ...truckBodyTypeEnum.map((v) => v.value),
    ...camperBodyTypeEnum.map((v) => v.value),
  ]),
);

const FUEL_KEYS = Array.from(
  new Set([
    ...carFuelTypeEnum.map((v) => v.value),
    ...utilityFuelTypeEnum.map((v) => v.value),
    ...truckFuelTypeEnum.map((v) => v.value),
    ...camperFuelTypeEnum.map((v) => v.value),
  ]),
);

const TRANSMISSION_KEYS = TransmissionTypeEnum.map((v) => v.value);

const COLOR_KEYS = ColorEnum.map((v) => v.value);

const DRIVE_TYPE_KEYS = DriveTypeEnum.map((v) => v.value);

const ENERGY_LABEL_KEYS = EnergyLabelEnum.map((v) => v.value);

const BATTERY_OWNERSHIP_KEYS = BatteryOwnershipEnum.map((v) => v.value);
const CHARGING_STANDARD_AC_KEYS = ChargingPlugTypeStandardEnum.map((v) => v.value);
const CHARGING_STANDARD_DC_KEYS = ChargingPlugTypeFastEnum.map((v) => v.value);

// ─── Builder ──────────────────────────────────────────────────────────────────

export function buildSearchParams(
  formValues: Record<string, unknown>,
  vehicleType: string,
): Record<string, string | string[]> {
  const params: Record<string, string | string[]> = {};

  // Vehicle type
  if (vehicleType) {
    params.vehicleType = vehicleType;
  }

  // Make (array)
  const make = formValues.make;
  if (Array.isArray(make) && make.length > 0) {
    params.make = make.filter((m): m is string => typeof m === "string");
  }

  // Exclude make (array)
  const excludeMake = formValues.excludeMake;
  if (Array.isArray(excludeMake) && excludeMake.length > 0) {
    params.excludeMake = excludeMake.filter(
      (m): m is string => typeof m === "string",
    );
  }

  // Ranges
  if (formValues["year-from"] != null && formValues["year-from"] !== "") {
    params.registrationFrom = String(formValues["year-from"]);
  }
  if (formValues["year-to"] != null && formValues["year-to"] !== "") {
    params.registrationTo = String(formValues["year-to"]);
  }
  if (formValues["kilometer-from"] != null && formValues["kilometer-from"] !== "") {
    params.kilometerFrom = String(formValues["kilometer-from"]);
  }
  if (formValues["kilometer-to"] != null && formValues["kilometer-to"] !== "") {
    params.kilometerTo = String(formValues["kilometer-to"]);
  }
  if (formValues["price-from"] != null && formValues["price-from"] !== "") {
    params.priceFrom = String(formValues["price-from"]);
  }
  if (formValues["price-to"] != null && formValues["price-to"] !== "") {
    params.priceTo = String(formValues["price-to"]);
  }

  // Power: emit kwFrom/kwTo if powerType=kw, else powerFrom/powerTo (hp)
  const powerType = formValues["powerType"] ?? "ps";
  if (powerType === "kw") {
    if (formValues["power-from"] != null && formValues["power-from"] !== "") {
      params.kwFrom = String(formValues["power-from"]);
    }
    if (formValues["power-to"] != null && formValues["power-to"] !== "") {
      params.kwTo = String(formValues["power-to"]);
    }
  } else {
    if (formValues["power-from"] != null && formValues["power-from"] !== "") {
      params.powerFrom = String(formValues["power-from"]);
    }
    if (formValues["power-to"] != null && formValues["power-to"] !== "") {
      params.powerTo = String(formValues["power-to"]);
    }
  }

  // Condition — form fields: condition-NEW, condition-USED, etc.
  const condition: string[] = [];
  for (const key of CONDITION_KEYS) {
    if (formValues[`condition-${key}`] === true) condition.push(key);
  }
  if (condition.length > 0) params.condition = condition;

  // Body type — form fields: bodyType-SUV, bodyType-SMALL_CAR, etc.
  const bodyType: string[] = [];
  for (const key of BODY_TYPE_KEYS) {
    if (formValues[`bodyType-${key}`] === true) bodyType.push(key);
  }
  if (bodyType.length > 0) params.bodyType = bodyType;

  // Fuel — form fields: fuel-PETROL, fuel-CNG_PETROL, etc.
  const fuel: string[] = [];
  for (const key of FUEL_KEYS) {
    if (formValues[`fuel-${key}`] === true) fuel.push(key);
  }
  if (fuel.length > 0) params.fuel = fuel;

  // Transmission — form fields: transmission-AUTOMATIC, etc.
  const transmission: string[] = [];
  for (const key of TRANSMISSION_KEYS) {
    if (formValues[`transmission-${key}`] === true) transmission.push(key);
  }
  if (transmission.length > 0) params.transmission = transmission;

  // Exterior color — form fields: color-BLUE, color-BLACK, etc.
  const color: string[] = [];
  for (const key of COLOR_KEYS) {
    if (formValues[`color-${key}`] === true) color.push(key);
  }
  if (color.length > 0) params.color = color;

  // Equipment — form fields: equipment-<VALUE> (dynamic)
  const equipment: string[] = [];
  for (const [key, value] of Object.entries(formValues)) {
    if (key.startsWith("equipment-") && value === true) {
      equipment.push(key.replace("equipment-", ""));
    }
  }
  if (equipment.length > 0) params.equipment = equipment;

  // Extras — form fields: extra-<VALUE> (dynamic)
  const extras: string[] = [];
  for (const [key, value] of Object.entries(formValues)) {
    if (key.startsWith("extra-") && value === true) {
      extras.push(key.replace("extra-", ""));
    }
  }
  if (extras.length > 0) params.extras = extras;

  // Metallic
  if (formValues.metallic === true) params.metallic = "true";
  if (formValues.metallic === false) params.metallic = "false";

  // Drive type — form fields: drive-ALL, drive-FRONT, drive-REAR
  const driveType: string[] = [];
  for (const key of DRIVE_TYPE_KEYS) {
    if (formValues[`drive-${key}`] === true) driveType.push(key);
  }
  if (driveType.length > 0) params.driveType = driveType;

  // Cubic capacity (Hubraum)
  if (formValues["capacity-from"] != null && formValues["capacity-from"] !== "") {
    params.cubicCapacityFrom = String(formValues["capacity-from"]);
  }
  if (formValues["capacity-to"] != null && formValues["capacity-to"] !== "") {
    params.cubicCapacityTo = String(formValues["capacity-to"]);
  }

  // Cylinders
  if (formValues["cylinder-from"] != null && formValues["cylinder-from"] !== "") {
    params.cylindersFrom = String(formValues["cylinder-from"]);
  }
  if (formValues["cylinder-to"] != null && formValues["cylinder-to"] !== "") {
    params.cylindersTo = String(formValues["cylinder-to"]);
  }

  // Consumption
  if (formValues["consumption-from"] != null && formValues["consumption-from"] !== "") {
    params.consumptionFrom = String(formValues["consumption-from"]);
  }
  if (formValues["consumption-to"] != null && formValues["consumption-to"] !== "") {
    params.consumptionTo = String(formValues["consumption-to"]);
  }

  // CO2 emissions
  if (formValues["emissions-from"] != null && formValues["emissions-from"] !== "") {
    params.co2From = String(formValues["emissions-from"]);
  }
  if (formValues["emissions-to"] != null && formValues["emissions-to"] !== "") {
    params.co2To = String(formValues["emissions-to"]);
  }

  // Energy efficiency label — form fields: energy-A, energy-B, etc.
  const energyLabels: string[] = [];
  for (const key of ENERGY_LABEL_KEYS) {
    if (formValues[`energy-${key}`] === true) energyLabels.push(key);
  }
  if (energyLabels.length > 0) params.energyLabels = energyLabels;

  // Emission standard / Euronorm — form fields: eu-EURO_1, eu-EURO_2, etc. (dynamic)
  const emissionStandards: string[] = [];
  for (const [key, value] of Object.entries(formValues)) {
    if (key.startsWith("eu-") && value === true) {
      emissionStandards.push(key.replace("eu-", ""));
    }
  }
  if (emissionStandards.length > 0) params.emissionStandards = emissionStandards;

  // Inspection passed (MFK)
  if (formValues["condition-mfk"] === true) params.inspectionPassed = "true";

  // Has warranty
  if (formValues["condition-warranty"] === true) params.hasWarranty = "true";

  // Interior color — form fields: int-BLUE, int-BLACK, etc.
  const interiorColor: string[] = [];
  for (const key of COLOR_KEYS) {
    if (formValues[`int-${key}`] === true) interiorColor.push(key);
  }
  if (interiorColor.length > 0) params.interiorColor = interiorColor;

  // Days listed
  const daysListed = formValues["daysListed"];
  if (typeof daysListed === "string" && daysListed !== "any") {
    const days = parseInt(daysListed.split(" ")[0] ?? "", 10);
    if (!isNaN(days)) params.daysListed = String(days);
  }

  // EV range
  if (formValues["range-from"] != null && formValues["range-from"] !== "") {
    params.rangeFrom = String(formValues["range-from"]);
  }
  if (formValues["range-to"] != null && formValues["range-to"] !== "") {
    params.rangeTo = String(formValues["range-to"]);
  }

  // Battery ownership — form fields: batteryOwnership-BATTERY_INCLUDED, etc.
  const batteryOwnership: string[] = [];
  for (const key of BATTERY_OWNERSHIP_KEYS) {
    if (formValues[`batteryOwnership-${key}`] === true) batteryOwnership.push(key);
  }
  if (batteryOwnership.length > 0) params.batteryOwnership = batteryOwnership;

  // Charging standard AC — form fields: chargingStandardAC-TYPE_1, etc.
  const chargingPlugTypeStandard: string[] = [];
  for (const key of CHARGING_STANDARD_AC_KEYS) {
    if (formValues[`chargingStandardAC-${key}`] === true) chargingPlugTypeStandard.push(key);
  }
  if (chargingPlugTypeStandard.length > 0) params.chargingPlugTypeStandard = chargingPlugTypeStandard;

  // Charging standard DC — form fields: chargingStandardDC-CCS, etc.
  const chargingPlugTypeFast: string[] = [];
  for (const key of CHARGING_STANDARD_DC_KEYS) {
    if (formValues[`chargingStandardDC-${key}`] === true) chargingPlugTypeFast.push(key);
  }
  if (chargingPlugTypeFast.length > 0) params.chargingPlugTypeFast = chargingPlugTypeFast;

  // Doors
  if (formValues["doors-from"] != null && formValues["doors-from"] !== "") {
    params.doorsFrom = String(formValues["doors-from"]);
  }
  if (formValues["doors-to"] != null && formValues["doors-to"] !== "") {
    params.doorsTo = String(formValues["doors-to"]);
  }

  // Seats
  if (formValues["seats-from"] != null && formValues["seats-from"] !== "") {
    params.seatsFrom = String(formValues["seats-from"]);
  }
  if (formValues["seats-to"] != null && formValues["seats-to"] !== "") {
    params.seatsTo = String(formValues["seats-to"]);
  }

  return params;
}

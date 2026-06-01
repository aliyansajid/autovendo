export const VehicleTypeEnum = [
  { value: "CAR" },
  { value: "UTILITY" },
  { value: "TRUCK" },
  { value: "CAMPER" },
] as const;

export const GearTransmissionEnum = [
  { value: "AUTOMATIC" },
  { value: "MANUAL" },
] as const;

export const TransmissionTypeEnum = [
  { value: "AUTOMATIC" },
  { value: "AUTOMATIC_STEPLESS" },
  { value: "SEMI_AUTOMATIC" },
  { value: "MANUAL" },
] as const;

export const DriveTypeEnum = [
  { value: "ALL" },
  { value: "FRONT" },
  { value: "REAR" },
] as const;

export const ColorEnum = [
  { value: "ANTHRACITE", hex: "#383E42" },
  { value: "BEIGE", hex: "#F5F5DC" },
  { value: "BLACK", hex: "#000000" },
  { value: "BLUE", hex: "#0000FF" },
  { value: "BORDEAUX", hex: "#800020" },
  { value: "BROWN", hex: "#964B00" },
  { value: "GOLD", hex: "#FFD700" },
  { value: "GRAY", hex: "#808080" },
  { value: "GREEN", hex: "#008000" },
  {
    value: "MULTICOLOURED",
    gradient: "linear-gradient(135deg, #FF0000 0%, #00FF00 50%, #0000FF 100%)",
  },
  { value: "ORANGE", hex: "#FFA500" },
  { value: "PINK", hex: "#FFC0CB" },
  { value: "RED", hex: "#FF0000" },
  { value: "SILVER", hex: "#C0C0C0" },
  { value: "TURQUOISE", hex: "#40E0D0" },
  { value: "VIOLET", hex: "#EE82EE" },
  { value: "WHITE", hex: "#FFFFFF", border: true },
  { value: "YELLOW", hex: "#FFFF00" },
  {
    value: "OTHER",
    gradient:
      "repeating-linear-gradient(45deg, #ccc, #ccc 10px, #eee 10px, #eee 20px)",
  },
] as const;

export const VehicleConditionEnum = [
  { value: "NEW" },
  { value: "DEMONSTRATION" },
  { value: "PRE_REGISTERED" },
  { value: "USED" },
  { value: "OLDTIMER" },
] as const;

export const WarrantyEnum = [
  { value: "FROM_DELIVERY" },
  { value: "FROM_FIRST_REGISTRATION" },
  { value: "FROM_DATE" },
] as const;

export const EnergyLabelEnum = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
  { value: "F", label: "F" },
  { value: "G", label: "G" },
] as const;

export const EmissionStandardEnum = [
  { value: "EURO_1", label: "Euro 1" },
  { value: "EURO_2", label: "Euro 2" },
  { value: "EURO_3", label: "Euro 3" },
  { value: "EURO_4", label: "Euro 4" },
  { value: "EURO_5", label: "Euro 5" },
  { value: "EURO_5_PLUS", label: "Euro 5+" },
  { value: "EURO_6", label: "Euro 6" },
  { value: "EURO_6A", label: "Euro 6a" },
  { value: "EURO_6B", label: "Euro 6b" },
  { value: "EURO_6C", label: "Euro 6c" },
  { value: "EURO_6D", label: "Euro 6d" },
  { value: "EURO_6D_ISC", label: "Euro 6d ISC" },
  { value: "EURO_6D_ISC_FCM", label: "Euro 6d ISC FCM" },
  { value: "EURO_6D_TEMP", label: "Euro 6d-temp" },
  { value: "EURO_6D_TEMP_EVAP", label: "Euro 6d-temp EVAP" },
  { value: "EURO_6D_TEMP_EVAP_ISC", label: "Euro 6d-temp EVAP ISC" },
  { value: "EURO_6D_TEMP_ISC", label: "Euro 6d-temp ISC" },
  { value: "EURO_6E", label: "Euro 6e" },
] as const;

export const ChargingPlugTypeStandardEnum = [
  { value: "TYPE_1" },
  { value: "TYPE_2" },
] as const;

export const ChargingPlugTypeFastEnum = [
  { value: "CCS" },
  { value: "CSS_2" },
  { value: "CHADEMO" },
  { value: "SUPERCHARGER" },
] as const;

export const BatteryOwnershipEnum = [
  { value: "BATTERY_INCLUDED" },
  { value: "BATTERY_RENT_REQUIRED" },
] as const;

export const EquipmentEnum = [
  { value: "360_CAMERA" },
  { value: "ABS" },
  { value: "ADAPTIVE_HEADLIGHTS" },
  { value: "ADAPTIVE_CRUISE_CONTROL" },
  { value: "ALARM_SYSTEM" },
  { value: "ALLOY_WHEELS" },
  { value: "ANDROID_AUTO" },
  { value: "TOW_HITCH" },
  { value: "TOW_HITCH_REMOVABLE" },
  { value: "TOW_HITCH_SWIVELING" },
  { value: "TOW_HITCH_FIXED" },
  { value: "APPLE_CARPLAY" },
  { value: "HEATED_SEATS" },
  { value: "VENTILATED_SEATS" },
  { value: "BLUETOOTH" },
  { value: "BRAKE_ASSIST" },
  { value: "CHROME_ELEMENTS" },
  { value: "DAB_RADIO" },
  { value: "ANTI_THEFT" },
  { value: "DIFFERENTIAL_LOCK" },
  { value: "ELECTRIC_WINDOWS" },
  { value: "ELECTRIC_TAILGATE" },
  { value: "ELECTRIC_SEAT_ADJUSTMENT" },
  { value: "GULL_WING_DOORS" },
  { value: "HANDS_FREE" },
  { value: "FLOOR" },
  { value: "ROOF_RACK" },
  { value: "HARDTOP" },
  { value: "HEAD_UP_DISPLAY" },
  { value: "CUSTOM_EXHAUST" },
  { value: "ISOFIX" },
  { value: "AIR_CONDITIONING" },
  { value: "AUTOMATIC_CLIMATE_CONTROL" },
  { value: "TRUNK" },
  { value: "SPEAKERS" },
  { value: "AIR_SUSPENSION" },
  { value: "NAVIGATION_SYSTEM" },
  { value: "NAVIGATION" },
  { value: "PORTABLE_NAVIGATION" },
  { value: "PANORAMIC_ROOF" },
  { value: "PARKING_ASSIST" },
  { value: "PARKING_SENSORS_REAR" },
  { value: "PARKING_SENSORS_FRONT" },
  { value: "BACKREST_PROTECTION" },
  { value: "BACKUP_CAMERA" },
  { value: "HEADLIGHTS" },
  { value: "LASER_HEADLIGHTS" },
  { value: "LED_HEADLIGHTS" },
  { value: "XENON_HEADLIGHTS" },
  { value: "SUNROOF" },
  { value: "SLIDING_DOOR" },
  { value: "KEYLESS_ENTRY_START" },
  { value: "FAST_CHARGING" },
  { value: "SEAT_COVERS" },
  { value: "ALCANTARA" },
  { value: "FABRIC_SEATS" },
  { value: "LEATHER" },
  { value: "PARTIAL_LEATHER_SEATS" },
  { value: "SPECIAL_PAINT" },
  { value: "SPORT_SEATS" },
  { value: "LANE_KEEP_ASSIST" },
  { value: "ESP" },
  { value: "AUXILIARY_HEATING" },
  { value: "START_STOP_SYSTEM" },
  { value: "CRUISE_CONTROL" },
  { value: "BLIND_SPOT_ASSIST" },
  { value: "REINFORCED_SUSPENSION" },
  { value: "ADDITIONAL_INSTRUMENTS" },
] as const;

export const prices = [
  { value: "500", label: "CHF 500" },
  { value: "1000", label: "CHF 1,000" },
  { value: "1500", label: "CHF 1,500" },
  { value: "2000", label: "CHF 2,000" },
  { value: "2500", label: "CHF 2,500" },
  { value: "3000", label: "CHF 3,000" },
  { value: "4000", label: "CHF 4,000" },
  { value: "5000", label: "CHF 5,000" },
  { value: "6000", label: "CHF 6,000" },
  { value: "7000", label: "CHF 7,000" },
  { value: "8000", label: "CHF  8,000" },
  { value: "9000", label: "CHF  9,000" },
  { value: "10000", label: "CHF 10,000" },
  { value: "12500", label: "CHF 12,500" },
  { value: "15000", label: "CHF 15,000" },
  { value: "17500", label: "CHF 17,500" },
  { value: "20000", label: "CHF 20,000" },
  { value: "25000", label: "CHF 25,000" },
  { value: "30000", label: "CHF 30,000" },
  { value: "40000", label: "CHF 40,000" },
  { value: "50000", label: "CHF 50,000" },
  { value: "75000", label: "CHF 75,000" },
  { value: "100000", label: "CHF 100,000" },
] as const;

export const powerOptions = [
  { value: "50", label: "ab 50 PS" },
  { value: "100", label: "ab 100 PS" },
  { value: "150", label: "ab 150 PS" },
  { value: "200", label: "ab 200 PS" },
  { value: "250", label: "ab 250 PS" },
  { value: "300", label: "ab 300 PS" },
  { value: "400", label: "ab 400 PS" },
] as const;

export const evOptions = [
  { value: "only_ev", label: "Nur E-Autos" },
  { value: "no_ev", label: "Keine E-Autos" },
] as const;

export const daysListedOptions = [
  { label: "Beliebig", value: "any" },
  { label: "1 Tag", value: "1 tag" },
  { label: "2 Tage", value: "2 tage" },
  { label: "3 Tage", value: "3 tage" },
  { label: "5 Tage", value: "5 tage" },
  { label: "7 Tage", value: "7 tage" },
  { label: "14 Tage", value: "14 tage" },
  { label: "28 Tage", value: "28 tage" },
] as const;

const _CURRENT_YEAR = new Date().getFullYear();

export const yearHistogram = [
  { year: 1910, h: 10 },
  { year: 1920, h: 20 },
  { year: 1930, h: 30 },
  { year: 1940, h: 45 },
  { year: 1950, h: 60 },
  { year: 1960, h: 80 },
  { year: 1970, h: 60 },
  { year: 1980, h: 40 },
  { year: 1990, h: 20 },
  { year: 2000, h: 10 },
  { year: 2010, h: 50 },
  { year: 2015, h: 90 },
  { year: 2020, h: 100 },
  { year: _CURRENT_YEAR, h: 30 },
];

export const kilometerHistogram = [
  { value: 0, h: 100 },
  { value: 30000, h: 80 },
  { value: 60000, h: 60 },
  { value: 90000, h: 40 },
  { value: 120000, h: 20 },
  { value: 150000, h: 10 },
  { value: 180000, h: 5 },
  { value: 210000, h: 5 },
  { value: 240000, h: 20 },
  { value: 270000, h: 40 },
  { value: 300000, h: 60 },
  { value: 330000, h: 30 },
  { value: 360000, h: 10 },
  { value: 400000, h: 5 },
];

export const priceHistogram = [
  { value: 0, h: 20 },
  { value: 20000, h: 30 },
  { value: 40000, h: 50 },
  { value: 60000, h: 70 },
  { value: 80000, h: 90 },
  { value: 100000, h: 60 },
  { value: 120000, h: 40 },
  { value: 140000, h: 30 },
  { value: 160000, h: 20 },
  { value: 180000, h: 10 },
  { value: 200000, h: 10 },
  { value: 1000000, h: 5 },
];

// ─── Vehicle-type specific constants ──────────────────────────────────────────

export * from "./filters";
export * from "./swiss-cities";
export * from "./cars";
export * from "./commercial-vehicles";
export * from "./truck";
export * from "./camper";

// ─── API validation helpers ───────────────────────────────────────────────────

import { carMakes, carExtrasEnum } from "./cars";
import { utilityMakes, utilityExtrasEnum } from "./commercial-vehicles";
import { truckMakes, truckExtrasEnum } from "./truck";
import { camperMakes, camperExtrasEnum } from "./camper";

type MakeGroup = {
  label: string;
  items: readonly { value: string; label: string }[];
};

function extractMakeValues(makes: readonly MakeGroup[]): string[] {
  return makes.flatMap((group) => group.items.map((item) => item.value));
}

export const VALID_CAR_MAKES = extractMakeValues(carMakes);
export const VALID_UTILITY_MAKES = extractMakeValues(utilityMakes);
export const VALID_TRUCK_MAKES = extractMakeValues(truckMakes);
export const VALID_CAMPER_MAKES = extractMakeValues(camperMakes);

export const VALID_MAKES_BY_TYPE: Record<string, string[]> = {
  CAR: VALID_CAR_MAKES,
  UTILITY: VALID_UTILITY_MAKES,
  TRUCK: VALID_TRUCK_MAKES,
  CAMPER: VALID_CAMPER_MAKES,
};

export const VALID_EQUIPMENT_KEYS: string[] = EquipmentEnum.map(
  (e: { value: string }) => e.value,
);

export const VALID_CAR_EXTRAS_KEYS: string[] = carExtrasEnum.map(
  (e: { value: string }) => e.value,
);
export const VALID_UTILITY_EXTRAS_KEYS: string[] = utilityExtrasEnum.map(
  (e: { value: string }) => e.value,
);
export const VALID_TRUCK_EXTRAS_KEYS: string[] = truckExtrasEnum.map(
  (e: { value: string }) => e.value,
);
export const VALID_CAMPER_EXTRAS_KEYS: string[] = camperExtrasEnum.map(
  (e: { value: string }) => e.value,
);

export const VALID_EXTRAS_KEYS_BY_TYPE: Record<string, string[]> = {
  CAR: VALID_CAR_EXTRAS_KEYS,
  UTILITY: VALID_UTILITY_EXTRAS_KEYS,
  TRUCK: VALID_TRUCK_EXTRAS_KEYS,
  CAMPER: VALID_CAMPER_EXTRAS_KEYS,
};

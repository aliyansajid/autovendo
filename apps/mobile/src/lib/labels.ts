// ─────────────────────────────────────────────────────────────────────────────
// German (de-CH) labels for Prisma enum values.
//
// Wording is copied verbatim from the web app's messages/de.json (Vehicle
// namespace) so the app reads identically to autovendo.ch. Make labels are
// resolved from @repo/vehicle-constants, the shared source of truth.
// ─────────────────────────────────────────────────────────────────────────────

import {
  carMakes,
  utilityMakes,
  truckMakes,
  camperMakes,
} from "@repo/vehicle-constants";

type MakeGroup = {
  label: string;
  items: readonly { value: string; label: string }[];
};

function flattenMakes(...groups: readonly MakeGroup[][]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const groupList of groups) {
    for (const group of groupList) {
      for (const item of group.items) out[item.value] = item.label;
    }
  }
  return out;
}

const MAKE_LABELS = flattenMakes(
  carMakes as unknown as MakeGroup[],
  utilityMakes as unknown as MakeGroup[],
  truckMakes as unknown as MakeGroup[],
  camperMakes as unknown as MakeGroup[],
);

const FUEL_TYPES: Record<string, string> = {
  PETROL: "Benzin",
  DIESEL: "Diesel",
  ELECTRIC: "Elektro",
  ETHANOL_PETROL: "Ethanol/Benzin",
  CNG_PETROL: "Erdgas/Benzin",
  LPG_PETROL: "Flüssiggas/Benzin",
  MHEV_DIESEL: "MHEV Diesel",
  MHEV_PETROL: "MHEV Benzin",
  PHEV_DIESEL: "PHEV Diesel",
  PHEV_PETROL: "PHEV Benzin",
  HEV_DIESEL: "HEV Diesel",
  HEV_PETROL: "HEV Benzin",
  HYDROGEN: "Wasserstoff",
};

const CONDITIONS: Record<string, string> = {
  NEW: "Neu",
  DEMONSTRATION: "Vorführfahrzeug",
  PRE_REGISTERED: "Neuimmatrikuliert",
  USED: "Occasion",
  OLDTIMER: "Oldtimer",
};

const TRANSMISSIONS: Record<string, string> = {
  MANUAL: "Schaltgetriebe",
  AUTOMATIC: "Automatik",
  AUTOMATIC_STEPLESS: "Stufenlos",
  SEMI_AUTOMATIC: "Halbautomatik",
};

const DRIVE_TYPES: Record<string, string> = {
  FRONT: "Frontantrieb",
  REAR: "Heckantrieb",
  ALL: "Allrad",
};

// Combined vehicle types + body types (the web "types" namespace).
const TYPES: Record<string, string> = {
  CAR: "Personenwagen",
  UTILITY: "Nutzfahrzeug",
  TRUCK: "Lastwagen",
  CAMPER: "Wohnmobil",
  BUS: "Bus",
  CABRIOLET: "Cabriolet",
  COUPE: "Coupé",
  SMALL_CAR: "Kleinwagen",
  ESTATE: "Kombi",
  MINIVAN: "Kompaktvan / Minivan",
  SALOON: "Limousine",
  PICKUP: "Pick-up",
  SUV: "SUV / Geländewagen",
  BRIDGE: "Brücke",
  BRIDGE_DOUBLE_CAB: "Brücke mit Doppelkabine",
  CHASSIS_CAB: "Chassis Kabine",
  BOX: "Kasten",
  BOX_GLAZED: "Kasten verglast",
  BOX_DOUBLE_CAB: "Kastenwagen Doppelkabine",
  TIPPER: "Kipper",
  PLATFORM: "Platform",
  SEMI_TRAILER: "Sattel-Auflieger",
  CAB_OVER: "Doppelkabine",
  COACH: "Reisebus",
  ALCOVE: "Alkoven",
  TRAILER: "Anhänger",
  INTEGRATED: "Integriertes Wohnmobil",
  CAB: "Kabine",
  OTHER: "Sonstige",
  SEMI_INTEGRATED: "Teilintegrierter",
  MOTORHOME: "Wohnmobil",
  CARAVAN: "Wohnwagen",
};

const COLORS: Record<string, string> = {
  ANTHRACITE: "Anthrazit",
  BEIGE: "Beige",
  BLACK: "Schwarz",
  BLUE: "Blau",
  BORDEAUX: "Bordeaux",
  BROWN: "Braun",
  GOLD: "Gold",
  GRAY: "Grau",
  GREEN: "Grün",
  MULTICOLOURED: "Mehrfarbig",
  ORANGE: "Orange",
  PINK: "Rosa",
  RED: "Rot",
  SILVER: "Silber",
  TURQUOISE: "Türkis",
  VIOLET: "Violett",
  WHITE: "Weiss",
  YELLOW: "Gelb",
  OTHER: "Andere",
};

const WARRANTY: Record<string, string> = {
  FROM_DELIVERY: "Ab Lieferung",
  FROM_FIRST_REGISTRATION: "Ab Erstzulassung",
  FROM_DATE: "Ab Datum",
};

const EMISSIONS: Record<string, string> = {
  EURO_1: "Euro 1",
  EURO_2: "Euro 2",
  EURO_3: "Euro 3",
  EURO_4: "Euro 4",
  EURO_5: "Euro 5",
  EURO_5_PLUS: "Euro 5+",
  EURO_6: "Euro 6",
  EURO_6A: "Euro 6a",
  EURO_6B: "Euro 6b",
  EURO_6C: "Euro 6c",
  EURO_6D: "Euro 6d",
  EURO_6D_ISC: "Euro 6d ISC",
  EURO_6D_ISC_FCM: "Euro 6d ISC FCM",
  EURO_6D_TEMP: "Euro 6d-temp",
  EURO_6D_TEMP_EVAP: "Euro 6d-temp EVAP",
  EURO_6D_TEMP_EVAP_ISC: "Euro 6d-temp EVAP ISC",
  EURO_6D_TEMP_ISC: "Euro 6d-temp ISC",
  EURO_6E: "Euro 6e",
};

const EQUIPMENT: Record<string, string> = {
  "360_CAMERA": "360°-Kamera",
  ABS: "ABS",
  ADAPTIVE_HEADLIGHTS: "Adaptive Scheinwerfer",
  ADAPTIVE_CRUISE_CONTROL: "Adaptiver Tempomat",
  ALARM_SYSTEM: "Alarmanlage",
  ALLOY_WHEELS: "Aluminiumfelgen",
  ANDROID_AUTO: "Android Auto",
  TOW_HITCH: "Anhängerkupplung",
  TOW_HITCH_REMOVABLE: "Anhängerkupplung abnehmbar",
  TOW_HITCH_SWIVELING: "Anhängerkupplung schwenkbar",
  TOW_HITCH_FIXED: "Anhängerkupplung fix",
  APPLE_CARPLAY: "Apple CarPlay",
  HEATED_SEATS: "Beheizbare Sitze",
  VENTILATED_SEATS: "Belüftete Sitze",
  BLUETOOTH: "Bluetooth-Schnittstelle",
  BRAKE_ASSIST: "Bremsassistent",
  CHROME_ELEMENTS: "Chromelemente",
  DAB_RADIO: "DAB-Radio",
  ANTI_THEFT: "Diebstahlsicherung",
  DIFFERENTIAL_LOCK: "Differenzialsperre",
  ELECTRIC_WINDOWS: "Elektrische Fensterheber",
  ELECTRIC_TAILGATE: "Elektrische Heckklappe",
  ELECTRIC_SEAT_ADJUSTMENT: "Elektrische Sitzverstellung",
  GULL_WING_DOORS: "Flügeltüren",
  HANDS_FREE: "Freisprechanlage",
  FLOOR: "Fussboden",
  ROOF_RACK: "Gepäckträger",
  HARDTOP: "Hardtop",
  HEAD_UP_DISPLAY: "Head-up Display",
  CUSTOM_EXHAUST: "Individuelle Auspuffanlage",
  ISOFIX: "Isofix",
  AIR_CONDITIONING: "Klimaanlage",
  AUTOMATIC_CLIMATE_CONTROL: "Automatische Klimaanlage",
  TRUNK: "Koffer",
  SPEAKERS: "Lautsprecher",
  AIR_SUSPENSION: "Luftfederung",
  NAVIGATION_SYSTEM: "Navigationssystem",
  NAVIGATION: "Navigation",
  PORTABLE_NAVIGATION: "Tragbares Navigationssystem",
  PANORAMIC_ROOF: "Panoramadach",
  PARKING_ASSIST: "Parkhilfe",
  PARKING_SENSORS_REAR: "Parksensoren hinten",
  PARKING_SENSORS_FRONT: "Parksensoren vorne",
  BACKREST_PROTECTION: "Rückenlehnenschutz",
  BACKUP_CAMERA: "Rückfahrkamera",
  HEADLIGHTS: "Scheinwerfer",
  LASER_HEADLIGHTS: "Laser Scheinwerfer",
  LED_HEADLIGHTS: "LED-Scheinwerfer",
  XENON_HEADLIGHTS: "Xenonscheinwerfer",
  SUNROOF: "Schiebedach",
  SLIDING_DOOR: "Schiebetür",
  KEYLESS_ENTRY_START: "Schlüsselloser Zugang/Start",
  FAST_CHARGING: "Schnellladen",
  SEAT_COVERS: "Sitzbezüge",
  ALCANTARA: "Alcantara",
  FABRIC_SEATS: "Stoffsitze",
  LEATHER: "Leder",
  PARTIAL_LEATHER_SEATS: "Teil-Ledersitze",
  SPECIAL_PAINT: "Sonderlackierung",
  SPORT_SEATS: "Sportsitze",
  LANE_KEEP_ASSIST: "Spurhalteassistent",
  ESP: "Stabilitätskontrolle (ESP)",
  AUXILIARY_HEATING: "Standheizung",
  START_STOP_SYSTEM: "Start-Stopp-System",
  CRUISE_CONTROL: "Tempomat",
  BLIND_SPOT_ASSIST: "Totwinkel-Assistent",
  REINFORCED_SUSPENSION: "Verstärkte Federung",
  ADDITIONAL_INSTRUMENTS: "Zusätzliche Instrumente",
};

const EXTRAS: Record<string, string> = {
  "8_TYRES": "8-fach bereift",
  ACCESSIBLE_FOR_DISABLED: "Behindertengerecht",
  DIRECT_IMPORT: "Direkt-/Parallelimport",
  RACE_CAR: "Rennwagen",
  TUNING: "Tuning",
  ACCIDENT_VEHICLE: "Unfallfahrzeug",
  CAR_TRANSPORTER: "Autotransporter",
  TARPAULIN: "Blache/Plane",
  TAIL_LIFT: "Hebebühne",
  CRANE: "Kran",
  REFRIGERATOR: "Kühlwagen",
  FURNITURE_TRANSPORTER: "Möbeltransporter",
  SCHOOL_BUS: "Schulbus",
  WINCH: "Seilwinde",
};

const SELLER_TYPES: Record<string, string> = {
  DEALER: "Händler",
  SELLER: "Privat",
};

function lookup(map: Record<string, string>, value: string | null | undefined): string {
  if (!value) return "";
  return map[value] ?? value;
}

export const labelFuel = (v?: string | null) => lookup(FUEL_TYPES, v);
export const labelCondition = (v?: string | null) => lookup(CONDITIONS, v);
export const labelTransmission = (v?: string | null) => lookup(TRANSMISSIONS, v);
export const labelDrive = (v?: string | null) => lookup(DRIVE_TYPES, v);
export const labelType = (v?: string | null) => lookup(TYPES, v);
export const labelColor = (v?: string | null) => lookup(COLORS, v);
export const labelWarranty = (v?: string | null) => lookup(WARRANTY, v);
export const labelEmission = (v?: string | null) => lookup(EMISSIONS, v);
export const labelEquipment = (v?: string | null) => lookup(EQUIPMENT, v);
export const labelExtra = (v?: string | null) => lookup(EXTRAS, v);
export const labelMake = (v?: string | null) => lookup(MAKE_LABELS, v);
export const labelSellerType = (v?: string | null) => lookup(SELLER_TYPES, v);

// Model values are slugs like "1_SERIES" / "E_TRON"; the web shows them
// title-cased when no explicit label exists. Good enough for display.
export function labelModel(v?: string | null): string {
  if (!v) return "";
  return v
    .split("_")
    .map((p) => (/^\d/.test(p) ? p : p.charAt(0) + p.slice(1).toLowerCase()))
    .join(" ");
}

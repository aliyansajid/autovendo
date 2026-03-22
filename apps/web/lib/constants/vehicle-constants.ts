export const SORT_OPTIONS = [
  "relevance",
  "price-asc",
  "price-desc",
  "kilometer-asc",
  "kilometer-desc",
  "registration-asc",
  "registration-desc",
  "created-asc",
  "created-desc",
] as const;

export const SORT_LABELS: Record<(typeof SORT_OPTIONS)[number], string> = {
  relevance: "Standard-Sortierung",
  "price-asc": "Preis (niedrigster zuerst)",
  "price-desc": "Preis (höchster zuerst)",
  "kilometer-asc": "Kilometerstand (niedrigster zuerst)",
  "kilometer-desc": "Kilometerstand (höchster zuerst)",
  "registration-asc": "Erstzulassung (älteste zuerst)",
  "registration-desc": "Erstzulassung (jüngste zuerst)",
  "created-asc": "Inserate (älteste zuerst)",
  "created-desc": "Inserate (neueste zuerst)",
};

export const FUEL_TYPES = [
  "petrol",
  "ethanol-petrol",
  "diesel",
  "electric",
  "cng-petrol",
  "lpg-petrol",
  "mhev-diesel",
  "mhev-petrol",
  "phev-diesel",
  "phev-petrol",
  "hev-diesel",
  "hev-petrol",
  "hydrogen",
] as const;

export const TRANSMISSION_TYPES = [
  "automatic",
  "automatic-stepless",
  "semi-automatic",
  "manual",
] as const;

export const VEHICLE_CONDITIONS = [
  "new",
  "demonstration",
  "pre-registered",
  "used",
  "oldtimer",
] as const;

export const VEHICLE_TYPES = ["car", "utility", "truck", "camper"] as const;

export const BODY_TYPES = [
  "bus",
  "cabriolet",
  "coupe",
  "small-car",
  "estate",
  "minivan",
  "saloon",
  "pickup",
  "suv",
] as const;

export const COLORS = [
  "anthracite",
  "beige",
  "black",
  "blue",
  "bordeaux",
  "brown",
  "gold",
  "gray",
  "green",
  "multicoloured",
  "orange",
  "pink",
  "red",
  "silver",
  "turquoise",
  "violet",
  "white",
  "yellow",
  "other",
] as const;

// German label maps
export const FUEL_LABELS: Record<string, string> = {
  PETROL: "Benzin",
  DIESEL: "Diesel",
  ELECTRIC: "Elektro",
  ETHANOL_PETROL: "Ethanol/Benzin",
  CNG_PETROL: "Erdgas/Benzin",
  LPG_PETROL: "Flüssiggas/Benzin",
  MHEV_DIESEL: "Mild-Hybrid Diesel",
  MHEV_PETROL: "Mild-Hybrid Benzin",
  PHEV_DIESEL: "Plug-in-Hybrid Diesel",
  PHEV_PETROL: "Plug-in-Hybrid Benzin",
  HEV_DIESEL: "Hybrid Diesel",
  HEV_PETROL: "Hybrid Benzin",
  HYDROGEN: "Wasserstoff",
};

export const TRANSMISSION_LABELS: Record<string, string> = {
  AUTOMATIC: "Automatik",
  MANUAL: "Manuell",
  AUTOMATIC_STEPLESS: "Stufenautomatik",
  SEMI_AUTOMATIC: "Halbautomatik",
};

export const DRIVE_LABELS: Record<string, string> = {
  ALL: "Allrad",
  FRONT: "Frontantrieb",
  REAR: "Hinterradantrieb",
};

export const CONDITION_LABELS: Record<string, string> = {
  NEW: "Neu",
  DEMONSTRATION: "Vorführfahrzeug",
  PRE_REGISTERED: "Neuimmatrikuliert",
  USED: "Occasion",
  OLDTIMER: "Oldtimer",
};

export const BODY_TYPE_LABELS: Record<string, string> = {
  bus: "Bus",
  cabriolet: "Cabriolet",
  coupe: "Coupé",
  "small-car": "Kleinwagen",
  estate: "Kombi",
  minivan: "Kompaktvan / Minivan",
  saloon: "Limousine",
  pickup: "Pick-up",
  suv: "SUV / Geländewagen",
};

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  CAR: "Personenwagen",
  UTILITY: "Nutzfahrzeug",
  TRUCK: "Lastwagen",
  CAMPER: "Wohnmobil",
};

export const COLOR_LABELS: Record<string, string> = {
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
  PINK: "Pink",
  RED: "Rot",
  SILVER: "Silber",
  TURQUOISE: "Türkis",
  VIOLET: "Violett",
  WHITE: "Weiss",
  YELLOW: "Gelb",
  OTHER: "Andere",
};

export const COLOR_OPTIONS = [
  { value: "anthracite", label: "Anthrazit", hex: "#383E42" },
  { value: "beige", label: "Beige", hex: "#F5F5DC" },
  { value: "black", label: "Schwarz", hex: "#000000" },
  { value: "blue", label: "Blau", hex: "#0000FF" },
  { value: "bordeaux", label: "Bordeaux", hex: "#800020" },
  { value: "brown", label: "Braun", hex: "#964B00" },
  { value: "gold", label: "Gold", hex: "#FFD700" },
  { value: "gray", label: "Grau", hex: "#808080" },
  { value: "green", label: "Grün", hex: "#008000" },
  {
    value: "multicoloured",
    label: "Mehrfarbig",
    gradient: "linear-gradient(135deg, #FF0000 0%, #00FF00 50%, #0000FF 100%)",
  },
  { value: "orange", label: "Orange", hex: "#FFA500" },
  { value: "pink", label: "Rosa", hex: "#FFC0CB" },
  { value: "red", label: "Rot", hex: "#FF0000" },
  { value: "silver", label: "Silber", hex: "#C0C0C0" },
  { value: "turquoise", label: "Türkis", hex: "#40E0D0" },
  { value: "violet", label: "Violett", hex: "#EE82EE" },
  { value: "white", label: "Weiss", hex: "#FFFFFF", border: true },
  { value: "yellow", label: "Gelb", hex: "#FFFF00" },
  {
    value: "other",
    label: "Other",
    gradient:
      "repeating-linear-gradient(45deg, #ccc, #ccc 10px, #eee 10px, #eee 20px)",
  },
] as const;

export const BATTERY_OWNERSHIP_LABELS: Record<string, string> = {
  BATTERY_INCLUDED: "Batterie inklusive",
  BATTERY_RENT_REQUIRED: "Batteriemiete erforderlich",
};

export const CHARGING_STANDARD_LABELS: Record<string, string> = {
  TYPE_1: "Typ 1",
  TYPE_2: "Typ 2",
};

export const CHARGING_FAST_LABELS: Record<string, string> = {
  CCS: "CCS",
  CSS_2: "CCS 2",
  CHADEMO: "CHAdeMO",
  SUPERCHARGER: "Supercharger",
};

export const WARRANTY_LABELS: Record<string, string> = {
  FROM_DELIVERY: "Ab Lieferung",
  FROM_FIRST_REGISTRATION: "Ab Erstzulassung",
  FROM_DATE: "Ab Datum",
};

export const EMISSION_LABELS: Record<string, string> = {
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

export const EQUIPMENT_LABELS: Record<string, string> = {
  "360-camera": "360°-Kamera",
  abs: "ABS",
  "adaptive-headlights": "Adaptive Scheinwerfer",
  "adaptive-cruise-control": "Adaptiver Tempomat",
  "alarm-system": "Alarmanlage",
  "alloy-wheels": "Aluminiumfelgen",
  "android-auto": "Android Auto",
  "tow-hitch": "Anhängerkupplung",
  "tow-hitch-removable": "Anhängerkupplung abnehmbar",
  "tow-hitch-swiveling": "Anhängerkupplung schwenkbar",
  "tow-hitch-fixed": "Anhängerkupplung fix",
  "apple-carplay": "Apple CarPlay",
  "heated-seats": "Beheizbare Sitze",
  "ventilated-seats": "Belüftete Sitze",
  bluetooth: "Bluetooth-Schnittstelle",
  "brake-assist": "Bremsassistent",
  "chrome-elements": "Chromelemente",
  "dab-radio": "DAB-Radio",
  "anti-theft": "Diebstahlsicherung",
  "differential-lock": "Differenzialsperre",
  "electric-windows": "Elektrische Fensterheber",
  "electric-tailgate": "Elektrische Heckklappe",
  "electric-seat-adjustment": "Elektrische Sitzverstellung",
  "gull-wing-doors": "Flügeltüren",
  "hands-free": "Freisprechanlage",
  floor: "Fussboden",
  "roof-rack": "Gepäckträger",
  hardtop: "Hardtop",
  "head-up-display": "Head-up-Display",
  "custom-exhaust": "Individuelle Auspuffanlage",
  isofix: "Isofix",
  "air-conditioning": "Klimaanlage",
  "automatic-climate-control": "Automatische Klimaanlage",
  trunk: "Koffer",
  speakers: "Lautsprecher",
  "air-suspension": "Luftfederung",
  "navigation-system": "Navigationssystem",
  navigation: "Navigation",
  "portable-navigation": "Tragbares Navigationssystem",
  "panoramic-roof": "Panoramadach",
  "parking-assist": "Parkhilfe",
  "parking-sensors-rear": "Parksensoren hinten",
  "parking-sensors-front": "Parksensoren vorne",
  "backrest-protection": "Rückenlehnenschutz",
  "backup-camera": "Rückfahrkamera",
  headlights: "Scheinwerfer",
  "laser-headlights": "Laser Scheinwerfer",
  "led-headlights": "LED-Scheinwerfer",
  "xenon-headlights": "Xenonscheinwerfer",
  sunroof: "Schiebedach",
  "sliding-door": "Schiebetür",
  "keyless-entry-start": "Schlüsselloser Zugang/Start",
  "fast-charging": "Schnellladen",
  "seat-covers": "Sitzbezüge",
  alcantara: "Alcantara",
  "fabric-seats": "Stoffsitze",
  leather: "Leder",
  "partial-leather-seats": "Teil-Ledersitze",
  "special-paint": "Sonderlackierung",
  "sport-seats": "Sportsitze",
  "lane-keep-assist": "Spurhalteassistent",
  esp: "Stabilitätskontrolle (ESP)",
  "auxiliary-heating": "Standheizung",
  "start-stop-system": "Start-Stopp-System",
  "cruise-control": "Tempomat",
  "blind-spot-assist": "Totwinkel-Assistent",
  "reinforced-suspension": "Verstärkte Federung",
  "additional-instruments": "Zusätzliche Instrumente",
};

export const PRICING_OPTIONS = [
  { value: "500", label: "CHF 500" },
  { value: "1000", label: "CHF 1'000" },
  { value: "1500", label: "CHF 1'500" },
  { value: "2000", label: "CHF 2'000" },
  { value: "2500", label: "CHF 2'500" },
  { value: "3000", label: "CHF 3'000" },
  { value: "4000", label: "CHF 4'000" },
  { value: "5000", label: "CHF 5'000" },
  { value: "6000", label: "CHF 6'000" },
  { value: "7000", label: "CHF 7'000" },
  { value: "8000", label: "CHF 8'000" },
  { value: "9000", label: "CHF 9'000" },
  { value: "10000", label: "CHF 10'000" },
  { value: "12500", label: "CHF 12'500" },
  { value: "15000", label: "CHF 15'000" },
  { value: "17500", label: "CHF 17'500" },
  { value: "20000", label: "CHF 20'000" },
  { value: "25000", label: "CHF 25'000" },
  { value: "30000", label: "CHF 30'000" },
  { value: "40000", label: "CHF 40'000" },
  { value: "50000", label: "CHF 50'000" },
  { value: "75000", label: "CHF 75'000" },
  { value: "100000", label: "CHF 100'000" },
];

export const POWER_OPTIONS = [
  { value: "50", label: "ab 50 PS" },
  { value: "100", label: "ab 100 PS" },
  { value: "150", label: "ab 150 PS" },
  { value: "200", label: "ab 200 PS" },
  { value: "250", label: "ab 250 PS" },
  { value: "300", label: "ab 300 PS" },
  { value: "400", label: "ab 400 PS" },
];

export const EV_OPTIONS = [
  { value: "only_ev", label: "Nur E-Autos" },
  { value: "no_ev", label: "Keine E-Autos" },
];

export const getRegistrationYears = () => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - 1900 + 1 }, (_, i) => {
    const year = (currentYear - i).toString();
    return { value: year, label: year };
  });
};

export const KILOMETER_OPTIONS = [
  ...Array.from({ length: 11 }, (_, i) => (i === 0 ? 5000 : i * 10000)),
  125000,
  150000,
  175000,
  200000,
].map((m) => ({
  value: m.toString(),
  label: m === 0 ? "0 km" : `${new Intl.NumberFormat("de-CH").format(m)} km`,
}));

export const VehicleTypeEnum = [
  { value: "car", label: "Car" },
  { value: "utility", label: "Commercial Vehicle" },
  { value: "truck", label: "Truck" },
  { value: "camper", label: "Camper" },
] as const;

export const GearTransmissionEnum = [
  { value: "automatic", label: "Automatikgetriebe" },
  { value: "manual", label: "Schaltgetriebe" },
] as const;

export const TransmissionTypeEnum = [
  { value: "automatic", label: "Automat" },
  { value: "automatic-stepless", label: "Stufenlos" },
  { value: "semi-automatic", label: "Halbautomatisches Getriebe" },
  { value: "manual", label: "Schaltgetriebe manuell" },
] as const;

export const DriveTypeEnum = [
  { value: "all", label: "Allrad" },
  { value: "front", label: "Hinterradantrieb" },
  { value: "rear", label: "Vorderradantrieb" },
] as const;

export const ColorEnum = [
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

export const VehicleConditionEnum = [
  { value: "new", label: "Neues Fahrzeug" },
  {
    value: "demonstration",
    label: "Vorführmodell",
  },
  { value: "pre-registered", label: "Neues Fahrzeug mit Tageszulassung" },
  { value: "used", label: "Occasion" },
  { value: "oldtimer", label: "Oldtimer" },
] as const;

export const WarrantyEnum = [
  { value: "from-delivery", label: "Ab Übernahme" },
  { value: "from-first-registration", label: "Ab 1. Inverkehrsetzung" },
  { value: "from-date", label: "Ab Datum" },
] as const;

export const EnergyLabelEnum = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
  { value: "c", label: "C" },
  { value: "d", label: "D" },
  { value: "e", label: "E" },
  { value: "f", label: "F" },
  { value: "g", label: "G" },
] as const;

export const EmissionStandardEnum = [
  { value: "euro-1", label: "Euro 1" },
  { value: "euro-2", label: "Euro 2" },
  { value: "euro-3", label: "Euro 3" },
  { value: "euro-4", label: "Euro 4" },
  { value: "euro-5", label: "Euro 5" },
  { value: "euro-5-plus", label: "Euro 5+" },
  { value: "euro-6", label: "Euro 6" },
  { value: "euro-6a", label: "Euro 6a" },
  { value: "euro-6b", label: "Euro 6b" },
  { value: "euro-6c", label: "Euro 6c" },
  { value: "euro-6d", label: "Euro 6d" },
  { value: "euro-6d-isc", label: "Euro 6d ISC" },
  { value: "euro-6d-isc-fcm", label: "Euro 6d ISC FCM" },
  { value: "euro-6d-temp", label: "Euro 6d Temp" },
  { value: "euro-6d-temp-evap", label: "Euro 6d Temp EVAP" },
  { value: "euro-6d-temp-evap-isc", label: "Euro 6d Temp EVAP ISC" },
  { value: "euro-6d-temp-isc", label: "Euro 6d Temp ISC" },
  { value: "euro-6e", label: "Euro 6e" },
] as const;

export const ChargingPlugTypeStandardEnum = [
  { value: "type-1", label: "Type 1" },
  { value: "type-2", label: "Type 2" },
] as const;

export const ChargingPlugTypeFastEnum = [
  { value: "ccs", label: "Ccs" },
  { value: "css-2", label: "Css-2" },
  { value: "chademo", label: "Chademo" },
  { value: "supercharger", label: "Supercharger" },
] as const;

export const BatteryOwnershipEnum = [
  {
    value: "battery-included",
    label: "Battery included in the purchase price",
  },
  {
    value: "battery-rent-required",
    label: "Battery requires an additional rent",
  },
] as const;

export const EquipmentEnum = [
  { value: "360-camera", label: "360°-Kamera" },
  { value: "abs", label: "ABS" },
  { value: "adaptive-headlights", label: "Adaptive Scheinwerfer" },
  { value: "adaptive-cruise-control", label: "Adaptiver Tempomat" },
  { value: "alarm-system", label: "Alarmanlage" },
  { value: "alloy-wheels", label: "Aluminiumfelgen" },
  { value: "android-auto", label: "Android Auto" },
  { value: "tow-hitch", label: "Anhängerkupplung" },
  { value: "tow-hitch-removable", label: "Anhängerkupplung abnehmbar" },
  { value: "tow-hitch-swiveling", label: "Anhängerkupplung schwenkbar" },
  { value: "tow-hitch-fixed", label: "Anhängerkupplung fix" },
  { value: "apple-carplay", label: "Apple CarPlay" },
  { value: "heated-seats", label: "Beheizbare Sitze" },
  { value: "ventilated-seats", label: "Belüftete Sitze" },
  { value: "bluetooth", label: "Bluetooth-Schnittstelle" },
  { value: "brake-assist", label: "Bremsassistent" },
  { value: "chrome-elements", label: "Chromelemente" },
  { value: "dab-radio", label: "DAB-Radio" },
  { value: "anti-theft", label: "Diebstahlsicherung" },
  { value: "differential-lock", label: "Differenzialsperre" },
  { value: "electric-windows", label: "Elektrische Fensterheber" },
  { value: "electric-tailgate", label: "Elektrische Heckklappe" },
  { value: "electric-seat-adjustment", label: "Elektrische Sitzverstellung" },
  { value: "gull-wing-doors", label: "Flügeltüren" },
  { value: "hands-free", label: "Freisprechanlage" },
  { value: "floor", label: "Fussboden" },
  { value: "roof-rack", label: "Gepäckträger" },
  { value: "hardtop", label: "Hardtop" },
  { value: "head-up-display", label: "Head-up-Display" },
  { value: "custom-exhaust", label: "Individuelle Auspuffanlage" },
  { value: "isofix", label: "Isofix" },
  { value: "air-conditioning", label: "Klimaanlage" },
  { value: "automatic-climate-control", label: "Automatische Klimaanlage" },
  { value: "trunk", label: "Koffer" },
  { value: "speakers", label: "Lautsprecher" },
  { value: "air-suspension", label: "Luftfederung" },
  { value: "navigation-system", label: "Navigationssystem" },
  { value: "navigation", label: "Navigation" },
  { value: "portable-navigation", label: "Tragbares Navigationssystem" },
  { value: "panoramic-roof", label: "Panoramadach" },
  { value: "parking-assist", label: "Parkhilfe" },
  { value: "parking-sensors-rear", label: "Parksensoren hinten" },
  { value: "parking-sensors-front", label: "Parksensoren vorne" },
  { value: "backrest-protection", label: "Rückenlehnenschutz" },
  { value: "backup-camera", label: "Rückfahrkamera" },
  { value: "headlights", label: "Scheinwerfer" },
  { value: "laser-headlights", label: "Laser Scheinwerfer" },
  { value: "led-headlights", label: "LED-Scheinwerfer" },
  { value: "xenon-headlights", label: "Xenonscheinwerfer" },
  { value: "sunroof", label: "Schiebedach" },
  { value: "sliding-door", label: "Schiebetür" },
  { value: "keyless-entry-start", label: "Schlüsselloser Zugang/Start" },
  { value: "fast-charging", label: "Schnellladen" },
  { value: "seat-covers", label: "Sitzbezüge" },
  { value: "alcantara", label: "Alcantara" },
  { value: "fabric-seats", label: "Stoffsitze" },
  { value: "leather", label: "Leder" },
  { value: "partial-leather-seats", label: "Teil-Ledersitze" },
  { value: "special-paint", label: "Sonderlackierung" },
  { value: "sport-seats", label: "Sportsitze" },
  { value: "lane-keep-assist", label: "Spurhalteassistent" },
  { value: "esp", label: "Stabilitätskontrolle (ESP)" },
  { value: "auxiliary-heating", label: "Standheizung" },
  { value: "start-stop-system", label: "Start-Stopp-System" },
  { value: "cruise-control", label: "Tempomat" },
  { value: "blind-spot-assist", label: "Totwinkel-Assistent" },
  { value: "reinforced-suspension", label: "Verstärkte Federung" },
  { value: "additional-instruments", label: "Zusätzliche Instrumente" },
] as const;

export const prices = [
  { value: "500", label: "€500" },
  { value: "1000", label: "€1,000" },
  { value: "1500", label: "€1,500" },
  { value: "2000", label: "€2,000" },
  { value: "2500", label: "€2,500" },
  { value: "3000", label: "€3,000" },
  { value: "4000", label: "€4,000" },
  { value: "5000", label: "€5,000" },
  { value: "6000", label: "€6,000" },
  { value: "7000", label: "€7,000" },
  { value: "8000", label: "€8,000" },
  { value: "9000", label: "€9,000" },
  { value: "10000", label: "€10,000" },
  { value: "12500", label: "€12,500" },
  { value: "15000", label: "€15,000" },
  { value: "17500", label: "€17,500" },
  { value: "20000", label: "€20,000" },
  { value: "25000", label: "€25,000" },
  { value: "30000", label: "€30,000" },
  { value: "40000", label: "€40,000" },
  { value: "50000", label: "€50,000" },
  { value: "75000", label: "€75,000" },
  { value: "100000", label: "€100,000" },
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

export const qualityLabels = [
  { label: "AMAG", count: "7'967" },
  { label: "Audi Occasion :plus", count: "768" },
  { label: "Auto Welt von Rotz AG", count: "902" },
  { label: "BMW", count: "1'873" },
  { label: "BMW Premium Selection", count: "2'725" },
  { label: "BYD Official Partner", count: "145" },
  { label: "CUPRA Approved", count: "153" },
  { label: "Jaguar Approved", count: "2" },
  { label: "Land Rover Approved", count: "37" },
  { label: "Merbag", count: "1'601" },
  { label: "Mercedes-Benz Certified", count: "2'899" },
  { label: "Mini", count: "133" },
  { label: "Occasionen MINI NEXT", count: "227" },
  { label: "Quality1", count: "30'309" },
  { label: "SEAT Occasion Plus", count: "145" },
  { label: "Skoda Occasion Plus", count: "424" },
  { label: "VFAS", count: "2'046" },
  { label: "Volvo Selekt", count: "1'581" },
  { label: "VW Occasion Plus", count: "770" },
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

export const mileageHistogram = [
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

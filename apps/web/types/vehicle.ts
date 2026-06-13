export interface PriceRating {
  label: string;
  bars: number;
  sentiment: "red" | "yellow" | "green";
}

export interface VehicleListItem {
  id: string;
  make: string;
  model: string | null;
  version: string | null;
  price: number;
  kilometer: number;
  registrationMonth: number | null;
  registrationYear: number | null;
  kw: number | null;
  hp: number | null;
  fuelType: string | null;
  vehicleCondition: string | null;
  bodyType: string;
  color: string;
  createdAt: Date;
  images: string[];
  equipment: Record<string, unknown> | null;
  priceRating?: PriceRating;
  dealer: {
    id: string;
    companyName: string;
    city: string;
    zipCode: string;
    phoneNumber: string | null;
    googleRating: number | null;
    googleReviewCount: number | null;
  } | null;
  seller: {
    id: string;
    city: string;
    zipCode: string;
    phoneNumber: string | null;
  } | null;
}

export interface VehicleDealerInfo {
  id: string;
  companyName: string;
  streetAddress: string | null;
  city: string;
  zipCode: string | null;
  phoneNumber: string | null;
  logo: string | null;
  website: string | null;
  businessEmail: string | null;
  description: string | null;
  openingHours: {
    day: string;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
  }[];
  googleRating: number | null;
  googleReviewCount: number | null;
  user?: { emailVerified?: boolean };
}

export interface VehicleSellerInfo {
  id: string;
  city: string;
  zipCode: string;
  phoneNumber: string | null;
}

export interface VehicleDetails {
  id: string;
  make: string;
  model: string | null;
  version: string | null;
  price: number;
  newPrice: number | null;
  kilometer: number;
  registrationMonth: number | null;
  registrationYear: number | null;
  kw: number | null;
  hp: number | null;
  fuelType: string | null;
  transmissionType: string | null;
  gearTransmission: string | null;
  vehicleCondition: string | null;
  vehicleType: string | null;
  bodyType: string | null;
  color: string | null;
  interiorColor: string | null;
  metallic: boolean | null;
  driveType: string | null;
  seats: number | null;
  doors: number | null;
  vin: string | null;
  serialNumber: string | null;
  typeApproval: string | null;
  description: string | null;
  images: string[];
  equipment: Record<string, unknown> | null;
  extras: Record<string, unknown> | null;
  energyLabel: string | null;
  emissionStandard: string | null;
  co2Emission: number | null;
  consumptionCity: number | null;
  consumptionCountry: number | null;
  consumptionTotal: number | null;
  range: number | null;
  batteryCapacity: number | null;
  batteryRentalMonth: number | null;
  powerConsumption: number | null;
  batteryOwnership: string | null;
  chargingPlugTypeStandard: string | null;
  chargingPlugTypeFast: string | null;
  chargingPower: number | null;
  combustionEnginePowerHp: number | null;
  electricMotorPowerHp: number | null;
  cubicCapacity: number | null;
  numberOfGears: number | null;
  cylinders: number | null;
  emptyWeight: number | null;
  loadCapacity: number | null;
  wheelbase: number | null;
  length: number | null;
  width: number | null;
  height: number | null;
  towingCapacityBraked: number | null;
  lastInspectionDate: string | null;
  warrantyStartDate: string | null;
  inspectionPassed: boolean | null;
  warranty: string | null;
  duration: number | null;
  maxKm: number | null;
  dealer: VehicleDealerInfo | null;
  seller: VehicleSellerInfo | null;
}

export interface VehicleFacets {
  make: Record<string, number>;
  fuelType: Record<string, number>;
  transmissionType: Record<string, number>;
  vehicleCondition: Record<string, number>;
  vehicleType: Record<string, number>;
  bodyType: Record<string, number>;
  color: Record<string, number>;
  interiorColor: Record<string, number>;
  driveType: Record<string, number>;
  energyLabel: Record<string, number>;
  emissionStandard: Record<string, number>;
  sellerType: Record<string, number>;
  metallic: number;
  inspectionPassed: number;
  hasWarranty: number;
  hpMax?: number;
  kwMax?: number;
  priceMax?: number;
  kilometerMax?: number;
  yearMin?: number;
  yearMax?: number;
  consumptionMax?: number;
  co2Max?: number;
  cubicCapacityMax?: number;
  cylindersMax?: number;
  yearHistogram?: { year: number; h: number }[];
  kilometerHistogram?: { value: number; h: number }[];
  priceHistogram?: { value: number; h: number }[];
}

export interface PaginatedVehicles {
  vehicles: VehicleListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets?: VehicleFacets;
}

export type FuelType =
  | "petrol"
  | "ethanol-petrol"
  | "diesel"
  | "electric"
  | "cng-petrol"
  | "lpg-petrol"
  | "mhev-diesel"
  | "mhev-petrol"
  | "phev-diesel"
  | "phev-petrol"
  | "hev-diesel"
  | "hev-petrol"
  | "hydrogen";

export type TransmissionType =
  | "automatic"
  | "automatic-stepless"
  | "semi-automatic"
  | "manual";

export type VehicleCondition =
  | "new"
  | "demonstration"
  | "pre-registered"
  | "used"
  | "oldtimer";

export type VehicleType = "car" | "utility" | "truck" | "camper";

export type BodyType =
  | "bus"
  | "cabriolet"
  | "coupe"
  | "small-car"
  | "estate"
  | "minivan"
  | "saloon"
  | "pickup"
  | "suv";

export type Color =
  | "anthracite"
  | "beige"
  | "black"
  | "blue"
  | "bordeaux"
  | "brown"
  | "gold"
  | "gray"
  | "green"
  | "multicoloured"
  | "orange"
  | "pink"
  | "red"
  | "silver"
  | "turquoise"
  | "violet"
  | "white"
  | "yellow"
  | "other";

export type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "kilometer-asc"
  | "kilometer-desc"
  | "registration-asc"
  | "registration-desc"
  | "created-asc"
  | "created-desc";

export interface ListingProps {
  id: number | string;
  image: string;
  badge?: string;
  title: string;
  price: string;
  details: string[];
  garageName: string;
  garageId: number | string;
  garageLocation: string;
}
